const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  publicName: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String },
  follows: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  visited: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;
