import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import cors from "cors";
import express, {
  NextFunction,
  Request,
  Response,
} from "express";
import mongoose from "mongoose";
import passport from "passport";
import "./config/passport";

import {
  about,
  auth,
  bloglinkRouter,
  goals,
  initiatives,
  upload,
  users,
} from "./routes";

import ikigaiQuestions from "./routes/ikigai-questions";
import matching from "./routes/matching";
import ikigaiResponses from "./routes/ikigai-responses";
import notifications from "./routes/notifications";

import { ErrorWithStatus } from "./utils/createError";
import {
  COOKIE_KEY,
  MONGO_URI,
  PORT,
} from "./utils/secrets";
import swaggerDocs from "./swagger";

const app = express();

app.set("trust proxy", 1);

swaggerDocs(app, PORT);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (
      err: Error | null,
      allow?: boolean
    ) => void
  ) => {
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      "http://localhost:3000",
    ];

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    return callback(
      new Error("Not allowed by CORS")
    );
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [COOKIE_KEY],
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", auth);
app.use("/users", users);
app.use("/goals", goals);
app.use("/initiatives", initiatives);
app.use("/upload", upload);
app.use("/about", about);
app.use("/bloglink", bloglinkRouter);
app.use("/ikigai-questions", ikigaiQuestions);
app.use("/ikigai-responses", ikigaiResponses);
app.use("/matching", matching);
app.use("/notifications", notifications);

app.use(
  (
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const errorStatus = err.status || 500;
    const errorMessage =
      err.message || "Something went wrong.";

    return res.status(errorStatus).send({
      success: false,
      message: errorMessage,
    });
  }
);

app.all("*", (req, res, next) => {
  const err = new Error(
    `Route ${req.originalUrl} not found.`
  ) as ErrorWithStatus;

  err.status = 404;
  next(err);
});

if (require.main === module) {
  if (!MONGO_URI) {
    throw new Error("MongoDB connection string is not configured.");
  }
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log(
        "Connected to MongoDB successfully"
      );

      app.listen(PORT, () => {
        console.log(
          `App listening on port: ${PORT}`
        );
      });
    })
    .catch((err: any) => {
      console.error(
        "MongoDB Connection Error:",
        err
      );
    });
}

export default app;