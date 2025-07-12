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
exports.DestinationController = void 0;
const common_1 = require("@nestjs/common");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const destination_use_case_1 = require("../../core/application/destination.use-case");
const delete_destination_use_case_1 = require("../../core/application/delete-destination.use-case");
const admin_guard_1 = require("../../common/guards/admin.guard");
const crypto_1 = require("crypto");
const storage_1 = require("firebase/storage");
const firebase_provider_1 = require("../../infrastructure/firebase/firebase.provider");
const create_destination_dto_1 = require("../dtos/destination/create-destination.dto");
const get_destinations_dto_1 = require("../dtos/destination/get-destinations.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let DestinationController = class DestinationController {
    destinationUseCase;
    deleteDestinationUc;
    storage;
    constructor(destinationUseCase, deleteDestinationUc, storage) {
        this.destinationUseCase = destinationUseCase;
        this.deleteDestinationUc = deleteDestinationUc;
        this.storage = storage;
    }
    async createDestination(req) {
        const uploadedImageRefs = [];
        let payloadJson = '';
        try {
            const parts = req.parts();
            const uploadedImageUrls = [];
            let videoUrl;
            const fileProcessingPromises = [];
            for await (const part of parts) {
                if (part.type === 'file') {
                    const task = (async () => {
                        const buffer = await part.toBuffer();
                        const extension = (part.filename?.split('.').pop() ?? '').toLowerCase();
                        const filename = `${(0, crypto_1.randomUUID)()}.${extension}`;
                        const storageRef = (0, storage_1.ref)(this.storage, `destinations/${filename}`);
                        await (0, storage_1.uploadBytes)(storageRef, buffer, { contentType: part.mimetype });
                        uploadedImageRefs.push(storageRef);
                        const url = await (0, storage_1.getDownloadURL)(storageRef);
                        if (part.fieldname === 'video') {
                            videoUrl = url;
                        }
                        else if (part.fieldname.startsWith('images')) {
                            uploadedImageUrls.push(url);
                        }
                    })();
                    fileProcessingPromises.push(task);
                }
                else if (part.type === 'field' && part.fieldname === 'payload') {
                    payloadJson = part.value;
                }
            }
            await Promise.all(fileProcessingPromises);
            if (!payloadJson) {
                throw new Error('Missing payload field');
            }
            const dto = (0, class_transformer_1.plainToInstance)(create_destination_dto_1.CreateDestinationDto, JSON.parse(payloadJson), {
                enableImplicitConversion: true,
            });
            await (0, class_validator_1.validateOrReject)(dto, { whitelist: true });
            const result = await this.destinationUseCase.execute({
                ...dto,
                images: uploadedImageUrls,
                video: videoUrl,
                uploaderId: req.user.id,
            });
            return result;
        }
        catch (err) {
            await Promise.all(uploadedImageRefs.map((fileRef) => (0, storage_1.deleteObject)(fileRef).catch(console.error)));
            throw err;
        }
    }
    async getDestinations(query, req) {
        const result = await this.destinationUseCase.findAll(query);
        const { data, totalItems } = result;
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 12;
        const totalPages = Math.ceil(totalItems / pageSize);
        return {
            data: data.map((destination) => {
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
                    images: images,
                    facilities: Array.isArray(destination.facilities)
                        ? destination.facilities.map((f) => f.name || f.icon || f)
                        : [],
                    description: destination.description,
                };
            }),
            meta: {
                page,
                pageSize,
                totalItems,
                totalPages,
            },
        };
    }
    async getDestinationDetail(id) {
        const dest = await this.destinationUseCase.findById(id);
        return {
            id: dest.id,
            name: dest.name,
            category: dest.category,
            location: {
                address: dest.location.address,
                lat: dest.location.lat,
                lng: dest.location.lng,
            },
            price: dest.price,
            openHours: dest.openHours,
            description: dest.description,
            facilities: dest.facilities,
            tips: dest.tips,
            images: dest.images,
            video: dest.video,
            rating: dest.rating,
            totalReviews: dest.totalReviews,
        };
    }
    async deleteDestination(id) {
        const deleted = await this.deleteDestinationUc.execute(id);
        return { name: deleted.name };
    }
};
exports.DestinationController = DestinationController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, response_decorator_1.ResponseMessage)('Berhasil menambahkan destinasi baru!'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DestinationController.prototype, "createDestination", null);
__decorate([
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan data daftar destinasi'),
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_destinations_dto_1.GetDestinationsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], DestinationController.prototype, "getDestinations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(200),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil data destinasi {name}'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DestinationController.prototype, "getDestinationDetail", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(200),
    (0, response_decorator_1.ResponseMessage)('Berhasil menghapus destinasi {name}!'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DestinationController.prototype, "deleteDestination", null);
exports.DestinationController = DestinationController = __decorate([
    (0, common_1.Controller)('destination'),
    __param(2, (0, common_1.Inject)(firebase_provider_1.FIREBASE_STORAGE)),
    __metadata("design:paramtypes", [destination_use_case_1.DestinationUseCase,
        delete_destination_use_case_1.DeleteDestinationUseCase, Object])
], DestinationController);
//# sourceMappingURL=destination.controller.js.map