import { HttpResponse, HttpStatusCode } from '../utils/protocols';

export const badRequest = (message: string): HttpResponse<string> => {
  return {
    statusCode: HttpStatusCode.BAD_REQUEST,
    body: message,
  };
};

export const ok = <T>(body: T): HttpResponse<T> => {
  return {
    statusCode: HttpStatusCode.OK,
    body,
  };
};

export const created = <T>(body: any): HttpResponse<T> => {
  return {
    statusCode: HttpStatusCode.CREATED,
    body,
  };
};

export const serverError = (message?: string) => {
  return {
    statusCode: HttpStatusCode.SERVER_ERROR,
    body: message || 'Something went wrong',
  };
};
