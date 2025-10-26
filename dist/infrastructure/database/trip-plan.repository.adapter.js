"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripPlanRepositoryAdapter = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const uuid_1 = require("uuid");
const trip_plan_entity_1 = require("../../core/domain/trip-plan.entity");
let TripPlanRepositoryAdapter = class TripPlanRepositoryAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    calcEstimatedBudget(budget) {
        return Object.values(budget).reduce((acc, val) => acc + (val ?? 0), 0);
    }
    async create(plan) {
        const estimatedBudget = this.calcEstimatedBudget(plan.budget);
        const { error: planErr } = await this.client.from('trip_plans').insert({
            id: plan.id,
            user_id: plan.userId,
            title: plan.name,
            description: plan.notes,
            start_date: plan.startDate.toISOString().split('T')[0],
            end_date: plan.endDate.toISOString().split('T')[0],
            total_people: plan.peopleCount,
            trip_type: plan.tripType,
            estimated_budget: estimatedBudget,
            privacy_level: plan.isPublic ? 'public' : 'private',
            status: 'planning',
            settings: {
                budget: plan.budget,
                packingList: plan.packingList,
                destinations: plan.destinations,
            },
            created_at: plan.createdAt.toISOString(),
            updated_at: plan.createdAt.toISOString(),
        });
        if (planErr)
            throw new Error(planErr.message);
        await Promise.all(plan.schedule.map(async (day) => {
            const dayId = (0, uuid_1.v4)();
            const dayDate = new Date(plan.startDate.getTime() + (day.day - 1) * 24 * 60 * 60 * 1000);
            const { error: dayErr } = await this.client
                .from('trip_plan_days')
                .insert({
                id: dayId,
                trip_plan_id: plan.id,
                day_number: day.day,
                date: dayDate.toISOString().split('T')[0],
                title: `Hari ${day.day}`,
                description: null,
                created_at: plan.createdAt.toISOString(),
                updated_at: plan.createdAt.toISOString(),
            });
            if (dayErr)
                throw new Error(dayErr.message);
            if (day.items?.length) {
                const itemRows = day.items.map((item) => ({
                    id: (0, uuid_1.v4)(),
                    trip_plan_day_id: dayId,
                    destination_id: item.destinationId,
                    title: item.activity,
                    description: item.notes ?? null,
                    start_time: item.startTime,
                    end_time: item.endTime,
                    estimated_cost: 0,
                    item_type: 'destination',
                    sort_order: 0,
                    created_at: plan.createdAt.toISOString(),
                    updated_at: plan.createdAt.toISOString(),
                }));
                const { error: itemsErr } = await this.client
                    .from('trip_plan_items')
                    .insert(itemRows);
                if (itemsErr)
                    throw new Error(itemsErr.message);
            }
        }));
    }
    async findById(id) {
        const { data: planRow, error: planErr } = await this.client
            .from('trip_plans')
            .select('*')
            .eq('id', id)
            .single();
        if (planErr?.code === 'PGRST116')
            return null;
        if (planErr)
            throw new Error(planErr.message);
        const { data: dayRows, error: dayErr } = await this.client
            .from('trip_plan_days')
            .select('*, trip_plan_items(*)')
            .eq('trip_plan_id', id)
            .order('day_number', { ascending: true });
        if (dayErr)
            throw new Error(dayErr.message);
        const schedule = (dayRows || []).map((d) => ({
            day: d.day_number,
            items: (d.trip_plan_items || []).map((it) => ({
                destinationId: it.destination_id,
                startTime: it.start_time,
                endTime: it.end_time,
                activity: it.title,
                notes: it.description ?? undefined,
            })),
        }));
        const settings = planRow.settings || {};
        const budget = settings.budget || {};
        const packingList = settings.packingList || [];
        const destinations = settings.destinations || [];
        return new trip_plan_entity_1.TripPlan(planRow.user_id, planRow.title, new Date(planRow.start_date), new Date(planRow.end_date), planRow.total_people, planRow.trip_type, planRow.privacy_level === 'public', destinations, schedule, budget, planRow.description, packingList, planRow.id, new Date(planRow.created_at));
    }
    async findAllByUser(query) {
        const { userId, page = 1, pageSize = 10 } = query;
        const safePageSize = Math.min(Math.max(pageSize, 1), 50);
        const from = (page - 1) * safePageSize;
        const to = from + safePageSize - 1;
        const supabaseQuery = this.client
            .from('trip_plans')
            .select(`id, user_id, title, start_date, end_date, total_people, trip_type, estimated_budget, privacy_level, created_at, updated_at`, { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);
        const { data, count, error } = await supabaseQuery;
        if (error) {
            throw new Error(error.message);
        }
        const mapped = (data || []).map((row) => new trip_plan_entity_1.TripPlan(row.user_id, row.title, row.start_date ? new Date(row.start_date) : new Date(), row.end_date ? new Date(row.end_date) : new Date(), row.total_people ?? 0, row.trip_type ?? '', row.privacy_level === 'public', [], [], {}, null, [], row.id, row.created_at ? new Date(row.created_at) : new Date()));
        return {
            data: mapped,
            totalItems: count || 0,
        };
    }
    async delete(id) {
        const { error } = await this.client
            .from('trip_plans')
            .delete()
            .eq('id', id);
        if (error) {
            if (error.code === 'PGRST116') {
                return false;
            }
            throw new Error(`Failed to delete trip: ${error.message}`);
        }
        return true;
    }
    async update(id, updates) {
        const existingTrip = await this.findById(id);
        if (!existingTrip)
            return null;
        const updateData = {
            updated_at: new Date().toISOString(),
        };
        if (updates.name !== undefined)
            updateData.title = updates.name;
        if (updates.startDate !== undefined)
            updateData.start_date = updates.startDate.toISOString().split('T')[0];
        if (updates.endDate !== undefined)
            updateData.end_date = updates.endDate.toISOString().split('T')[0];
        if (updates.peopleCount !== undefined)
            updateData.total_people = updates.peopleCount;
        if (updates.tripType !== undefined)
            updateData.trip_type = updates.tripType;
        if (updates.isPublic !== undefined)
            updateData.privacy_level = updates.isPublic ? 'public' : 'private';
        if (updates.notes !== undefined)
            updateData.description = updates.notes;
        const currentSettings = existingTrip.settings || {};
        const newSettings = { ...currentSettings };
        if (updates.budget !== undefined) {
            newSettings.budget = updates.budget;
            updateData.estimated_budget = this.calcEstimatedBudget(updates.budget);
        }
        if (updates.packingList !== undefined) {
            newSettings.packingList = updates.packingList;
        }
        if (updates.destinations !== undefined) {
            newSettings.destinations = updates.destinations;
        }
        updateData.settings = newSettings;
        const { error: planErr } = await this.client
            .from('trip_plans')
            .update(updateData)
            .eq('id', id);
        if (planErr)
            throw new Error(planErr.message);
        if (updates.schedule !== undefined) {
            const { error: deleteErr } = await this.client
                .from('trip_plan_days')
                .delete()
                .eq('trip_plan_id', id);
            if (deleteErr)
                throw new Error(deleteErr.message);
            await Promise.all(updates.schedule.map(async (day) => {
                const dayId = (0, uuid_1.v4)();
                const baseDate = updates.startDate || existingTrip.startDate;
                const dayDate = new Date(baseDate.getTime() + (day.day - 1) * 24 * 60 * 60 * 1000);
                const { error: dayErr } = await this.client
                    .from('trip_plan_days')
                    .insert({
                    id: dayId,
                    trip_plan_id: id,
                    day_number: day.day,
                    date: dayDate.toISOString().split('T')[0],
                    title: `Hari ${day.day}`,
                    description: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
                if (dayErr)
                    throw new Error(dayErr.message);
                if (day.items?.length) {
                    const itemRows = day.items.map((item) => ({
                        id: (0, uuid_1.v4)(),
                        trip_plan_day_id: dayId,
                        destination_id: item.destinationId,
                        title: item.activity,
                        description: item.notes ?? null,
                        start_time: item.startTime,
                        end_time: item.endTime,
                        estimated_cost: 0,
                        item_type: 'destination',
                        sort_order: 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }));
                    const { error: itemsErr } = await this.client
                        .from('trip_plan_items')
                        .insert(itemRows);
                    if (itemsErr)
                        throw new Error(itemsErr.message);
                }
            }));
        }
        return this.findById(id);
    }
};
exports.TripPlanRepositoryAdapter = TripPlanRepositoryAdapter;
exports.TripPlanRepositoryAdapter = TripPlanRepositoryAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], TripPlanRepositoryAdapter);
//# sourceMappingURL=trip-plan.repository.adapter.js.map