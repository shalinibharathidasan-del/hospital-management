// JWT authentication middleware
const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'dev-secret'

const signToken = (user) =>
  jwt.sign({ id: user.id, name: user.name, role: user.role }, SECRET, { expiresIn: '7d' })

// Requires a valid "Authorization: Bearer <token>" header; sets req.user
function requireLogin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Please log in' })
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Session expired, please log in again' })
  }
}

// requireRole('doctor') or requireRole('doctor', 'admin')
const requireRole = (...roles) => (req, res, next) =>
  requireLogin(req, res, () => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'You do not have access to this' })
    next()
  })

module.exports = { signToken, requireLogin, requireRole }
