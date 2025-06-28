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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const supabase_js_1 = require("@supabase/supabase-js");
const common_2 = require("@nestjs/common");
const response_decorator_1 = require("./common/decorators/response.decorator");
let AppController = class AppController {
    appService;
    supabase;
    constructor(appService, supabase) {
        this.appService = appService;
        this.supabase = supabase;
    }
    getHello() {
        return this.appService.getHello();
    }
    async testDbConnection() {
        const { data, error } = await this.supabase.from('destination_categories').select('*').limit(1);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    }
};
exports.AppController = AppController;
__decorate([
    (0, response_decorator_1.ResponseMessage)('Hello from Sangihe Trip API!'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, response_decorator_1.ResponseMessage)('Database connection test successful.'),
    (0, common_1.Get)('test-db'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "testDbConnection", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __param(1, (0, common_2.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [app_service_1.AppService,
        supabase_js_1.SupabaseClient])
], AppController);
//# sourceMappingURL=app.controller.js.map