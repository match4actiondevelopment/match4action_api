import { UserDocument } from "../../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument | null;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
      logOut?: (
        options?: any,
        done?: (err?: any) => void
      ) => void;
    }

    namespace Multer {
      interface File {
        filename: string;
        path: string;
        mimetype: string;
        size: number;
      }
    }
  }
}

// Declare modules that may not have type definitions
declare module "jsonwebtoken";
declare module "passport";
declare module "bcrypt";
declare module "multer";

export {};

