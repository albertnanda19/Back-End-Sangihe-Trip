import { Controller, HttpCode, Inject, Get, Param, Query } from '@nestjs/common';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { DestinationUseCase } from '../../core/application/destination.use-case';
import {
  GetDestinationsQueryDto,
  GetDestinationsResponseDto,
} from '../dtos/destination/get-destinations.dto';

@Controller('destination')
export class DestinationController {
  constructor(
    private readonly destinationUseCase: DestinationUseCase,
    @Inject('SUPABASE_CLIENT') private readonly supabase: any,
  ) {}

  // ----------------------------------------------
  // GET DESTINATIONS (with pagination and filtering)
  // ----------------------------------------------
  @ResponseMessage('Berhasil mendapatkan data daftar destinasi')
  @Get()
  @HttpCode(200)
  async getDestinations(
    @Query() query: GetDestinationsQueryDto,
  ): Promise<GetDestinationsResponseDto> {
    const result = await this.destinationUseCase.findAll(query);
    const { data, totalItems } = result;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Fetch images for all destinations in a single query
    const destinationIds = data.map((d) => d.id);
    const { data: allImages } = await this.supabase
      .from('destination_images')
      .select('*')
      .in('destination_id', destinationIds)
      .order('sort_order', { ascending: true });

    // Group images by destination_id
    const imagesByDestination = (allImages || []).reduce(
      (acc: any, img: any) => {
        if (!acc[img.destination_id]) {
          acc[img.destination_id] = [];
        }
        acc[img.destination_id].push(img);
        return acc;
      },
      {},
    );

    return {
      data: data.map((destination) => {
        const images = imagesByDestination[destination.id] || [];
        return {
          id: destination.id,
          name: destination.name,
          slug: destination.slug,
          description: destination.description,
          address: destination.location.address,
          opening_hours: destination.openHours,
          entry_fee: destination.price,
          category: destination.category,
          avg_rating: destination.rating,
          total_reviews: destination.totalReviews,
          is_featured: destination.isFeatured,
          images: images.map((img: any) => ({
            id: img.id,
            image_url: img.image_url,
            alt_text: img.alt_text,
            image_type: img.image_type,
            sort_order: img.sort_order,
            is_featured: img.is_featured,
          })),
        };
      }),
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  // ----------------------------------------------
  // GET DESTINATION DETAIL BY ID (no view count increment)
  // ----------------------------------------------
  @Get(':id')
  @HttpCode(200)
  @ResponseMessage('Berhasil mengambil data destinasi {name}')
  async getDestinationById(@Param('id') id: string) {
    const dest = await this.destinationUseCase.findById(id);

    // Fetch images from destination_images table
    const { data: images } = await this.supabase
      .from('destination_images')
      .select('*')
      .eq('destination_id', dest.id)
      .order('sort_order', { ascending: true });

    return {
      id: dest.id,
      name: dest.name,
      slug: dest.slug,
      description: dest.description,
      address: dest.location.address,
      latitude: dest.location.lat,
      longitude: dest.location.lng,
      phone: dest.phone,
      email: dest.email,
      website: dest.website,
      opening_hours: dest.openHours,
      entry_fee: dest.price,
      category: dest.category,
      facilities: Array.isArray(dest.facilities)
        ? dest.facilities.map((f) => (typeof f === 'object' ? f.name : f))
        : [],
      avg_rating: dest.rating,
      total_reviews: dest.totalReviews,
      is_featured: dest.isFeatured,
      activities: dest.activities,
      images: (images || []).map((img: any) => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        image_type: img.image_type,
        sort_order: img.sort_order,
        is_featured: img.is_featured,
      })),
    };
  }

  // ----------------------------------------------
  // GET DESTINATION DETAIL BY SLUG (with view count increment)
  // ----------------------------------------------
  @Get('slug/:slug')
  @HttpCode(200)
  @ResponseMessage('Berhasil mengambil data destinasi {name}')
  async getDestinationBySlug(@Param('slug') slug: string) {
    const dest = await this.destinationUseCase.findBySlug(slug);

    // Fetch images from destination_images table
    const { data: images } = await this.supabase
      .from('destination_images')
      .select('*')
      .eq('destination_id', dest.id)
      .order('sort_order', { ascending: true });

    return {
      id: dest.id,
      name: dest.name,
      slug: dest.slug,
      description: dest.description,
      address: dest.location.address,
      latitude: dest.location.lat,
      longitude: dest.location.lng,
      phone: dest.phone,
      email: dest.email,
      website: dest.website,
      opening_hours: dest.openHours,
      entry_fee: dest.price,
      category: dest.category,
      facilities: Array.isArray(dest.facilities)
        ? dest.facilities.map((f) => (typeof f === 'object' ? f.name : f))
        : [],
      avg_rating: dest.rating,
      total_reviews: dest.totalReviews,
      is_featured: dest.isFeatured,
      activities: dest.activities,
      images: (images || []).map((img: any) => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        image_type: img.image_type,
        sort_order: img.sort_order,
        is_featured: img.is_featured,
      })),
    };
  }
}
