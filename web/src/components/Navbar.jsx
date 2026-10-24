import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

const LINKS = {
  patient: [
    ['/', 'Dashboard'],
    ['/book', 'Book Appointment'],
    ['/appointments', 'My Appointments'],
    ['/prescriptions', 'Prescriptions'],
    ['/profile', 'Profile'],
  ],
  doctor: [
    ['/', 'Appointments'],
    ['/patients', 'My Patients'],
  ],
  admin: [
    ['/', 'Doctors'],
    ['/patients', 'Patients'],
  ],
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unread, setUnread] = useState(0)

  // Refresh the unread notification count whenever the page changes
  useEffect(() => {
    if (!user || user.role === 'admin') return
    api('/notifications')
      .then((list) => setUnread(list.filter((n) => !n.is_read).length))
      .catch(() => setUnread(0))
  }, [user, location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-teal">
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/">✚ CityCare Hospital</NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            {user &&
              LINKS[user.role].map(([to, label]) => (
                <li className="nav-item" key={to}>
                  <NavLink className="nav-link" to={to} end>{label}</NavLink>
                </li>
              ))}
          </ul>
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                {user.role !== 'admin' && (
                  <NavLink to="/notifications" className="btn btn-sm btn-light position-relative" aria-label="Notifications">
                    🔔
                    {unread > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{unread}</span>
                    )}
                  </NavLink>
                )}
                <span className="text-light small ms-2">
                  {user.name} <span className="badge bg-light text-dark text-capitalize">{user.role}</span>
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink className="btn btn-outline-light btn-sm" to="/login">Login</NavLink>
                <NavLink className="btn btn-light btn-sm" to="/register">Register</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
