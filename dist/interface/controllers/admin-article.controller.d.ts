import { AdminArticleUseCase } from '../../core/application/admin-article.use-case';
import { AdminArticleQueryDto } from '../dtos/admin/admin-article-query.dto';
import { CreateAdminArticleDto, UpdateAdminArticleDto } from '../dtos/admin/admin-article.dto';
export declare class AdminArticleController {
    private readonly adminArticleUseCase;
    constructor(adminArticleUseCase: AdminArticleUseCase);
    list(query: AdminArticleQueryDto): Promise<any>;
    getById(id: string): Promise<any>;
    create(dto: CreateAdminArticleDto, req: any): Promise<any>;
    update(id: string, dto: UpdateAdminArticleDto): Promise<any>;
    delete(id: string, hard?: string): Promise<null>;
    publish(id: string): Promise<any>;
}
