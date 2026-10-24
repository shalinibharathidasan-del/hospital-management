// Saves an in-app notification for a user (shown in the web and mobile apps)
const pool = require('./db')

const notify = (userId, message) =>
  pool.execute('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [userId, message])

// '2026-11-05 11:00:00' -> '5 Nov 2026, 11:00 am'
const niceDate = (value) =>
  new Date(String(value).replace(' ', 'T')).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })

module.exports = { notify, niceDate }
