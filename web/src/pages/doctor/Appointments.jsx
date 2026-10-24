import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatDateTime } from '../../api'
import StatusBadge from '../../components/StatusBadge'

// Doctor home: schedule with links to write the consultation record
function Appointments() {
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('Booked')
  const [error, setError] = useState('')

  useEffect(() => {
    api('/appointments/doctor').then(setRows).catch((err) => setError(err.message))
  }, [])

  const shown = filter ? rows.filter((a) => a.status === filter) : rows

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">My Appointments</h2>
        <div className="btn-group" role="group" aria-label="Filter by status">
          {['Booked', 'Completed', 'Cancelled', ''].map((s) => (
            <button key={s || 'all'} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter(s)}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr><th>Date &amp; time</th><th>Patient</th><th>Reason</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan="5" className="text-muted">No appointments.</td></tr>}
              {shown.map((a) => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.appointment_date)}</td>
                  <td>
                    <Link to={`/patients/${a.patient_id}`}>{a.patient_name}</Link>
                    <br /><small className="text-muted">{[a.age && `${a.age} yrs`, a.gender, a.blood_group].filter(Boolean).join(' · ')}</small>
                  </td>
                  <td>{a.reason}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.status !== 'Cancelled' && (
                      <Link to={`/consultation/${a.id}`} className="btn btn-sm btn-primary">
                        {a.diagnosis ? 'Update record' : 'Consult'}
                      </Link>
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

export default Appointments
