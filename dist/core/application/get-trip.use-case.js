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
exports.GetTripUseCase = void 0;
const common_1 = require("@nestjs/common");
let GetTripUseCase = class GetTripUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id) {
        try {
            const trip = await this.repository.findById(id);
            if (!trip) {
                throw new common_1.NotFoundException('Trip tidak ditemukan');
            }
            return trip;
        }
        catch (e) {
            if (e instanceof common_1.NotFoundException)
                throw e;
            throw new common_1.InternalServerErrorException(e.message);
        }
    }
};
exports.GetTripUseCase = GetTripUseCase;
exports.GetTripUseCase = GetTripUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TripPlanRepository')),
    __metadata("design:paramtypes", [Object])
], GetTripUseCase);
//# sourceMappingURL=get-trip.use-case.js.map