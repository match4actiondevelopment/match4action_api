import { Router } from "express";
import { getAboutUs, updateAboutUs, deleteAbout } from "../controllers/about";
import { hasRoles, isLogged } from "../middleware/jwt";

const router: Router = Router();

router.get("/", getAboutUs);
router.put("/", isLogged, hasRoles(['admin']), updateAboutUs);
router.delete("/", isLogged, hasRoles(['admin']), deleteAbout);

export { router as about };
