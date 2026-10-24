import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, formatDateTime } from '../../api'
import StatusBadge from '../../components/StatusBadge'

// Doctor writes or updates the consultation record (diagnosis + prescription) for an appointment
function Consultation() {
  const { id } = useParams()
  const [appt, setAppt] = useState(null)
  const [form, setForm] = useState({ diagnosis: '', prescription: '', notes: '' })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [busy, setBusy] = useState(false)

  const load = () =>
    api(`/appointments/${id}`)
      .then((a) => {
        setAppt(a)
        setForm({ diagnosis: a.diagnosis || '', prescription: a.prescription || '', notes: a.notes || '' })
      })
      .catch((err) => setMessage({ text: err.message, type: 'danger' }))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await api(`/appointments/${id}/consultation`, { method: 'PUT', body: form })
      setMessage({ text: `${res.message}. The patient has been notified.`, type: 'success' })
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  if (!appt) return message.text ? <div className="alert alert-danger">{message.text}</div> : <div className="spinner-border"></div>

  return (
    <>
      <Link to="/" className="btn btn-link px-0 mb-2">&larr; Appointments</Link>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">{appt.patient_name}</h5>
              <table className="table table-sm mb-2">
                <tbody>
                  <tr><th>Age</th><td>{appt.age ?? '-'}</td></tr>
                  <tr><th>Gender</th><td>{appt.gender ?? '-'}</td></tr>
                  <tr><th>Blood group</th><td>{appt.blood_group ?? '-'}</td></tr>
                  <tr><th>Phone</th><td>{appt.patient_phone ?? '-'}</td></tr>
                </tbody>
              </table>
              <Link to={`/patients/${appt.patient_id}`} className="small">Full patient history &rarr;</Link>
            </div>
          </div>
          <div className="card mt-3">
            <div className="card-body small">
              <div><b>When:</b> {formatDateTime(appt.appointment_date)}</div>
              <div><b>Reason:</b> {appt.reason}</div>
              <div><b>Status:</b> <StatusBadge status={appt.status} /></div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <h3>Consultation record</h3>
          {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
          {appt.status === 'Cancelled' ? (
            <p className="text-muted">This appointment was cancelled.</p>
          ) : (
            <form onSubmit={handleSubmit} className="card">
              <div className="card-body">
                <label className="form-label" htmlFor="diagnosis">Diagnosis</label>
                <input id="diagnosis" name="diagnosis" className="form-control mb-3" value={form.diagnosis} onChange={handleChange} required />
                <label className="form-label" htmlFor="prescription">Prescription (one medicine per line)</label>
                <textarea
                  id="prescription"
                  name="prescription"
                  rows="5"
                  className="form-control mb-3"
                  placeholder="Paracetamol 650 mg - 1 tablet three times a day for 3 days"
                  value={form.prescription}
                  onChange={handleChange}
                  required
                />
                <label className="form-label" htmlFor="notes">Advice / notes</label>
                <textarea id="notes" name="notes" rows="2" className="form-control mb-3" value={form.notes} onChange={handleChange} />
                <button className="btn btn-primary" disabled={busy}>
                  {busy ? 'Saving...' : appt.diagnosis ? 'Update record' : 'Save and complete visit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

export default Consultation
