import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { AuthController } from '../controllers/auth';
import { hashPassword } from '../middlewares/bcrypt';
import { User } from '../models/User';
import { UserToken } from '../models/UserToken';
import {
  ACCESS_TOKEN_PRIVATE_KEY,
  ACCESS_TOKEN_PRIVATE_TIME,
  REFRESH_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_PRIVATE_TIME,
} from '../utils/constants';

const router: Router = Router();

const auth = new AuthController();

router.post('/register', async (req, res) => {
  try {
    if (!req?.body?.termsAndConditions) {
      res
        .status(404)
        .json({ success: false, message: 'Error creating new user. The user must agree with terms and conditions.' });
    }

    console.log('here1');

    const user = await User.findOne({ email: req.body.email });

    if (user) {
      return res.status(404).json({ success: false, message: 'Invalid email.' });
    }

    console.log('here2');

    const newPassword = await hashPassword(req?.body?.password);

    const newUser = new User({
      name: req?.body?.name,
      email: req?.body?.email,
      termsAndConditions: req?.body?.termsAndConditions,
      role: req?.body?.role ?? 'volunteer',
      password: newPassword,
      provider: req?.body?.provider ?? 'credentials',
    });

    console.log('here3');

    const addedUser = await newUser.save();

    console.log('here4');

    const createdUser = await User.findById(addedUser._id);

    if (!createdUser) {
      return res.status(404).json({ success: false, message: 'Error creating new user.' });
    }

    console.log('here5');

    const access_token = jwt.sign(
      {
        _id: user!._id,
        role: user!.role,
        email: user!.email,
      },
      ACCESS_TOKEN_PRIVATE_KEY,
      { expiresIn: +ACCESS_TOKEN_PRIVATE_TIME }
    );

    const refresh_token = jwt.sign(
      {
        _id: user!._id,
        role: user!.role,
        email: user!.email,
      },
      REFRESH_TOKEN_PRIVATE_KEY,
      { expiresIn: REFRESH_TOKEN_PRIVATE_TIME }
    );

    const userToken = new UserToken({
      token: refresh_token,
      userId: user?._id,
    });

    const addedUserToken = await userToken.save();

    if (!addedUserToken) {
      res.status(404).json({ success: false, message: 'Error creating refresh token.' });
      return;
    }

    if (createdUser) {
      createdUser.password = undefined;
    }

    console.log('here6');

    res.status(201).json({
      success: true,
      user: {
        ...createdUser?.toObject(),
        access_token,
        refresh_token,
      },
    });
  } catch (error) {
    res.status(404);
  }
}); //ok
router.post('/login', auth.signIn); //ok
router.post('/refreshToken', auth.refreshToken); //ok
router.post('/googleLogin', auth.googleSignIn); //ok

export { router as authRouter };
