export class Review {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly destinationId: string,
    public rating: number,
    public comment: string,
    public images: string[] = [],
    public helpful: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
