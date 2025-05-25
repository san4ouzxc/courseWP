const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: '/uploads/default-avatar.png' }  // <- добавь это
});

module.exports = mongoose.model('User', UserSchema);
