import { Router } from 'express';
import { SustainableDevelopmentGoalsController } from '../controllers/SustainableDevelopmentGoals';

const router: Router = Router();

const sustainableDevelopmentGoals = new SustainableDevelopmentGoalsController();

router.get('/', sustainableDevelopmentGoals.getAll);
router.post('/', sustainableDevelopmentGoals.create);
router.put('/:id', sustainableDevelopmentGoals.update);
router.delete('/:id', sustainableDevelopmentGoals.delete);

export { router as sustainableDevelopmentGoalsRouter };
