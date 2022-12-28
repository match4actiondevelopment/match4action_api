import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { User } from '../models/User';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CLIENT_SECRET ?? '';

export const passportStrategy = (passport: PassportStatic) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (request: any, accessToken: any, _refreshToken: any, profile: any, done: Function) => {
        try {
          const user = await User.findOne({ email: profile?.email });

          if (!user) {
            const newUser = await User.create({
              email: profile.email,
              name: profile.displayName,
              password: profile.sub,
              googleId: profile.id,
              provider: 'google',
              photo: profile.picture,
            });
            return done(null, newUser);
          }

          return done(null, user);
        } catch (error) {
          console.log(error);
          return done(error, null);
        }
      }
    )
  );
};
