import { Router } from 'express';
import { AuthController } from '../controllers/auth';

const router: Router = Router();

const auth = new AuthController();

router.post('/register', (req, res) => {
  res.status(200).send(req.body);
}); //ok
router.post('/login', auth.signIn); //ok
router.post('/refreshToken', auth.refreshToken); //ok
router.post('/googleLogin', auth.googleSignIn); //ok

export { router as authRouter };
