# CityCare Hospital – Appointment System (Web + Mobile)

MMCA314D – Web Development Using Full Stack Open — **AAT-II, Question 1**

A prototype where patients register, book appointments, view prescriptions and receive appointment notifications. Doctors view patient details and update consultation records. An admin manages doctors and patients.

| Part | Technology | Folder |
|---|---|---|
| Web app (patients, doctors, admin) | React (Vite), React Router, Bootstrap | `web/` |
| Mobile app (patients) | React Native, Expo | `mobile/` |
| REST API | Node.js, Express 5, JWT, bcrypt | `server/` |
| Database | MySQL | `server/schema.sql` |

## Features

| Requirement | Where |
|---|---|
| Patient registration | Web `/register` |
| Book appointments | Web `/book`, Mobile **Book** tab (doctor, day, time slot, reason; double-booking a slot is blocked) |
| View prescriptions | Web `/prescriptions`, Mobile **Prescriptions** tab |
| Appointment notifications | Created automatically on booking, cancellation and when the doctor saves a record. Bell with unread count on the web, list on the mobile home screen |
| Doctor views patient details | Web `/patients`, `/patients/:id` (details + full visit history) |
| Doctor updates consultation records | Web `/consultation/:id` (diagnosis, prescription, notes; can be edited later) |
| Patient CRUD | Register (create), profile and admin list (read), profile / admin edit (update), delete account / admin delete (delete) |
| Doctor CRUD | Admin `/` – add, list, edit, delete doctors |
| Basic authentication | JWT login for all roles, passwords hashed with bcrypt, role checks on every API route |

## How to run

Needs Node.js 20.6+ and MySQL 8 running.

```bash
# 1. API
cd server
npm install
cp .env.example .env        # put your MySQL password in .env
npm run init-db             # creates database, tables and demo data
npm start                   # http://localhost:5003/api

# 2. Web app (new terminal)
cd web
npm install
npm run dev                 # http://localhost:5176

# 3. Mobile app (new terminal)
cd mobile
npm install
npx expo start              # scan the QR code with Expo Go (phone on the same Wi-Fi)
```

The mobile app finds the API automatically using the laptop's address that Expo is already serving from (`mobile/src/api.js`). If Windows Firewall asks about Node.js, allow it on private networks so the phone can connect.

**Demo logins** (created by `npm run init-db`):

| Role | Email | Password |
|---|---|---|
| Patient (web + mobile) | ananya@gmail.com | patient123 |
| Doctor | ravi@citycare.com | doctor123 |
| Admin | admin@citycare.com | admin123 |

## Database design

```
users                         appointments                 consultations               notifications
-----                         ------------                 -------------               -------------
id (PK)                       id (PK)                      id (PK)                     id (PK)
name, email (unique), phone   patient_id (FK -> users)     appointment_id (FK, unique) user_id (FK -> users)
password_hash                 doctor_id  (FK -> users)     diagnosis                   message
role (patient/doctor/admin)   appointment_date             prescription                is_read
age, gender, blood_group,     reason                       notes                       created_at
address        (patients)     status (Booked/Completed/    updated_at
specialization (doctors)              Cancelled)
created_at                    created_at
```

- One `users` table for all roles keeps login simple.
- An appointment has at most one consultation record (`UNIQUE appointment_id`).
- Deleting a user removes their appointments, records and notifications (`ON DELETE CASCADE`).

## REST API

| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | Patient registration |
| POST | `/api/auth/login` | – | Login (all roles), returns JWT |
| GET / PUT / DELETE | `/api/auth/me` | Patient | View / update / delete own profile |
| GET | `/api/doctors` | – | Doctor list |
| POST / PUT / DELETE | `/api/doctors[/:id]` | Admin | Doctor CRUD |
| GET | `/api/patients?search=` | Doctor, Admin | Patient list (doctor sees own patients only) |
| GET | `/api/patients/:id` | Doctor, Admin | Patient details + visit history |
| PUT / DELETE | `/api/patients/:id` | Admin | Update / delete patient |
| POST | `/api/appointments` | Patient | Book appointment |
| GET | `/api/appointments/my` | Patient | Own appointments |
| GET | `/api/appointments/prescriptions` | Patient | Prescriptions |
| GET | `/api/appointments/doctor` | Doctor | Doctor's schedule |
| GET | `/api/appointments/:id` | Patient/Doctor of it | Appointment details |
| PATCH | `/api/appointments/:id/cancel` | Patient/Doctor of it | Cancel |
| PUT | `/api/appointments/:id/consultation` | Doctor of it | Create / update consultation record |
| GET | `/api/notifications` | Logged in | Own notifications |
| PATCH | `/api/notifications/read-all` | Logged in | Mark all read |

## React concepts used (web)

| Concept | Where |
|---|---|
| Reusable components | `PatientFields` (register, profile, admin edit), `StatusBadge`, `Navbar`, `ProtectedRoute` |
| Props | `PatientFields form/onChange`, `StatusBadge status`, `ProtectedRoute roles` |
| State & hooks | `useState`, `useEffect` on every page; `useContext` via `useAuth()` |
| Forms & events | Booking, consultation, profile, doctor forms (`onChange`, `onSubmit`, validation) |
| Routing | React Router with role-based protected routes, `useParams`, `useNavigate` |

## React Native concepts used (mobile)

`View`, `Text`, `TextInput`, `Pressable`, `ScrollView` with `RefreshControl` (pull to refresh), `FlatList`, `ActivityIndicator`, `Alert`, `StatusBar`, `StyleSheet`, Flexbox layout, reusable `AppointmentCard` and `Chip` components, props and state.

## Project structure

```
hospital-management/
├── server/
│   ├── index.js  db.js  notify.js  schema.sql  init-db.js
│   ├── middleware/auth.js
│   └── routes/  auth.js  doctors.js  patients.js  appointments.js  notifications.js
├── web/src/
│   ├── App.jsx  api.js  main.jsx  App.css
│   ├── context/AuthContext.jsx
│   ├── components/  Navbar  ProtectedRoute  PatientFields  StatusBadge
│   └── pages/  Login  Register  Notifications
│              patient/  Dashboard  BookAppointment  MyAppointments  Prescriptions  Profile
│              doctor/   Appointments  Consultation  PatientList  PatientDetails
│              admin/    Doctors
└── mobile/
    ├── App.js                         tabs + login state
    └── src/  api.js
              components/AppointmentCard.js
              screens/  LoginScreen  HomeScreen  BookScreen  PrescriptionsScreen
```
