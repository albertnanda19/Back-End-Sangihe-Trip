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
exports.DestinationRepositoryAdapter = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const destination_entity_1 = require("../../core/domain/destination.entity");
let DestinationRepositoryAdapter = class DestinationRepositoryAdapter {
    client;
    async findById(id) {
        const { data: dest, error } = await this.client
            .from('destinations')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !dest)
            return null;
        const { data: images } = await this.client
            .from('destination_images')
            .select('image_url')
            .eq('destination_id', id)
            .order('sort_order', { ascending: true });
        const imageUrls = (images || []).map((img) => img.image_url);
        const { data: facilities } = await this.client
            .from('destination_facility_pivot')
            .select('is_available, facility:facility_id(name,icon)')
            .eq('destination_id', id);
        const mappedFacilities = (facilities || []).map((f) => ({
            name: f.facility?.name,
            icon: f.facility?.icon,
            available: f.is_available,
        }));
        const tips = [
            'Kunjungi saat sore hari untuk menikmati sunset terbaik',
            'Bawa kamera underwater untuk foto snorkeling',
            'Gunakan sunscreen karena terik matahari cukup kuat',
            'Coba kuliner lokal di warung sekitar pantai',
            'Datang lebih pagi untuk menghindari keramaian',
        ];
        const { data: reviews } = await this.client
            .from('reviews')
            .select('id, rating, created_at, visit_date, content, helpful_count, user:user_id(first_name,avatar_url), review_images:image_url')
            .eq('destination_id', id)
            .order('created_at', { ascending: false })
            .limit(3);
        const mappedReviews = (reviews || []).map((r) => ({
            id: r.id,
            user: {
                name: r.user?.first_name,
                avatar: r.user?.avatar_url,
            },
            rating: r.rating,
            date: r.created_at,
            visitDate: r.visit_date,
            text: r.content,
            images: Array.isArray(r.review_images) ? r.review_images : [],
            helpful: r.helpful_count,
        }));
        const { data: ratingAgg } = await this.client
            .rpc('get_rating_breakdown', { dest_id: id });
        const ratingBreakdown = ratingAgg || [
            { stars: 5, count: 0, percentage: 0 },
            { stars: 4, count: 0, percentage: 0 },
            { stars: 3, count: 0, percentage: 0 },
            { stars: 2, count: 0, percentage: 0 },
            { stars: 1, count: 0, percentage: 0 },
        ];
        const { data: related } = await this.client
            .from('destinations')
            .select('id, name, avg_rating, price, destination_images:image')
            .neq('id', id)
            .limit(3);
        const relatedDestinations = (related || []).map((d) => ({
            id: d.id,
            name: d.name,
            image: Array.isArray(d.destination_images) ? d.destination_images[0]?.image_url : '',
            rating: d.avg_rating,
            price: d.price,
        }));
        const media = {
            images: imageUrls,
            hasVideo: !!dest.video,
            videoUrl: dest.video || null,
        };
        const coordinates = {
            lat: dest.latitude,
            lng: dest.longitude,
        };
        return new destination_entity_1.Destination(dest.id, dest.name, dest.category, {
            address: dest.address,
            lat: dest.latitude,
            lng: dest.longitude,
        }, dest.distance_km, dest.entry_fee, dest.opening_hours, dest.description, mappedFacilities.length > 0 ? mappedFacilities : (Array.isArray(dest.facilities) ? dest.facilities : []), tips, imageUrls.length > 0 ? imageUrls : (Array.isArray(dest.images) ? dest.images : []), dest.video, dest.created_at ? new Date(dest.created_at) : new Date());
    }
    constructor(client) {
        this.client = client;
    }
    toRow(dest) {
        const { id, name, category, location, distanceKm, price, openHours, description, facilities, tips, images, video, createdAt, } = dest;
        return {
            id,
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            description,
            address: location.address,
            latitude: location.lat,
            longitude: location.lng,
            opening_hours: openHours,
            price,
            entry_fee: price,
            category,
            facilities: Array.isArray(facilities) ? facilities : [],
            images: Array.isArray(images) ? images : [],
            video: video ?? null,
            created_at: createdAt.toISOString(),
            updated_at: createdAt.toISOString(),
        };
    }
    async save(destination) {
        const rowData = this.toRow(destination);
        const { error } = await this.client
            .from('destinations')
            .insert(rowData)
            .select('id')
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return destination;
    }
    async findAll(query) {
        const { search, category, location, minRating, priceMin, priceMax, sortBy = 'popular', page = 1, pageSize = 12, } = query;
        let supabaseQuery = this.client
            .from('destinations')
            .select(`id, name, category, address, price, images, facilities, description, created_at`, { count: 'exact' });
        if (search) {
            supabaseQuery = supabaseQuery.ilike('name', `%${search}%`);
        }
        if (category) {
            supabaseQuery = supabaseQuery.eq('category', category);
        }
        if (location) {
            supabaseQuery = supabaseQuery.ilike('address', `%${location}%`);
        }
        if (typeof priceMin === 'number') {
            supabaseQuery = supabaseQuery.gte('price', priceMin);
        }
        if (typeof priceMax === 'number') {
            supabaseQuery = supabaseQuery.lte('price', priceMax);
        }
        switch (sortBy) {
            case 'price-low':
                supabaseQuery = supabaseQuery.order('price', { ascending: true });
                break;
            case 'newest':
                supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
                break;
            case 'popular':
            case 'rating':
            default:
                supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
        }
        const safePageSize = Math.min(Math.max(pageSize, 1), 50);
        const from = (page - 1) * safePageSize;
        const to = from + safePageSize - 1;
        supabaseQuery = supabaseQuery.range(from, to);
        const { data, count, error } = await supabaseQuery;
        if (error) {
            throw new Error(error.message);
        }
        function parsePgArray(str) {
            if (!str)
                return [];
            return str
                .replace(/^{|}$/g, '')
                .split(',')
                .map(s => s.trim().replace(/^"|"$/g, ''))
                .filter(Boolean);
        }
        const mapped = (data || []).map((row) => {
            let imagesArr = [];
            if (Array.isArray(row.images)) {
                imagesArr = row.images;
            }
            else if (typeof row.images === 'string') {
                imagesArr = parsePgArray(row.images);
            }
            return new destination_entity_1.Destination(row.id, row.name, row.category, {
                address: row.address,
                lat: row.latitude ?? 0,
                lng: row.longitude ?? 0,
            }, row.distance_km ?? 0, row.price, row.opening_hours ?? '', row.description, row.facilities ?? [], [], imagesArr, undefined, row.created_at ? new Date(row.created_at) : new Date());
        });
        return {
            data: mapped,
            totalItems: count || 0,
        };
    }
};
exports.DestinationRepositoryAdapter = DestinationRepositoryAdapter;
exports.DestinationRepositoryAdapter = DestinationRepositoryAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], DestinationRepositoryAdapter);
//# sourceMappingURL=destination.repository.adapter.js.map