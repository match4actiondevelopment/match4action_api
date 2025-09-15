import { boolean, object, string, TypeOf } from "zod";

/**
 * @openapi
 * components:
 *  schemas:
 *    Initiative:
 *      type: object
 *      properties:
 *          location: 
 *              type: object
 *              properties:
 *                  country:
 *                      type: string
 *                  city:
 *                      type: string
 *          _id: 
 *              type: string
 *          userId: 
 *              type: string
 *          applicants: 
 *              type: array
 *              items:
 *                  type: string
 *          initiativeName:  
 *              type: string
 *          whatMovesThisInitiative: 
 *              type: array
 *              items:
 *                  type: string
 *          whichAreasAreCoveredByThisInitiative: 
 *              type: array
 *              items:
 *                  type: string 
 *          servicesNeeded: 
 *              type: array
 *              items:
 *                  type: string 
 *          description:
 *              type: string
 *          startDate:
 *              type: string
 *          endDate:
 *              type: string
 *          startTime:
 *              type: string
 *          endTime:
 *              type: string
 *          postalCode:
 *              type: string
 *          website:
 *              type: string
 *          image:
 *              type: array
 *              items:
 *                  type: string
 *          goals:
 *              type: array
 *              items:
 *                  type: string                  
 *          createdAt: 
 *              type: string
 *          updatedAt: 
 *              type: string
 *          __v: 
 *              type: string
 *    
 *    InitiativesResponse:
 *      type: object
 *      properties:
 *        data:
 *          type: array
 *          items:
 *              $ref: '#/components/schemas/Initiative'
 *        success: 
 *          type: boolean
 *        message:
 *          type: string
 * 
 *    InitiativeResponse:
 *      type: object
 *      properties:
 *        data:
 *          type: object
 *          additionalProperties:
 *              $ref: '#/components/schemas/Initiative'
 *        success: 
 *          type: boolean
 *        message:
 *          type: string
 */
