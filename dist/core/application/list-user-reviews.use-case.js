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
exports.ListUserReviewsUseCase = void 0;
const common_1 = require("@nestjs/common");
let ListUserReviewsUseCase = class ListUserReviewsUseCase {
    reviewRepository;
    destinationRepository;
    constructor(reviewRepository, destinationRepository) {
        this.reviewRepository = reviewRepository;
        this.destinationRepository = destinationRepository;
    }
    async execute(userId, page = 1, limit = 10) {
        const { data: reviews, totalItems } = await this.reviewRepository.findAllByUser({
            userId,
            page,
            pageSize: limit,
        });
        const enrichedReviews = await Promise.all(reviews.map(async (review) => {
            const destination = await this.destinationRepository.findById(review.destinationId);
            return {
                id: review.id,
                destination: destination
                    ? {
                        id: destination.id,
                        name: destination.name,
                        image: destination.images && destination.images.length > 0
                            ? destination.images[0]
                            : '/placeholder.svg',
                    }
                    : {
                        id: review.destinationId,
                        name: 'Unknown Destination',
                        image: '/placeholder.svg',
                    },
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt.toISOString(),
                helpful: review.helpful,
            };
        }));
        return {
            data: enrichedReviews,
            total: totalItems,
            page,
            pageSize: limit,
        };
    }
};
exports.ListUserReviewsUseCase = ListUserReviewsUseCase;
exports.ListUserReviewsUseCase = ListUserReviewsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ReviewRepository')),
    __param(1, (0, common_1.Inject)('DestinationRepository')),
    __metadata("design:paramtypes", [Object, Object])
], ListUserReviewsUseCase);
//# sourceMappingURL=list-user-reviews.use-case.js.map