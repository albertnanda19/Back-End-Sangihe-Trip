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
    destinationRepository;
    userRepository;
    constructor(repository, destinationRepository, userRepository) {
        this.repository = repository;
        this.destinationRepository = destinationRepository;
        this.userRepository = userRepository;
    }
    async execute(id) {
        try {
            const trip = await this.repository.findById(id);
            if (!trip) {
                throw new common_1.NotFoundException('Trip tidak ditemukan');
            }
            const owner = await this.userRepository.findById(trip.userId);
            const destinationsWithDetails = await Promise.all(trip.destinations.map(async (destId) => {
                const dest = await this.destinationRepository.findById(destId);
                return dest
                    ? { id: dest.id, name: dest.name }
                    : { id: destId, name: 'Unknown Destination' };
            }));
            let coverImage = null;
            if (trip.destinations.length > 0) {
                const firstDest = await this.destinationRepository.findById(trip.destinations[0]);
                if (firstDest && firstDest.images && firstDest.images.length > 0) {
                    coverImage = firstDest.images[0];
                }
            }
            const totalBudget = Object.values(trip.budget).reduce((sum, val) => sum + (val || 0), 0);
            const slug = trip.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            const enrichedSchedule = await Promise.all(trip.schedule.map(async (day) => {
                const enrichedItems = await Promise.all(day.items.map(async (item) => {
                    const dest = await this.destinationRepository.findById(item.destinationId);
                    return {
                        ...item,
                        destinationName: dest?.name || 'Unknown Destination',
                    };
                }));
                return {
                    day: day.day,
                    items: enrichedItems,
                };
            }));
            return {
                id: trip.id,
                userId: trip.userId,
                name: trip.name,
                slug,
                startDate: trip.startDate.toISOString(),
                endDate: trip.endDate.toISOString(),
                peopleCount: trip.peopleCount,
                tripType: trip.tripType,
                isPublic: trip.isPublic,
                destinations: destinationsWithDetails,
                schedule: enrichedSchedule,
                budget: trip.budget,
                totalBudget,
                notes: trip.notes || '',
                packingList: trip.packingList,
                coverImage,
                createdAt: trip.createdAt.toISOString(),
                updatedAt: trip.createdAt.toISOString(),
                owner: owner
                    ? {
                        id: owner.id,
                        name: owner.name,
                        firstName: owner.firstName,
                        lastName: owner.lastName,
                        avatar: owner.avatarUrl,
                    }
                    : null,
            };
        }
        catch (e) {
            if (e instanceof common_1.NotFoundException)
                throw e;
            throw new common_1.InternalServerErrorException(e instanceof Error ? e.message : 'Unknown error');
        }
    }
};
exports.GetTripUseCase = GetTripUseCase;
exports.GetTripUseCase = GetTripUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TripPlanRepository')),
    __param(1, (0, common_1.Inject)('DestinationRepository')),
    __param(2, (0, common_1.Inject)('UserRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], GetTripUseCase);
//# sourceMappingURL=get-trip.use-case.js.map