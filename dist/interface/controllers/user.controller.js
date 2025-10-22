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
const jwt_access_guard_1 = require("../../common/guards/jwt-access.guard");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const my_trips_query_dto_1 = require("../dtos/trip/my-trips-query.dto");
let UserController = class UserController {
    userUseCase;
    listUserTripsUc;
    listUserReviewsUc;
    constructor(userUseCase, listUserTripsUc, listUserReviewsUc) {
        this.userUseCase = userUseCase;
        this.listUserTripsUc = listUserTripsUc;
        this.listUserReviewsUc = listUserReviewsUc;
    }
    async getMyProfile(req) {
        const userId = req.user?.id;
        return this.userUseCase.getUserProfile(userId);
    }
    async getMyTrips(req, query) {
        const userId = req.user?.id;
        const page = query.page ?? 1;
        const limit = query.per_page ?? 10;
        return this.listUserTripsUc.execute(userId, page, limit);
    }
    async getMyReviews(req, limit) {
        const userId = req.user?.id;
        const reviewLimit = limit ?? 10;
        return this.listUserReviewsUc.execute(userId, 1, reviewLimit);
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
    (0, common_1.Get)('me/reviews'),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan data daftar review'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
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
        list_user_reviews_use_case_1.ListUserReviewsUseCase])
], UserController);
//# sourceMappingURL=user.controller.js.map