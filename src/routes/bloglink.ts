import express from "express";
import { getBlogLink, updateBlogLink } from "../controllers/bloglink";
import { isLogged, hasRoles } from "../middleware/jwt";

const router = express.Router();

router.get("/", getBlogLink);
router.put("/", isLogged, hasRoles(["admin"]), updateBlogLink);

export { router as bloglinkRouter };
