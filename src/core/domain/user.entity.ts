export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public firstName?: string,
    public lastName?: string,
    public avatarUrl?: string,
    public readonly createdAt: Date = new Date(),
  ) {}
}
