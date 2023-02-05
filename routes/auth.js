const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Encrypt = require('../lib/encrypt');
const User = require('../models/user');
const { z } = require('zod');

router.post('/login', function (req, res, next) {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: err?.message ?? info?.message,
      });
    }

    req.login(user, { session: false }, err => {
      if (err) {
        res.status(500).json(err);
      }

      // generate a signed json web token with the contents of user object and return it in the response
      const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET);
      return res.json({ user, token });
    });
  })(req, res);
});

const schema = z.object({
  body: z.object({
    username: z
      .string({ required_error: 'Username is required' })
      .min(1)
      .refine(
        async val => {
          const user = await User.findOne({ username: val });
          return user === null;
        },
        {
          message: 'Username is already taken',
        }
      ),
    password: z.string({ required_error: 'Password is required' }).min(1),
  }),
});

const validate = schema => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    return res.status(400).json(error);
  }
};

router.post('/register', validate(schema), async function (req, res, next) {
  const { publicName, username, password } = req.body;

  // add to database
  const user = new User({
    publicName: publicName ?? '',
    username,
    password: await Encrypt.cryptPassword(password),
    avatar: '',
    follows: [],
    visited: [],
    savedPosts: [],
  });

  user
    .save()
    .then(user => {
      req.login(user, { session: false }, err => {
        if (err) {
          res.status(500).json(err);
        }

        // generate a signed json web token with the contents of user object and return it in the response
        const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET);
        return res.status(201).json({ user, token });
      });
    })
    .catch(err => {
      res.status(500).json({ message: 'Internal server error' });
    });
});

module.exports = router;
