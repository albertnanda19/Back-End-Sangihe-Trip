export interface TripBudget {
  transport?: number;
  lodging?: number;
  food?: number;
  activities?: number;
  [key: string]: number | undefined;
}

export interface TripItem {
  destinationId: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  activity: string;
  notes?: string;
}

export interface TripDay {
  day: number; // 1-based index
  items: TripItem[];
}

import { v4 as uuid } from 'uuid';

export class TripPlan {
  readonly id: string;
  readonly createdAt: Date;

  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly peopleCount: number,
    public readonly tripType: string,
    public readonly isPublic: boolean,
    public readonly destinations: string[],
    public readonly schedule: TripDay[],
    public readonly budget: TripBudget,
    public readonly notes: string | null = null,
    public readonly packingList: string[] = [],
    id?: string,
    createdAt?: Date,
  ) {
    this.id = id ?? uuid();
    this.createdAt = createdAt ?? new Date();
  }
}
