import { useEffect, useState } from 'react'
import { api, formatDate } from '../../api'

function Prescriptions() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/appointments/prescriptions').then(setRows).catch((err) => setError(err.message))
  }, [])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!rows) return <div className="spinner-border"></div>

  return (
    <>
      <h2 className="mb-3">My Prescriptions</h2>
      {rows.length === 0 && <p className="text-muted">No prescriptions yet. They appear here after your doctor completes a consultation.</p>}
      <div className="row g-3">
        {rows.map((r) => (
          <div className="col-lg-6" key={r.id}>
            <div className="card h-100 prescription">
              <div className="card-header d-flex justify-content-between">
                <span><b>{r.doctor_name}</b> · {r.specialization}</span>
                <small>{formatDate(r.appointment_date)}</small>
              </div>
              <div className="card-body">
                <p className="mb-1"><b>Diagnosis:</b> {r.diagnosis}</p>
                <p className="mb-1"><b>℞ Prescription:</b></p>
                <pre className="rx">{r.prescription}</pre>
                {r.notes && <p className="mb-0 small text-muted"><b>Advice:</b> {r.notes}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Prescriptions
