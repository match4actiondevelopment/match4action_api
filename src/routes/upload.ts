import { Router } from "express";
import { create } from "../controllers/upload";
import { isLogged } from "../middleware/jwt";
import { multerUpload } from "../middleware/multer";

const router: Router = Router();

router.post("/", isLogged, multerUpload.single("file"), create);

export { router as upload };
