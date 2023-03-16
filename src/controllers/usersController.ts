import { type Request, type Response } from 'express';
import User, { IUserModel } from '../models/User';
import formidable from 'formidable';
import cloudinary from '../lib/cloudinary';
import { z } from 'zod';
import Encrypt from '../lib/encrypt';

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

const infoSchema = z.object({
  publicName: z.string(),
  description: z.string(),
});

const usernameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Username is required' })
  .refine(
    async val => {
      const user = await User.findOne({ username: val });
      return user === null;
    },
    {
      message: 'User with this name already exists',
    }
  );

export const updateInfo = async (req: Request, res: Response) => {
  try {
    infoSchema.parse({
      publicName: req.body.name,
      description: req.body.description,
    });
    if (req.body.username !== (req?.user as IUserModel)?.username) {
      await usernameSchema.parseAsync(req.body.username);
    }
  } catch (err) {
    return res.status(400).json(err);
  }

  User.findByIdAndUpdate(req.params.id, {
    $set: {
      username: req.body.username,
      publicName: req.body.name,
      description: req.body.description,
    },
  })
    .then(() => {
      return res.status(200).send();
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

const passwordsSchema = z
  .object({
    currentPassword: z.string().min(1),
    password: z.string().min(1),
    passwordConfirm: z.string().min(1),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });

export const updatePassword = async (req: Request, res: Response) => {
  const data = {
    currentPassword: req.body.currentPassword,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };

  try {
    passwordsSchema.parse(data);
  } catch (err) {
    return res.status(400).json(err);
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(400).json({ message: "This user doesn't exist" });
    }

    const isPasswordValid = await Encrypt.comparePassword(data.currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const newPassword = await Encrypt.cryptPassword(data.password);
    user.password = newPassword;
    await user.save();

    return res.status(200).send();
  } catch (err) {
    return res.status(500).json(err);
  }
};
