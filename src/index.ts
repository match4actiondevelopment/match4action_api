import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import morgan from 'morgan';
import passport from 'passport';
import errorHandler from './middleware/error';
import router from './routes';

config();

const url = process.env.MONGODB_URL as string;
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const port = process.env.PORT || 3003;

// passport config
import passportStrategy from './config/passport';

passportStrategy(passport);

const app = express();

app.use(morgan('dev'));
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true, // IMPORTANT to set to true
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
    secret: 'secretcat',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', router);

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`server is running on: http://localhost:${port}`);
});
