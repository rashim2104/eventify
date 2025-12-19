import mongoose, { Schema, models } from 'mongoose';

const clubSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
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

const Club = models.Club || mongoose.model('Club', clubSchema);
export default Club;
