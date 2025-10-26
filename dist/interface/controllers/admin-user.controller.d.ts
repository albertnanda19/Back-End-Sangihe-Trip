import { AdminUserUseCase } from '../../core/application/admin-user.use-case';
import { AdminUserQueryDto } from '../dtos/admin/admin-user-query.dto';
import { UpdateUserDto } from '../dtos/admin/admin-user-update.dto';
export declare class AdminUserController {
    private readonly userUseCase;
    constructor(userUseCase: AdminUserUseCase);
    list(query: AdminUserQueryDto): Promise<import("../../core/application/admin-user.use-case").AdminUserListResult>;
    getById(id: string): Promise<any>;
    update(id: string, dto: UpdateUserDto): Promise<any>;
    delete(id: string, hard?: string): Promise<null>;
}
