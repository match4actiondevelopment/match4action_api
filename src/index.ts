import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';
import { authRouter } from './routes/auth';
import { sustainableDevelopmentGoalsRouter } from './routes/sustainableDevelopmentGoals';
import { usersRouter } from './routes/users';

config();

const url = process.env.MONGODB_URL ?? '';
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const port = process.env.PORT;

const app = express();

app.use(morgan('dev'));
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://match4action-api.onrender.com'],
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
  })
);

mongoose.set('strictQuery', false);

// Connect to Mongo
mongoose
  .connect(url, {
    auth: {
      password,
      username,
    },
  })
  .then(() => {
    console.log('mongo connected');
  })
  .catch((err) => console.log('error connecting to mongo', err));

// Allow express to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/auth/register', (req, res) => {
  res.status(200).json({ success: false, data: req.body });
});
app.use('/users', usersRouter);
app.use('/sustainableDevelopmentGoals', sustainableDevelopmentGoalsRouter);

// unknown Routes
app.all('*', (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`server is running on: http://localhost:${port}`);
});
