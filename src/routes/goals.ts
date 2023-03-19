import { Router } from "express";
import { create, getAll, remove, update } from "../controllers/goals";
import { verifyToken } from "../middleware/jwt";

const router: Router = Router();

router.get("/", getAll);
router.post("/", verifyToken, create);
router.put("/:id", verifyToken, update);
router.delete("/:id", verifyToken, remove);

export { router as goals };
