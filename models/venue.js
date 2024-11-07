import mongoose, { Schema, models } from "mongoose";

const venueSchema = new Schema(
  {
    venueName:{
      type: String,
      required: true,
    },
    hasAc : {
      type: Boolean,
      required: true,
    },
    hasProjector : {
      type: Boolean,
      required: true,
    },
    seatingCapacity:{
      type: Number,
      required: true,
    },
    parentBlock:{
      type: String,
      required: true,
    },
    venueId:{
      type: String,
      required: true,
    },
    isAvailable:{
      type: Boolean,
      default: true,
    }
  }
);

const Venue = models.Venue || mongoose.model("Venue", venueSchema);
export default Venue;
