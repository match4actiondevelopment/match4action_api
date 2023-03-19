import { Router } from "express";
import {
  create,
  getAll,
  getInitiativesByUser,
  getOne,
  remove,
  subscribe,
  update,
} from "../controllers/initiatives";
import { isLogged } from "../middleware/jwt";
import { multerUpload } from "../middleware/multer";

const router: Router = Router();

router.get("/user", isLogged, getInitiativesByUser);
router.patch("/subscribe/:id", isLogged, subscribe);
router.get("/", getAll);
router.post("/", isLogged, multerUpload.single("file"), create);
router.delete("/:id", isLogged, remove);
router.put("/:id", isLogged, multerUpload.single("file"), update);
router.get("/:id", getOne);

export { router as initiatives };
