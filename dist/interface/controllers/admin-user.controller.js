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
exports.AdminUserController = void 0;
const common_1 = require("@nestjs/common");
const jwt_admin_guard_1 = require("../../common/guards/jwt-admin.guard");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const admin_user_use_case_1 = require("../../core/application/admin-user.use-case");
const admin_user_query_dto_1 = require("../dtos/admin/admin-user-query.dto");
const admin_user_update_dto_1 = require("../dtos/admin/admin-user-update.dto");
let AdminUserController = class AdminUserController {
    userUseCase;
    constructor(userUseCase) {
        this.userUseCase = userUseCase;
    }
    async list(query) {
        return await this.userUseCase.list(query);
    }
    async getById(id) {
        return await this.userUseCase.getById(id);
    }
    async update(id, dto) {
        return await this.userUseCase.update(id, dto);
    }
    async delete(id, hard) {
        await this.userUseCase.delete(id, hard === 'true');
        return null;
    }
};
exports.AdminUserController = AdminUserController;
__decorate([
    (0, common_1.Get)(),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil daftar pengguna'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_user_query_dto_1.AdminUserQueryDto]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil detail pengguna'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, response_decorator_1.ResponseMessage)('Berhasil memperbarui pengguna'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_user_update_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, response_decorator_1.ResponseMessage)('Berhasil menghapus pengguna'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('hard')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "delete", null);
exports.AdminUserController = AdminUserController = __decorate([
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    __metadata("design:paramtypes", [admin_user_use_case_1.AdminUserUseCase])
], AdminUserController);
//# sourceMappingURL=admin-user.controller.js.map