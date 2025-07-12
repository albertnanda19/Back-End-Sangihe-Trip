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

export class Destination {
  constructor(
    public readonly id: string,
    public name: string,
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
    /** Average rating (0-5) */
    public rating: number = 0,
    /** Total number of active reviews */
    public totalReviews: number = 0,
  ) {}
}
