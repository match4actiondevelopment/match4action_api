import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import passport from "passport";
import "./config/passport";

// Existing routes
import { auth, goals, initiatives, upload, users } from "./routes";

// Ikigai questions route
import ikigaiQuestions from "./routes/ikigai-questions";

// Matching route
import matching from "./routes/matching";

// Ikigai responses route
import ikigaiResponses from "./routes/ikigai-responses";

import { ErrorWithStatus } from "./utils/createError";
import { COOKIE_KEY, MONGO_URI, PORT } from "./utils/secrets";
import swaggerDocs from "./swagger";

const app = express();

// Swagger
swaggerDocs(app, PORT);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//attempt to fix the fetching questions cors issue
app.use(cors({
  origin: [
    "https://match4action-web-snowy.vercel.app",
    "https://match4action-web.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.options("*", cors());

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [COOKIE_KEY],
  })
);

app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.set("strictQuery", false);
console.log("Attempting to connect to MongoDB...");
console.log("MONGO_URI is set:", !!MONGO_URI);
if (MONGO_URI) {
  console.log("MONGO_URI starts with:", MONGO_URI.substring(0, 15) + "...");
} else {
  console.error("CRITICAL: MONGO_URI is missing or empty.");
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// ------------------
// Mount routes
// ------------------
app.use("/auth", auth);
app.use("/users", users);
app.use("/goals", goals);
app.use("/initiatives", initiatives);
app.use("/upload", upload);
app.use("/ikigai-questions", ikigaiQuestions); // <-- FIXED: mounted before 404
app.use("/ikigai-responses", ikigaiResponses);
app.use("/matching", matching);

// ------------------
// Error handling
// ------------------
app.use(
  (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went wrong.";
    return res.status(errorStatus).send({ success: false, message: errorMessage });
  }
);

// 404 handler
app.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found.`) as ErrorWithStatus;
  err.status = 404;
  next(err);
});

// Start server
// Start server if not running in Vercel (or other serverless environment)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`App listening on port: ${PORT}`);
  });
}

export default app;
