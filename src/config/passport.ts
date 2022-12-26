import bcrypt from 'bcrypt';
import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User';

const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET || '';

const passportStrategy = (passport: PassportStatic) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        // passReqToCallback: true,
      },
      (
        // request: any,
        accessToken,
        refreshToken,
        profile,
        done: Function
      ) => {
        // console.log('profile:', profile);
        const { id, email, sub, displayName, provider, picture } = profile;

        User.findOne({ googleId: id })
          .then((user) => {
            if (!user) {
              User.create(
                {
                  email,
                  name: displayName,
                  password: sub,
                  googleId: id,
                  provider,
                  photo: picture,
                },
                (err, user) => {
                  // request.user = user;
                  return done(err, user);
                }
              );
              return;
            } else {
              return done(null, user);
            }
          })
          .catch((err) => console.log(err));
      }
    )
  );

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      console.log('email:', email, 'password:', password);
      // Match user
      User.findOne({ email })
        .then((user) => {
          if (!user) {
            // no Match
            done(null, false, { message: 'This email is not registered' });
          } else {
            // Match password
            bcrypt.compare(password, user.password || '', (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, {
                  message: 'Password did not match',
                });
              }
            });
          }
        })
        .catch((err) => console.log(err));
    })
  );

  passport.serializeUser((user: any, done: Function) => {
    done(null, user);
  });

  passport.deserializeUser((id: string, done: Function) => {
    User.findById(id, (err: any, user: any) => {
      done(err, user);
    });
  });
};

export default passportStrategy;
