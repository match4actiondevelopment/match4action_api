import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { CreateGoalController, DeleteGoalController, GetGoalsController } from './controllers/goals';
import {
  CreateInitiativeController,
  GetInitiativeController,
  GetInitiativesController,
} from './controllers/initiatives';
import { CreateUserController, DeleteUserController, GetUserController, GetUsersController } from './controllers/users';
import { CreateGoalRepository, DeleteGoalRepository, GetGoalsRepository } from './repositories/goals';
import { CreateInitiativeRepository, GetInitiativesRepository } from './repositories/initiatives';
import { GetInitiativeRepository } from './repositories/initiatives/getOne';
import {
  CreateUserRepository,
  DeleteUserRepository,
  GetUserRepository,
  GetUsersRepository,
} from './repositories/users';

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

    app.get('/users/:id', async (req, res) => {
      const getUserRepository = new GetUserRepository();
      const getUserControllers = new GetUserController(getUserRepository);
      const { body, statusCode } = await getUserControllers.handle({ params: req.params });
      res.status(statusCode).send(body);
    });

    app.delete('/users/:id', async (req, res) => {
      const deleteUserRepository = new DeleteUserRepository();
      const deleteUserControllers = new DeleteUserController(deleteUserRepository);
      const { body, statusCode } = await deleteUserControllers.handle({ params: req.params });
      res.status(statusCode).send(body);
    });

    app.get('/goals', async (req, res) => {
      const getGoalsRepository = new GetGoalsRepository();
      const getGoalsController = new GetGoalsController(getGoalsRepository);
      const { body, statusCode } = await getGoalsController.handle();
      res.status(statusCode).send(body);
    });

    app.post('/goals', async (req, res) => {
      const createGoalRepository = new CreateGoalRepository();
      const createGoalControllers = new CreateGoalController(createGoalRepository);
      const { body, statusCode } = await createGoalControllers.handle({ body: req.body });
      res.status(statusCode).send(body);
    });

    app.delete('/goals/:id', async (req, res) => {
      const deleteGoalRepository = new DeleteGoalRepository();
      const deleteGoalController = new DeleteGoalController(deleteGoalRepository);
      const { body, statusCode } = await deleteGoalController.handle({ params: req.params });
      res.status(statusCode).send(body);
    });

    app.get('/initiatives', async (req, res) => {
      const getInitiativesRepository = new GetInitiativesRepository();
      const getInitiativesControllers = new GetInitiativesController(getInitiativesRepository);
      const { body, statusCode } = await getInitiativesControllers.handle();
      res.status(statusCode).send(body);
    });

    app.post('/initiatives', async (req, res) => {
      const createInitiativeRepository = new CreateInitiativeRepository();
      const createInitiativeControllers = new CreateInitiativeController(createInitiativeRepository);
      const { body, statusCode } = await createInitiativeControllers.handle({ body: req.body });
      res.status(statusCode).send(body);
    });

    app.get('/initiatives/:id', async (req, res) => {
      const getInitiativeRepository = new GetInitiativeRepository();
      const getInitiativesControllers = new GetInitiativeController(getInitiativeRepository);
      const { body, statusCode } = await getInitiativesControllers.handle({ params: req.params });
      res.status(statusCode).send(body);
    });

    app.listen(port, () => {
      console.log(`server is running on: http://localhost:${port}`);
    });
  })
  .catch((err) => console.log('error connecting to mongo', err));
