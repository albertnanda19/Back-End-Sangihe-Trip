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
exports.ListUserTripsUseCase = void 0;
const common_1 = require("@nestjs/common");
let ListUserTripsUseCase = class ListUserTripsUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(userId, page = 1, limit = 10) {
        try {
            const { data, totalItems } = await this.repo.findAllByUser({
                userId,
                page,
                pageSize: limit,
            });
            const trips = data.map((plan) => {
                const slugBase = plan.name.toLowerCase().replace(/\s+/g, '-');
                const slug = `${slugBase}-${plan.id.toString().slice(0, 8)}`;
                const totalBudget = Object.values(plan.budget ?? {}).reduce((acc, val) => acc + (val ?? 0), 0);
                return {
                    id: plan.id,
                    slug,
                    name: plan.name,
                    startDate: plan.startDate.toISOString().split('T')[0],
                    endDate: plan.endDate.toISOString().split('T')[0],
                    peopleCount: plan.peopleCount,
                    tripType: plan.tripType,
                    destinationCount: plan.destinations.length,
                    coverImage: plan.destinations?.[0] ?? null,
                    totalBudget,
                    isPublic: plan.isPublic,
                    createdAt: plan.createdAt.toISOString(),
                    updatedAt: plan.createdAt.toISOString(),
                };
            });
            return {
                data: trips,
                meta: {
                    page,
                    limit,
                    total: totalItems,
                },
            };
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e.message);
        }
    }
};
exports.ListUserTripsUseCase = ListUserTripsUseCase;
exports.ListUserTripsUseCase = ListUserTripsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TripPlanRepository')),
    __metadata("design:paramtypes", [Object])
], ListUserTripsUseCase);
//# sourceMappingURL=list-user-trips.use-case.js.map