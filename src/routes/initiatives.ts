import { Router } from "express";
import { InitiativesController } from "../controllers/initiatives";
import { authGuard } from "../utils/authGuard";
import { multerUpload } from "../utils/multer";

const router: Router = Router();

const initiatives = new InitiativesController();

router.get("/", initiatives.getAll);
router.post("/", authGuard, multerUpload.single("file"), initiatives.create);
router.get("/:id", authGuard, initiatives.getOne);
router.delete("/:id", authGuard, initiatives.delete);
router.patch("/:id", authGuard, initiatives.subscribe);

export { router as initiativesRouter };
