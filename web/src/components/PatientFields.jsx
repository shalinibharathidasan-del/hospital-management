// Reusable patient detail inputs, used by Register, Profile and the admin patient editor.
// Props: form (object), onChange (input change handler)
function PatientFields({ form, onChange }) {
  return (
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label" htmlFor="name">Full name</label>
        <input id="name" name="name" className="form-control" value={form.name || ''} onChange={onChange} required />
      </div>
      <div className="col-md-6">
        <label className="form-label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" className="form-control" value={form.phone || ''} onChange={onChange} />
      </div>
      <div className="col-md-4">
        <label className="form-label" htmlFor="age">Age</label>
        <input id="age" name="age" type="number" min="1" max="119" className="form-control" value={form.age || ''} onChange={onChange} />
      </div>
      <div className="col-md-4">
        <label className="form-label" htmlFor="gender">Gender</label>
        <select id="gender" name="gender" className="form-select" value={form.gender || ''} onChange={onChange}>
          <option value="">Select</option>
          <option>Female</option>
          <option>Male</option>
          <option>Other</option>
        </select>
      </div>
      <div className="col-md-4">
        <label className="form-label" htmlFor="blood_group">Blood group</label>
        <select id="blood_group" name="blood_group" className="form-select" value={form.blood_group || ''} onChange={onChange}>
          <option value="">Select</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div className="col-12">
        <label className="form-label" htmlFor="address">Address</label>
        <input id="address" name="address" className="form-control" value={form.address || ''} onChange={onChange} />
      </div>
    </div>
  )
}

export default PatientFields
