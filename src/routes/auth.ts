import { Router } from "express";
import passport from "passport";
import {
  google,
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/auth";
import validateResource from "../middleware/validateResource"
import { loginSchema, logoutSchema, registerUserSchema} from "../schemas/auth";
import { isLogged } from "../middleware/jwt";

const router: Router = Router();

 /**
   * @openapi
   * '/auth/login':
   *  post:
   *     tags:
   *     - Authentication
   *     summary: User login
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/LoginInput'
   *     responses:
   *      200:
   *        description: Success
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/LoginResponse'
   *      400:
   *        description: Invalid input
   *      404:
   *        description: Unsucessfull login
   */
router.post("/login", validateResource(loginSchema), login);

/**
   * @openapi
   * '/auth/register':
   *  post:
   *     tags:
   *     - Authentication
   *     summary: Register user 
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/RegisterUserInput'
   *     responses:
   *      200:
   *        description: Success
   *      400:
   *        description: Invalid input
   */
router.post("/register", validateResource(registerUserSchema), register);

/**
   * @openapi
   * '/auth/logout':
   *  post:
   *     tags:
   *     - Authentication
   *     summary: User logout
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/LogoutInput'
   *     responses:
   *      200:
   *        description: Success
   *      400:
   *        description: Invalid input
   */
router.get("/logout", isLogged, logout);

/**
   * @openapi
   * '/auth/refreshToken':
   *  post:
   *     tags:
   *     - Authentication
   *     summary: Refresh Access Token
   *     responses:
   *      201:
   *        description: Success
   *      404:
   *        description: Token not found
   */
router.post("/refreshToken", refreshToken);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);


router.get("/google/redirect", passport.authenticate("google"), google);

export { router as auth };
