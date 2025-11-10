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
exports.CreateTripUseCase = void 0;
const common_1 = require("@nestjs/common");
const trip_plan_entity_1 = require("../domain/trip-plan.entity");
const activity_logger_service_1 = require("./activity-logger.service");
let CreateTripUseCase = class CreateTripUseCase {
    repo;
    activityLogger;
    constructor(repo, activityLogger) {
        this.repo = repo;
        this.activityLogger = activityLogger;
    }
    async execute(cmd) {
        const plan = new trip_plan_entity_1.TripPlan(cmd.userId, cmd.name, new Date(cmd.startDate), new Date(cmd.endDate), cmd.peopleCount, cmd.tripType, cmd.isPublic, cmd.destinations, cmd.schedule, cmd.budget, cmd.notes ?? null, cmd.packingList ?? []);
        await this.repo.create(plan);
        await this.activityLogger.logTripPlanAction(cmd.userId, 'create', plan.id, {
            name: cmd.name,
            startDate: cmd.startDate,
            endDate: cmd.endDate,
            peopleCount: cmd.peopleCount,
            tripType: cmd.tripType,
            isPublic: cmd.isPublic,
            destinations: cmd.destinations,
        });
    }
};
exports.CreateTripUseCase = CreateTripUseCase;
exports.CreateTripUseCase = CreateTripUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TripPlanRepository')),
    __metadata("design:paramtypes", [Object, activity_logger_service_1.ActivityLoggerService])
], CreateTripUseCase);
//# sourceMappingURL=create-trip.use-case.js.map