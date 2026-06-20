import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const app = express()
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'
const DATA_FILE = join(process.cwd(), 'users.json')
const BOOKINGS_FILE = join(process.cwd(), 'bookings.json')

app.use(cors())
app.use(express.json())

const readUsers = () => {
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify({ users: [] }, null, 2))
  }
  return JSON.parse(readFileSync(DATA_FILE, 'utf8')).users
}

const writeUsers = (users) => {
  writeFileSync(DATA_FILE, JSON.stringify({ users }, null, 2))
}

const readBookings = () => {
  if (!existsSync(BOOKINGS_FILE)) {
    writeFileSync(BOOKINGS_FILE, JSON.stringify({ bookings: [] }, null, 2))
  }
  return JSON.parse(readFileSync(BOOKINGS_FILE, 'utf8')).bookings
}

const writeBookings = (bookings) => {
  writeFileSync(BOOKINGS_FILE, JSON.stringify({ bookings }, null, 2))
}

app.post('/api/signup', async (req, res) => {
  const { name, email, password, travelStyle } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' })
  }

  const users = readUsers()
  const existing = users.find((user) => user.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    return res.status(409).json({ message: 'Email already exists.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const newUser = { id: Date.now(), name, email, passwordHash, travelStyle: travelStyle || 'Relaxed' }
  users.push(newUser)
  writeUsers(users)

  const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, {
    expiresIn: '2h',
  })

  res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, travelStyle: newUser.travelStyle } })
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const users = readUsers()
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials.' })
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: '2h',
  })

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, travelStyle: user.travelStyle } })
})

const authenticate = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization header.' })
  }

  const token = header.replace('Bearer ', '')
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

const tours = [
  {
    title: 'Spiti Valley',
    location: 'Himachal Pradesh',
    date: 'May 12 - May 18',
    description: 'High mountain roads, monasteries, and starlit nights in the cold desert.',
    imageUrl: 'https://images.unsplash.com/photo-1517821369730-8001c5367052?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Leh-Ladakh',
    location: 'Jammu & Kashmir',
    date: 'June 2 - June 10',
    description: 'Breathtaking lakes, rugged passes, and adventure trails.',
    imageUrl: 'https://images.unsplash.com/photo-1545992336-19d8a65f15d8?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Jaipur & Ranthambore',
    location: 'Rajasthan',
    date: 'September 5 - September 12',
    description: 'Palaces, forts, and tiger safaris under the desert sun.',
    imageUrl: 'https://images.unsplash.com/photo-1546574835-5f1f905cff28?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Goa Beach Escape',
    location: 'Goa',
    date: 'December 10 - December 16',
    description: 'Sunset beaches, water sports, and vibrant beach markets.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Darjeeling Tea Route',
    location: 'West Bengal',
    date: 'April 1 - April 6',
    description: 'Peaceful hills, tea gardens, and mountain viewpoints.',
    imageUrl: 'https://images.unsplash.com/photo-1512451031483-1a26f14b6b4c?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Udaipur Lakes',
    location: 'Rajasthan',
    date: 'October 15 - October 20',
    description: 'Romantic palaces, lakeside walks, and rich culture.',
    imageUrl: 'https://images.unsplash.com/photo-1532147079600-05ad5236a9a0?auto=format&fit=crop&w=900&q=80',
  },
]

app.get('/api/tours', authenticate, (req, res) => {
  res.json({ tours })
})

app.post('/api/bookings', authenticate, (req, res) => {
  const { tourTitle, tourLocation, fullName, email, phone, startDate, guests } = req.body

  if (!tourTitle || !fullName || !email || !phone || !startDate || !guests) {
    return res.status(400).json({ message: 'All booking fields are required.' })
  }

  const bookings = readBookings()
  const newBooking = {
    id: Date.now(),
    userId: req.user.id,
    userEmail: req.user.email,
    tourTitle,
    tourLocation,
    fullName,
    email,
    phone,
    startDate,
    guests,
    bookedAt: new Date().toISOString(),
  }

  bookings.push(newBooking)
  writeBookings(bookings)

  res.json({ booking: newBooking, message: 'Booking confirmed!' })
})

app.get('/api/bookings', authenticate, (req, res) => {
  const bookings = readBookings()
  const userBookings = bookings.filter((b) => b.userId === req.user.id)
  res.json({ bookings: userBookings })
})

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`)
})
