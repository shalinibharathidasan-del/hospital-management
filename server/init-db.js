// Creates the database and tables, then adds demo admin, doctors, a patient and sample records.
// Run once: npm run init-db
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

const DB_NAME = process.env.DB_NAME || 'hospital_db'

// Demo logins for trying the app locally (also listed in README)
const DEMO_USERS = [
  { name: 'Admin', email: 'admin@citycare.com', password: 'admin123', role: 'admin' },
  { name: 'Dr. Ravi Shankar', email: 'ravi@citycare.com', password: 'doctor123', role: 'doctor', specialization: 'General Physician', phone: '9845000001' },
  { name: 'Dr. Lakshmi Iyer', email: 'lakshmi@citycare.com', password: 'doctor123', role: 'doctor', specialization: 'Cardiologist', phone: '9845000002' },
  { name: 'Dr. Farhan Ali', email: 'farhan@citycare.com', password: 'doctor123', role: 'doctor', specialization: 'Dermatologist', phone: '9845000003' },
  { name: 'Ananya Rao', email: 'ananya@gmail.com', password: 'patient123', role: 'patient', phone: '9876543210', age: 24, gender: 'Female', blood_group: 'B+', address: 'Kumaraswamy Layout, Bengaluru' },
]

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``)
  await conn.changeUser({ database: DB_NAME })
  await conn.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))
  console.log(`Database "${DB_NAME}" and tables ready`)

  for (const u of DEMO_USERS) {
    const hash = await bcrypt.hash(u.password, 10)
    await conn.execute(
      `INSERT IGNORE INTO users (name, email, phone, password_hash, role, age, gender, blood_group, address, specialization)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.name, u.email, u.phone || null, hash, u.role, u.age || null, u.gender || null, u.blood_group || null, u.address || null, u.specialization || null],
    )
  }

  // A past completed visit with a prescription, and an upcoming booking, for the demo patient
  const [[{ count }]] = await conn.query('SELECT COUNT(*) AS count FROM appointments')
  if (count === 0) {
    const [[patient]] = await conn.query("SELECT id FROM users WHERE email = 'ananya@gmail.com'")
    const [[doctor]] = await conn.query("SELECT id FROM users WHERE email = 'ravi@citycare.com'")
    const [[cardio]] = await conn.query("SELECT id FROM users WHERE email = 'lakshmi@citycare.com'")

    const [past] = await conn.execute(
      "INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status) VALUES (?, ?, '2026-10-10 10:30:00', 'Fever and headache', 'Completed')",
      [patient.id, doctor.id],
    )
    await conn.execute(
      `INSERT INTO consultations (appointment_id, diagnosis, prescription, notes) VALUES (?, 'Viral fever',
       'Paracetamol 650 mg - 1 tablet three times a day for 3 days\nCetirizine 10 mg - 1 tablet at night for 5 days', 'Drink plenty of fluids. Review if fever continues after 3 days.')`,
      [past.insertId],
    )
    await conn.execute(
      "INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason) VALUES (?, ?, '2026-11-05 11:00:00', 'Routine heart check-up')",
      [patient.id, cardio.id],
    )
    await conn.query(
      `INSERT INTO notifications (user_id, message, is_read) VALUES
       (?, 'Dr. Ravi Shankar updated your consultation record. Your prescription is ready.', TRUE),
       (?, 'Appointment booked with Dr. Lakshmi Iyer on 5 Nov 2026 at 11:00 am.', FALSE)`,
      [patient.id, patient.id],
    )
    console.log('Sample appointments, consultation and notifications added')
  }

  console.log('Demo logins: admin@citycare.com / admin123, ravi@citycare.com / doctor123, ananya@gmail.com / patient123')
  await conn.end()
}

main().catch((err) => {
  console.error('Setup failed:', err.sqlMessage || err.message)
  process.exit(1)
})
