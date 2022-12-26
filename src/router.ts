import { Router } from 'express';
import { GoalsController } from './controllers/goals';
import { InitiativesController } from './controllers/initiatives';
import { UsersController } from './controllers/users';
import { protect } from './utils/authorization';

const router = Router();

/*
  controllers
*/
const goals = new GoalsController();
const users = new UsersController();
const initiatives = new InitiativesController();

/*
  users
*/
router.get('/users', protect, users.getAll);
router.post('/sign-in', users.signIn);
router.post('/users', users.create);
router.get('/users/:id', protect, users.getOne);
router.put('/users/:id', protect, users.update);
router.delete('/users/:id', protect, users.delete);

/*
  goals
*/
router.get('/goals', goals.getAll);
router.post('/goals', protect, goals.create);
router.put('/goals/:id', protect, goals.update);
router.delete('/goals/:id', protect, goals.delete);

/*
  initiatives
*/
router.get('/initiatives', initiatives.getAll);
router.post('/initiatives', protect, initiatives.create);
router.get('/initiatives/:id', initiatives.getOne);
router.delete('/initiatives/:id', protect, initiatives.delete);

export default router;
