import { Router } from 'express';
import passport from 'passport';
import { UserController } from '../controllers/user';
import { generateToken } from '../middlewares/jwt';

const router: Router = Router();

const users = new UserController();

router.route('/google/login').get(
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureMessage: true,
    failureRedirect: process.env.CLIENT_BASE_URL,
  }),
  async (req, res) => {
    const token = generateToken(req.user);
    let url = new URL(process.env.CLIENT_BASE_URL ?? '');
    url.searchParams.append('auth_token', token);

    res.redirect(url.toString());
  }
);

router.post('/register', users.signUp);
router.post('/login', users.signIn);

export { router as authRouter };
