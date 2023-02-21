import { Router } from 'express';
import { GoalsController } from '../controllers/goals';
import { authGuard } from '../utils/authGuard';

const router: Router = Router();

const goals = new GoalsController();

router.get('/', goals.getAll);
router.post('/', authGuard, goals.create);
router.put('/:id', authGuard, goals.update);
router.delete('/:id', authGuard, goals.delete);

export { router as goalsRouter };
