import { Router } from 'express';
import { UserController } from '../controllers/user';
import { authGuard } from '../middlewares/jwt';

const router: Router = Router();

const users = new UserController();

router.get('/', authGuard, users.getAll);
// router.get('/:id', users.getOne);
// router.post('/profile', authGuard, users.profile);
// router.delete('/:id', authGuard, users.delete);
// router.patch('/:id', authGuard, users.update);

export { router as usersRouter };
