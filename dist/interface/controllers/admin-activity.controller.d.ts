import { AdminActivityUseCase } from '../../core/application/admin-activity.use-case';
import { AdminActivityQueryDto } from '../dtos/admin/admin-activity-query.dto';
import { AdminAlertQueryDto } from '../dtos/admin/admin-alert-query.dto';
export declare class AdminActivityController {
    private readonly adminActivityUseCase;
    constructor(adminActivityUseCase: AdminActivityUseCase);
    getActivities(query: AdminActivityQueryDto): Promise<any>;
    getAlerts(query: AdminAlertQueryDto): Promise<any>;
}
