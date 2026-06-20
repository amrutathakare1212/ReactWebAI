import React, { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:4000/api'
const initialForm = { name: '', email: '', password: '', travelStyle: 'Relaxed' }

export default function App() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [user, setUser] = useState(null)
  const [tours, setTours] = useState([])
  const [error, setError] = useState('')
  const [bookedTours, setBookedTours] = useState([])
  const [activeModal, setActiveModal] = useState(null)
  const [selectedTour, setSelectedTour] = useState(null)
  const [bookingForm, setBookingForm] = useState({ fullName: '', email: '', phone: '', startDate: '', guests: 1 })
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    const stored = window.localStorage.getItem('tourist-user')
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser(parsed)
      fetchTours(parsed.token)
      fetchBookedTours(parsed.token)
    }
  }, [])

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const route = mode === 'login' ? 'login' : 'signup'
    const body = {
      email: form.email,
      password: form.password,
      ...(mode === 'signup' ? { name: form.name, travelStyle: form.travelStyle } : {}),
    }

    try {
      const response = await fetch(`${API_BASE}/${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Request failed')
        return
      }

      const userData = { ...data.user, token: data.token }
      window.localStorage.setItem('tourist-user', JSON.stringify(userData))
      setUser(userData)
      setForm(initialForm)
      fetchTours(data.token)
    } catch (err) {
      setError('Unable to connect to backend.')
    }
  }

  const fetchTours = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/tours`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) return
      const data = await response.json()
      setTours(data.tours)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBookedTours = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) return
      const data = await response.json()
      setBookedTours(data.bookings || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
    }
  }

  const handleBookTour = async (event) => {
    event.preventDefault()
    setBookingError('')

    if (!bookingForm.fullName || !bookingForm.email || !bookingForm.phone || !bookingForm.startDate) {
      setBookingError('All fields are required.')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          tourTitle: selectedTour.title,
          tourLocation: selectedTour.location,
          ...bookingForm,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setBookingError(data.message || 'Booking failed')
        return
      }

      setBookedTours([...bookedTours, data.booking])
      setBookingForm({ fullName: '', email: '', phone: '', startDate: '', guests: 1 })
      setActiveModal(null)
      setSelectedTour(null)
      alert('Tour booked successfully!')
    } catch (err) {
      setBookingError('Unable to book tour. Please try again.')
      console.error(err)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('tourist-user')
    setUser(null)
    setTours([])
  }

  if (user) {
    const isBooked = (tourTitle) => bookedTours.some((b) => b.tourTitle === tourTitle)

    return (
      <main className="page home-page">
        <div className="site-header">
          <div className="logo">TouristCo</div>
          <nav className="nav-menu">
            <button className="nav-link" onClick={() => setActiveModal('tours')}>
              Tours
            </button>
            <button className="nav-link" onClick={() => setActiveModal('profile')}>
              Profile
            </button>
            <button className="nav-link" onClick={() => setActiveModal('contact')}>
              Contact
            </button>
          </nav>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <section className="home-hero">
          <div>
            <p className="eyebrow">India Travel</p>
            <h1>Discover iconic Indian journeys with expert guides.</h1>
            <p className="hero-copy">
              Get curated packages for Spiti, Leh-Ladakh, Rajasthan, Goa, Darjeeling and more.
            </p>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1526588560251-1a01834d4ae8?auto=format&fit=crop&w=900&q=80"
              alt="Tourism hero"
            />
          </div>
        </section>

        <section className="home-content">
          <div className="profile-card">
            <h2>Your profile</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Travel style:</strong> {user.travelStyle}</p>
            <p><strong>Member since:</strong> 2026</p>
          </div>
          <div className="contact-card">
            <h2>Contact support</h2>
            <p>Need help booking or customizing your tour? Our travel team is ready.</p>
            <p><strong>Email:</strong> support@touristcompany.com</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Office:</strong> New Delhi, India</p>
          </div>
        </section>

        <section className="tour-section">
          <div className="section-title">
            <p className="eyebrow">Popular tours</p>
            <h2>India tour experiences</h2>
          </div>
          <div className="tour-grid">
            {tours.map((tour) => {
              const booked = isBooked(tour.title)
              return (
                <article key={tour.title} className="tour-card">
                  <div
                    className="tour-image"
                    style={{ backgroundImage: `linear-gradient(135deg, rgba(14,165,233,0.18), rgba(34,197,94,0.18)), url('${tour.imageUrl}')` }}
                  />
                  {booked && <div className="booked-badge">✓ Booked</div>}
                  <div className="tour-content">
                    <div className="tour-meta">
                      <span>{tour.location}</span>
                      <span>{tour.date}</span>
                    </div>
                    <h3>{tour.title}</h3>
                    <p>{tour.description}</p>
                    <button
                      className={`tour-button ${booked ? 'booked' : ''}`}
                      onClick={() => {
                        setSelectedTour(tour)
                        setBookingForm({ fullName: '', email: '', phone: '', startDate: '', guests: 1 })
                        setBookingError('')
                        setActiveModal('booking')
                      }}
                      disabled={booked}
                    >
                      {booked ? 'Already Booked' : 'Book now'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* MODALS */}
        {activeModal === 'profile' && (
          <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
              <h2>Your Profile</h2>
              <div className="modal-body">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Travel Style:</strong> {user.travelStyle}</p>
                <h3>Your Bookings</h3>
                {bookedTours.length > 0 ? (
                  <ul className="bookings-list">
                    {bookedTours.map((booking, idx) => (
                      <li key={idx}>
                        <strong>{booking.tourTitle}</strong> - {booking.tourLocation} ({booking.startDate})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No bookings yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeModal === 'contact' && (
          <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
              <h2>Contact Support</h2>
              <div className="modal-body">
                <p><strong>Email:</strong> support@touristcompany.com</p>
                <p><strong>Phone:</strong> +91 98765 43210</p>
                <p><strong>Office:</strong> New Delhi, India</p>
                <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>
                <p>Have a question? Our team is here to help! Feel free to reach out anytime.</p>
              </div>
            </div>
          </div>
        )}

        {activeModal === 'tours' && (
          <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
              <h2>Available Tours</h2>
              <div className="modal-body">
                <div className="tours-list">
                  {tours.map((tour) => (
                    <div key={tour.title} className="tour-item">
                      <h4>{tour.title}</h4>
                      <p>{tour.location} - {tour.date}</p>
                      <p className="tour-desc">{tour.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModal === 'booking' && selectedTour && (
          <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
              <h2>Book Tour: {selectedTour.title}</h2>
              <form className="booking-form" onSubmit={handleBookTour}>
                <label>
                  Full Name
                  <input
                    type="text"
                    value={bookingForm.fullName}
                    onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </label>

                <label>
                  Phone
                  <input
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </label>

                <label>
                  Start Date
                  <input
                    type="date"
                    value={bookingForm.startDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Number of Guests
                  <input
                    type="number"
                    min="1"
                    value={bookingForm.guests}
                    onChange={(e) => setBookingForm({ ...bookingForm, guests: parseInt(e.target.value) })}
                    required
                  />
                </label>

                {bookingError && <div className="error-message">{bookingError}</div>}

                <button type="submit" className="submit-button">Confirm Booking</button>
              </form>
            </div>
          </div>
        )}
      </main>
    )
  }

  return (
    <main className="page">
      <div className="page-grid">
        <section className="travel-panel">
          <div className="panel-top">
            <div>
              <p className="eyebrow">Tourist Company</p>
              <h1>Book your dream India tour with confidence.</h1>
              <p className="panel-copy">
                Sign up to explore curated tours, private guides, and premium travel plans across India.
              </p>
            </div>
            <div className="panel-stats">
              <div>
                <strong>420+</strong>
                <span>Happy travellers</span>
              </div>
              <div>
                <strong>35</strong>
                <span>Tour packages</span>
              </div>
            </div>
          </div>

          <div className="image-frame modern-image">
            <img
              src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80"
              alt="India travel illustration"
            />
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <button
              type="button"
              className={mode === 'login' ? 'tab active' : 'tab'}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'tab active' : 'tab'}
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <div className="card-body">
            <h2>{mode === 'login' ? 'Welcome back!' : 'Create your travel account'}</h2>
            <p className="subtitle">
              {mode === 'login'
                ? 'Sign in to continue exploring tours and packages.'
                : 'Enter your details and start your travel journey.'}
            </p>

            <button
              type="button"
              className="google-button"
              onClick={() => window.alert('Google login is not connected in this demo.')}
            >
              <span className="google-icon">G</span>
              Continue with Google
            </button>

            <div className="separator">or</div>

            <form className="form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <label>
                  Full name
                  <input
                    value={form.name}
                    onChange={(event) => setField('name', event.target.value)}
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    required
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  value={form.email}
                  onChange={(event) => setField('email', event.target.value)}
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  value={form.password}
                  onChange={(event) => setField('password', event.target.value)}
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  required
                />
              </label>

              {mode === 'signup' && (
                <label>
                  Travel style
                  <select
                    value={form.travelStyle}
                    onChange={(event) => setField('travelStyle', event.target.value)}
                    name="travelStyle"
                  >
                    <option>Relaxed</option>
                    <option>Adventure</option>
                    <option>Luxury</option>
                    <option>Budget</option>
                  </select>
                </label>
              )}

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="submit-button">
                {mode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

