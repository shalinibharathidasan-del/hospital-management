import { Pressable, StyleSheet, Text, View } from 'react-native'
import { COLORS, formatDateTime } from '../api'

const STATUS_COLORS = { Booked: '#2563eb', Completed: '#16a34a', Cancelled: '#6b7280' }

// Reusable card for one appointment. Props: appointment, onCancel (optional)
export default function AppointmentCard({ appointment, onCancel }) {
  const a = appointment
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.doctor}>{a.doctor_name}</Text>
          <Text style={styles.muted}>{a.specialization}</Text>
        </View>
        <Text style={[styles.status, { backgroundColor: STATUS_COLORS[a.status] }]}>{a.status}</Text>
      </View>
      <Text style={styles.date}>📅 {formatDateTime(a.appointment_date)}</Text>
      <Text style={styles.muted}>{a.reason}</Text>
      {onCancel && a.status === 'Booked' && (
        <Pressable style={styles.cancel} onPress={() => onCancel(a)}>
          <Text style={styles.cancelText}>Cancel appointment</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  doctor: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  muted: { color: COLORS.muted, fontSize: 13 },
  date: { marginTop: 8, marginBottom: 2, fontSize: 14, color: COLORS.text },
  status: { color: '#fff', fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  cancel: { marginTop: 10, alignSelf: 'flex-start' },
  cancelText: { color: COLORS.danger, fontWeight: '600' },
})
