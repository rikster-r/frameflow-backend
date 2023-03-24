import mongoose, { type Types, type Model, type Document } from 'mongoose';
const { Schema, models, model } = mongoose;

interface IComment {
  author: Types.ObjectId;
  post: Types.ObjectId;
  text: string;
  likedBy: Types.ObjectId[];
}

export interface ICommentModel extends IComment, Document {}

const CommentSchema = new Schema<IComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Comment = (models.Comment as Model<IComment>) || model('Comment', CommentSchema);

export default Comment;
