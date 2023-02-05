const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Encrypt = require('../lib/encrypt');
const User = require('../models/user');

router.post('/login', function (req, res, next) {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        err,
        info,
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

router.post('/register', async function (req, res, next) {
  const { publicName, username, password } = req.body;

  //todo validation

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
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

module.exports = router;
