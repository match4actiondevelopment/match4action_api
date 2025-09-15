export interface ErrorWithStatus extends Error {
  status: number;
}

export const createError = (status: number, message: string) => {
  const err = new Error() as ErrorWithStatus;
  err.status = status;
  err.message = message;

  return err;
};
