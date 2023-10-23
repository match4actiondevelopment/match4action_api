"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
var express_1 = require("express");
var passport_1 = __importDefault(require("passport"));
var auth_1 = require("../controllers/auth");
var router = (0, express_1.Router)();
exports.auth = router;
/**
  * @openapi
  * '/auth/login':
  *  post:
  *     tags:
  *     - Login
  *     summary: Login
  *     requestBody:
  *      required: true
  *      content:
  *        application/json:
  *           schema:
  *              $ref: '#/components/schemas/CreateUserInput'
  *     responses:
  *      200:
  *        description: Success
  *        content:
  *          application/json:
  *            schema:
  *              $ref: '#/components/schemas/CreateUserResponse'
  *      409:
  *        description: Conflict
  *      400:
  *        description: Bad request
  */
router.post("/login", auth_1.login);
router.post("/register", auth_1.register);
router.post("/logout", auth_1.logout);
router.post("/refreshToken", auth_1.refreshToken);
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["email", "profile"],
}));
/**
   * @openapi
   * /google/redirect:
   *  get:
   *     tags:
   *     - Healthcheck
   *     description: Responds if the app is up and running
   *     responses:
   *       200:
   *         description: App is up and running
   */
router.get("/google/redirect", passport_1.default.authenticate("google"), auth_1.google);
