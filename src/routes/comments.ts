import { Router } from 'express';
import * as commentsController from '../controllers/commentsController';

const router = Router();

router.put('/:id/likes', commentsController.updateCommentLikesField);

export default router;
