declare module Express {
  export interface Request {
    user: {
      _id: string;
      role: UserRole;
      email: string;
      iat: number;
      exp: number;
    };
  }
}
