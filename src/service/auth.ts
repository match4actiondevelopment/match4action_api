import { signJwtAccessToken, signJwtRefreshToken } from "../middleware/jwt";
import { User, UserRole } from "../models/User";
import { UserToken } from "../models/UserToken";
import { comparePasswords, hashPassword } from "../utils/bcrypt";
import { LoginInput } from "../schemas/auth";


interface LoginDone {
    success: boolean,
    data: object,
    access_token: string,
    refresh_token: string,
}

export async function doLogin(input: LoginInput): Promise<LoginDone> {
    try {
        let result: LoginDone = {
            success: false,
            data: {},
            access_token: "",
            refresh_token: "",
        }

        const user = await User.findOne({ email: input.body.email });
    
        //User not found
        if (!user) {
          return result;
        }
    
        const comparedPassword = await comparePasswords(
          input.body?.password,
          user?.password as string
        );
    
        //Passwords don't match
        if (!comparedPassword) {
          return result;
        }
    
        const access_token = signJwtAccessToken({
          _id: user._id!,
          email: user.email!,
          role: user.role!,
        });
    
        const refresh_token = signJwtRefreshToken({
          _id: user._id!,
          email: user.email!,
          role: user.role!,
        });
    
        const userToken = new UserToken({
          token: refresh_token,
          userId: user?._id,
        });
    
        const addedUserToken = await userToken.save();
    
        if (!addedUserToken) {
          return result;
        }
    
        user.password = undefined;
    
        result.success = true
        result.data = user
        result.access_token = access_token
        result.refresh_token = refresh_token

        return result
      } catch (e:any) {
        throw new Error(e);
      }
}
