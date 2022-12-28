import { Router } from 'express';
import { UserController } from '../controllers/user';
import { adminGuard, authGuard } from '../middlewares/jwt';

const router: Router = Router();

const users = new UserController();

router.get('/', authGuard, adminGuard, users.getAll);
router.get('/:id', authGuard, users.getOne);
router.delete('/:id', authGuard, users.delete);
router.patch('/:id', authGuard, users.update);

export { router as usersRouter };
