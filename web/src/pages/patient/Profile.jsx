import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import PatientFields from '../../components/PatientFields'

// Patient views, updates or deletes their own record
function Profile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(user)
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api('/auth/me', { method: 'PUT', body: form })
      updateUser(res.user)
      setMessage({ text: res.message, type: 'success' })
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete your account and all your appointments? This cannot be undone.')) return
    try {
      await api('/auth/me', { method: 'DELETE' })
      logout()
      navigate('/register')
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h2>My Profile</h2>
        <p className="text-muted">{user.email}</p>
        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        <form onSubmit={handleSubmit} className="card">
          <div className="card-body">
            <PatientFields form={form} onChange={handleChange} />
            <div className="d-flex mt-4">
              <button className="btn btn-primary">Save changes</button>
              <button type="button" className="btn btn-outline-danger ms-auto" onClick={handleDelete}>Delete account</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
