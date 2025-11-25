import { Router } from "express";
import { saveIkigaiResponse, getIkigaiResponse } from "../controllers/ikigai-responses";
import { isLogged } from "../middleware/jwt";

const router: Router = Router();

/**
 * @openapi
 * '/ikigai-responses':
 *  post:
 *     tags:
 *     - Ikigai Responses
 *     summary: Save user's Ikigai test response
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              properties:
 *                answers:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      questionId:
 *                        type: string
 *                      optionValue:
 *                        type: number
 *                      category:
 *                        type: string
 *                        enum: [passion, mission, profession, vocation]
 *     responses:
 *      201:
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
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", isLogged, saveIkigaiResponse);

/**
 * @openapi
 * '/ikigai-responses':
 *  get:
 *     tags:
 *     - Ikigai Responses
 *     summary: Get user's latest Ikigai test response
 *     responses:
 *      200:
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
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", isLogged, getIkigaiResponse);

export default router;
