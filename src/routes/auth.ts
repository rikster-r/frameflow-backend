import { Router, type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z, type AnyZodObject } from 'zod';
import Encrypt from '../lib/encrypt';
import User from '../models/User';
import passport from 'passport';

const router = Router();

const loginSchema = z.object({
  body: z.object({
    username: z.string().trim().min(1, { message: 'Username is required' }),
    password: z.string().trim().min(1, { message: 'Password is required' }),
  }),
});

const registerSchema = z.object({
  body: z.object({
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
  }),
});

const validate =
  (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (err) {
      return res.status(400).json(err);
    }
  };

router.post('/login', validate(loginSchema), function (req, res, next) {
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
      return res.json({ user, token });
    });
  })(req, res);
});

router.post('/register', validate(registerSchema), async function (req, res, next) {
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
        return res.status(201).json({ user, token });
      });
    })
    .catch(err => {
      res.status(500).json({ message: 'Internal server error' });
    });
});

export default router;
