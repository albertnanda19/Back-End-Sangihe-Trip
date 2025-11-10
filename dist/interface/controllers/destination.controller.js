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
exports.DestinationController = void 0;
const common_1 = require("@nestjs/common");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const destination_use_case_1 = require("../../core/application/destination.use-case");
const get_destinations_dto_1 = require("../dtos/destination/get-destinations.dto");
let DestinationController = class DestinationController {
    destinationUseCase;
    supabase;
    constructor(destinationUseCase, supabase) {
        this.destinationUseCase = destinationUseCase;
        this.supabase = supabase;
    }
    async getDestinations(query) {
        const result = await this.destinationUseCase.findAll(query);
        const { data, totalItems } = result;
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 12;
        const totalPages = Math.ceil(totalItems / pageSize);
        const destinationIds = data.map((d) => d.id);
        const { data: allImages } = await this.supabase
            .from('destination_images')
            .select('*')
            .in('destination_id', destinationIds)
            .order('sort_order', { ascending: true });
        const imagesByDestination = (allImages || []).reduce((acc, img) => {
            if (!acc[img.destination_id]) {
                acc[img.destination_id] = [];
            }
            acc[img.destination_id].push(img);
            return acc;
        }, {});
        return {
            data: data.map((destination) => {
                const images = imagesByDestination[destination.id] || [];
                return {
                    id: destination.id,
                    name: destination.name,
                    slug: destination.slug,
                    description: destination.description,
                    address: destination.location.address,
                    opening_hours: destination.openHours,
                    entry_fee: destination.price,
                    category: destination.category,
                    avg_rating: destination.rating,
                    total_reviews: destination.totalReviews,
                    is_featured: destination.isFeatured,
                    images: images.map((img) => ({
                        id: img.id,
                        image_url: img.image_url,
                        alt_text: img.alt_text,
                        image_type: img.image_type,
                        sort_order: img.sort_order,
                        is_featured: img.is_featured,
                    })),
                };
            }),
            meta: {
                page,
                pageSize,
                totalItems,
                totalPages,
            },
        };
    }
    async getDestinationById(id) {
        const dest = await this.destinationUseCase.findById(id);
        const { data: images } = await this.supabase
            .from('destination_images')
            .select('*')
            .eq('destination_id', dest.id)
            .order('sort_order', { ascending: true });
        return {
            id: dest.id,
            name: dest.name,
            slug: dest.slug,
            description: dest.description,
            address: dest.location.address,
            latitude: dest.location.lat,
            longitude: dest.location.lng,
            phone: dest.phone,
            email: dest.email,
            website: dest.website,
            opening_hours: dest.openHours,
            entry_fee: dest.price,
            category: dest.category,
            facilities: Array.isArray(dest.facilities)
                ? dest.facilities.map((f) => (typeof f === 'object' ? f.name : f))
                : [],
            avg_rating: dest.rating,
            total_reviews: dest.totalReviews,
            is_featured: dest.isFeatured,
            activities: dest.activities,
            images: (images || []).map((img) => ({
                id: img.id,
                image_url: img.image_url,
                alt_text: img.alt_text,
                image_type: img.image_type,
                sort_order: img.sort_order,
                is_featured: img.is_featured,
            })),
        };
    }
    async getDestinationBySlug(slug) {
        const dest = await this.destinationUseCase.findBySlug(slug);
        const { data: images } = await this.supabase
            .from('destination_images')
            .select('*')
            .eq('destination_id', dest.id)
            .order('sort_order', { ascending: true });
        return {
            id: dest.id,
            name: dest.name,
            slug: dest.slug,
            description: dest.description,
            address: dest.location.address,
            latitude: dest.location.lat,
            longitude: dest.location.lng,
            phone: dest.phone,
            email: dest.email,
            website: dest.website,
            opening_hours: dest.openHours,
            entry_fee: dest.price,
            category: dest.category,
            facilities: Array.isArray(dest.facilities)
                ? dest.facilities.map((f) => (typeof f === 'object' ? f.name : f))
                : [],
            avg_rating: dest.rating,
            total_reviews: dest.totalReviews,
            is_featured: dest.isFeatured,
            activities: dest.activities,
            images: (images || []).map((img) => ({
                id: img.id,
                image_url: img.image_url,
                alt_text: img.alt_text,
                image_type: img.image_type,
                sort_order: img.sort_order,
                is_featured: img.is_featured,
            })),
        };
    }
};
exports.DestinationController = DestinationController;
__decorate([
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan data daftar destinasi'),
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_destinations_dto_1.GetDestinationsQueryDto]),
    __metadata("design:returntype", Promise)
], DestinationController.prototype, "getDestinations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(200),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil data destinasi {name}'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DestinationController.prototype, "getDestinationById", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, common_1.HttpCode)(200),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil data destinasi {name}'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DestinationController.prototype, "getDestinationBySlug", null);
exports.DestinationController = DestinationController = __decorate([
    (0, common_1.Controller)('destination'),
    __param(1, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [destination_use_case_1.DestinationUseCase, Object])
], DestinationController);
//# sourceMappingURL=destination.controller.js.map