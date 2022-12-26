import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import router from './router';

config();

const url = process.env.MONGODB_URL as string;
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const port = process.env.PORT || 3003;

mongoose.set('strictQuery', false);
mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, converted) => {
    delete converted.__v;
    delete converted._id;
  },
});

mongoose
  .connect(url, {
    auth: {
      password,
      username,
    },
  })
  .then(() => {
    console.log('mongo connected');

    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/api', router);

    app.listen(port, () => {
      console.log(`server is running on: http://localhost:${port}`);
    });
  })
  .catch((err) => console.log('error connecting to mongo', err));
