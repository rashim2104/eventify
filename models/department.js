import mongoose, { Schema, models } from 'mongoose';

const departmentSchema = new Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  college: {
    type: String,
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

// Compound unique index: code + college
departmentSchema.index({ code: 1, college: 1 }, { unique: true });

const Department =
  models.Department || mongoose.model('Department', departmentSchema);
export default Department;
