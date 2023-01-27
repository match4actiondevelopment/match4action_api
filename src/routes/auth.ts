import { Router } from 'express';
import { AuthController } from '../controllers/auth';

const router: Router = Router();

const auth = new AuthController();

router.post('/register', auth.signUp); //ok
router.post('/login', auth.signIn); //ok
router.post('/refreshToken', auth.refreshToken); //ok
router.post('/googleLogin', auth.googleSignIn); //ok

export { router as authRouter };
