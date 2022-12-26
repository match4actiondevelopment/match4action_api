import { ISignInUserRepository, SignInUserParams } from '../../controllers/users/types';
import { IUser, User } from '../../models/user';
import { comparePasswords } from '../../utils/bcrypt';

export class SignInUserRepository implements ISignInUserRepository {
  async signIn(params: SignInUserParams): Promise<IUser> {
    const user = await User.findOne({
      email: params.email,
    });

    if (!user) {
      throw new Error('Email or password incorrect.');
    }

    const isValid = await comparePasswords(params.password, user.password);

    if (!isValid) {
      throw new Error('Email or password incorrect.');
    }

    return user;
  }
}
