import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import PatientFields from '../../components/PatientFields'

// Doctor: patients who booked with them. Admin: all patients, with edit and delete.
function PatientList() {
  const { isAdmin } = useAuth()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  const load = (term = search) =>
    api(`/patients?search=${encodeURIComponent(term)}`).then(setPatients).catch((err) => setMessage({ text: err.message, type: 'danger' }))

  useEffect(() => {
    const timer = setTimeout(() => load(search), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const saveEdit = async (e) => {
    e.preventDefault()
    try {
      const res = await api(`/patients/${editing.id}`, { method: 'PUT', body: editing })
      setMessage({ text: res.message, type: 'success' })
      setEditing(null)
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete ${p.name} and all their appointments?`)) return
    try {
      const res = await api(`/patients/${p.id}`, { method: 'DELETE' })
      setMessage({ text: res.message, type: 'success' })
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  return (
    <>
      <h2 className="mb-3">{isAdmin ? 'Patients' : 'My Patients'}</h2>
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {editing && (
        <form onSubmit={saveEdit} className="card mb-3">
          <div className="card-body">
            <h5>Edit patient</h5>
            <PatientFields form={editing} onChange={(e) => setEditing({ ...editing, [e.target.name]: e.target.value })} />
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </form>
      )}

      <input className="form-control mb-3" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Age</th><th>Gender</th><th>Blood</th><th></th></tr>
            </thead>
            <tbody>
              {patients.length === 0 && <tr><td colSpan="7" className="text-muted">No patients found.</td></tr>}
              {patients.map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/patients/${p.id}`}>{p.name}</Link></td>
                  <td>{p.email}</td>
                  <td>{p.phone || '-'}</td>
                  <td>{p.age || '-'}</td>
                  <td>{p.gender || '-'}</td>
                  <td>{p.blood_group || '-'}</td>
                  <td className="text-nowrap">
                    {isAdmin && (
                      <>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditing(p)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p)}>Delete</button>
                      </>
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

export default PatientList
