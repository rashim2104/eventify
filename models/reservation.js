import mongoose, { Schema, models } from 'mongoose';

const reservationSchema = new Schema(
  {
    venueId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    reservationDate: {
      type: String, // Changed from Date to String
      required: true,
    },
    venueName: {
      type: String,
      required: true,
    },
    reservationSession: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Reservation =
  models.Reservation || mongoose.model('Reservation', reservationSchema);
export default Reservation;
