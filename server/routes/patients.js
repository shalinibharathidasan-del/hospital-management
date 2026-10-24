// Patients: list and details (doctor / admin), update and delete (admin)
const express = require('express')
const pool = require('../db')
const { requireRole } = require('../middleware/auth')
const { patientFields, PUBLIC } = require('./auth')

const router = express.Router()

// Doctors only see patients who booked with them; admin sees everyone
async function canSee(user, patientId) {
  if (user.role === 'admin') return true
  const [rows] = await pool.execute('SELECT id FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1', [
    user.id,
    patientId,
  ])
  return rows.length > 0
}

// GET /api/patients?search=
router.get('/', requireRole('doctor', 'admin'), async (req, res) => {
  const like = `%${req.query.search || ''}%`
  const sql =
    req.user.role === 'admin'
      ? `SELECT ${PUBLIC} FROM users WHERE role = 'patient' AND (name LIKE ? OR email LIKE ?) ORDER BY name`
      : `SELECT DISTINCT u.id, u.name, u.email, u.phone, u.age, u.gender, u.blood_group
         FROM users u JOIN appointments a ON a.patient_id = u.id
         WHERE a.doctor_id = ? AND (u.name LIKE ? OR u.email LIKE ?) ORDER BY u.name`
  const params = req.user.role === 'admin' ? [like, like] : [req.user.id, like, like]
  const [patients] = await pool.execute(sql, params)
  res.json(patients)
})

// GET /api/patients/:id  (details + visit history with consultation records)
router.get('/:id', requireRole('doctor', 'admin'), async (req, res) => {
  const [[patient]] = await pool.execute(`SELECT ${PUBLIC} FROM users WHERE id = ? AND role = 'patient'`, [req.params.id])
  if (!patient) return res.status(404).json({ error: 'Patient not found' })
  if (!(await canSee(req.user, patient.id))) return res.status(403).json({ error: 'This patient has no appointments with you' })

  const [history] = await pool.execute(
    `SELECT a.id, a.appointment_date, a.reason, a.status, d.name AS doctor_name,
            c.diagnosis, c.prescription, c.notes
     FROM appointments a JOIN users d ON d.id = a.doctor_id
     LEFT JOIN consultations c ON c.appointment_id = a.id
     WHERE a.patient_id = ? ORDER BY a.appointment_date DESC`,
    [patient.id],
  )
  res.json({ ...patient, history })
})

// PUT /api/patients/:id  (admin edits a patient)
router.put('/:id', requireRole('admin'), async (req, res) => {
  const fields = patientFields(req.body)
  if (typeof fields === 'string') return res.status(400).json({ error: fields })
  const [result] = await pool.execute(
    "UPDATE users SET name = ?, phone = ?, age = ?, gender = ?, blood_group = ?, address = ? WHERE id = ? AND role = 'patient'",
    [...fields, req.params.id],
  )
  if (!result.affectedRows) return res.status(404).json({ error: 'Patient not found' })
  res.json({ message: 'Patient updated' })
})

// DELETE /api/patients/:id  (admin)
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const [result] = await pool.execute("DELETE FROM users WHERE id = ? AND role = 'patient'", [req.params.id])
  if (!result.affectedRows) return res.status(404).json({ error: 'Patient not found' })
  res.json({ message: 'Patient deleted' })
})

module.exports = router
