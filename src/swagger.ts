import { Express, Request, Response } from "express";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Match 4 Action API Docs",
      version: "1.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["routes/*.ts", "schemas/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number) {
  // Swagger page
  app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCssUrl: CSS_URL }));

  // Docs in JSON format
  app.get("/api-doc.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("Docs available at http://localhost:${port}/docs");
  console.log(process.cwd());
}

export default swaggerDocs;
