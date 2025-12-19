import mongoose, { Schema, models } from 'mongoose';

const parentBlockSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const ParentBlock =
  models.ParentBlock || mongoose.model('ParentBlock', parentBlockSchema);
export default ParentBlock;
