import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import passport from "passport";
import "./config/passport";
import { auth, goals, initiatives, upload, users } from "./routes";
import { ErrorWithStatus } from "./utils/createError";
import { COOKIE_KEY, MONGO_URI, PORT } from "./utils/secrets";
import swaggerDocs from "./swagger";

const app = express();

swaggerDocs(app, PORT);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(morgan("dev"));
app.use(
  cors({
    origin: [ 
      "http://localhost:3000",
      "https://match4action-web.vercel.app",
      "http://match4action-api.onrender.com",
      "https://match4action-api.onrender.com",
      "http://match4action-api.vercel.app",
      "https://match4action-api.vercel.app",
    ],
    credentials: true,
  })
);

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [COOKIE_KEY],
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.set("strictQuery", false);

mongoose.connect(MONGO_URI, () => {
  console.log("connected to mongodb");
});

app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/goals", goals);
app.use("/api/initiatives", initiatives);
app.use("/api/upload", upload);

app.use(
  (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went wrong.";
    return res
      .status(errorStatus)
      .send({ success: false, message: errorMessage });
  }
);

app.all("*", (req, res, next) => {
  const err = new Error(
    `Route ${req.originalUrl} not found.`
  ) as ErrorWithStatus;
  err.status = 404;
  next(err);
});

app.listen(PORT, () => {
  console.log("App listening on port: " + PORT);
});

module.exports = app;
export default app;