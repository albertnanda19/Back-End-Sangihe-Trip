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
exports.LandingPageController = void 0;
const common_1 = require("@nestjs/common");
const landing_page_use_case_1 = require("../../core/application/landing-page.use-case");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const landing_page_query_dto_1 = require("../dtos/landing-page-query.dto");
let LandingPageController = class LandingPageController {
    landingPageUseCase;
    constructor(landingPageUseCase) {
        this.landingPageUseCase = landingPageUseCase;
    }
    getLandingPage(query) {
        return this.landingPageUseCase.execute(query.category);
    }
};
exports.LandingPageController = LandingPageController;
__decorate([
    (0, common_1.Get)(),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil data landing page'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [landing_page_query_dto_1.LandingPageQueryDto]),
    __metadata("design:returntype", void 0)
], LandingPageController.prototype, "getLandingPage", null);
exports.LandingPageController = LandingPageController = __decorate([
    (0, common_1.Controller)('landing-page'),
    __metadata("design:paramtypes", [landing_page_use_case_1.LandingPageUseCase])
], LandingPageController);
//# sourceMappingURL=landing-page.controller.js.map