import { Router } from "express";
import passport from "passport";
import { AuthController } from "../controllers/auth";
import { UserDocument } from "../models/User";
import { UserToken } from "../models/UserToken";
import { authGuard } from "../utils/authGuard";
import { CLIENT_BASE_URL } from "../utils/secrets";

const router: Router = Router();
const auth = new AuthController();

router.post("/login", auth.signIn);
router.post("/refreshToken", auth.refreshToken);

router.post("/logout", authGuard, async function (req, res, next) {
  try {
    await UserToken.deleteMany({ userId: req.user?._id });
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
    });
  } catch (e) {
    console.error(e);
  }
  res.status(200).json({ success: req.isAuthenticated() });
});

router.post(
  "/register",
  passport.authenticate("register"),
  async (req, res) => {
    const user = req.user as UserDocument;
    const response = await auth.signUp(user);

    res.status(201).json(response);
  }
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google"),
  async (req, res) => {
    const response = await auth.googleSignIn(req?.user?.email);

    if (response?.success) {
      let url = new URL(CLIENT_BASE_URL);
      url.searchParams.set("access_token", response?.data?.access_token);
      url.searchParams.set("refresh_token", response?.data?.refresh_token);
      url.searchParams.set("user_id", response?.data?.userId);
      res.redirect(url.toString());
    } else {
      res.redirect(`${CLIENT_BASE_URL}/404`);
    }
  }
);

export { router as authRoutes };
