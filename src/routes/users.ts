import { Router } from 'express';
const router = Router();
import passport from 'passport';
import * as usersController from '../controllers/usersController';

/* GET users listing. */
router.get('/');

/* GET user profile. */
router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  usersController.getProfile
);

export default router;
