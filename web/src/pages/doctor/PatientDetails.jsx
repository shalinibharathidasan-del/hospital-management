import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, formatDateTime } from '../../api'
import StatusBadge from '../../components/StatusBadge'

// Patient details and visit history (doctor / admin)
function PatientDetails() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api(`/patients/${id}`).then(setPatient).catch((err) => setError(err.message))
  }, [id])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!patient) return <div className="spinner-border"></div>

  return (
    <>
      <Link to="/patients" className="btn btn-link px-0 mb-2">&larr; Patients</Link>
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">{patient.name}</h3>
          <div className="row small">
            <div className="col-sm-4"><b>Email:</b> {patient.email}</div>
            <div className="col-sm-4"><b>Phone:</b> {patient.phone || '-'}</div>
            <div className="col-sm-4"><b>Age / Gender:</b> {patient.age || '-'} / {patient.gender || '-'}</div>
            <div className="col-sm-4"><b>Blood group:</b> {patient.blood_group || '-'}</div>
            <div className="col-sm-8"><b>Address:</b> {patient.address || '-'}</div>
          </div>
        </div>
      </div>

      <h5>Visit history</h5>
      {patient.history.length === 0 && <p className="text-muted">No visits yet.</p>}
      {patient.history.map((h) => (
        <div className="card mb-2" key={h.id}>
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <b>{formatDateTime(h.appointment_date)} · {h.doctor_name}</b>
              <StatusBadge status={h.status} />
            </div>
            <div className="small text-muted mb-1">Reason: {h.reason}</div>
            {h.diagnosis && (
              <div className="small">
                <b>Diagnosis:</b> {h.diagnosis}
                <pre className="rx mt-1 mb-0">{h.prescription}</pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  )
}

export default PatientDetails
