import { Router } from 'express';
import passport from 'passport';
import * as postsController from '../controllers/postsController';

const router = Router();

router.get('/', postsController.getAll);
router.post('/', passport.authenticate('jwt', { session: false }), postsController.createPost);

router.get('/:id', postsController.getOne);
router.get('/:id/comments', postsController.getPostComments);
router.post(
  '/:id/comments',
  passport.authenticate('jwt', { session: false }),
  postsController.addComment
);

export default router;
