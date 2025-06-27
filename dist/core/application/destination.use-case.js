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
exports.DestinationUseCase = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const destination_entity_1 = require("../domain/destination.entity");
let DestinationUseCase = class DestinationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(payload) {
        const dest = new destination_entity_1.Destination((0, crypto_1.randomUUID)(), payload.name, payload.category, payload.location, payload.distanceKm, payload.price, payload.openHours, payload.description, payload.facilities, payload.tips, payload.images, payload.video);
        try {
            return await this.repository.save(dest);
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e.message);
        }
    }
};
exports.DestinationUseCase = DestinationUseCase;
exports.DestinationUseCase = DestinationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DestinationRepository')),
    __metadata("design:paramtypes", [Object])
], DestinationUseCase);
//# sourceMappingURL=destination.use-case.js.map