import { Router } from 'express';
import {
  CreateGoalController,
  DeleteGoalController,
  GetGoalsController,
  UpdateGoalController,
} from './controllers/goals';
import {
  CreateInitiativeController,
  DeleteInitiativeController,
  GetInitiativeController,
  GetInitiativesController,
} from './controllers/initiatives';
import {
  CreateUserController,
  DeleteUserController,
  GetUserController,
  GetUsersController,
  UpdateUserController,
} from './controllers/users';
import { SignInUserController } from './controllers/users/signIn';
import {
  CreateGoalRepository,
  DeleteGoalRepository,
  GetGoalsRepository,
  UpdateGoalRepository,
} from './repositories/goals';
import {
  CreateInitiativeRepository,
  DeleteInitiativeRepository,
  GetInitiativeRepository,
  GetInitiativesRepository,
} from './repositories/initiatives';
import {
  CreateUserRepository,
  DeleteUserRepository,
  GetUserRepository,
  GetUsersRepository,
  SignInUserRepository,
  UpdateUserRepository,
} from './repositories/users';

const router = Router();

/*
  repositories
*/
const getUsersRepository = new GetUsersRepository();
const createUserRepository = new CreateUserRepository();
const getUserRepository = new GetUserRepository();
const updateUserRepository = new UpdateUserRepository();
const deleteUserRepository = new DeleteUserRepository();
const getGoalsRepository = new GetGoalsRepository();
const createGoalRepository = new CreateGoalRepository();
const deleteGoalRepository = new DeleteGoalRepository();
const updateGoalRepository = new UpdateGoalRepository();
const getInitiativesRepository = new GetInitiativesRepository();
const getInitiativeRepository = new GetInitiativeRepository();
const createInitiativeRepository = new CreateInitiativeRepository();
const deleteInitiativeRepository = new DeleteInitiativeRepository();
const signInUserRepository = new SignInUserRepository();

/*
  controller
*/
const getUsersControllers = new GetUsersController(getUsersRepository);
const createUserControllers = new CreateUserController(createUserRepository);
const getUserControllers = new GetUserController(getUserRepository);
const updateUserControllers = new UpdateUserController(updateUserRepository);
const deleteUserControllers = new DeleteUserController(deleteUserRepository);
const getGoalsController = new GetGoalsController(getGoalsRepository);
const createGoalControllers = new CreateGoalController(createGoalRepository);
const deleteGoalController = new DeleteGoalController(deleteGoalRepository);
const updateGoalController = new UpdateGoalController(updateGoalRepository);
const getInitiativesControllers = new GetInitiativesController(getInitiativesRepository);
const createInitiativeControllers = new CreateInitiativeController(createInitiativeRepository);
const getInitiativeController = new GetInitiativeController(getInitiativeRepository);
const deleteInitiativeControllers = new DeleteInitiativeController(deleteInitiativeRepository);
const signInUserControllers = new SignInUserController(signInUserRepository);

/*
  users
*/
router.get('/users', async (req, res) => {
  const { body, statusCode } = await getUsersControllers.handle();
  res.status(statusCode).send(body);
});

router.post('/sign-in', async (req, res) => {
  const { body, statusCode } = await signInUserControllers.handle({ body: req.body });
  res.status(statusCode).send(body);
});

router.post('/users', async (req, res) => {
  const { body, statusCode } = await createUserControllers.handle({ body: req.body });
  res.status(statusCode).send(body);
});

router.get('/users/:id', async (req, res) => {
  const { body, statusCode } = await getUserControllers.handle({ params: req.params });
  res.status(statusCode).send(body);
});

router.put('/users/:id', async (req, res) => {
  const { body, statusCode } = await updateUserControllers.handle({ body: req.body, params: req.params });
  res.status(statusCode).send(body);
});

router.delete('/users/:id', async (req, res) => {
  const { body, statusCode } = await deleteUserControllers.handle({ params: req.params });
  res.status(statusCode).send(body);
});

/*
  goals
*/
router.get('/goals', async (req, res) => {
  const { body, statusCode } = await getGoalsController.handle();
  res.status(statusCode).send(body);
});

router.post('/goals', async (req, res) => {
  const { body, statusCode } = await createGoalControllers.handle({ body: req.body });
  res.status(statusCode).send(body);
});

router.put('/goals/:id', async (req, res) => {
  const { body, statusCode } = await updateGoalController.handle({ body: req.body, params: req.params });
  res.status(statusCode).send(body);
});

router.delete('/goals/:id', async (req, res) => {
  const { body, statusCode } = await deleteGoalController.handle({ params: req.params });
  res.status(statusCode).send(body);
});

/*
  initiatives
*/
router.get('/initiatives', async (req, res) => {
  const { body, statusCode } = await getInitiativesControllers.handle();
  res.status(statusCode).send(body);
});

router.post('/initiatives', async (req, res) => {
  const { body, statusCode } = await createInitiativeControllers.handle({ body: req.body });
  res.status(statusCode).send(body);
});

router.get('/initiatives/:id', async (req, res) => {
  const { body, statusCode } = await getInitiativeController.handle({ params: req.params });
  res.status(statusCode).send(body);
});

router.delete('/initiatives/:id', async (req, res) => {
  const { body, statusCode } = await deleteInitiativeControllers.handle({ params: req.params });
  res.status(statusCode).send(body);
});

export default router;
