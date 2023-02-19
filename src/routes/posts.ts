import { Router, response } from 'express';
const router = Router();
import passport from 'passport';
import Post from '../models/Post';
import formidable from 'formidable';
import cloudinary from '../lib/cloudinary';
import { IUserModel } from '../models/User';

// GET all posts
router.get('/', (req, res) => {
  Post.find()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const form = formidable({ multiples: true });

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

  fields.images.forEach(image => {
    if (image.mimetype !== 'image/png' && image.mimetype !== 'image/jpeg')
      return res
        .status(400)
        .json({ message: 'Invalid file type. Only PNG and JPEG images are supported' });
  });

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

  const post = new Post({
    author: (req.user as IUserModel)._id,
    images: imageUrls,
    text: fields.text,
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
});

export default router;
