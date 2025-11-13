import { Router } from "express";
import {
  create,
  getAll,
  getInitiativesByUser,
  getOne,
  remove,
  subscribe,
  unsubscribe,
  update,
} from "../controllers/initiatives";
import { isLogged } from "../middleware/jwt";
import { multerUpload } from "../middleware/multer";

const router: Router = Router();

/**
   * @openapi
   * '/initiatives/user':
   *  get:
   *     tags:
   *     - Initiatives
   *     summary: Get the initiatives the user volunteered for
   *     responses:
   *      200:
   *        description: Success
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/InitiativesResponse'
   */
router.get("/user", isLogged, getInitiativesByUser);

/**
   * @openapi
   * '/initiatives/subscribe/{id}':
   *  patch:
   *     tags:
   *     - Initiatives
   *     summary: Subscribe for the initiative
   *     responses:
   *      200:
   *        description: Success
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/InitiativeResponse'
   */
router.patch("/subscribe/:id", isLogged, subscribe);

/**
   * @openapi
   * '/initiatives/unsubscribe/{id}':
   *  patch:
   *     tags:
   *     - Initiatives
   *     summary: Unsubscribe for the initiative
   *     responses:
   *      200:
   *        description: Success
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/InitiativeResponse'
   */
router.patch("/unsubscribe/:id", isLogged, unsubscribe);

/**
   * @openapi
   * '/initiatives/':
   *  get:
   *     tags:
   *     - Initiatives
   *     summary: Get all initiatives
   *     parameters:
   *      - in: query
   *        name: country
   *        schema:
   *          type: string
   *        required: false
   *        description: Filter initiatives by country (case-insensitive partial match)
   *        example: United States
   *      - in: query
   *        name: city
   *        schema:
   *          type: string
   *        required: false
   *        description: Filter initiatives by city (case-insensitive partial match)
   *        example: New York
   *      - in: query
   *        name: location
   *        schema:
   *          type: string
   *        required: false
   *        description: Filter initiatives by location - searches in both city and country fields (case-insensitive partial match). Use this when you want to search in either field, or use city and country parameters for specific field searches.
   *        example: New York
   *      - in: query
   *        name: search
   *        schema:
   *          type: string
   *        required: false
   *        description: Search initiatives by keywords - searches in initiative name, description, services needed, what moves this initiative, and areas covered (case-insensitive partial match)
   *        example: education
   *      - in: query
   *        name: q
   *        schema:
   *          type: string
   *        required: false
   *        description: Alias for search parameter
   *        example: education
   *     responses:
   *      200:
   *        description: Success
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/InitiativesResponse'
   */
router.get("/", getAll);

//TODO
/**
   * @openapi
   * '/initiatives/':
   *  post:
   *     tags:
   *     - Initiatives
   *     summary: Create an initiative
   *     responses:
   *      200:
   *        description: Success
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Initiative'
   */
router.post("/", isLogged, multerUpload.single("file"), create);

//TODO
/**
   * @openapi
   * '/initiatives/':
   *  delete:
   *     tags:
   *     - Initiatives
   *     summary: Delete the initiative
   *     responses:
   *      200:
   *        description: Success
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/InitiativesResponse'
   */
router.delete("/:id", isLogged, remove);

//TODO
router.put("/:id", isLogged, multerUpload.single("file"), update);

/**
   * @openapi
   * '/initiatives/{id}':
   *  get:
   *     tags:
   *     - Initiatives
   *     summary: Get one initiative
   *     parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: string
   *        required: true
   *        description: Initiative Id
   *        example: 63f2e7adc5a48948e1dab8f5
   *     responses:
   *      200:
   *        description: Success
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/InitiativeResponse'
   */
router.get("/:id", getOne);

export { router as initiatives };
