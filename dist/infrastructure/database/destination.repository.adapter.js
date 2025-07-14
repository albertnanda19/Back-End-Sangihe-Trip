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
    constructor(client) {
        this.client = client;
    }
    parseImages(images) {
        if (Array.isArray(images))
            return images;
        if (typeof images === 'string') {
            return images
                .replace(/^{|}$/g, '')
                .split(',')
                .map((s) => s.trim().replace(/^"|"$/g, ''))
                .filter(Boolean);
        }
        return [];
    }
    mapRowToEntity(row) {
        return new destination_entity_1.Destination(row.id, row.name, row.category, {
            address: row.address,
            lat: row.latitude ?? 0,
            lng: row.longitude ?? 0,
        }, 0, row.price, row.opening_hours ?? '', row.description, row.facilities ?? [], [], this.parseImages(row.images), undefined, row.created_at ? new Date(row.created_at) : new Date());
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
    async save(destination, _uploadedBy) {
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
            }, 0, row.price, row.opening_hours ?? '', row.description, row.facilities ?? [], [], imagesArr, undefined, row.created_at ? new Date(row.created_at) : new Date());
        });
        return {
            data: mapped,
            totalItems: count || 0,
        };
    }
    async findAllNoPagination() {
        const { data, error } = await this.client
            .from('destinations')
            .select('id, name, category, address, latitude, longitude, price, opening_hours, description, facilities, images, created_at')
            .order('created_at', { ascending: false });
        if (error) {
            throw new Error(error.message);
        }
        return (data || []).map((row) => this.mapRowToEntity(row));
    }
    async delete(id) {
        const { data: row, error: fetchError } = await this.client
            .from('destinations')
            .select('id, name, category, address, latitude, longitude, price, opening_hours, description, facilities, images, video, created_at')
            .eq('id', id)
            .single();
        if (fetchError || !row) {
            throw new Error(fetchError?.message || 'Destination not found');
        }
        const destination = new destination_entity_1.Destination(row.id, row.name, row.category, {
            address: row.address,
            lat: row.latitude ?? 0,
            lng: row.longitude ?? 0,
        }, 0, row.price, row.opening_hours ?? '', row.description, row.facilities ?? [], [], row.images ?? [], row.video ?? undefined, row.created_at ? new Date(row.created_at) : new Date());
        const { error: deleteError } = await this.client
            .from('destinations')
            .delete()
            .eq('id', id);
        if (deleteError) {
            throw new Error(deleteError.message);
        }
        return destination;
    }
    async findById(id) {
        const { data: row, error } = await this.client
            .from('destinations')
            .select(`id, name, category, address, latitude, longitude, price, opening_hours, description, facilities, images, video, avg_rating, total_reviews, created_at`)
            .eq('id', id)
            .single();
        if (error || !row) {
            throw new Error(error?.message || 'Destination not found');
        }
        const parsePgArray = (str) => {
            if (!str)
                return [];
            return str
                .replace(/^{|}$/g, '')
                .split(',')
                .map((s) => s.trim().replace(/^"|"$/g, ''))
                .filter(Boolean);
        };
        let imagesArr = [];
        if (Array.isArray(row.images)) {
            imagesArr = row.images;
        }
        else if (typeof row.images === 'string') {
            imagesArr = parsePgArray(row.images);
        }
        const facilities = Array.isArray(row.facilities) ? row.facilities : [];
        const destination = new destination_entity_1.Destination(row.id, row.name, row.category, {
            address: row.address,
            lat: row.latitude ?? 0,
            lng: row.longitude ?? 0,
        }, 0, row.price, row.opening_hours ?? '', row.description, facilities, [], imagesArr, row.video ?? undefined, row.created_at ? new Date(row.created_at) : new Date(), Number(row.avg_rating ?? 0), Number(row.total_reviews ?? 0));
        return destination;
    }
};
exports.DestinationRepositoryAdapter = DestinationRepositoryAdapter;
exports.DestinationRepositoryAdapter = DestinationRepositoryAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], DestinationRepositoryAdapter);
//# sourceMappingURL=destination.repository.adapter.js.map