import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User, { IUserModel } from '../models/User';
import Encrypt from './encrypt';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    function (jwtPayload, cb) {
      //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
      return User.findOne({ _id: jwtPayload._id })
        .then((user: IUserModel | null) => {
          if (user) {
            return cb(null, user);
          }
          return cb(null, false, { message: 'User not found' });
        })
        .catch((err: Error) => {
          return cb(err);
        });
    }
  )
);

passport.use(
  new LocalStrategy(function (username, password, cb) {
    User.findOne({ username })
      .then(async user => {
        if (!user) {
          return cb(null, false, { message: "User doesn't exist" });
        }

        const isPasswordValid = await Encrypt.comparePassword(password, user.password);

        if (!isPasswordValid) {
          return cb(null, false, { message: 'Incorrect password' });
        }

        return cb(null, user, { message: 'Logged in successfully' });
      })
      .catch((err: Error) => cb(err));
  })
);
