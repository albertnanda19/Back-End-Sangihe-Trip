import { UserUseCase } from '../../core/application/user.use-case';
export declare class UserController {
    private readonly userUseCase;
    constructor(userUseCase: UserUseCase);
    findOne(id: string): Promise<import("../../core/domain/user.entity").User>;
}
