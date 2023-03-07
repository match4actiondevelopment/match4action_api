import cookieSession from "cookie-session";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import passport from "passport";
import "./config/passport";
import { authRoutes } from "./routes/auth";
import { goalsRouter } from "./routes/goals";
import { initiativesRouter } from "./routes/initiatives";
import { uploadRouter } from "./routes/upload";
import { usersRouter } from "./routes/user";
import { COOKIE_KEY, MONGO_URI, PORT } from "./utils/secrets";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://match4action-web.vercel.app",
      "http://match4action-api.onrender.com",
      "https://match4action-api.onrender.com",
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

app.use("/auth", authRoutes);
app.use("/users", usersRouter);
app.use("/upload", uploadRouter);
app.use("/goals", goalsRouter);
app.use("/initiatives", initiativesRouter);

app.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.listen(PORT, () => {
  console.log("App listening on port: " + PORT);
});
