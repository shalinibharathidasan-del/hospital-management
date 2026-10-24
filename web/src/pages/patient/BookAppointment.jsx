import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'

function BookAppointment() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState({ doctor_id: '', appointment_date: '', reason: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api('/doctors').then(setDoctors).catch((err) => setError(err.message))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.doctor_id) return setError('Please choose a doctor')
    setBusy(true)
    setError('')
    try {
      const res = await api('/appointments', { method: 'POST', body: form })
      navigate('/appointments', { state: { message: res.message } })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h2 className="mb-3">Book an appointment</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="card">
          <div className="card-body">
            <label className="form-label fw-semibold">1. Choose a doctor</label>
            <div className="row g-2 mb-3">
              {doctors.map((d) => (
                <div className="col-md-4" key={d.id}>
                  <button
                    type="button"
                    className={`doctor-card w-100 text-start ${String(form.doctor_id) === String(d.id) ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, doctor_id: d.id })}
                  >
                    <div className="fw-semibold">{d.name}</div>
                    <small className="text-muted">{d.specialization}</small>
                  </button>
                </div>
              ))}
            </div>

            <div className="row g-3">
              <div className="col-md-5">
                <label className="form-label fw-semibold" htmlFor="appointment_date">2. Date &amp; time</label>
                <input
                  id="appointment_date"
                  name="appointment_date"
                  type="datetime-local"
                  className="form-control"
                  value={form.appointment_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-7">
                <label className="form-label fw-semibold" htmlFor="reason">3. Reason for visit</label>
                <input id="reason" name="reason" className="form-control" placeholder="e.g. Fever since 2 days" value={form.reason} onChange={handleChange} required />
              </div>
            </div>
            <button className="btn btn-primary btn-lg mt-4" disabled={busy}>{busy ? 'Booking...' : 'Book appointment'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookAppointment
