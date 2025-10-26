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
exports.AdminMetricsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_admin_guard_1 = require("../../common/guards/jwt-admin.guard");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const admin_metrics_use_case_1 = require("../../core/application/admin-metrics.use-case");
let AdminMetricsController = class AdminMetricsController {
    metricsUseCase;
    constructor(metricsUseCase) {
        this.metricsUseCase = metricsUseCase;
    }
    async getSummary(range) {
        const data = await this.metricsUseCase.getSummary(range);
        return data;
    }
    async getRegistrations(range = '6mo') {
        const data = await this.metricsUseCase.getRegistrations(range);
        return data;
    }
    async getPopularDestinations(limit = '10', period = '30d') {
        const data = await this.metricsUseCase.getPopularDestinations(parseInt(limit), period);
        return data;
    }
    async getTripPlans(range = '6mo') {
        const data = await this.metricsUseCase.getTripPlans(range);
        return data;
    }
    async getReviewDistribution(period = '30d') {
        const data = await this.metricsUseCase.getReviewDistribution(period);
        return data;
    }
};
exports.AdminMetricsController = AdminMetricsController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil ringkasan metrik'),
    __param(0, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminMetricsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('registrations'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil data registrasi pengguna'),
    __param(0, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminMetricsController.prototype, "getRegistrations", null);
__decorate([
    (0, common_1.Get)('popular-destinations'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil destinasi populer'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminMetricsController.prototype, "getPopularDestinations", null);
__decorate([
    (0, common_1.Get)('trip-plans'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil data rencana perjalanan'),
    __param(0, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminMetricsController.prototype, "getTripPlans", null);
__decorate([
    (0, common_1.Get)('review-distribution'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil distribusi review'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminMetricsController.prototype, "getReviewDistribution", null);
exports.AdminMetricsController = AdminMetricsController = __decorate([
    (0, common_1.Controller)('admin/metrics'),
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    __metadata("design:paramtypes", [admin_metrics_use_case_1.AdminMetricsUseCase])
], AdminMetricsController);
//# sourceMappingURL=admin-metrics.controller.js.map