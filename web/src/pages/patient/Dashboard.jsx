import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatDateTime } from '../../api'
import { useAuth } from '../../context/AuthContext'

// Patient home: upcoming appointments and latest notifications
function Dashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api('/appointments/my'), api('/notifications')])
      .then(([a, n]) => {
        setAppointments(a.filter((x) => x.status === 'Booked'))
        setNotifications(n.slice(0, 5))
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <>
      <div className="hero p-4 mb-4 rounded-3 text-white d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h2 className="fw-bold mb-1">Hello, {user.name.split(' ')[0]}</h2>
          <p className="mb-0">Book appointments, see prescriptions and get updates from your doctors.</p>
        </div>
        <Link to="/book" className="btn btn-light">+ Book appointment</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-7">
          <h5>Upcoming appointments</h5>
          {appointments.length === 0 ? (
            <p className="text-muted">No upcoming appointments.</p>
          ) : (
            appointments.map((a) => (
              <div className="card mb-2" key={a.id}>
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <b>{a.doctor_name}</b> <span className="text-muted small">· {a.specialization}</span>
                    <div className="small">{formatDateTime(a.appointment_date)}</div>
                    <div className="small text-muted">{a.reason}</div>
                  </div>
                  <span className="badge bg-primary">Booked</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="col-lg-5">
          <h5>Notifications</h5>
          <ul className="list-group">
            {notifications.length === 0 && <li className="list-group-item text-muted">No notifications</li>}
            {notifications.map((n) => (
              <li key={n.id} className={`list-group-item small ${n.is_read ? '' : 'fw-semibold list-group-item-info'}`}>
                {n.message}
              </li>
            ))}
          </ul>
          <Link to="/notifications" className="small">See all</Link>
        </div>
      </div>
    </>
  )
}

export default Dashboard
