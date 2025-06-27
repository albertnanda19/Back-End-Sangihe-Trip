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
const admin_guard_1 = require("../../common/guards/admin.guard");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const create_destination_dto_1 = require("../dtos/destination/create-destination.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let DestinationController = class DestinationController {
    destinationUseCase;
    storagePath;
    constructor(destinationUseCase, storagePath) {
        this.destinationUseCase = destinationUseCase;
        this.storagePath = storagePath;
    }
    async createDestination(req) {
        const files = [];
        const savedFilePaths = [];
        let videoFile;
        let payloadJson = '';
        try {
            const parts = req.parts();
            for await (const part of parts) {
                if (part.type === 'file') {
                    const extension = (part.filename?.split('.').pop() ?? '').toLowerCase();
                    const filename = `${(0, crypto_1.randomUUID)()}.${extension}`;
                    const filepath = (0, path_1.join)(this.storagePath, filename);
                    await (0, promises_1.writeFile)(filepath, await part.toBuffer());
                    savedFilePaths.push(filepath);
                    if (part.fieldname === 'images') {
                        files.push(filename);
                    }
                    else if (part.fieldname === 'video') {
                        videoFile = filename;
                    }
                }
                else if (part.type === 'field' && part.fieldname === 'payload') {
                    payloadJson = part.value;
                }
            }
            if (!payloadJson) {
                throw new Error('Missing payload field');
            }
            let parsed;
            try {
                parsed = JSON.parse(payloadJson);
            }
            catch {
                throw new Error('Invalid JSON in payload field');
            }
            const dto = (0, class_transformer_1.plainToInstance)(create_destination_dto_1.CreateDestinationDto, parsed, {
                enableImplicitConversion: true,
            });
            await (0, class_validator_1.validateOrReject)(dto, { whitelist: true });
            const result = await this.destinationUseCase.execute({
                ...dto,
                images: files,
                video: videoFile,
                uploaderId: req.user.id,
            });
            return result;
        }
        catch (err) {
            await Promise.all(savedFilePaths.map((p) => (0, promises_1.unlink)(p).catch(() => undefined)));
            throw err;
        }
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
exports.DestinationController = DestinationController = __decorate([
    (0, common_1.Controller)('destination'),
    __param(1, (0, common_1.Inject)('STORAGE_PATH')),
    __metadata("design:paramtypes", [destination_use_case_1.DestinationUseCase, String])
], DestinationController);
//# sourceMappingURL=destination.controller.js.map