import mongoose from 'mongoose'

const registrationSchema = new mongoose.Schema({
  eventId: { type: String, required: true, index: true },
  eventTitle: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  department: { type: String, required: true, trim: true },
  registeredAt: { type: Date, default: Date.now },
}, { timestamps: true })

registrationSchema.index({ eventId: 1, email: 1 }, { unique: true })
export default mongoose.model('Registration', registrationSchema)
