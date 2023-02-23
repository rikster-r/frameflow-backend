import { type Request, type Response } from 'express';
import User from '../models/User';
import Post from '../models/Post';

export const getProfile = (req: Request, res: Response) => {
  return res.status(200).json(req.user);
};

export const getAll = (req: Request, res: Response) => {
  User.find()
    .then(users => {
      return res.status(200).json(users);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

export const getUser = (req: Request, res: Response) => {
  User.findOne({ username: req.params.username })
    .then(user => {
      return res.status(200).json(user);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(400).json({ message: 'No such user exists' });

    const posts = await Post.find({ author: user._id }).sort({ timestamp: 'descending' });
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const getSubscribers = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(400).json({ message: 'No such user exists' });

    const subscribers = await User.find({ follows: user._id });
    return res.status(200).json(subscribers);
  } catch (err) {
    return res.status(500).json(err);
  }
};
