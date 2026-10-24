import { useEffect, useState } from 'react'
import { api } from '../../api'

const emptyForm = { name: '', email: '', phone: '', specialization: '', password: '' }

// Admin: create, read, update and delete doctors
function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  const load = () => api('/doctors').then(setDoctors).catch((err) => setMessage({ text: err.message, type: 'danger' }))

  useEffect(() => {
    load()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const startEdit = (d) => {
    setEditingId(d.id)
    setForm({ ...emptyForm, ...d, phone: d.phone || '' })
  }

  const reset = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = editingId
        ? await api(`/doctors/${editingId}`, { method: 'PUT', body: form })
        : await api('/doctors', { method: 'POST', body: form })
      setMessage({ text: res.message, type: 'success' })
      reset()
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete ${d.name}? Their appointments will also be deleted.`)) return
    try {
      const res = await api(`/doctors/${d.id}`, { method: 'DELETE' })
      setMessage({ text: res.message, type: 'success' })
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  return (
    <>
      <h2 className="mb-3">Doctors</h2>
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="card mb-4">
        <div className="card-body">
          <h5>{editingId ? 'Edit doctor' : 'Add doctor'}</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label" htmlFor="name">Name</label>
              <input id="name" name="name" className="form-control" value={form.name} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="specialization">Specialization</label>
              <input id="specialization" name="specialization" className="form-control" value={form.specialization} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="phone">Phone</label>
              <input id="phone" name="phone" className="form-control" value={form.phone} onChange={handleChange} />
            </div>
            {!editingId && (
              <>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="email">Login email</label>
                  <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="password">Temporary password</label>
                  <input id="password" name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required />
                </div>
              </>
            )}
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-primary">{editingId ? 'Save changes' : 'Add doctor'}</button>
            {editingId && <button type="button" className="btn btn-secondary" onClick={reset}>Cancel</button>}
          </div>
        </div>
      </form>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr><th>Name</th><th>Specialization</th><th>Email</th><th>Phone</th><th></th></tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.specialization}</td>
                  <td>{d.email}</td>
                  <td>{d.phone || '-'}</td>
                  <td className="text-nowrap">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => startEdit(d)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(d)}>Delete</button>
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

export default Doctors
