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
exports.UpdateUserProfileUseCase = void 0;
const common_1 = require("@nestjs/common");
const activity_logger_service_1 = require("./activity-logger.service");
let UpdateUserProfileUseCase = class UpdateUserProfileUseCase {
    userRepository;
    activityLogger;
    constructor(userRepository, activityLogger) {
        this.userRepository = userRepository;
        this.activityLogger = activityLogger;
    }
    async execute(userId, data) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const oldProfile = {
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
        };
        const updateData = {};
        if (data.firstName || data.first_name) {
            updateData.firstName = data.firstName || data.first_name;
        }
        if (data.lastName || data.last_name) {
            updateData.lastName = data.lastName || data.last_name;
        }
        if (data.avatar || data.avatar_url) {
            updateData.avatarUrl = data.avatar || data.avatar_url;
        }
        const updatedUser = await this.userRepository.update(userId, updateData);
        if (!updatedUser) {
            throw new common_1.NotFoundException('Failed to update user');
        }
        const newProfile = {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            avatarUrl: updatedUser.avatarUrl,
        };
        await this.activityLogger.logProfileUpdate(userId, oldProfile, newProfile);
        return {
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            first_name: updatedUser.firstName,
            lastName: updatedUser.lastName,
            last_name: updatedUser.lastName,
            avatar: updatedUser.avatarUrl,
            avatar_url: updatedUser.avatarUrl,
        };
    }
};
exports.UpdateUserProfileUseCase = UpdateUserProfileUseCase;
exports.UpdateUserProfileUseCase = UpdateUserProfileUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('UserRepository')),
    __metadata("design:paramtypes", [Object, activity_logger_service_1.ActivityLoggerService])
], UpdateUserProfileUseCase);
//# sourceMappingURL=update-user-profile.use-case.js.map