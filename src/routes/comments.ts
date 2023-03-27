import { Router } from 'express';
import * as commentsController from '../controllers/commentsController.js';

const router = Router();

router.get('/:id', commentsController.getOne);
router.delete('/:id', commentsController.deleteComment);

router.get('/:id/likes', commentsController.getLikes);
router.put('/:id/likes', commentsController.updateCommentLikesField);

export default router;
