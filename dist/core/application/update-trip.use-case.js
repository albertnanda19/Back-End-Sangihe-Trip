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
const activity_logger_service_1 = require("./activity-logger.service");
let UpdateTripUseCase = class UpdateTripUseCase {
    repository;
    activityLogger;
    constructor(repository, activityLogger) {
        this.repository = repository;
        this.activityLogger = activityLogger;
    }
    async execute(command) {
        const existingTrip = await this.repository.findById(command.tripId);
        if (!existingTrip) {
            throw new common_1.NotFoundException('Trip tidak ditemukan');
        }
        if (existingTrip.userId !== command.userId) {
            throw new common_1.ForbiddenException('Anda tidak memiliki akses untuk mengubah trip ini');
        }
        const oldTripData = {
            name: existingTrip.name,
            startDate: existingTrip.startDate.toISOString(),
            endDate: existingTrip.endDate.toISOString(),
            peopleCount: existingTrip.peopleCount,
            tripType: existingTrip.tripType,
            isPublic: existingTrip.isPublic,
            destinations: existingTrip.destinations,
            notes: existingTrip.notes,
        };
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
        const newTripData = {
            name: updates.name ?? oldTripData.name,
            startDate: updates.startDate?.toISOString() ?? oldTripData.startDate,
            endDate: updates.endDate?.toISOString() ?? oldTripData.endDate,
            peopleCount: updates.peopleCount ?? oldTripData.peopleCount,
            tripType: updates.tripType ?? oldTripData.tripType,
            isPublic: updates.isPublic ?? oldTripData.isPublic,
            destinations: updates.destinations ?? oldTripData.destinations,
            notes: updates.notes ?? oldTripData.notes,
        };
        await this.activityLogger.logTripPlanAction(command.userId, 'update_trip', command.tripId, newTripData, oldTripData);
    }
};
exports.UpdateTripUseCase = UpdateTripUseCase;
exports.UpdateTripUseCase = UpdateTripUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TripPlanRepository')),
    __metadata("design:paramtypes", [Object, activity_logger_service_1.ActivityLoggerService])
], UpdateTripUseCase);
//# sourceMappingURL=update-trip.use-case.js.map