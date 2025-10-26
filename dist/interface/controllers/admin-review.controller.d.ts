import { AdminReviewUseCase } from '../../core/application/admin-review.use-case';
import { AdminReviewQueryDto } from '../dtos/admin/admin-review-query.dto';
import { ApproveReviewDto, RejectReviewDto } from '../dtos/admin/admin-review-action.dto';
interface AuthenticatedRequest {
    user?: {
        id: string;
        email: string;
        name: string;
    };
}
export declare class AdminReviewController {
    private readonly reviewUseCase;
    constructor(reviewUseCase: AdminReviewUseCase);
    list(query: AdminReviewQueryDto): Promise<import("../../core/application/admin-review.use-case").AdminReviewListResult>;
    getById(id: string): Promise<any>;
    approve(id: string, dto: ApproveReviewDto, req: AuthenticatedRequest): Promise<any>;
    reject(id: string, dto: RejectReviewDto, req: AuthenticatedRequest): Promise<any>;
}
export {};
