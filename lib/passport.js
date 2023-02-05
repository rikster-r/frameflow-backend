const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Encrypt = require('../lib/encrypt');

const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    function (jwtPayload, cb) {
      //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
      return User.findOne({ _id: jwtPayload._id })
        .then(user => {
          return cb(null, user);
        })
        .catch(err => {
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
      .catch(err => cb(err));
  })
);
