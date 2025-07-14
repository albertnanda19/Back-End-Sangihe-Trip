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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllDestinationController = void 0;
const common_1 = require("@nestjs/common");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const list_all_destinations_use_case_1 = require("../../core/application/list-all-destinations.use-case");
let AllDestinationController = class AllDestinationController {
    listAllDestinationsUseCase;
    constructor(listAllDestinationsUseCase) {
        this.listAllDestinationsUseCase = listAllDestinationsUseCase;
    }
    async getAllDestinations() {
        const destinations = await this.listAllDestinationsUseCase.execute();
        return destinations.map((destination) => {
            const images = destination.images ?? [];
            return {
                id: destination.id,
                name: destination.name,
                category: destination.category,
                rating: 0,
                totalReviews: 0,
                location: destination.location.address,
                price: destination.price,
                image: images[0] ?? '',
                images,
                facilities: Array.isArray(destination.facilities)
                    ? destination.facilities.map((f) => f.name || f.icon || f)
                    : [],
                description: destination.description,
            };
        });
    }
};
exports.AllDestinationController = AllDestinationController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(200),
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan data daftar destinasi'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AllDestinationController.prototype, "getAllDestinations", null);
exports.AllDestinationController = AllDestinationController = __decorate([
    (0, common_1.Controller)('all-destination'),
    __metadata("design:paramtypes", [list_all_destinations_use_case_1.ListAllDestinationsUseCase])
], AllDestinationController);
//# sourceMappingURL=all-destination.controller.js.map