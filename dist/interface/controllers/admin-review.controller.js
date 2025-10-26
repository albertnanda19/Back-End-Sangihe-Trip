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
exports.AdminReviewController = void 0;
const common_1 = require("@nestjs/common");
const jwt_admin_guard_1 = require("../../common/guards/jwt-admin.guard");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const admin_review_use_case_1 = require("../../core/application/admin-review.use-case");
const admin_review_query_dto_1 = require("../dtos/admin/admin-review-query.dto");
const admin_review_action_dto_1 = require("../dtos/admin/admin-review-action.dto");
let AdminReviewController = class AdminReviewController {
    reviewUseCase;
    constructor(reviewUseCase) {
        this.reviewUseCase = reviewUseCase;
    }
    async list(query) {
        return await this.reviewUseCase.list(query);
    }
    async getById(id) {
        return await this.reviewUseCase.getById(id);
    }
    async approve(id, dto, req) {
        const adminId = req.user?.id;
        return await this.reviewUseCase.approve(id, adminId, dto.moderatorNote);
    }
    async reject(id, dto, req) {
        const adminId = req.user?.id;
        return await this.reviewUseCase.reject(id, adminId, dto.reason, dto.moderatorNote);
    }
};
exports.AdminReviewController = AdminReviewController;
__decorate([
    (0, common_1.Get)(),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil daftar review'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_review_query_dto_1.AdminReviewQueryDto]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil detail review'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, response_decorator_1.ResponseMessage)('Berhasil menyetujui review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_review_action_dto_1.ApproveReviewDto, Object]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "approve", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, response_decorator_1.ResponseMessage)('Berhasil menolak review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_review_action_dto_1.RejectReviewDto, Object]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "reject", null);
exports.AdminReviewController = AdminReviewController = __decorate([
    (0, common_1.Controller)('admin/reviews'),
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    __metadata("design:paramtypes", [admin_review_use_case_1.AdminReviewUseCase])
], AdminReviewController);
//# sourceMappingURL=admin-review.controller.js.map