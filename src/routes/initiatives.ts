import { Router } from "express";
import {
  create,
  getAll,
  getInitiativesByUser,
  getOne,
  remove,
  subscribe,
} from "../controllers/initiatives";
import { verifyToken } from "../middleware/jwt";
import { multerUpload } from "../utils/multer";

const router: Router = Router();

router.get("/user", verifyToken, getInitiativesByUser);
router.patch("/subscribe/:id", verifyToken, subscribe);

router.get("/", getAll);
router.post("/", verifyToken, multerUpload.single("file"), create);

router.get("/:id", verifyToken, getOne);
router.delete("/:id", verifyToken, remove);

export { router as initiatives };
