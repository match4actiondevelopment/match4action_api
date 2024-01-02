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
   *  get:
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
   *  get:
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
   *     responses:
   *      200:
   *        description: Success
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/InitiativesResponse'
   */
router.get("/", getAll);

router.post("/", isLogged, multerUpload.single("file"), create);
router.delete("/:id", isLogged, remove);
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
