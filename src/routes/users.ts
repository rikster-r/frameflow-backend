import { Router } from 'express';
import passport from 'passport';
import * as usersController from '../controllers/usersController';

const router = Router();

router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  usersController.getProfile
);

router.get('/', usersController.getAll);

router.get('/:username', usersController.getUser);

router.get('/:username/posts', usersController.getPosts);

router.get('/:username/subscribers', usersController.getSubscribers);

export default router;
