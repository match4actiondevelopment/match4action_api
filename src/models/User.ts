import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  email: {
    type: String,
    minLength: 7,
    lowercase: true,
    unique: true,
    // required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    // google authentication does not have password
    // required: true,
  },
  date: {
    type: Date,
    default: () => Date.now(),
    immutable: true,
  },
  photo: {
    type: String,
  },
  googleId: {
    type: String,
    minLength: 7,
    unique: true,
  },
  provider: {
    type: String,
    enum: ['github', 'google', 'facebook', 'linkedin'],
  },
});

const User = mongoose.model('User', UserSchema);

export default User;
