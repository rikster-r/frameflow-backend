import { type Request, type Response } from 'express';
import User from '../models/User';
import formidable from 'formidable';
import cloudinary from '../lib/cloudinary';

export const getProfile = (req: Request, res: Response) => {
  return res.status(200).json(req.user);
};

export const getSearchResults = (req: Request, res: Response) => {
  if (!req.query) return res.status(400).json({ message: 'Search parameters required' });

  User.find({ username: new RegExp(req.query.username as string, 'i') })
    .limit(10)
    .then(users => {
      return res.status(200).json(users);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
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

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(400).json({ message: 'No such user exists' });

    const followers = await User.find({ follows: user._id });
    return res.status(200).json(followers);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const getFollowing = (req: Request, res: Response) => {
  User.findOne({ username: req.params.username })
    .populate('follows')
    .then(user => {
      if (!user) return res.status(200).json([]);
      return res.status(200).json(user.follows);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

export const updateSavedList = (req: Request, res: Response) => {
  User.findByIdAndUpdate(req.params.id, { savedPosts: req.body.savedPosts })
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

export const updateFollowsList = (req: Request, res: Response) => {
  User.findByIdAndUpdate(req.params.id, { follows: req.body.follows })
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

export const getVisited = (req: Request, res: Response) => {
  User.findOne({ username: req.params.username })
    .populate('visited')
    .then(user => {
      if (!user) return res.status(400).json('No such user exists');
      return res.status(200).json(user.visited);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

export const updateVisitedList = (req: Request, res: Response) => {
  User.findByIdAndUpdate(req.params.id, { visited: req.body.visited })
    .then(() => {
      res.status(200).send();
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

export const updateAvatar = async (req: Request, res: Response) => {
  const form = formidable();

  // parse files
  const avatar: formidable.File = await new Promise(function (resolve, reject) {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      const image = Array.isArray(files.images) ? files.images[0] : files.images;
      resolve(image);
    });
  });

  const avatarUrl = await cloudinary.uploader
    .upload(avatar.filepath, {
      folder: 'frameflow/avatars',
      resource_type: 'image',
      public_id: avatar.newFilename,
    })
    .then(result => {
      return result.url;
    })
    .catch(err => {
      return res.status(500).json(err);
    });

  User.findByIdAndUpdate(req.params.id, { avatar: avatarUrl })
    .then(() => {
      res.status(200).send();
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

export const deleteAvatar = (req: Request, res: Response) => {
  User.findByIdAndUpdate(req.params.id, { $unset: { avatar: 1 } })
    .then(() => {
      return res.status(200).send();
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};
