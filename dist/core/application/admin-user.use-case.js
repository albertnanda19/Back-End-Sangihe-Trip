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
exports.AdminUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const activity_logger_service_1 = require("./activity-logger.service");
let AdminUserUseCase = class AdminUserUseCase {
    supabase;
    activityLogger;
    constructor(supabase, activityLogger) {
        this.supabase = supabase;
        this.activityLogger = activityLogger;
    }
    async list(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const offset = (page - 1) * limit;
        let dbQuery = this.supabase
            .from('users')
            .select('*', { count: 'exact' })
            .is('deleted_at', null);
        if (query.search) {
            dbQuery = dbQuery.or(`email.ilike.%${query.search}%,first_name.ilike.%${query.search}%,last_name.ilike.%${query.search}%`);
        }
        if (query.status) {
            dbQuery = dbQuery.eq('status', query.status);
        }
        dbQuery = dbQuery.order('created_at', { ascending: false });
        dbQuery = dbQuery.range(offset, offset + limit - 1);
        const { data, error, count } = await dbQuery;
        if (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
        const usersWithRoles = await Promise.all((data || []).map(async (user) => {
            let roleName = null;
            if (user.role_id) {
                const { data: roleData } = await this.supabase
                    .from('roles')
                    .select('name')
                    .eq('id', user.role_id)
                    .single();
                roleName = roleData?.name || null;
            }
            return {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                avatar_url: user.avatar_url,
                status: user.status,
                email_verified: user.email_verified,
                last_login_at: user.last_login_at,
                created_at: user.created_at,
                role: roleName,
            };
        }));
        return {
            data: usersWithRoles,
            meta: {
                page,
                limit,
                total: count || 0,
            },
        };
    }
    async getById(id) {
        const { data: user, error } = await this.supabase
            .from('users')
            .select('*, user_profiles(*)')
            .eq('id', id)
            .is('deleted_at', null)
            .single();
        if (error || !user) {
            throw new common_1.NotFoundException('User not found');
        }
        let role = null;
        if (user.role_id) {
            const { data: roleData } = await this.supabase
                .from('roles')
                .select('id, name, description')
                .eq('id', user.role_id)
                .single();
            role = roleData || null;
        }
        const { count: tripCount } = await this.supabase
            .from('trip_plans')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', id)
            .is('deleted_at', null);
        const { count: reviewCount } = await this.supabase
            .from('reviews')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', id)
            .is('deleted_at', null);
        return {
            ...user,
            role,
            tripPlansCount: tripCount || 0,
            reviewsCount: reviewCount || 0,
        };
    }
    async update(id, data, adminUser, ipAddress, userAgent) {
        const existingUser = await this.getById(id);
        const updateData = {};
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.role !== undefined) {
            const { data: roleData } = await this.supabase
                .from('roles')
                .select('id')
                .eq('name', data.role)
                .single();
            if (roleData) {
                updateData.role_id = roleData.id;
            }
        }
        if (Object.keys(updateData).length > 0) {
            const { error } = await this.supabase
                .from('users')
                .update(updateData)
                .eq('id', id);
            if (error) {
                throw new Error(`Failed to update user: ${error.message}`);
            }
        }
        const updatedUser = await this.getById(id);
        if (adminUser && Object.keys(updateData).length > 0) {
            const adminName = adminUser.name || 'Admin';
            const userName = `${updatedUser.first_name} ${updatedUser.last_name}`.trim();
            const oldValues = {};
            const newValues = {};
            if (data.status !== undefined) {
                oldValues.status = existingUser.status;
                newValues.status = data.status;
            }
            if (data.role !== undefined) {
                oldValues.role = existingUser.role?.name;
                newValues.role = data.role;
            }
            await this.activityLogger.logAdminAction(adminUser.id, 'update', 'user', id, {
                userName,
                description: `${adminName} updated user "${userName}"`,
            }, newValues, adminName, adminUser.email, userName, ipAddress, userAgent, oldValues);
        }
        return updatedUser;
    }
    async delete(id, hard = false) {
        await this.getById(id);
        if (hard) {
            const { error } = await this.supabase
                .from('users')
                .delete()
                .eq('id', id);
            if (error) {
                throw new Error(`Failed to delete user: ${error.message}`);
            }
        }
        else {
            const { error } = await this.supabase
                .from('users')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);
            if (error) {
                throw new Error(`Failed to delete user: ${error.message}`);
            }
        }
    }
};
exports.AdminUserUseCase = AdminUserUseCase;
exports.AdminUserUseCase = AdminUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient,
        activity_logger_service_1.ActivityLoggerService])
], AdminUserUseCase);
//# sourceMappingURL=admin-user.use-case.js.map