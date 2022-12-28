import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import morgan from 'morgan';
import passport from 'passport';
import { errorHandler } from './middlewares/errorHandler';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';

config();

const url = process.env.MONGODB_URL ?? '';
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const port = process.env.PORT ?? 3003;
const sessionSecret = process.env.SESSION_SECRET ?? 'secretSession';

// Passport config
import { passportStrategy } from './config/passport';

passportStrategy(passport);

const app = express();

app.use(morgan('dev'));
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);

mongoose.set('strictQuery', false);

mongoose.set('toJSON', {
  virtuals: true,
  transform: (_, converted) => {
    delete converted.__v;
    delete converted._id;
  },
});

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

// Express Session
app.use(
  session({
    name: 'session',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, cb) => {
  process.nextTick(() => {
    return cb(null, {
      id: user._id,
      username: user.username,
      picture: user.picture,
    });
  });
});

passport.deserializeUser((user: any, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

// Routes
app.use('/auth', authRouter);
app.use('/users', usersRouter);

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
