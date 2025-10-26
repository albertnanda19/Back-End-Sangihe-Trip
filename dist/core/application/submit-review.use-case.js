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
exports.SubmitReviewUseCase = void 0;
const common_1 = require("@nestjs/common");
const review_entity_1 = require("../domain/review.entity");
const uuid_1 = require("uuid");
let SubmitReviewUseCase = class SubmitReviewUseCase {
    reviewRepository;
    constructor(reviewRepository) {
        this.reviewRepository = reviewRepository;
    }
    async execute(userId, dto) {
        const existingReview = await this.reviewRepository.findByUserAndDestination(userId, dto.destinationId);
        if (existingReview) {
            throw new common_1.BadRequestException('You have already submitted a review for this destination');
        }
        if (dto.images && dto.images.length > 5) {
            throw new common_1.BadRequestException('Maximum 5 images allowed per review');
        }
        const review = new review_entity_1.Review((0, uuid_1.v4)(), userId, dto.destinationId, dto.rating, dto.comment, dto.images || [], 0, new Date(), new Date());
        return await this.reviewRepository.create(review);
    }
};
exports.SubmitReviewUseCase = SubmitReviewUseCase;
exports.SubmitReviewUseCase = SubmitReviewUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ReviewRepository')),
    __metadata("design:paramtypes", [Object])
], SubmitReviewUseCase);
//# sourceMappingURL=submit-review.use-case.js.map