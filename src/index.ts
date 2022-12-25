import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { CreateGoalController } from './controllers/goals';
import { CreateUserController, GetUsersController } from './controllers/users';
import { CreateGoalRepository } from './repositories/goals';
import { CreateUserRepository, GetUsersRepository } from './repositories/users';

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

    app.get('/users', async (req, res) => {
      const getUsersRepository = new GetUsersRepository();
      const getUsersControllers = new GetUsersController(getUsersRepository);
      const { body, statusCode } = await getUsersControllers.handle();
      res.status(statusCode).send(body);
    });

    app.post('/users', async (req, res) => {
      const createUserRepository = new CreateUserRepository();
      const createUserControllers = new CreateUserController(createUserRepository);
      const { body, statusCode } = await createUserControllers.handle({ body: req.body });
      res.status(statusCode).send(body);
    });

    app.post('/goals', async (req, res) => {
      const createGoalRepository = new CreateGoalRepository();
      const getUsersControllers = new CreateGoalController(createGoalRepository);
      const { body, statusCode } = await getUsersControllers.handle({ body: req.body });
      res.status(statusCode).send(body);
    });

    app.listen(port, () => {
      console.log(`server is running on: http://localhost:${port}`);
    });
  })
  .catch((err) => console.log('error connecting to mongo', err));
