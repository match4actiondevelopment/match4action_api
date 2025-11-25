import { Router } from "express";
import { getRecommendedInitiatives } from "../controllers/matching";
import { isLogged } from "../middleware/jwt";

const router: Router = Router();

/**
 * @openapi
 * '/matching/recommendations':
 *  get:
 *     tags:
 *     - Matching
 *     summary: Get recommended initiatives based on user's Ikigai test results
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       initiativeName:
 *                         type: string
 *                       description:
 *                         type: string
 *                       matchingScore:
 *                         type: number
 *                       matchingReasons:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/recommendations", isLogged, getRecommendedInitiatives);

export default router;
