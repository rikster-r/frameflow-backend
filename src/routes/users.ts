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

router.get('/:id/notifications', usersController.getNotifications);

router.get('/:username/feed', postsController.getFeed);

router.get('/:username/saved', postsController.getUserSavedPosts);

router.put(
  '/:id/saved',
  passport.authenticate('jwt', { session: false }),
  usersController.updateSavedList
);

router.get('/:username/followers', usersController.getFollowers);

router.get('/:username/following', usersController.getFollowing);

router.put(
  '/:id/follows',
  passport.authenticate('jwt', { session: false }),
  usersController.updateFollowsList
);

router.get('/:username/posts', postsController.getUserPosts);

router.get('/:username/visited', usersController.getVisited);

router.put('/:id/visited', usersController.updateVisitedList);

router.put(
  '/:id/avatar',
  passport.authenticate('jwt', { session: false }),
  usersController.updateAvatar
);

router.delete(
  '/:id/avatar',
  passport.authenticate('jwt', { session: false }),
  usersController.deleteAvatar
);

router.put(
  '/:id/info',
  passport.authenticate('jwt', { session: false }),
  usersController.updateInfo
);

router.put(
  '/:id/password',
  passport.authenticate('jwt', { session: false }),
  usersController.updatePassword
);

export default router;
