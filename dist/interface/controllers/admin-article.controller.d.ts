import { FirebaseStorage } from 'firebase/storage';
import { CreateArticleUseCase } from '../../core/application/create-article.use-case';
import { AdminArticleUseCase } from '../../core/application/admin-article.use-case';
import { AdminArticleQueryDto } from '../dtos/admin/admin-article-query.dto';
import { CreateAdminArticleDto, UpdateAdminArticleDto } from '../dtos/admin/admin-article.dto';
export declare class AdminArticleController {
    private readonly adminArticleUseCase;
    private readonly createArticleUc;
    private readonly storage;
    constructor(adminArticleUseCase: AdminArticleUseCase, createArticleUc: CreateArticleUseCase, storage: FirebaseStorage);
    list(query: AdminArticleQueryDto): Promise<any>;
    getById(id: string): Promise<any>;
    createWithUpload(req: any): Promise<import("../../core/domain/article.entity").Article>;
    create(dto: CreateAdminArticleDto, req: any): Promise<any>;
    update(id: string, dto: UpdateAdminArticleDto, req: any): Promise<any>;
    delete(id: string, req: any): Promise<null>;
    publish(id: string, req: any): Promise<any>;
}
