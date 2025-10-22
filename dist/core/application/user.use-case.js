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
exports.UserUseCase = void 0;
const common_1 = require("@nestjs/common");
let UserUseCase = class UserUseCase {
    userRepository;
    tripPlanRepository;
    constructor(userRepository, tripPlanRepository) {
        this.userRepository = userRepository;
        this.tripPlanRepository = tripPlanRepository;
    }
    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getUserProfile(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { totalItems: tripCount } = await this.tripPlanRepository.findAllByUser({
            userId: id,
            page: 1,
            pageSize: 1,
        });
        const profileCompletion = this.calculateProfileCompletion(user);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: null,
            role: 'user',
            joinDate: user.createdAt.toISOString(),
            profileCompletion,
            stats: {
                tripPlans: tripCount,
                visitedDestinations: 0,
                reviewsWritten: 0,
            },
        };
    }
    calculateProfileCompletion(user) {
        let completion = 0;
        if (user.name)
            completion += 30;
        if (user.email)
            completion += 30;
        return Math.min(completion, 100);
    }
};
exports.UserUseCase = UserUseCase;
exports.UserUseCase = UserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('UserRepository')),
    __param(1, (0, common_1.Inject)('TripPlanRepository')),
    __metadata("design:paramtypes", [Object, Object])
], UserUseCase);
//# sourceMappingURL=user.use-case.js.map