import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

export interface MetricsSummary {
  totalUsers: number;
  totalDestinations: number;
  totalArticles: number;
  totalTripPlans: number;
  totalReviews: number;
  // monthlyActiveUsers: number | null;  // commented for now
  // revenue: number | null;  // commented for now
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

@Injectable()
export class AdminMetricsUseCase {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async getSummary(range?: string): Promise<MetricsSummary> {
    // Get total counts
    const [usersResult, destinationsResult, articlesResult, tripsResult, reviewsResult] =
      await Promise.all([
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

  async getRegistrations(range: string = '6mo'): Promise<TimeSeriesData[]> {
    const monthsAgo = this.parseRange(range);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsAgo);

    const { data, error } = await this.supabase.rpc('get_user_registrations', {
      start_date: startDate.toISOString().split('T')[0],
    });

    if (error) {
      // Fallback: manual aggregation if function doesn't exist
      const { data: users } = await this.supabase
        .from('users')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .is('deleted_at', null);

      return this.aggregateByMonth(users || []);
    }

    return data || [];
  }

  async getPopularDestinations(
    limit: number = 10,
    period: string = '30d',
  ): Promise<PopularDestination[]> {
    const daysAgo = this.parsePeriod(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get page views grouped by destination
    const { data: pageViews } = await this.supabase
      .from('page_views')
      .select('page_id')
      .eq('page_type', 'destination')
      .gte('created_at', startDate.toISOString());

    if (!pageViews || pageViews.length === 0) {
      // Fallback: use view_count from destinations table
      const { data: destinations } = await this.supabase
        .from('destinations')
        .select('id, name, slug, view_count')
        .eq('status', 'active')
        .order('view_count', { ascending: false })
        .limit(limit);

      return (
        destinations?.map((d: any) => ({
          destinationId: d.id,
          name: d.name,
          slug: d.slug,
          visits: d.view_count || 0,
          imageUrl: null,
        })) || []
      );
    }

    // Count visits per destination
    const visitCounts = pageViews.reduce(
      (acc: Record<string, number>, pv: any) => {
        acc[pv.page_id] = (acc[pv.page_id] || 0) + 1;
        return acc;
      },
      {},
    );

    // Get top destinations
    const topDestinationIds = Object.entries(visitCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, limit)
      .map(([id]) => id);

    const { data: destinations } = await this.supabase
      .from('destinations')
      .select('id, name, slug')
      .in('id', topDestinationIds);

    // Get featured images
    const { data: images } = await this.supabase
      .from('destination_images')
      .select('destination_id, image_url')
      .in('destination_id', topDestinationIds)
      .eq('is_featured', true)
      .limit(limit);

    const imageMap = new Map(
      images?.map((img: any) => [img.destination_id, img.image_url]),
    );

    return (
      destinations?.map((d: any) => ({
        destinationId: d.id,
        name: d.name,
        slug: d.slug,
        visits: visitCounts[d.id] || 0,
        imageUrl: imageMap.get(d.id) || null,
      })) || []
    ).sort((a, b) => b.visits - a.visits);
  }

  async getTripPlans(range: string = '6mo'): Promise<TimeSeriesData[]> {
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

  async getReviewDistribution(
    period: string = '30d',
  ): Promise<ReviewDistribution[]> {
    const daysAgo = this.parsePeriod(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const { data: reviews } = await this.supabase
      .from('reviews')
      .select('rating')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'active')
      .is('deleted_at', null);

    // Count by rating
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews?.forEach((r: any) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    return Object.entries(distribution).map(([rating, count]) => ({
      rating: parseInt(rating),
      count,
    }));
  }

  // Helper methods
  private parseRange(range: string): number {
    const match = range.match(/(\d+)(mo|m|month)/i);
    return match ? parseInt(match[1]) : 6;
  }

  private parsePeriod(period: string): number {
    const match = period.match(/(\d+)(d|day)/i);
    return match ? parseInt(match[1]) : 30;
  }

  private aggregateByMonth(
    records: Array<{ created_at: string }>,
  ): TimeSeriesData[] {
    const monthCounts: Record<string, number> = {};

    records.forEach((record) => {
      const date = new Date(record.created_at);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[period] = (monthCounts[period] || 0) + 1;
    });

    return Object.entries(monthCounts)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }
}
