import mongoose, { Schema, models } from 'mongoose';

const collegeSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

const College = models.College || mongoose.model('College', collegeSchema);
export default College;
