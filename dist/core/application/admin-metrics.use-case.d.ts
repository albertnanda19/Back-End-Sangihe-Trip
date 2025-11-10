import { SupabaseClient } from '@supabase/supabase-js';
export interface MetricsSummary {
    totalUsers: number;
    totalDestinations: number;
    totalArticles: number;
    totalTripPlans: number;
    totalReviews: number;
}
export interface TimeSeriesData {
    period: string;
    count: number;
}
export interface PopularDestination {
    destinationId: string;
    name: string;
    slug: string;
    visits: number;
    imageUrl: string | null;
}
export interface ReviewDistribution {
    rating: number;
    count: number;
}
export declare class AdminMetricsUseCase {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getSummary(range?: string): Promise<MetricsSummary>;
    getRegistrations(range?: string): Promise<TimeSeriesData[]>;
    getPopularDestinations(limit?: number, period?: string): Promise<PopularDestination[]>;
    getTripPlans(range?: string): Promise<TimeSeriesData[]>;
    getReviewDistribution(period?: string): Promise<ReviewDistribution[]>;
    private parseRange;
    private parsePeriod;
    private aggregateByMonth;
}
