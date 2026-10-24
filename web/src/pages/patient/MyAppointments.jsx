import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api, formatDateTime } from '../../api'
import StatusBadge from '../../components/StatusBadge'

function MyAppointments() {
  const location = useLocation()
  const [rows, setRows] = useState([])
  const [message, setMessage] = useState({ text: location.state?.message || '', type: 'success' })

  const load = () => api('/appointments/my').then(setRows).catch((err) => setMessage({ text: err.message, type: 'danger' }))

  useEffect(() => {
    load()
  }, [])

  const handleCancel = async (a) => {
    if (!window.confirm(`Cancel your appointment with ${a.doctor_name}?`)) return
    try {
      const res = await api(`/appointments/${a.id}/cancel`, { method: 'PATCH' })
      setMessage({ text: res.message, type: 'success' })
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  return (
    <>
      <h2 className="mb-3">My Appointments</h2>
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr><th>Date &amp; time</th><th>Doctor</th><th>Reason</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan="5" className="text-muted">No appointments yet.</td></tr>}
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.appointment_date)}</td>
                  <td>{a.doctor_name}<br /><small className="text-muted">{a.specialization}</small></td>
                  <td>{a.reason}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.status === 'Booked' && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(a)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default MyAppointments
