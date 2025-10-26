import { AdminMetricsUseCase } from '../../core/application/admin-metrics.use-case';
export declare class AdminMetricsController {
    private readonly metricsUseCase;
    constructor(metricsUseCase: AdminMetricsUseCase);
    getSummary(range?: string): Promise<import("../../core/application/admin-metrics.use-case").MetricsSummary>;
    getRegistrations(range?: string): Promise<import("../../core/application/admin-metrics.use-case").TimeSeriesData[]>;
    getPopularDestinations(limit?: string, period?: string): Promise<import("../../core/application/admin-metrics.use-case").PopularDestination[]>;
    getTripPlans(range?: string): Promise<import("../../core/application/admin-metrics.use-case").TimeSeriesData[]>;
    getReviewDistribution(period?: string): Promise<import("../../core/application/admin-metrics.use-case").ReviewDistribution[]>;
}
