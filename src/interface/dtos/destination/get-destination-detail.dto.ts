export interface DestinationDetailFacilityDto {
  name: string;
  icon: string;
  available: boolean;
}

export interface DestinationDetailReviewUserDto {
  name: string;
  avatar: string;
}

export interface DestinationDetailReviewDto {
  id: string;
  user: DestinationDetailReviewUserDto;
  rating: number;
  date: string;
  visitDate: string;
  text: string;
  images?: string[];
  helpful: number;
}

export interface DestinationDetailMediaDto {
  images: string[];
  hasVideo: boolean;
  videoUrl: string | null;
}

export interface DestinationDetailRatingBreakdownDto {
  stars: number;
  count: number;
  percentage: number;
}

export interface DestinationDetailRelatedDto {
  id: string;
  name: string;
  image: string;
  rating: number;
  price: number;
}

export interface DestinationDetailResponseDto {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalReviews: number;
  location: string;
  coordinates: { lat: number; lng: number };
  distanceKm: number;
  price: number;
  openHours: string;
  description: string;
  facilities: DestinationDetailFacilityDto[];
  tips: string[];
  media: DestinationDetailMediaDto;
  ratingBreakdown: DestinationDetailRatingBreakdownDto[];
  reviews: DestinationDetailReviewDto[];
  relatedDestinations: DestinationDetailRelatedDto[];
  createdAt: string;
  updatedAt: string;
}
