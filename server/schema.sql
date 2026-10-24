-- Hospital Appointment System - database schema

-- Patients, doctors and admin share one table; role decides what they can do
CREATE TABLE IF NOT EXISTS users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(100) NOT NULL UNIQUE,
  phone          VARCHAR(15),
  password_hash  VARCHAR(100) NOT NULL,
  role           ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
  -- patient details
  age            TINYINT,
  gender         ENUM('Male', 'Female', 'Other'),
  blood_group    VARCHAR(5),
  address        VARCHAR(255),
  -- doctor details
  specialization VARCHAR(100),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  patient_id       INT NOT NULL,
  doctor_id        INT NOT NULL,
  appointment_date DATETIME NOT NULL,
  reason           VARCHAR(255) NOT NULL,
  status           ENUM('Booked', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Booked',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id)  REFERENCES users(id) ON DELETE CASCADE
);

-- Consultation record written by the doctor (one per appointment)
CREATE TABLE IF NOT EXISTS consultations (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL UNIQUE,
  diagnosis      VARCHAR(255) NOT NULL,
  prescription   TEXT NOT NULL,
  notes          TEXT,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  message    VARCHAR(255) NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
