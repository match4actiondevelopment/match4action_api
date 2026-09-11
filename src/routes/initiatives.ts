import { Router } from "express";
import {
  apply,
  create,
  getAll,
  getInitiativesByUser,
  getOne,
  remove,
  update,
} from "../controllers/initiatives";
import {
  getMyApplications,
} from "../controllers/applications";
import {
  hasRoles,
  isLogged,
} from "../middleware/jwt";
import {
  multerUpload,
} from "../middleware/multer";
import {
  createError,
} from "../utils/createError";

const router: Router = Router();

/**
 * @openapi
 * '/initiatives/applications/me':
 *   get:
 *     tags:
 *       - Initiatives
 *     summary: Get the authenticated user's applications
 *     responses:
 *       200:
 *         description: Applications returned successfully
 *       401:
 *         description: Authentication required
 */
router.get(
  "/applications/me",
  isLogged,
  getMyApplications
);

/**
 * @openapi
 * '/initiatives/user':
 *   get:
 *     tags:
 *       - Initiatives
 *     summary: Get the initiatives the user volunteered for
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InitiativesResponse'
 */
router.get(
  "/user",
  isLogged,
  getInitiativesByUser
);

/**
 * @openapi
 * '/initiatives/subscribe/{id}':
 *   patch:
 *     tags:
 *       - Initiatives
 *     deprecated: true
 *     summary: Retired subscription endpoint
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       410:
 *         description: Use the opportunity Apply action
 */
router.patch(
  "/subscribe/:id",
  isLogged,
  (_req, _res, next) =>
    next(
      createError(
        410,
        "Use the opportunity Apply action to submit an application."
      )
    )
);

/**
 * @openapi
 * '/initiatives/apply/{id}':
 *   patch:
 *     tags:
 *       - Initiatives
 *     summary: Apply to an active initiative
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *       400:
 *         description: Invalid initiative ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Volunteer role required
 *       404:
 *         description: Initiative not found
 *       409:
 *         description: Already applied or initiative unavailable
 */
router.patch(
  "/apply/:id",
  isLogged,
  hasRoles(["volunteer"]),
  apply
);

/**
 * @openapi
 * '/initiatives/unsubscribe/{id}':
 *   patch:
 *     tags:
 *       - Initiatives
 *     deprecated: true
 *     summary: Retired unsubscription endpoint
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       410:
 *         description: Application withdrawal is unsupported
 */
router.patch(
  "/unsubscribe/:id",
  isLogged,
  (_req, _res, next) =>
    next(
      createError(
        410,
        "Application withdrawal is not supported in this version."
      )
    )
);

/**
 * @openapi
 * '/initiatives/':
 *   get:
 *     tags:
 *       - Initiatives
 *     summary: Get all initiatives
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by country using case-insensitive partial matching
 *         example: United States
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by city using case-insensitive partial matching
 *         example: New York
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: false
 *         description: Search both city and country
 *         example: New York
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search initiative name, description, services and areas
 *         example: education
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Alias for search
 *         example: education
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InitiativesResponse'
 */
router.get("/", getAll);

/**
 * @openapi
 * '/initiatives/':
 *   post:
 *     tags:
 *       - Initiatives
 *     summary: Create an initiative
 *     responses:
 *       201:
 *         description: Initiative created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Initiative'
 */
router.post(
  "/",
  isLogged,
  hasRoles(["admin", "organization"]),
  multerUpload.single("file"),
  create
);

/**
 * @openapi
 * '/initiatives/{id}':
 *   delete:
 *     tags:
 *       - Initiatives
 *     summary: Delete an initiative
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Initiative removed
 */
router.delete(
  "/:id",
  isLogged,
  hasRoles(["admin", "organization"]),
  remove
);

router.put(
  "/:id",
  isLogged,
  hasRoles(["admin", "organization"]),
  multerUpload.single("file"),
  update
);

/**
 * @openapi
 * '/initiatives/{id}':
 *   get:
 *     tags:
 *       - Initiatives
 *     summary: Get one initiative
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Initiative ID
 *         example: 63f2e7adc5a48948e1dab8f5
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InitiativeResponse'
 */
router.get("/:id", getOne);

export { router as initiatives };