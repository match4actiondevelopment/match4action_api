import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User";
import {
  GOOGLE_CALLBACK_REDIRECT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "../utils/secrets";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_REDIRECT,
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await User.findOne({
        provider: { id: profile.id, name: "google" },
      });

      // If user doesn't exist creates a new user. (similar to sign up)
      if (!user) {
        const newUser = await User.create({
          provider: {
            id: profile.id,
            name: "google",
          },
          email: profile.emails?.[0].value,
          name: profile.displayName,
          image: profile.photos?.[0].value,
          password: null,
          termsAndConditions: true,
        });
        if (newUser) {
          done(null, newUser);
        } else {
          done(null, undefined);
        }
      } else {
        done(null, user);
      }
    }
  )
);
