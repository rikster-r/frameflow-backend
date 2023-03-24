import mongoose, { type Types, type Model, type Document } from 'mongoose';
const { Schema, models, model } = mongoose;

interface IPost {
  author: Types.ObjectId;
  images: string[];
  text: string;
  likedBy: Types.ObjectId[];
  location: string;
}

export interface IPostModel extends IPost, Document {}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String, required: true }],
    text: { type: String },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    location: { type: String },
  },
  { timestamps: true }
);

const Post = (models.Post as Model<IPost>) || model('Post', PostSchema);

export default Post;
