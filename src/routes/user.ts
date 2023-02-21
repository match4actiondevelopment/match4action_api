import { Router } from 'express';
import { UserController } from '../controllers/user';
import { authGuard } from '../utils/authGuard';

const router: Router = Router();

const users = new UserController();

router.get('/', users.getAll);
router.post('/profile', authGuard, users.profile);

// router.get('/:id', users.getOne);
// router.delete('/:id',  users.delete);
router.patch('/:id', authGuard, users.update);

export { router as usersRouter };
