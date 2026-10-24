// Patient registration, login for all roles, and the patient's own profile (view / update / delete)
const express = require('express')
const bcrypt = require('bcryptjs')
const pool = require('../db')
const { signToken, requireLogin, requireRole } = require('../middleware/auth')

const router = express.Router()

const PUBLIC = 'id, name, email, phone, role, age, gender, blood_group, address, specialization'
const publicUser = (u) => Object.fromEntries(PUBLIC.split(', ').map((k) => [k, u[k] ?? null]))

// Shared validation for patient details (also used by admin when editing a patient)
function patientFields(body) {
  const { name, phone, age, gender, blood_group, address } = body
  if (!name?.trim()) return 'Name is required'
  if (phone && !/^[0-9+\- ]{7,15}$/.test(phone)) return 'Enter a valid phone number'
  if (age && !(Number(age) > 0 && Number(age) < 120)) return 'Enter a valid age'
  if (gender && !['Male', 'Female', 'Other'].includes(gender)) return 'Gender must be Male, Female or Other'
  return [name.trim(), phone || null, age ? Number(age) : null, gender || null, blood_group || null, address?.trim() || null]
}

// POST /api/auth/register  (patients only)
router.post('/register', async (req, res) => {
  const { email, password } = req.body
  const fields = patientFields(req.body)
  if (typeof fields === 'string') return res.status(400).json({ error: fields })
  if (!/^\S+@\S+\.\S+$/.test(email || '')) return res.status(400).json({ error: 'Enter a valid email' })
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  const cleanEmail = email.trim().toLowerCase()
  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [cleanEmail])
  if (existing.length) return res.status(409).json({ error: 'An account with this email already exists' })

  const hash = await bcrypt.hash(password, 10)
  const [result] = await pool.execute(
    `INSERT INTO users (name, phone, age, gender, blood_group, address, email, password_hash, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'patient')`,
    [...fields, cleanEmail, hash],
  )
  const [[user]] = await pool.execute(`SELECT ${PUBLIC} FROM users WHERE id = ?`, [result.insertId])
  res.status(201).json({ token: signToken(user), user })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const [[user]] = await pool.execute('SELECT * FROM users WHERE email = ?', [(email || '').trim().toLowerCase()])
  if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  res.json({ token: signToken(user), user: publicUser(user) })
})

// GET /api/auth/me
router.get('/me', requireLogin, async (req, res) => {
  const [[user]] = await pool.execute(`SELECT ${PUBLIC} FROM users WHERE id = ?`, [req.user.id])
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

// PUT /api/auth/me  (patient updates own profile)
router.put('/me', requireRole('patient'), async (req, res) => {
  const fields = patientFields(req.body)
  if (typeof fields === 'string') return res.status(400).json({ error: fields })
  await pool.execute(
    'UPDATE users SET name = ?, phone = ?, age = ?, gender = ?, blood_group = ?, address = ? WHERE id = ?',
    [...fields, req.user.id],
  )
  const [[user]] = await pool.execute(`SELECT ${PUBLIC} FROM users WHERE id = ?`, [req.user.id])
  res.json({ message: 'Profile updated', user })
})

// DELETE /api/auth/me  (patient deletes own account; appointments are removed by CASCADE)
router.delete('/me', requireRole('patient'), async (req, res) => {
  await pool.execute('DELETE FROM users WHERE id = ?', [req.user.id])
  res.json({ message: 'Account deleted' })
})

module.exports = { router, patientFields, PUBLIC }
