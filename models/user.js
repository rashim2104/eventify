import mongoose, { Schema, models } from 'mongoose';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
    },
    dept: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isSuperAdmin: {
      type: Number,
      default: 0,
    },
    college: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model('User', userSchema);
export default User;
