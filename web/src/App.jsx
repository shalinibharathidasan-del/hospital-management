import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Notifications from './pages/Notifications'
import PatientDashboard from './pages/patient/Dashboard'
import BookAppointment from './pages/patient/BookAppointment'
import MyAppointments from './pages/patient/MyAppointments'
import Prescriptions from './pages/patient/Prescriptions'
import Profile from './pages/patient/Profile'
import DoctorAppointments from './pages/doctor/Appointments'
import Consultation from './pages/doctor/Consultation'
import PatientList from './pages/doctor/PatientList'
import PatientDetails from './pages/doctor/PatientDetails'
import Doctors from './pages/admin/Doctors'

// Each role gets its own home page
function Home() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'doctor') return <DoctorAppointments />
  if (user.role === 'admin') return <Doctors />
  return <PatientDashboard />
}

const patient = (page) => <ProtectedRoute roles={['patient']}>{page}</ProtectedRoute>
const staff = (page) => <ProtectedRoute roles={['doctor', 'admin']}>{page}</ProtectedRoute>

function App() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/notifications" element={<ProtectedRoute roles={['patient', 'doctor']}><Notifications /></ProtectedRoute>} />

          {/* Patient */}
          <Route path="/book" element={patient(<BookAppointment />)} />
          <Route path="/appointments" element={patient(<MyAppointments />)} />
          <Route path="/prescriptions" element={patient(<Prescriptions />)} />
          <Route path="/profile" element={patient(<Profile />)} />

          {/* Doctor and admin */}
          <Route path="/consultation/:id" element={<ProtectedRoute roles={['doctor']}><Consultation /></ProtectedRoute>} />
          <Route path="/patients" element={staff(<PatientList />)} />
          <Route path="/patients/:id" element={staff(<PatientDetails />)} />

          <Route path="*" element={<h3>Page not found</h3>} />
        </Routes>
      </main>
    </>
  )
}

export default App
