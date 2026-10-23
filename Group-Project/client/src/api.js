// Choose "json-server" for dummy JSON records or "mongodb" for Express + MongoDB.
export const DATA_MODE = "json-server"
const BASE_URL = DATA_MODE === "json-server" ? "http://localhost:3001" : "http://localhost:5000/api"

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed (${response.status})`)
  }
  if (response.status === 204) return null
  return response.json()
}

export const api = {
  getEvents: () => request('/events?_sort=date'),
  getRegistrations: () => request('/registrations'),
  createEvent: (event) => request('/events', { method: 'POST', body: JSON.stringify(event) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  register: (registration) => request('/registrations', { method: 'POST', body: JSON.stringify(registration) }),
}
