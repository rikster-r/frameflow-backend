import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import Encrypt from '../lib/encrypt';
import User from '../models/User';
import passport from 'passport';

const loginSchema = z.object({
  username: z.string().trim().min(1, { message: 'Username is required' }),
  password: z.string().trim().min(1, { message: 'Password is required' }),
});

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: 'Username is required' })
    .refine(
      async val => {
        const user = await User.findOne({ username: val });
        return user === null;
      },
      {
        message: 'User with this name already exists',
      }
    ),
  password: z.string().trim().min(1, { message: 'Password is required' }),
});

export const login = (req: Request, res: Response) => {
  try {
    loginSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json(err);
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      /* 
        follows this structure because errors in zod follow the same one 
        while passport only allows message field on info
      */
      switch (info?.message) {
        case "This user doesn't exist":
          return res.status(400).json({
            issues: [
              {
                message: info.message,
                path: ['body', 'username'],
              },
            ],
          });
        case 'Incorrect password':
          return res.status(400).json({
            issues: [
              {
                message: info.message,
                path: ['body', 'password'],
              },
            ],
          });
        default:
          return res.status(400).json({
            issues: [
              {
                message: err?.message ?? info?.message,
                path: [],
              },
            ],
          });
      }
    }

    req.login(user, { session: false }, err => {
      if (err) {
        res.status(500).json(err);
      }

      // generate a signed json web token with the contents of user object and return it in the response
      const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET as string);
      return res.json({ token });
    });
  })(req, res);
};

export const register = async (req: Request, res: Response) => {
  try {
    await registerSchema.parseAsync(req.body);
  } catch (err) {
    return res.status(400).json(err);
  }

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
      req.login(user, { session: false }, (err: Error) => {
        if (err) {
          res.status(500).json(err);
        }

        // generate a signed json web token with the contents of user object and return it in the response
        const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET as string);
        return res.status(201).json({ token });
      });
    })
    .catch(() => {
      res.status(500).json({ message: 'Internal server error' });
    });
};
