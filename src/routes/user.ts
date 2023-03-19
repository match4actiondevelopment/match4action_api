import { Router } from "express";
import { remove, getAll, getOne, profile, update } from "../controllers/user";
import { verifyToken } from "../middleware/jwt";

const router: Router = Router();

router.get("/", getAll);
router.post("/profile", verifyToken, profile);
router.get("/:id", verifyToken, getOne);
router.delete("/:id", verifyToken, remove);
router.patch("/:id", verifyToken, update);

export { router as users };

