import { UserUseCase } from '../../core/application/user.use-case';
import { ListUserTripsUseCase } from '../../core/application/list-user-trips.use-case';
import { MyTripsQueryDto } from '../dtos/trip/my-trips-query.dto';
export declare class UserController {
    private readonly userUseCase;
    private readonly listUserTripsUc;
    constructor(userUseCase: UserUseCase, listUserTripsUc: ListUserTripsUseCase);
    findOne(id: string): Promise<import("../../core/domain/user.entity").User>;
    getMyTrips(req: any, query: MyTripsQueryDto): Promise<import("../../core/application/list-user-trips.use-case").ListUserTripsResult>;
}
