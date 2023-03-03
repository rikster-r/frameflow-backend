import { Schema, models, model, Types, type Model, type Document } from 'mongoose';

interface IUser {
  publicName: string;
  username: string;
  password: string;
  avatar: string;
  description: string;
  follows: Types.ObjectId[];
  visited: Types.ObjectId[];
  savedPosts: Types.ObjectId[];
}

export interface IUserModel extends IUser, Document {}

const UserSchema = new Schema<IUser>(
  {
    publicName: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    description: { type: String },
    follows: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    visited: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    savedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  },
  { timestamps: true }
);

const User = (models.User as Model<IUser>) || model('User', UserSchema);

export default User;
