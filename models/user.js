import mongoose, { Schema, Types, models } from 'mongoose';

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
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    postEventOverrideCount: {
      type: Number,
      default: 0,
    },
    lastOverrideGrantedBy: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lastOverrideGrantedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model('User', userSchema);
export default User;
