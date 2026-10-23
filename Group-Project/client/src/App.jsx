import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, MapPin, Users, Search, Plus, Ticket, Sparkles, LayoutDashboard, X, CheckCircle2, Clock3, ArrowRight } from 'lucide-react'
import { api } from './api'

const categories = ['All Events', 'Workshop', 'Competition', 'Cultural', 'Tech Talk', 'Sports']
const initialForm = { name: '', email: '', department: '' }
const blankEvent = { title: '', category: 'Workshop', date: '', time: '', venue: '', description: '', capacity: 100, organizer: '' }

function dateLabel(date) {
  if (!date) return 'Date to be announced'
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function App() {
  const [events, setEvents] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Events')
  const [page, setPage] = useState('events')
  const [selected, setSelected] = useState(null)
  const [notice, setNotice] = useState('')
  const [registrationForm, setRegistrationForm] = useState(initialForm)
  const [eventForm, setEventForm] = useState(blankEvent)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true); setError('')
    try {
      const [eventData, registrationData] = await Promise.all([api.getEvents(), api.getRegistrations()])
      setEvents(eventData); setRegistrations(registrationData)
    } catch (e) {
      setError('Could not connect to the database. Start JSON Server (or the MongoDB backend) and refresh.')
    } finally { setLoading(false) }
  }
  useEffect(() => { loadData() }, [])

  const filteredEvents = useMemo(() => events.filter(event => {
    const matchesCategory = category === 'All Events' || event.category === category
    const text = `${event.title} ${event.description} ${event.venue} ${event.organizer}`.toLowerCase()
    return matchesCategory && text.includes(search.toLowerCase())
  }), [events, category, search])

  const countFor = (eventId) => registrations.filter(r => String(r.eventId) === String(eventId)).length
  const seatsLeft = (event) => Math.max(0, Number(event.capacity || 0) - countFor(event.id))

  async function submitRegistration(e) {
    e.preventDefault()
    if (!selected) return
    if (registrations.some(r => r.eventId === selected.id && r.email.toLowerCase() === registrationForm.email.toLowerCase())) {
      setNotice('This email is already registered for this event.'); return
    }
    setSaving(true)
    try {
      await api.register({ ...registrationForm, id: crypto.randomUUID(), eventId: selected.id, eventTitle: selected.title, registeredAt: new Date().toISOString() })
      setNotice('You are registered! See you at the event.')
      setRegistrationForm(initialForm)
      await loadData()
    } catch { setNotice('Registration failed. Please check that the database server is running.') }
    finally { setSaving(false) }
  }

  async function createEvent(e) {
    e.preventDefault(); setSaving(true)
    try {
      await api.createEvent({ ...eventForm, id: crypto.randomUUID(), capacity: Number(eventForm.capacity), createdAt: new Date().toISOString() })
      setEventForm(blankEvent); setNotice('Event created successfully!'); setPage('events'); await loadData()
    } catch { setNotice('Could not create event. Check the database connection.') }
    finally { setSaving(false) }
  }

  async function deleteEvent(event) {
    if (!window.confirm(`Delete "${event.title}"?`)) return
    try { await api.deleteEvent(event.id); setNotice('Event deleted.'); await loadData() }
    catch { setNotice('Could not delete event.') }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={() => setPage('events')}><span className="brand-icon"><Sparkles size={21}/></span><span>Event<span className="brand-accent">Hub</span><small>CAMPUS HAPPENINGS</small></span></a>
      <nav>
        <button className={page === 'events' ? 'nav-link active' : 'nav-link'} onClick={() => setPage('events')}>Explore Events</button>
        <button className={page === 'admin' ? 'nav-link active' : 'nav-link'} onClick={() => setPage('admin')}><LayoutDashboard size={16}/> Admin</button>
      </nav>
      <button className="top-cta" onClick={() => { setPage('admin'); document.getElementById('create-event')?.scrollIntoView({ behavior: 'smooth' }) }}><Plus size={17}/> Create Event</button>
    </header>

    <main>
      {page === 'events' ? <>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow"><span className="live-dot"/> YOUR CAMPUS, YOUR COMMUNITY</span>
            <h1>Make memories.<br/><span>Find your people.</span></h1>
            <p>Discover workshops, competitions, cultural fests, and more. Your next campus experience starts here.</p>
            <button className="hero-button" onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}>Explore upcoming events <ArrowRight size={17}/></button>
            <div className="hero-stats"><div><strong>{events.length.toString().padStart(2, '0')}</strong><span>UPCOMING EVENTS</span></div><i/><div><strong>{registrations.length.toString().padStart(2, '0')}</strong><span>REGISTRATIONS</span></div><i/><div><strong>01</strong><span>COLLEGE COMMUNITY</span></div></div>
          </div>
          <div className="hero-art"><div className="art-glow"/><div className="art-card art-card-back"><span>CREATIVE MINDS</span><div className="art-shapes"><b/><b/><b/></div></div><div className="art-card art-card-front"><span className="art-label">UP NEXT</span><div className="art-date"><strong>24</strong><span>OCT<br/>2026</span></div><div className="art-line"/><h3>Ideas into<br/>impact.</h3><span className="art-small">WORKSHOP · CAMPUS HALL</span></div><div className="floating-bubble bubble-one"><Sparkles size={20}/></div><div className="floating-bubble bubble-two"><Users size={20}/></div><div className="art-orbit"/></div>
        </section>

        <section className="events-section" id="events-section">
          <div className="section-heading"><div><span className="eyebrow dark-eyebrow">WHAT'S HAPPENING</span><h2>Find your next <span>experience.</span></h2><p>Good things happen when you show up.</p></div><div className="event-total"><strong>{filteredEvents.length}</strong><span>EVENTS FOUND</span></div></div>
          <div className="filters"><div className="category-list">{categories.map(c => <button key={c} className={category === c ? 'category-chip selected' : 'category-chip'} onClick={() => setCategory(c)}>{c}</button>)}</div><label className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, venues..."/></label></div>
          {error && <div className="error-box">{error} <button onClick={loadData}>Retry</button></div>}
          {loading ? <div className="empty-state">Loading events...</div> : filteredEvents.length ? <div className="event-grid">{filteredEvents.map((event, index) => <article className="event-card" key={event.id}><div className={`event-cover cover-${index % 4}`}><span className="event-category">{event.category}</span><span className="cover-number">{String(index + 1).padStart(2, '0')}</span><div className="cover-symbol">{event.category === 'Sports' ? '↗' : event.category === 'Cultural' ? '✳' : event.category === 'Competition' ? '◇' : '✦'}</div></div><div className="event-body"><div className="event-date"><CalendarDays size={15}/>{dateLabel(event.date)}{event.time && <span>· {event.time}</span>}</div><h3>{event.title}</h3><p>{event.description}</p><div className="event-meta"><span><MapPin size={15}/>{event.venue}</span><span><Users size={15}/>{seatsLeft(event)} seats left</span></div><div className="card-footer"><span className="organizer">By {event.organizer || 'EventHub Team'}</span><button className="register-button" disabled={seatsLeft(event) === 0} onClick={() => { setSelected(event); setNotice(''); setRegistrationForm(initialForm) }}>{seatsLeft(event) === 0 ? 'Full' : 'Register'} <ArrowRight size={15}/></button></div></div></article>)}</div> : <div className="empty-state"><Ticket size={30}/><h3>No events found</h3><p>Try another search or category, or create a new event from the Admin page.</p></div>}
        </section>
      </> : <section className="admin-section">
        <div className="section-heading"><div><span className="eyebrow dark-eyebrow">EVENT ORGANIZER SPACE</span><h2>Admin <span>dashboard.</span></h2><p>Manage campus events and keep an eye on registrations.</p></div></div>
        <div className="admin-stats"><div><CalendarDays/><span>Total events</span><strong>{events.length}</strong></div><div><Users/><span>Total registrations</span><strong>{registrations.length}</strong></div><div><Ticket/><span>Seats filled</span><strong>{registrations.length}</strong></div></div>
        <div className="admin-columns">
          <div className="admin-panel" id="create-event"><div className="panel-heading"><h3><Plus size={19}/> Create an event</h3><span>NEW LISTING</span></div><form className="event-form" onSubmit={createEvent}>
            <label>Event title<input required maxLength="90" value={eventForm.title} onChange={e => setEventForm({...eventForm,title:e.target.value})} placeholder="e.g. Design Thinking Workshop"/></label>
            <div className="form-row"><label>Category<select value={eventForm.category} onChange={e => setEventForm({...eventForm,category:e.target.value})}>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</select></label><label>Capacity<input required type="number" min="1" max="5000" value={eventForm.capacity} onChange={e => setEventForm({...eventForm,capacity:e.target.value})}/></label></div>
            <div className="form-row"><label>Date<input required type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm,date:e.target.value})}/></label><label>Time<input required value={eventForm.time} onChange={e => setEventForm({...eventForm,time:e.target.value})} placeholder="10:00 AM"/></label></div>
            <label>Venue<input required value={eventForm.venue} onChange={e => setEventForm({...eventForm,venue:e.target.value})} placeholder="Seminar Hall / Auditorium"/></label>
            <label>Organizer<input required value={eventForm.organizer} onChange={e => setEventForm({...eventForm,organizer:e.target.value})} placeholder="Club or department name"/></label>
            <label>Description<textarea required rows="3" maxLength="260" value={eventForm.description} onChange={e => setEventForm({...eventForm,description:e.target.value})} placeholder="What should students know about this event?"/></label>
            <button className="primary-button" disabled={saving}>{saving ? 'Saving...' : 'Publish event'} <ArrowRight size={16}/></button>
          </form></div>
          <div className="admin-panel"><div className="panel-heading"><h3><CalendarDays size={19}/> Manage events</h3><span>{events.length} LISTED</span></div><div className="manage-list">{events.map(event=><div className="manage-item" key={event.id}><div className="mini-date"><strong>{event.date ? new Date(`${event.date}T12:00:00`).getDate() : '—'}</strong><span>{event.date ? new Date(`${event.date}T12:00:00`).toLocaleDateString('en-IN',{month:'short'}).toUpperCase() : 'TBA'}</span></div><div className="manage-info"><strong>{event.title}</strong><span>{event.category} · {countFor(event.id)} registered</span></div><button className="icon-button danger" title="Delete event" onClick={()=>deleteEvent(event)}><X size={17}/></button></div>)}</div>
            <div className="panel-heading registrations-heading"><h3><Users size={19}/> Recent registrations</h3><span>{registrations.length} TOTAL</span></div><div className="registrations-list">{registrations.length ? registrations.slice().reverse().slice(0,8).map((r,i)=><div className="registration-row" key={r.id || i}><div className="avatar">{(r.name || 'S').slice(0,1).toUpperCase()}</div><div><strong>{r.name}</strong><span>{r.eventTitle || events.find(e=>e.id===r.eventId)?.title || 'Event'} · {r.department || 'Student'}</span></div><CheckCircle2 size={17} className="check-icon"/></div>) : <p className="subtle-note">Registrations will appear here after students sign up.</p>}</div>
          </div>
        </div>
      </section>}
    </main>

    <footer><a className="brand footer-brand" href="#"><span className="brand-icon"><Sparkles size={18}/></span><span>Event<span className="brand-accent">Hub</span><small>CAMPUS HAPPENINGS</small></span></a><span>Built for campus communities · 2026</span><button onClick={() => { setPage('events'); window.scrollTo({top:0,behavior:'smooth'}) }}>Back to top ↑</button></footer>

    {notice && <div className="toast" role="status">{notice}<button onClick={()=>setNotice('')}><X size={16}/></button></div>}
    {selected && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><div className="modal"><button className="modal-close" onClick={()=>setSelected(null)}><X size={20}/></button><span className="eyebrow dark-eyebrow">SAVE YOUR SPOT</span><h2>Register for <span>{selected.title}</span></h2><div className="modal-event-info"><span><CalendarDays size={16}/>{dateLabel(selected.date)} · {selected.time}</span><span><MapPin size={16}/>{selected.venue}</span><span><Clock3 size={16}/>{seatsLeft(selected)} seats remaining</span></div><form className="event-form" onSubmit={submitRegistration}><label>Full name<input required value={registrationForm.name} onChange={e=>setRegistrationForm({...registrationForm,name:e.target.value})} placeholder="Your full name"/></label><label>College email<input required type="email" value={registrationForm.email} onChange={e=>setRegistrationForm({...registrationForm,email:e.target.value})} placeholder="you@college.edu"/></label><label>Department / year<input required value={registrationForm.department} onChange={e=>setRegistrationForm({...registrationForm,department:e.target.value})} placeholder="e.g. CSE, 3rd year"/></label><button className="primary-button" disabled={saving || seatsLeft(selected)===0}>{saving ? 'Submitting...' : 'Confirm registration'} <ArrowRight size={16}/></button></form></div></div>}
  </div>
}

export default App
