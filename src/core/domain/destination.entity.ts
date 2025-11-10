export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface Facility {
  name: string;
  icon: string;
  available: boolean;
}

export interface Activity {
  name: string;
  startTime: string; // Format: HH:mm
  endTime: string; // Format: HH:mm
}

export class Destination {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public category: string,
    public location: Location,
    public distanceKm: number,
    public price: number,
    public openHours: string,
    public description: string,
    public facilities: Facility[],
    public tips: string[],
    public images: string[],
    public video?: string,
    public readonly createdAt: Date = new Date(),
    public rating: number = 0,
    public totalReviews: number = 0,
    public viewCount: number = 0,
    public activities: Activity[] = [],
    public phone: string = '',
    public email: string = '',
    public website: string = '',
    public isFeatured: boolean = false,
  ) {}
}
