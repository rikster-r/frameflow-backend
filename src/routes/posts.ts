import { Router } from 'express';
import passport from 'passport';
import * as postsController from '../controllers/postsController';
import * as commentsController from '../controllers/commentsController';

const router = Router();

router.get('/', postsController.getAll);
router.post('/', passport.authenticate('jwt', { session: false }), postsController.createPost);

router.get('/:id', postsController.getOne);

router.get('/:id/likes', postsController.getLikes);
router.put('/:id/likes', postsController.updatePostLikesField);

router.get('/:id/comments', commentsController.getPostComments);
router.post(
  '/:id/comments',
  passport.authenticate('jwt', { session: false }),
  commentsController.addComment
);

export default router;
