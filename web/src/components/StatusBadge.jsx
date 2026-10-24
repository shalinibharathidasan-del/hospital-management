import { STATUS_COLORS } from '../api'

// Coloured badge for an appointment status
function StatusBadge({ status }) {
  return <span className={`badge bg-${STATUS_COLORS[status] || 'secondary'}`}>{status}</span>
}

export default StatusBadge
