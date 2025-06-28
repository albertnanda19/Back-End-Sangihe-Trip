"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const fs_1 = require("fs");
const path_1 = require("path");
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_controller_1 = require("./interface/controllers/user.controller");
const destination_controller_1 = require("./interface/controllers/destination.controller");
const auth_controller_1 = require("./interface/controllers/auth.controller");
const user_repository_adapter_1 = require("./infrastructure/database/user.repository.adapter");
const destination_repository_adapter_1 = require("./infrastructure/database/destination.repository.adapter");
const user_use_case_1 = require("./core/application/user.use-case");
const destination_use_case_1 = require("./core/application/destination.use-case");
const auth_use_case_1 = require("./core/application/auth.use-case");
const firebase_module_1 = require("./infrastructure/firebase/firebase.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            jwt_1.JwtModule.register({
                privateKey: (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '..', 'private.pem')),
                publicKey: (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '..', 'public.pem')),
                signOptions: {
                    algorithm: 'RS256',
                },
            }),
            firebase_module_1.FirebaseModule,
        ],
        controllers: [
            app_controller_1.AppController,
            auth_controller_1.AuthController,
            user_controller_1.UserController,
            destination_controller_1.DestinationController,
        ],
        providers: [
            app_service_1.AppService,
            auth_use_case_1.AuthUseCase,
            user_use_case_1.UserUseCase,
            destination_use_case_1.DestinationUseCase,
            {
                provide: 'SUPABASE_CLIENT',
                useFactory: () => (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY),
            },
            { provide: 'UserRepository', useClass: user_repository_adapter_1.UserRepositoryAdapter },
            { provide: 'DestinationRepository', useClass: destination_repository_adapter_1.DestinationRepositoryAdapter },
            {
                provide: 'STORAGE_PATH',
                useValue: (0, path_1.join)(__dirname, '..', 'storage'),
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map