// Doctors: list for booking (everyone), create / update / delete (admin)
const express = require('express')
const bcrypt = require('bcryptjs')
const pool = require('../db')
const { requireRole } = require('../middleware/auth')

const router = express.Router()
const admin = requireRole('admin')

function doctorFields({ name, phone, specialization }) {
  if (!name?.trim() || !specialization?.trim()) return 'Name and specialization are required'
  if (phone && !/^[0-9+\- ]{7,15}$/.test(phone)) return 'Enter a valid phone number'
  return [name.trim(), phone || null, specialization.trim()]
}

// GET /api/doctors
router.get('/', async (req, res) => {
  const [doctors] = await pool.query(
    "SELECT id, name, email, phone, specialization FROM users WHERE role = 'doctor' ORDER BY name",
  )
  res.json(doctors)
})

// POST /api/doctors  { name, email, phone, specialization, password }
router.post('/', admin, async (req, res) => {
  const fields = doctorFields(req.body)
  if (typeof fields === 'string') return res.status(400).json({ error: fields })
  const { email, password } = req.body
  if (!/^\S+@\S+\.\S+$/.test(email || '')) return res.status(400).json({ error: 'Enter a valid email' })
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  try {
    const [result] = await pool.execute(
      "INSERT INTO users (name, phone, specialization, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'doctor')",
      [...fields, email.trim().toLowerCase(), await bcrypt.hash(password, 10)],
    )
    res.status(201).json({ id: result.insertId, message: 'Doctor added' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That email is already used' })
    throw err
  }
})

// PUT /api/doctors/:id
router.put('/:id', admin, async (req, res) => {
  const fields = doctorFields(req.body)
  if (typeof fields === 'string') return res.status(400).json({ error: fields })
  const [result] = await pool.execute(
    "UPDATE users SET name = ?, phone = ?, specialization = ? WHERE id = ? AND role = 'doctor'",
    [...fields, req.params.id],
  )
  if (!result.affectedRows) return res.status(404).json({ error: 'Doctor not found' })
  res.json({ message: 'Doctor updated' })
})

// DELETE /api/doctors/:id
router.delete('/:id', admin, async (req, res) => {
  const [result] = await pool.execute("DELETE FROM users WHERE id = ? AND role = 'doctor'", [req.params.id])
  if (!result.affectedRows) return res.status(404).json({ error: 'Doctor not found' })
  res.json({ message: 'Doctor deleted' })
})

module.exports = router
