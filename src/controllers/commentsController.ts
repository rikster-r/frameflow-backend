import { type Request, type Response } from 'express';
import Comment from '../models/Comment';
import { IUserModel } from '../models/User';
import { z } from 'zod';

const commentSchema = z.string().trim().min(1);

export const getPostComments = (req: Request, res: Response) => {
  Comment.find({ post: req.params.id })
    .populate('author')
    .sort({ createdAt: 'descending' })
    .then(comments => {
      return res.status(200).json(comments);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

export const addComment = async (req: Request, res: Response) => {
  try {
    commentSchema.parse(req.body.text);
  } catch (err) {
    return res.status(400).json(err);
  }

  try {
    let comment = await Comment.create({
      author: (req.user as IUserModel)._id,
      post: req.params.id,
      text: req.body.text,
      likedBy: [],
    });

    comment = await comment.populate('author');
    return res.status(201).json(comment);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const deleteComment = (req: Request, res: Response) => {
  Comment.deleteOne({ _id: req.params.id })
    .then(() => {
      return res.status(204).send();
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

export const getLikes = (req: Request, res: Response) => {
  Comment.findById(req.params.id)
    .populate('likedBy')
    .then(comment => {
      if (!comment) return res.status(200).json([]);
      return res.status(200).json(comment.likedBy);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

export const updateCommentLikesField = (req: Request, res: Response) => {
  Comment.findByIdAndUpdate(req.params.id, { likedBy: req.body.likedBy })
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};
