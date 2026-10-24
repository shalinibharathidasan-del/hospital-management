// Hospital Appointment System - Express REST API (used by the React web app and the React Native app)
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', require('./routes/auth').router)
app.use('/api/doctors', require('./routes/doctors'))
app.use('/api/patients', require('./routes/patients'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/notifications', require('./routes/notifications'))

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// Errors thrown in async routes end up here (Express 5 forwards them automatically)
app.use((err, req, res, next) => {
  console.error(err)
  if (err.code === 'ECONNREFUSED') return res.status(500).json({ error: 'Database is not running' })
  res.status(500).json({ error: 'Something went wrong' })
})

// Listen on all network interfaces so the phone app can reach it over Wi-Fi
const PORT = Number(process.env.PORT) || 5003
app.listen(PORT, '0.0.0.0', () => console.log(`API running at http://localhost:${PORT}/api`))
