import { Router } from 'express';
import passport from 'passport';
import * as usersController from '../controllers/usersController';

const router = Router();

router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  usersController.getProfile
);

router.get('/search', usersController.getSearchResults);

router.get('/', usersController.getAll);

router.get('/:username', usersController.getUser);

router.get('/:username/saved', usersController.getSavedPosts);

router.put(
  '/:id/saved',
  passport.authenticate('jwt', { session: false }),
  usersController.updateSavedList
);

router.get('/:username/followers', usersController.getFollowers);

router.get('/:username/following', usersController.getFollowing);

router.put('/:id/follows', usersController.updateFollowsList);

router.get('/:username/posts', usersController.getPosts);

router.get('/:username/visited', usersController.getVisited);

router.put('/:id/visited', usersController.updateVisitedList);

export default router;
