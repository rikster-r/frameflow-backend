import { Router } from 'express';
import passport from 'passport';
import * as postsController from '../controllers/postsController';

const router = Router();

router.get('/', postsController.getAll);
router.post('/', passport.authenticate('jwt', { session: false }), postsController.createPost);

export default router;
