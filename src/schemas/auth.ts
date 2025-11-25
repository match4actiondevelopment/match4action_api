import { boolean, object, string, TypeOf } from "zod";

/**
 * @openapi
 * components:
 *  schemas:
 *    LoginInput:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          default: jane.doe@example.com
 *        password:
 *          type: string
 *          default: stringPassword123
 *    LoginResponse:
 *      type: object
 *      properties:
 *        data:
 *          type: object
 *          properties:
 *            provider:
 *              type: object
 *              properties:
 *                id: 
 *                  type: string
 *                name:
 *                  type: string
 *            _id: 
 *              type: string
 *            name: 
 *              type: string
 *            email: 
 *              type: string
 *            role: 
 *              type: string
 *            termsAndConditions: 
 *              type: string
 *            createdAt: 
 *              type: string
 *            updatedAt: 
 *              type: string
 *            __v: 
 *              type: string
 *        success:
 *          type: boolean
 *        message:
 *          type: string
 */
export const loginSchema = object({
  body: object({
    email: string({
        required_error: "Email is required",
      }).email("Not a valid email"),
    password: string({
      required_error: "Password is required",
    }).min(6, "Password too short - should be 6 chars minimum"),
  })
});

export type LoginInput = TypeOf<typeof loginSchema>;

/**
 * @openapi
 * components:
 *  schemas:
*    LogoutInput:
 *      type: object
 *      properties:
 *        user:
 *          type: object
 *          properties:
 *            _id:
 *              type: string
 */
export const logoutSchema = object({
  body: object({
    user: object({
      _id: string({
        required_error: "Id is required"
        })
    })
  })
});

export type LogoutInput = TypeOf<typeof logoutSchema>;


/**
 * @openapi
 * components:
 *  schemas:
 *    RegisterUserInput:
 *      type: object
 *      required:
 *        - name
 *        - email
 *        - password
 *        - termsAndConditions
 *        - provider
 *      properties:
 *        name:
 *          type: string
 *          default: Jane Doe Example
 *        email:
 *          type: string
 *          default: jane.doe@example.com
 *        password:
 *          type: string
 *          default: stringPassword123
 *        termsAndConditions:
 *          type: boolean
 *          default: true
 *        provider:
 *          type: object
 *          properties:
 *            id: 
 *              type: string
 *              default: xxx
 *            name: 
 *              type: string
 *              default: xxx
 */
export const registerUserSchema = object({
  body: object({
    name: string({
      required_error: "Name is required",
    }),
    email: string({
        required_error: "Email is required",
      }).email("Not a valid email"),
    password: string({
      required_error: "Password is required",
    }).min(6, "Password too short - should be 6 chars minimum"),
    termsAndConditions: boolean({
      required_error: "Terms and conditions is required",
    }),
    provider: object({
      id: string({
        required_error: "Provider id is required",
      }),
      name: string({
        required_error: "Provider name is required",
      })
    }),
  })
});

export type RegisterUserInput = TypeOf<typeof registerUserSchema>;