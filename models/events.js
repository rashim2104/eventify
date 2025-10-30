import mongoose, { Schema, models } from 'mongoose';

const eventSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  dept: {
    type: String,
    required: true,
  },
  eventCollege: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    default: 0,
  },
  ins_id: {
    type: String,
    default: null,
  },
  iqac_id: {
    type: Schema.Types.ObjectId,
    default: null,
  },
  eventData: {
    type: Schema.Types.Mixed,
    required: true,
  },
  comment: {
    type: String,
    default: '',
  },
  updateStatus: {
    type: Number,
    default: 0,
  },
  postEventData: {
    type: Schema.Types.Mixed,
    default: null,
  },
  postEventUpdateOn: {
    type: Date,
    default: null,
  },
  postEventUpdateBy: {
    type: Schema.Types.ObjectId,
    default: null,
  },
});

const Events = models.Events || mongoose.model('Events', eventSchema);

export default Events;
