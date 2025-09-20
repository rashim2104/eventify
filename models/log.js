import mongoose, { Schema, models } from 'mongoose';

const logSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: true,
    },
    logType: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Logs = models.Logs || mongoose.model('Logs', logSchema);

export default Logs;
