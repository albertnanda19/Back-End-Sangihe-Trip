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
exports.AdminDestinationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_admin_guard_1 = require("../../common/guards/jwt-admin.guard");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const admin_destination_use_case_1 = require("../../core/application/admin-destination.use-case");
const admin_destination_query_dto_1 = require("../dtos/admin/admin-destination-query.dto");
const admin_destination_dto_1 = require("../dtos/admin/admin-destination.dto");
let AdminDestinationController = class AdminDestinationController {
    destinationUseCase;
    constructor(destinationUseCase) {
        this.destinationUseCase = destinationUseCase;
    }
    async list(query) {
        return await this.destinationUseCase.list(query);
    }
    async getById(id) {
        return await this.destinationUseCase.getById(id);
    }
    async create(dto, req) {
        const adminId = req.user?.id;
        return await this.destinationUseCase.create(dto, adminId);
    }
    async update(id, dto) {
        return await this.destinationUseCase.update(id, dto);
    }
    async delete(id, hard) {
        await this.destinationUseCase.delete(id, hard === 'true');
        return null;
    }
};
exports.AdminDestinationController = AdminDestinationController;
__decorate([
    (0, common_1.Get)(),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil daftar destinasi'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_destination_query_dto_1.AdminDestinationQueryDto]),
    __metadata("design:returntype", Promise)
], AdminDestinationController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil detail destinasi'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDestinationController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    (0, response_decorator_1.ResponseMessage)('Berhasil membuat destinasi baru'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_destination_dto_1.CreateAdminDestinationDto, Object]),
    __metadata("design:returntype", Promise)
], AdminDestinationController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, response_decorator_1.ResponseMessage)('Berhasil memperbarui destinasi'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_destination_dto_1.UpdateAdminDestinationDto]),
    __metadata("design:returntype", Promise)
], AdminDestinationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, response_decorator_1.ResponseMessage)('Berhasil menghapus destinasi'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('hard')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminDestinationController.prototype, "delete", null);
exports.AdminDestinationController = AdminDestinationController = __decorate([
    (0, common_1.Controller)('admin/destinations'),
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    __metadata("design:paramtypes", [admin_destination_use_case_1.AdminDestinationUseCase])
], AdminDestinationController);
//# sourceMappingURL=admin-destination.controller.js.map