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
exports.ReviewController = void 0;
const common_1 = require("@nestjs/common");
const submit_review_use_case_1 = require("../../core/application/submit-review.use-case");
const get_destination_reviews_use_case_1 = require("../../core/application/get-destination-reviews.use-case");
const like_review_use_case_1 = require("../../core/application/like-review.use-case");
const create_review_dto_1 = require("../dtos/review/create-review.dto");
const get_reviews_dto_1 = require("../dtos/review/get-reviews.dto");
const jwt_access_guard_1 = require("../../common/guards/jwt-access.guard");
const response_decorator_1 = require("../../common/decorators/response.decorator");
let ReviewController = class ReviewController {
    submitReviewUseCase;
    getDestinationReviewsUseCase;
    likeReviewUseCase;
    constructor(submitReviewUseCase, getDestinationReviewsUseCase, likeReviewUseCase) {
        this.submitReviewUseCase = submitReviewUseCase;
        this.getDestinationReviewsUseCase = getDestinationReviewsUseCase;
        this.likeReviewUseCase = likeReviewUseCase;
    }
    async submitReview(createReviewDto, req) {
        const userId = req.user.id;
        return await this.submitReviewUseCase.execute(userId, createReviewDto);
    }
    async getDestinationReviews(destinationId, query, req) {
        const userId = req.user?.id;
        return await this.getDestinationReviewsUseCase.execute(destinationId, {
            page: query.page,
            pageSize: query.limit,
            sortBy: query.sortBy,
        }, userId);
    }
    async likeReview(reviewId, req) {
        const userId = req.user.id;
        return await this.likeReviewUseCase.execute(reviewId, userId);
    }
};
exports.ReviewController = ReviewController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengirim review'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_review_dto_1.CreateReviewDto, Object]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "submitReview", null);
__decorate([
    (0, common_1.Get)('destination/:destinationId'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil daftar review'),
    __param(0, (0, common_1.Param)('destinationId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_reviews_dto_1.GetReviewsDto, Object]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getDestinationReviews", null);
__decorate([
    (0, common_1.Post)(':reviewId/like'),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    (0, response_decorator_1.ResponseMessage)('Berhasil toggle like review'),
    __param(0, (0, common_1.Param)('reviewId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "likeReview", null);
exports.ReviewController = ReviewController = __decorate([
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [submit_review_use_case_1.SubmitReviewUseCase,
        get_destination_reviews_use_case_1.GetDestinationReviewsUseCase,
        like_review_use_case_1.LikeReviewUseCase])
], ReviewController);
//# sourceMappingURL=review.controller.js.map