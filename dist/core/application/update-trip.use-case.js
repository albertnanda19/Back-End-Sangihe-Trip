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
exports.UpdateTripUseCase = void 0;
const common_1 = require("@nestjs/common");
let UpdateTripUseCase = class UpdateTripUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(command) {
        const existingTrip = await this.repository.findById(command.tripId);
        if (!existingTrip) {
            throw new common_1.NotFoundException('Trip tidak ditemukan');
        }
        if (existingTrip.userId !== command.userId) {
            throw new common_1.ForbiddenException('Anda tidak memiliki akses untuk mengubah trip ini');
        }
        const updates = {};
        if (command.name !== undefined)
            updates.name = command.name;
        if (command.startDate !== undefined)
            updates.startDate = new Date(command.startDate);
        if (command.endDate !== undefined)
            updates.endDate = new Date(command.endDate);
        if (command.peopleCount !== undefined)
            updates.peopleCount = command.peopleCount;
        if (command.tripType !== undefined)
            updates.tripType = command.tripType;
        if (command.isPublic !== undefined)
            updates.isPublic = command.isPublic;
        if (command.destinations !== undefined)
            updates.destinations = command.destinations;
        if (command.schedule !== undefined)
            updates.schedule = command.schedule;
        if (command.budget !== undefined)
            updates.budget = command.budget;
        if (command.notes !== undefined)
            updates.notes = command.notes;
        if (command.packingList !== undefined)
            updates.packingList = command.packingList;
        await this.repository.update(command.tripId, updates);
    }
};
exports.UpdateTripUseCase = UpdateTripUseCase;
exports.UpdateTripUseCase = UpdateTripUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TripPlanRepository')),
    __metadata("design:paramtypes", [Object])
], UpdateTripUseCase);
//# sourceMappingURL=update-trip.use-case.js.map