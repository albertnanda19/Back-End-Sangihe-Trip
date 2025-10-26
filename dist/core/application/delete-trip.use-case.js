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
exports.DeleteTripUseCase = void 0;
const common_1 = require("@nestjs/common");
let DeleteTripUseCase = class DeleteTripUseCase {
    tripRepository;
    constructor(tripRepository) {
        this.tripRepository = tripRepository;
    }
    async execute(tripId, userId) {
        const trip = await this.tripRepository.findById(tripId);
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        if (trip.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this trip');
        }
        const deleted = await this.tripRepository.delete(tripId);
        if (!deleted) {
            throw new common_1.NotFoundException('Trip not found');
        }
    }
};
exports.DeleteTripUseCase = DeleteTripUseCase;
exports.DeleteTripUseCase = DeleteTripUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TripPlanRepository')),
    __metadata("design:paramtypes", [Object])
], DeleteTripUseCase);
//# sourceMappingURL=delete-trip.use-case.js.map