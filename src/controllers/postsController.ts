import { type Request, type Response } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';
import formidable from 'formidable';
import cloudinary from '../lib/cloudinary';
import { IUserModel } from '../models/User';
import { z } from 'zod';

const fieldsSchema = z.object({
  captionSchema: z.optional(z.string().trim()),
  images: z
    .any()
    .array()
    .min(1, { message: 'At least one image is required' })
    .max(9, { message: 'More than 9 images is not allowed' })
    .refine(
      images =>
        images.every(image => image.mimetype === 'image/png' || image.mimetype === 'image/jpeg'),
      { message: 'Invalid file type. Only PNG and JPEG images are supported' }
    ),
});

const commentSchema = z.string().trim().min(1);

export const getAll = (req: Request, res: Response) => {
  Post.find()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

export const createPost = async (req: Request, res: Response) => {
  const form = formidable({ multiples: true });

  // parse files
  const fields: {
    text: string;
    images: formidable.File[];
  } = await new Promise(function (resolve, reject) {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      const images = Array.isArray(files.images) ? files.images : [files.images];

      resolve({
        text: fields.text as string,
        images,
      });
    });
  });

  // validate
  try {
    fieldsSchema.parse(fields);
  } catch (err) {
    return res.status(400).json(err);
  }

  // post images
  const imageUrls = await Promise.all(
    fields.images.map(image =>
      cloudinary.uploader
        .upload(image.filepath, {
          folder: 'frameflow/posts',
          resource_type: 'image',
          public_id: image.newFilename,
        })
        .then(result => {
          return result.url;
        })
        .catch(err => {
          return res.status(500).json(err);
        })
    )
  );

  //create post
  const post = new Post({
    author: (req.user as IUserModel)._id,
    images: imageUrls,
    text: fields.text ?? '',
    likedBy: [],
  });

  post
    .save()
    .then(post => {
      return res.status(201).json(post);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

export const getOne = (req: Request, res: Response) => {
  Post.findById(req.params.id)
    .then(post => {
      return res.status(200).json(post);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
};

export const getPostComments = (req: Request, res: Response) => {
  Comment.find({ post: req.params.id })
    .populate('author')
    .sort({ timestamp: 'descending' })
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

  const comment = new Comment({
    author: (req.user as IUserModel)._id,
    post: req.params.id,
    text: req.body.text,
    likedBy: [],
  });

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
