import { Router } from 'express';
import { AuthController } from '../controllers/auth';

const router: Router = Router();

const auth = new AuthController();

router.post('/register', auth.signUp);
router.post('/login', auth.signIn);
router.post('/refreshToken', auth.refreshToken);

export { router as authRouter };
