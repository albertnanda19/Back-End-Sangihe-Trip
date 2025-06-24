export class ResponseDto<T> {
  status: number;
  message: string;
  data: T | null;
}
