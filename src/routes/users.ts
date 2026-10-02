import { Router } from "express";
import {
  getAll,
  getOne,
  profile,
  remove,
  update,
  selectRole,
} from "../controllers/users";
import {
  isAdmin,
  isLogged,
} from "../middleware/jwt";

const router: Router = Router();

router.get("/", isAdmin, getAll);
router.post("/profile", isLogged, profile);

router.get("/:id", isAdmin, getOne);
router.delete("/:id", isLogged, remove);

router.patch("/role", isLogged, selectRole);
router.patch("/:id", isLogged, update);

export { router as users };