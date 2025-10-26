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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_use_case_1 = require("../../core/application/user.use-case");
const list_user_trips_use_case_1 = require("../../core/application/list-user-trips.use-case");
const list_user_reviews_use_case_1 = require("../../core/application/list-user-reviews.use-case");
const update_user_profile_use_case_1 = require("../../core/application/update-user-profile.use-case");
const update_password_use_case_1 = require("../../core/application/update-password.use-case");
const delete_trip_use_case_1 = require("../../core/application/delete-trip.use-case");
const update_trip_use_case_1 = require("../../core/application/update-trip.use-case");
const jwt_access_guard_1 = require("../../common/guards/jwt-access.guard");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const my_trips_query_dto_1 = require("../dtos/trip/my-trips-query.dto");
const update_profile_dto_1 = require("../dtos/user/update-profile.dto");
const update_password_dto_1 = require("../dtos/user/update-password.dto");
const update_trip_dto_1 = require("../dtos/trip/update-trip.dto");
const my_reviews_query_dto_1 = require("../dtos/user/my-reviews-query.dto");
let UserController = class UserController {
    userUseCase;
    listUserTripsUc;
    listUserReviewsUc;
    updateUserProfileUc;
    updatePasswordUc;
    deleteTripUc;
    updateTripUc;
    constructor(userUseCase, listUserTripsUc, listUserReviewsUc, updateUserProfileUc, updatePasswordUc, deleteTripUc, updateTripUc) {
        this.userUseCase = userUseCase;
        this.listUserTripsUc = listUserTripsUc;
        this.listUserReviewsUc = listUserReviewsUc;
        this.updateUserProfileUc = updateUserProfileUc;
        this.updatePasswordUc = updatePasswordUc;
        this.deleteTripUc = deleteTripUc;
        this.updateTripUc = updateTripUc;
    }
    async getMyProfile(req) {
        const userId = req.user?.id;
        return this.userUseCase.getUserProfile(userId);
    }
    async updateMyProfile(req, dto) {
        const userId = req.user?.id;
        return this.updateUserProfileUc.execute(userId, dto);
    }
    async updateMyPassword(req, dto) {
        const userId = req.user?.id;
        await this.updatePasswordUc.execute(userId, dto.currentPassword, dto.newPassword);
        return null;
    }
    async getMyTrips(req, query) {
        const userId = req.user?.id;
        const page = query.page ?? 1;
        const limit = query.per_page ?? 10;
        return this.listUserTripsUc.execute(userId, page, limit);
    }
    async deleteMyTrip(req, tripId) {
        const userId = req.user?.id;
        await this.deleteTripUc.execute(tripId, userId);
        return null;
    }
    async updateMyTrip(req, tripId, dto) {
        const userId = req.user?.id;
        await this.updateTripUc.execute({
            tripId,
            userId,
            ...dto,
        });
        return null;
    }
    async getMyReviews(req, query) {
        const userId = req.user?.id;
        const page = query.page ?? 1;
        const limit = query.per_page ?? 10;
        const sortBy = query.sortBy ?? 'date';
        const order = query.order ?? 'desc';
        const rating = query.rating;
        return this.listUserReviewsUc.execute(userId, page, limit, sortBy, order, rating);
    }
    async findOne(id) {
        return this.userUseCase.getUserById(id);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan data profil'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    (0, response_decorator_1.ResponseMessage)('Berhasil memperbarui profil'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Patch)('me/password'),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    (0, response_decorator_1.ResponseMessage)('Berhasil memperbarui password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_password_dto_1.UpdatePasswordDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateMyPassword", null);
__decorate([
    (0, common_1.Get)('me/trips'),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan data daftar perjalanan'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, my_trips_query_dto_1.MyTripsQueryDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyTrips", null);
__decorate([
    (0, common_1.Delete)('me/trips/:id'),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    (0, response_decorator_1.ResponseMessage)('Berhasil menghapus rencana perjalanan'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteMyTrip", null);
__decorate([
    (0, common_1.Patch)('me/trips/:id'),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    (0, response_decorator_1.ResponseMessage)('Berhasil memperbarui rencana perjalanan'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_trip_dto_1.UpdateTripDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateMyTrip", null);
__decorate([
    (0, common_1.Get)('me/reviews'),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan data daftar review'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, my_reviews_query_dto_1.MyReviewsQueryDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyReviews", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_use_case_1.UserUseCase,
        list_user_trips_use_case_1.ListUserTripsUseCase,
        list_user_reviews_use_case_1.ListUserReviewsUseCase,
        update_user_profile_use_case_1.UpdateUserProfileUseCase,
        update_password_use_case_1.UpdatePasswordUseCase,
        delete_trip_use_case_1.DeleteTripUseCase,
        update_trip_use_case_1.UpdateTripUseCase])
], UserController);
//# sourceMappingURL=user.controller.js.map