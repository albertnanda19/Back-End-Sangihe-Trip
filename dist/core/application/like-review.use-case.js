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
exports.LikeReviewUseCase = void 0;
const common_1 = require("@nestjs/common");
let LikeReviewUseCase = class LikeReviewUseCase {
    reviewRepository;
    constructor(reviewRepository) {
        this.reviewRepository = reviewRepository;
    }
    async execute(reviewId, userId) {
        const review = await this.reviewRepository.findById(reviewId);
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return await this.reviewRepository.toggleLike(reviewId, userId);
    }
};
exports.LikeReviewUseCase = LikeReviewUseCase;
exports.LikeReviewUseCase = LikeReviewUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ReviewRepository')),
    __metadata("design:paramtypes", [Object])
], LikeReviewUseCase);
//# sourceMappingURL=like-review.use-case.js.map