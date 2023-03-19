import { Router } from "express";
import passport from "passport";
import {
  google,
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/auth";

const router: Router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.post("/refreshToken", refreshToken);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

router.get("/google/redirect", passport.authenticate("google"), google);

export { router as auth };
