import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    description: { type: String },
    location: { type: String },
    category: { type: String, enum: ['Work', 'Personal', 'Health', 'Other'] },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
