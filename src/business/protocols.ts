export interface HttpResponse<T> {
  statusCode: number;
  body: T;
}

export interface HttpRequest<B> {
  body?: B;
  params?: any;
  headers?: any;
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  SERVER_ERROR = 500,
}

export interface IBusiness {
  handle(httpRequest: HttpRequest<unknown>): Promise<HttpResponse<unknown>>;
}
