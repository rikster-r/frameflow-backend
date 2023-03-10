import { Router } from 'express';
import passport from 'passport';
import * as usersController from '../controllers/usersController';
import * as postsController from '../controllers/postsController';

const router = Router();

router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  usersController.getProfile
);

router.get('/search', usersController.getSearchResults);

router.get('/', usersController.getAll);

router.get('/:username', usersController.getUser);

router.get('/:username/saved', postsController.getUserSavedPosts);

router.put(
  '/:id/saved',
  passport.authenticate('jwt', { session: false }),
  usersController.updateSavedList
);

router.get('/:username/followers', usersController.getFollowers);

router.get('/:username/following', usersController.getFollowing);

router.put('/:id/follows', usersController.updateFollowsList);

router.get('/:username/posts', postsController.getUserPosts);

router.get('/:username/visited', usersController.getVisited);

router.put('/:id/visited', usersController.updateVisitedList);

export default router;
