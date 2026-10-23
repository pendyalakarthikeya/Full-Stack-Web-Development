import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Event from './models/Event.js'
import Registration from './models/Registration.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }))

app.get('/api/events', async (_req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 })
    res.json(events.map(event => ({ ...event.toObject(), id: String(event._id) })))
  } catch { res.status(500).json({ message: 'Could not fetch events' }) }
})

app.post('/api/events', async (req, res) => {
  try {
    const event = await Event.create(req.body)
    res.status(201).json({ ...event.toObject(), id: String(event._id) })
  } catch (error) { res.status(400).json({ message: error.message || 'Could not create event' }) }
})

app.delete('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) return res.status(404).json({ message: 'Event not found' })
    await Registration.deleteMany({ eventId: req.params.id })
    res.status(204).end()
  } catch { res.status(400).json({ message: 'Invalid event ID' }) }
})

app.get('/api/registrations', async (_req, res) => {
  try {
    const registrations = await Registration.find().sort({ registeredAt: -1 })
    res.json(registrations.map(r => ({ ...r.toObject(), id: String(r._id) })))
  } catch { res.status(500).json({ message: 'Could not fetch registrations' }) }
})

app.post('/api/registrations', async (req, res) => {
  try {
    const { eventId, eventTitle, name, email, department } = req.body
    if (!eventId || !eventTitle || !name || !email || !department) return res.status(400).json({ message: 'All registration fields are required' })
    const duplicate = await Registration.findOne({ eventId, email: email.toLowerCase() })
    if (duplicate) return res.status(409).json({ message: 'This email is already registered for this event' })
    const registration = await Registration.create({ eventId, eventTitle, name, email, department })
    res.status(201).json({ ...registration.toObject(), id: String(registration._id) })
  } catch (error) { res.status(400).json({ message: error.message || 'Could not register' }) }
})

const port = process.env.PORT || 5000
try {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub')
  console.log('Connected to MongoDB')
  app.listen(port, () => console.log(`EventHub API running at http://localhost:${port}`))
} catch (error) {
  console.error('MongoDB connection failed. Check MONGO_URI and ensure MongoDB is running.')
  console.error(error.message)
  process.exit(1)
}
