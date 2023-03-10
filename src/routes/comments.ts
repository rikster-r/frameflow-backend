import { Router } from 'express';
import * as commentsController from '../controllers/commentsController';

const router = Router();

router.delete('/:id', commentsController.deleteComment);

router.get('/:id/likes', commentsController.getLikes);
router.put('/:id/likes', commentsController.updateCommentLikesField);

export default router;
