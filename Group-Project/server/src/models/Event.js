import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true, min: 1, default: 100 },
  organizer: { type: String, required: true, trim: true },
}, { timestamps: true })

export default mongoose.model('Event', eventSchema)
