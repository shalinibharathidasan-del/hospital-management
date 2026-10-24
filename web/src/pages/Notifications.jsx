import { useEffect, useState } from 'react'
import { api, formatDateTime } from '../api'

// Appointment notifications for patients and doctors
function Notifications() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  const load = () => api('/notifications').then(setRows).catch((err) => setError(err.message))

  useEffect(() => {
    load()
  }, [])

  const markAllRead = async () => {
    await api('/notifications/read-all', { method: 'PATCH' })
    load()
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Notifications</h2>
          {rows.some((n) => !n.is_read) && <button className="btn btn-sm btn-outline-primary" onClick={markAllRead}>Mark all as read</button>}
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <ul className="list-group">
          {rows.length === 0 && <li className="list-group-item text-muted">No notifications</li>}
          {rows.map((n) => (
            <li key={n.id} className={`list-group-item d-flex justify-content-between gap-3 ${n.is_read ? '' : 'list-group-item-info fw-semibold'}`}>
              <span>{n.message}</span>
              <small className="text-muted text-nowrap fw-normal">{formatDateTime(n.created_at)}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Notifications
