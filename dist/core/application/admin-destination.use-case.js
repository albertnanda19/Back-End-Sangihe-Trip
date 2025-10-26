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
exports.AdminDestinationUseCase = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
let AdminDestinationUseCase = class AdminDestinationUseCase {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async list(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const offset = (page - 1) * limit;
        let dbQuery = this.supabase
            .from('destinations')
            .select('*', { count: 'exact' })
            .is('deleted_at', null);
        if (query.search) {
            dbQuery = dbQuery.or(`name.ilike.%${query.search}%,description.ilike.%${query.search}%,slug.ilike.%${query.search}%`);
        }
        if (query.status) {
            dbQuery = dbQuery.eq('status', query.status);
        }
        if (query.category) {
            dbQuery = dbQuery.eq('category', query.category);
        }
        const [sortField, sortOrder] = (query.sort || 'createdAt:desc').split(':');
        const orderColumn = this.mapSortField(sortField);
        dbQuery = dbQuery.order(orderColumn, {
            ascending: sortOrder === 'asc',
        });
        dbQuery = dbQuery.range(offset, offset + limit - 1);
        const { data, error, count } = await dbQuery;
        if (error) {
            throw new Error(`Failed to fetch destinations: ${error.message}`);
        }
        return {
            data: data || [],
            meta: {
                page,
                limit,
                total: count || 0,
            },
        };
    }
    async getById(id) {
        const { data: destination, error: destError } = await this.supabase
            .from('destinations')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();
        if (destError || !destination) {
            throw new common_1.NotFoundException('Destination not found');
        }
        const { data: images } = await this.supabase
            .from('destination_images')
            .select('*')
            .eq('destination_id', id)
            .order('sort_order', { ascending: true });
        return {
            ...destination,
            images: images || [],
        };
    }
    async create(data, adminId) {
        const slug = data.slug || this.generateSlug(data.name);
        const destinationData = {
            name: data.name,
            slug,
            description: data.description,
            short_description: data.shortDescription,
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            phone: data.phone,
            email: data.email,
            website: data.website,
            opening_hours: data.openingHours,
            entry_fee: data.entryFee || 0,
            status: data.status || (data.published ? 'active' : 'pending'),
            category: data.categories?.[0] || null,
            facilities: data.facilities || [],
            is_featured: data.isFeatured || false,
            created_by: adminId,
        };
        const { data: destination, error } = await this.supabase
            .from('destinations')
            .insert(destinationData)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create destination: ${error.message}`);
        }
        if (data.images && data.images.length > 0) {
            const imageData = data.images.map((img, index) => ({
                destination_id: destination.id,
                image_url: img.url,
                alt_text: img.alt,
                caption: img.caption,
                is_featured: img.isFeatured || false,
                sort_order: index,
                uploaded_by: adminId,
            }));
            await this.supabase.from('destination_images').insert(imageData);
        }
        return this.getById(destination.id);
    }
    async update(id, data) {
        const existing = await this.getById(id);
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.slug !== undefined)
            updateData.slug = data.slug;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.shortDescription !== undefined)
            updateData.short_description = data.shortDescription;
        if (data.address !== undefined)
            updateData.address = data.address;
        if (data.latitude !== undefined)
            updateData.latitude = data.latitude;
        if (data.longitude !== undefined)
            updateData.longitude = data.longitude;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.website !== undefined)
            updateData.website = data.website;
        if (data.openingHours !== undefined)
            updateData.opening_hours = data.openingHours;
        if (data.entryFee !== undefined)
            updateData.entry_fee = data.entryFee;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.categories !== undefined)
            updateData.category = data.categories[0];
        if (data.facilities !== undefined)
            updateData.facilities = data.facilities;
        if (data.isFeatured !== undefined)
            updateData.is_featured = data.isFeatured;
        if (data.published !== undefined)
            updateData.status = data.published ? 'active' : 'inactive';
        const { error } = await this.supabase
            .from('destinations')
            .update(updateData)
            .eq('id', id);
        if (error) {
            throw new Error(`Failed to update destination: ${error.message}`);
        }
        if (data.images !== undefined) {
            await this.supabase
                .from('destination_images')
                .delete()
                .eq('destination_id', id);
            if (data.images.length > 0) {
                const imageData = data.images.map((img, index) => ({
                    destination_id: id,
                    image_url: img.url,
                    alt_text: img.alt,
                    caption: img.caption,
                    is_featured: img.isFeatured || false,
                    sort_order: index,
                }));
                await this.supabase.from('destination_images').insert(imageData);
            }
        }
        return this.getById(id);
    }
    async delete(id, hard = false) {
        const existing = await this.getById(id);
        if (hard) {
            const { error } = await this.supabase
                .from('destinations')
                .delete()
                .eq('id', id);
            if (error) {
                throw new Error(`Failed to delete destination: ${error.message}`);
            }
        }
        else {
            const { error } = await this.supabase
                .from('destinations')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);
            if (error) {
                throw new Error(`Failed to delete destination: ${error.message}`);
            }
        }
    }
    mapSortField(field) {
        const mapping = {
            createdAt: 'created_at',
            name: 'name',
            rating: 'avg_rating',
            viewCount: 'view_count',
        };
        return mapping[field] || 'created_at';
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
};
exports.AdminDestinationUseCase = AdminDestinationUseCase;
exports.AdminDestinationUseCase = AdminDestinationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], AdminDestinationUseCase);
//# sourceMappingURL=admin-destination.use-case.js.map