"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var cookie_session_1 = __importDefault(require("cookie-session"));
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var mongoose_1 = __importDefault(require("mongoose"));
var morgan_1 = __importDefault(require("morgan"));
var passport_1 = __importDefault(require("passport"));
require("./config/passport");
var routes_1 = require("./routes");
var secrets_1 = require("./utils/secrets");
var swagger_1 = __importDefault(require("./swagger"));
var app = (0, express_1.default)();
(0, swagger_1.default)(app, secrets_1.PORT);
/**
   * @openapi
   * /healthcheck:
   *  get:
   *     tags:
   *     - Healthcheck
   *     description: Responds if the app is up and running
   *     responses:
   *       200:
   *         description: App is up and running
   */
app.get("/healthcheck", function (req, res) { return res.sendStatus(200); });
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://match4action-web.vercel.app",
        "http://match4action-api.onrender.com",
        "https://match4action-api.onrender.com",
    ],
    credentials: true,
}));
app.use((0, cookie_session_1.default)({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [secrets_1.COOKIE_KEY],
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
mongoose_1.default.set("strictQuery", false);
mongoose_1.default.connect(secrets_1.MONGO_URI, function () {
    console.log("connected to mongodb");
});
app.use("/auth", routes_1.auth);
app.use("/users", routes_1.users);
app.use("/goals", routes_1.goals);
app.use("/initiatives", routes_1.initiatives);
app.use("/upload", routes_1.upload);
app.use(function (err, req, res, next) {
    var errorStatus = err.status || 500;
    var errorMessage = err.message || "Something went wrong.";
    return res
        .status(errorStatus)
        .send({ success: false, message: errorMessage });
});
app.all("*", function (req, res, next) {
    var err = new Error("Route ".concat(req.originalUrl, " not found."));
    err.status = 404;
    next(err);
});
app.listen(secrets_1.PORT, function () {
    console.log("App listening on port: " + secrets_1.PORT);
});
