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
exports.AdminActivityController = void 0;
const common_1 = require("@nestjs/common");
const jwt_admin_guard_1 = require("../../common/guards/jwt-admin.guard");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const admin_activity_use_case_1 = require("../../core/application/admin-activity.use-case");
const admin_activity_query_dto_1 = require("../dtos/admin/admin-activity-query.dto");
const admin_alert_query_dto_1 = require("../dtos/admin/admin-alert-query.dto");
let AdminActivityController = class AdminActivityController {
    adminActivityUseCase;
    constructor(adminActivityUseCase) {
        this.adminActivityUseCase = adminActivityUseCase;
    }
    async getActivities(query) {
        const result = await this.adminActivityUseCase.getActivities(query);
        return result;
    }
    async getAlerts(query) {
        const result = await this.adminActivityUseCase.getAlerts(query);
        return result;
    }
};
exports.AdminActivityController = AdminActivityController;
__decorate([
    (0, common_1.Get)('activities'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan daftar aktivitas admin'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_activity_query_dto_1.AdminActivityQueryDto]),
    __metadata("design:returntype", Promise)
], AdminActivityController.prototype, "getActivities", null);
__decorate([
    (0, common_1.Get)('alerts'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan daftar alert'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_alert_query_dto_1.AdminAlertQueryDto]),
    __metadata("design:returntype", Promise)
], AdminActivityController.prototype, "getAlerts", null);
exports.AdminActivityController = AdminActivityController = __decorate([
    (0, common_1.Controller)('api/admin'),
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    __metadata("design:paramtypes", [admin_activity_use_case_1.AdminActivityUseCase])
], AdminActivityController);
//# sourceMappingURL=admin-activity.controller.js.map