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
    async execute(userId, page = 1, limit = 10, sortBy = 'date', order = 'desc', rating) {
        const { data: reviews, totalItems } = await this.reviewRepository.findAllByUser({
            userId,
            page,
            pageSize: limit,
        });
        let filteredReviews = reviews;
        if (rating && rating !== 'all') {
            const ratingNum = parseInt(rating);
            filteredReviews = reviews.filter((r) => r.rating === ratingNum);
        }
        const sortedReviews = [...filteredReviews].sort((a, b) => {
            if (sortBy === 'date') {
                const comparison = a.createdAt.getTime() - b.createdAt.getTime();
                return order === 'asc' ? comparison : -comparison;
            }
            else {
                const comparison = a.rating - b.rating;
                return order === 'asc' ? comparison : -comparison;
            }
        });
        const enrichedReviews = await Promise.all(sortedReviews.map(async (review) => {
            const destination = await this.destinationRepository.findById(review.destinationId);
            return {
                id: review.id,
                destinationId: review.destinationId,
                destinationName: destination?.name || 'Unknown Destination',
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
                content: review.comment,
                helpful: review.helpful,
                helpfulCount: review.helpful,
                likes: review.helpful,
                createdAt: review.createdAt.toISOString(),
                date: review.createdAt.toISOString(),
            };
        }));
        const totalPages = Math.ceil((rating && rating !== 'all' ? filteredReviews.length : totalItems) /
            limit);
        return {
            data: enrichedReviews,
            meta: {
                page,
                per_page: limit,
                total: rating && rating !== 'all' ? filteredReviews.length : totalItems,
                total_pages: totalPages,
            },
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