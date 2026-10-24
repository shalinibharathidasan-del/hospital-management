// Appointments: booking and cancelling, doctor schedule, consultation records, prescriptions
const express = require('express')
const pool = require('../db')
const { requireLogin, requireRole } = require('../middleware/auth')
const { notify, niceDate } = require('../notify')

const router = express.Router()

const APPOINTMENT_SELECT = `
  SELECT a.id, a.appointment_date, a.reason, a.status, a.patient_id, a.doctor_id,
         p.name AS patient_name, p.age, p.gender, p.blood_group, p.phone AS patient_phone,
         d.name AS doctor_name, d.specialization,
         c.diagnosis, c.prescription, c.notes, c.updated_at AS consultation_updated
  FROM appointments a
  JOIN users p ON p.id = a.patient_id
  JOIN users d ON d.id = a.doctor_id
  LEFT JOIN consultations c ON c.appointment_id = a.id`

// POST /api/appointments  { doctor_id, appointment_date, reason }  (patient books)
router.post('/', requireRole('patient'), async (req, res) => {
  const { doctor_id, appointment_date, reason } = req.body
  if (!doctor_id || !appointment_date || !reason?.trim()) {
    return res.status(400).json({ error: 'Doctor, date and reason are required' })
  }
  const when = new Date(appointment_date)
  if (Number.isNaN(when.getTime()) || when < new Date()) return res.status(400).json({ error: 'Choose a future date and time' })

  const [[doctor]] = await pool.execute("SELECT id, name FROM users WHERE id = ? AND role = 'doctor'", [doctor_id])
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' })

  const date = appointment_date.replace('T', ' ').slice(0, 16) + ':00'
  const [clash] = await pool.execute(
    "SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status = 'Booked'",
    [doctor.id, date],
  )
  if (clash.length) return res.status(409).json({ error: 'That time slot is already booked. Please pick another time.' })

  const [result] = await pool.execute(
    'INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason) VALUES (?, ?, ?, ?)',
    [req.user.id, doctor.id, date, reason.trim()],
  )
  await notify(req.user.id, `Appointment booked with ${doctor.name} on ${niceDate(date)}.`)
  await notify(doctor.id, `New appointment: ${req.user.name} on ${niceDate(date)} (${reason.trim()}).`)
  res.status(201).json({ id: result.insertId, message: `Appointment booked with ${doctor.name}` })
})

// GET /api/appointments/my  (patient's appointments, newest first)
router.get('/my', requireRole('patient'), async (req, res) => {
  const [rows] = await pool.execute(`${APPOINTMENT_SELECT} WHERE a.patient_id = ? ORDER BY a.appointment_date DESC`, [req.user.id])
  res.json(rows)
})

// GET /api/appointments/prescriptions  (patient's completed visits that have a consultation record)
router.get('/prescriptions', requireRole('patient'), async (req, res) => {
  const [rows] = await pool.execute(
    `${APPOINTMENT_SELECT} WHERE a.patient_id = ? AND c.id IS NOT NULL ORDER BY a.appointment_date DESC`,
    [req.user.id],
  )
  res.json(rows)
})

// GET /api/appointments/doctor  (doctor's schedule)
router.get('/doctor', requireRole('doctor'), async (req, res) => {
  const [rows] = await pool.execute(
    `${APPOINTMENT_SELECT} WHERE a.doctor_id = ? ORDER BY a.status = 'Booked' DESC, a.appointment_date`,
    [req.user.id],
  )
  res.json(rows)
})

// GET /api/appointments/:id  (the patient or doctor of this appointment)
router.get('/:id', requireLogin, async (req, res) => {
  const [[appt]] = await pool.execute(`${APPOINTMENT_SELECT} WHERE a.id = ?`, [req.params.id])
  if (!appt) return res.status(404).json({ error: 'Appointment not found' })
  if (![appt.patient_id, appt.doctor_id].includes(req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have access to this appointment' })
  }
  res.json(appt)
})

// PATCH /api/appointments/:id/cancel  (patient or doctor of this appointment)
router.patch('/:id/cancel', requireRole('patient', 'doctor'), async (req, res) => {
  const [[appt]] = await pool.execute(`${APPOINTMENT_SELECT} WHERE a.id = ?`, [req.params.id])
  if (!appt || ![appt.patient_id, appt.doctor_id].includes(req.user.id)) return res.status(404).json({ error: 'Appointment not found' })
  if (appt.status !== 'Booked') return res.status(400).json({ error: `This appointment is already ${appt.status.toLowerCase()}` })

  await pool.execute("UPDATE appointments SET status = 'Cancelled' WHERE id = ?", [appt.id])
  const other = req.user.id === appt.patient_id ? appt.doctor_id : appt.patient_id
  await notify(other, `Appointment on ${niceDate(appt.appointment_date)} was cancelled by ${req.user.name}.`)
  res.json({ message: 'Appointment cancelled' })
})

// PUT /api/appointments/:id/consultation  { diagnosis, prescription, notes }  (doctor creates or updates the record)
router.put('/:id/consultation', requireRole('doctor'), async (req, res) => {
  const { diagnosis, prescription, notes } = req.body
  if (!diagnosis?.trim() || !prescription?.trim()) return res.status(400).json({ error: 'Diagnosis and prescription are required' })

  const [[appt]] = await pool.execute('SELECT * FROM appointments WHERE id = ? AND doctor_id = ?', [req.params.id, req.user.id])
  if (!appt) return res.status(404).json({ error: 'Appointment not found' })
  if (appt.status === 'Cancelled') return res.status(400).json({ error: 'This appointment was cancelled' })

  await pool.execute(
    `INSERT INTO consultations (appointment_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE diagnosis = VALUES(diagnosis), prescription = VALUES(prescription), notes = VALUES(notes)`,
    [appt.id, diagnosis.trim(), prescription.trim(), notes?.trim() || null],
  )
  await pool.execute("UPDATE appointments SET status = 'Completed' WHERE id = ?", [appt.id])
  await notify(appt.patient_id, `${req.user.name} updated your consultation record. Your prescription is ready.`)
  res.json({ message: 'Consultation record saved' })
})

module.exports = router
