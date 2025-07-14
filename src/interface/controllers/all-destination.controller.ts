import { Controller, Get, HttpCode } from '@nestjs/common';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { ListAllDestinationsUseCase } from '../../core/application/list-all-destinations.use-case';

@Controller('all-destination')
export class AllDestinationController {
  constructor(private readonly listAllDestinationsUseCase: ListAllDestinationsUseCase) {}

  @Get()
  @HttpCode(200)
  @ResponseMessage('Berhasil mendapatkan data daftar destinasi')
  async getAllDestinations() {
    const destinations = await this.listAllDestinationsUseCase.execute();

    return destinations.map((destination) => {
      const images: string[] = destination.images ?? [];
      return {
        id: destination.id,
        name: destination.name,
        category: destination.category,
        rating: 0,
        totalReviews: 0,
        location: destination.location.address,
        price: destination.price,
        image: images[0] ?? '',
        images,
        facilities: Array.isArray(destination.facilities)
          ? destination.facilities.map((f: any) => f.name || f.icon || f)
          : [],
        description: destination.description,
      };
    });
  }
} 