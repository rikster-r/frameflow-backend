import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import Encrypt from '../lib/encrypt';
import User from '../models/User';
import passport from 'passport';
const router = Router();
router.post('/login', function (req, res, next) {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        var _a;
        if (err || !user) {
            return res.status(400).json({
                message: (_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : info === null || info === void 0 ? void 0 : info.message,
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
            .string()
            .min(1)
            .refine(async (val) => {
            const user = await User.findOne({ username: val });
            return user === null;
        }, {
            message: 'Username is already taken',
        }),
        password: z.string().min(1),
    }),
});
const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    }
    catch (err) {
        return res.status(400).json(err);
    }
};
router.post('/register', validate(schema), async function (req, res, next) {
    const { publicName, username, password } = req.body;
    // add to database
    const user = new User({
        publicName: publicName !== null && publicName !== void 0 ? publicName : '',
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
        req.login(user, { session: false }, (err) => {
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
export default router;
