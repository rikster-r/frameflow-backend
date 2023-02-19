import { Schema, models, model, Types, type Model, type Document } from 'mongoose';

interface IPost {
  author: Types.ObjectId;
  images: string[];
  text: string;
  likedBy: Types.ObjectId[];
  timestamp: Date;
}

export interface IPostModel extends IPost, Document {}

const PostSchema = new Schema<IPost>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ type: String, required: true }],
  text: { type: String },
  likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  timestamp: { type: Date, default: Date.now },
});

const Post = (models.Post as Model<IPost>) || model('Post', PostSchema);

export default Post;
