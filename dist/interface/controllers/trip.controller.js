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
exports.TripController = void 0;
const common_1 = require("@nestjs/common");
const create_trip_use_case_1 = require("../../core/application/create-trip.use-case");
const get_trip_use_case_1 = require("../../core/application/get-trip.use-case");
const create_trip_dto_1 = require("../dtos/trip/create-trip.dto");
const jwt_access_guard_1 = require("../../common/guards/jwt-access.guard");
const response_decorator_1 = require("../../common/decorators/response.decorator");
let TripController = class TripController {
    createTripUc;
    getTripUc;
    constructor(createTripUc, getTripUc) {
        this.createTripUc = createTripUc;
        this.getTripUc = getTripUc;
    }
    async create(dto, req) {
        const userId = req.user?.id;
        await this.createTripUc.execute({
            ...dto,
            userId,
            schedule: dto.schedule,
            budget: { ...dto.budget },
        });
        return null;
    }
    async getTripDetail(id) {
        const trip = await this.getTripUc.execute(id);
        return trip;
    }
};
exports.TripController = TripController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    (0, response_decorator_1.ResponseMessage)('Berhasil menambah rencana perjalanan baru'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_trip_dto_1.CreateTripDto, Object]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(200),
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan data trip {name}'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "getTripDetail", null);
exports.TripController = TripController = __decorate([
    (0, common_1.Controller)('trips'),
    __metadata("design:paramtypes", [create_trip_use_case_1.CreateTripUseCase,
        get_trip_use_case_1.GetTripUseCase])
], TripController);
//# sourceMappingURL=trip.controller.js.map