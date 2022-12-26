import { Router } from 'express';
import passport from 'passport';

const router: Router = Router();

router.route('/auth/google/login').get(
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: `http://localhost:3000`,
    failureMessage: true,
  })
);

export default router;
