import { Router } from 'express';
const router = Router();
import passport from 'passport';

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/* GET user profile. */
router.get('/profile', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.status(200).json({ user: req.user });
});

export default router;
