import { Schema, models, model } from 'mongoose';
const UserSchema = new Schema({
    publicName: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    follows: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    visited: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    savedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});
const User = models.User || model('User', UserSchema);
export default User;
