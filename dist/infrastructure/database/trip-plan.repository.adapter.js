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
            created_at: plan.createdAt.toISOString(),
            updated_at: plan.createdAt.toISOString(),
        });
        if (planErr)
            throw new Error(planErr.message);
        await Promise.all(plan.schedule.map(async (day) => {
            const dayId = (0, uuid_1.v4)();
            const dayDate = new Date(plan.startDate.getTime() + (day.day - 1) * 24 * 60 * 60 * 1000);
            const { error: dayErr } = await this.client.from('trip_plan_days').insert({
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
                const { error: itemsErr } = await this.client.from('trip_plan_items').insert(itemRows);
                if (itemsErr)
                    throw new Error(itemsErr.message);
            }
        }));
    }
};
exports.TripPlanRepositoryAdapter = TripPlanRepositoryAdapter;
exports.TripPlanRepositoryAdapter = TripPlanRepositoryAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], TripPlanRepositoryAdapter);
//# sourceMappingURL=trip-plan.repository.adapter.js.map