import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PatientFields from '../components/PatientFields'

// Patient registration
function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', age: '', gender: '', blood_group: '', address: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <div className="card">
          <div className="card-body p-4">
            <h3 className="mb-3">Patient registration</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <PatientFields form={form} onChange={handleChange} />
              <div className="row g-3 mt-0">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="password">Password (min 6 characters)</label>
                  <input id="password" name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required />
                </div>
              </div>
              <button className="btn btn-primary w-100 mt-4" disabled={busy}>{busy ? 'Registering...' : 'Register'}</button>
            </form>
            <p className="mt-3 mb-0 small text-center">
              Already registered? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
