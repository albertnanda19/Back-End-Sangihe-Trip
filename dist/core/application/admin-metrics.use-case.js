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
exports.AdminMetricsUseCase = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
let AdminMetricsUseCase = class AdminMetricsUseCase {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getSummary(range) {
        const [usersResult, destinationsResult, articlesResult, tripsResult, reviewsResult] = await Promise.all([
            this.supabase
                .from('users')
                .select('id', { count: 'exact', head: true })
                .is('deleted_at', null),
            this.supabase
                .from('destinations')
                .select('id', { count: 'exact', head: true }),
            this.supabase
                .from('articles')
                .select('id', { count: 'exact', head: true }),
            this.supabase
                .from('trip_plans')
                .select('id', { count: 'exact', head: true })
                .is('deleted_at', null),
            this.supabase
                .from('reviews')
                .select('id', { count: 'exact', head: true })
                .is('deleted_at', null),
        ]);
        return {
            totalUsers: usersResult.count || 0,
            totalDestinations: destinationsResult.count || 0,
            totalArticles: articlesResult.count || 0,
            totalTripPlans: tripsResult.count || 0,
            totalReviews: reviewsResult.count || 0,
        };
    }
    async getRegistrations(range = '6mo') {
        const monthsAgo = this.parseRange(range);
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsAgo);
        const { data, error } = await this.supabase.rpc('get_user_registrations', {
            start_date: startDate.toISOString().split('T')[0],
        });
        if (error) {
            const { data: users } = await this.supabase
                .from('users')
                .select('created_at')
                .gte('created_at', startDate.toISOString())
                .is('deleted_at', null);
            return this.aggregateByMonth(users || []);
        }
        return data || [];
    }
    async getPopularDestinations(limit = 10, period = '30d') {
        const daysAgo = this.parsePeriod(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);
        const { data: pageViews } = await this.supabase
            .from('page_views')
            .select('page_id')
            .eq('page_type', 'destination')
            .gte('created_at', startDate.toISOString());
        if (!pageViews || pageViews.length === 0) {
            const { data: destinations } = await this.supabase
                .from('destinations')
                .select('id, name, slug, view_count')
                .eq('status', 'active')
                .order('view_count', { ascending: false })
                .limit(limit);
            return (destinations?.map((d) => ({
                destinationId: d.id,
                name: d.name,
                slug: d.slug,
                visits: d.view_count || 0,
                imageUrl: null,
            })) || []);
        }
        const visitCounts = pageViews.reduce((acc, pv) => {
            acc[pv.page_id] = (acc[pv.page_id] || 0) + 1;
            return acc;
        }, {});
        const topDestinationIds = Object.entries(visitCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([id]) => id);
        const { data: destinations } = await this.supabase
            .from('destinations')
            .select('id, name, slug')
            .in('id', topDestinationIds);
        const { data: images } = await this.supabase
            .from('destination_images')
            .select('destination_id, image_url')
            .in('destination_id', topDestinationIds)
            .eq('is_featured', true)
            .limit(limit);
        const imageMap = new Map(images?.map((img) => [img.destination_id, img.image_url]));
        return (destinations?.map((d) => ({
            destinationId: d.id,
            name: d.name,
            slug: d.slug,
            visits: visitCounts[d.id] || 0,
            imageUrl: imageMap.get(d.id) || null,
        })) || []).sort((a, b) => b.visits - a.visits);
    }
    async getTripPlans(range = '6mo') {
        const monthsAgo = this.parseRange(range);
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsAgo);
        const { data: trips } = await this.supabase
            .from('trip_plans')
            .select('created_at')
            .gte('created_at', startDate.toISOString())
            .is('deleted_at', null);
        return this.aggregateByMonth(trips || []);
    }
    async getReviewDistribution(period = '30d') {
        const daysAgo = this.parsePeriod(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);
        const { data: reviews } = await this.supabase
            .from('reviews')
            .select('rating')
            .gte('created_at', startDate.toISOString())
            .eq('status', 'active')
            .is('deleted_at', null);
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews?.forEach((r) => {
            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });
        return Object.entries(distribution).map(([rating, count]) => ({
            rating: parseInt(rating),
            count,
        }));
    }
    parseRange(range) {
        const match = range.match(/(\d+)(mo|m|month)/i);
        return match ? parseInt(match[1]) : 6;
    }
    parsePeriod(period) {
        const match = period.match(/(\d+)(d|day)/i);
        return match ? parseInt(match[1]) : 30;
    }
    aggregateByMonth(records) {
        const monthCounts = {};
        records.forEach((record) => {
            const date = new Date(record.created_at);
            const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthCounts[period] = (monthCounts[period] || 0) + 1;
        });
        return Object.entries(monthCounts)
            .map(([period, count]) => ({ period, count }))
            .sort((a, b) => a.period.localeCompare(b.period));
    }
};
exports.AdminMetricsUseCase = AdminMetricsUseCase;
exports.AdminMetricsUseCase = AdminMetricsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], AdminMetricsUseCase);
//# sourceMappingURL=admin-metrics.use-case.js.map