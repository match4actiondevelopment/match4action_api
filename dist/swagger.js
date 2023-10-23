"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
var swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
var options = {
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
    apis: ["routes/*.ts", "models/*.ts"],
};
var swaggerSpec = (0, swagger_jsdoc_1.default)(options);
function swaggerDocs(app, port) {
    // Swagger page
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    // Docs in JSON format
    app.get("/docs.json", function (req, res) {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    console.log("Docs available at http://localhost:${port}/docs");
    //log.info(`Docs available at http://localhost:${port}/docs`);
}
exports.default = swaggerDocs;
