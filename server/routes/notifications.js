// In-app notifications for the logged-in user
const express = require('express')
const pool = require('../db')
const { requireLogin } = require('../middleware/auth')

const router = express.Router()
router.use(requireLogin)

// GET /api/notifications
router.get('/', async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 50',
    [req.user.id],
  )
  res.json(rows.map((n) => ({ ...n, is_read: Boolean(n.is_read) })))
})

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res) => {
  await pool.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id])
  res.json({ message: 'All notifications marked as read' })
})

module.exports = router
