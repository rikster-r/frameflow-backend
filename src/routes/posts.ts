import { Router } from 'express';
import passport from 'passport';
import * as postsController from '../controllers/postsController.js';
import * as commentsController from '../controllers/commentsController.js';

const router = Router();

router.get('/', postsController.getAll);
router.post('/', passport.authenticate('jwt', { session: false }), postsController.createPost);

router.get('/latest', postsController.getLatest);

router.get('/:id', postsController.getOne);
router.delete('/:id', postsController.deleteOne);

router.get('/:id/likes', postsController.getLikes);
router.put(
  '/:id/likes',
  passport.authenticate('jwt', { session: false }),
  postsController.updatePostLikesField
);

router.get('/:id/comments', commentsController.getPostComments);
router.post(
  '/:id/comments',
  passport.authenticate('jwt', { session: false }),
  commentsController.addComment
);

export default router;
