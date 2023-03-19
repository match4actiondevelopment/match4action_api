import { Router } from "express";
import { create, getAll, remove, update } from "../controllers/goals";
import { isAdmin } from "../middleware/jwt";

const router: Router = Router();

router.get("/", getAll);
router.post("/", isAdmin, create);
router.put("/:id", isAdmin, update);
router.delete("/:id", isAdmin, remove);

export { router as goals };
