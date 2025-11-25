import { UserDocument } from "../../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument | null;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
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

export {};
