import { Router } from 'express';
import { UserController } from '../controllers/user';

const router: Router = Router();

const users = new UserController();

router.post('/register', users.signUp);
router.post('/login', users.signIn);
router.post('/refreshToken', users.refreshToken);

export { router as authRouter };
