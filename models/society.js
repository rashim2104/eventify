import mongoose, { Schema, models } from 'mongoose';

const societySchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['professional', 'ieee'],
    required: true,
  },
  eventIdTemplate: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Society = models.Society || mongoose.model('Society', societySchema);
export default Society;
