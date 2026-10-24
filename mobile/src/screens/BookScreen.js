import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { api, COLORS } from '../api'

const TIME_SLOTS = ['09:30', '10:30', '11:30', '14:00', '15:00', '16:00']

// Next 7 days starting tomorrow, as { value: '2026-11-05', label: 'Thu 5' }
function nextDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return { value, label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }) }
  })
}

// Small reusable chip button
function Chip({ label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  )
}

// Props: onBooked() - called after a successful booking
export default function BookScreen({ onBooked }) {
  const [doctors, setDoctors] = useState([])
  const [doctorId, setDoctorId] = useState(null)
  const [day, setDay] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState({ text: '', error: false })
  const [loading, setLoading] = useState(false)
  const days = nextDays()

  useEffect(() => {
    api('/doctors').then(setDoctors).catch((err) => setMessage({ text: err.message, error: true }))
  }, [])

  const book = async () => {
    if (!doctorId || !day || !time || !reason.trim()) {
      return setMessage({ text: 'Please choose a doctor, day, time and enter a reason', error: true })
    }
    setLoading(true)
    try {
      const res = await api('/appointments', {
        method: 'POST',
        body: { doctor_id: doctorId, appointment_date: `${day}T${time}`, reason },
      })
      setMessage({ text: res.message, error: false })
      setReason('')
      setTime('')
      onBooked()
    } catch (err) {
      setMessage({ text: err.message, error: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>1. Choose a doctor</Text>
      {doctors.map((d) => (
        <Pressable key={d.id} onPress={() => setDoctorId(d.id)} style={[styles.doctor, doctorId === d.id && styles.doctorSelected]}>
          <Text style={styles.doctorName}>{d.name}</Text>
          <Text style={styles.muted}>{d.specialization}</Text>
        </Pressable>
      ))}

      <Text style={styles.label}>2. Pick a day</Text>
      <View style={styles.chips}>
        {days.map((d) => (
          <Chip key={d.value} label={d.label} selected={day === d.value} onPress={() => setDay(d.value)} />
        ))}
      </View>

      <Text style={styles.label}>3. Pick a time</Text>
      <View style={styles.chips}>
        {TIME_SLOTS.map((t) => (
          <Chip key={t} label={t} selected={time === t} onPress={() => setTime(t)} />
        ))}
      </View>

      <Text style={styles.label}>4. Reason for visit</Text>
      <TextInput style={styles.input} placeholder="e.g. Fever since 2 days" value={reason} onChangeText={setReason} />

      {message.text ? <Text style={[styles.message, message.error && styles.error]}>{message.text}</Text> : null}

      <Pressable style={styles.button} onPress={book} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Book appointment</Text>}
      </Pressable>
      <View style={{ height: 30 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginTop: 14, marginBottom: 8 },
  doctor: { backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.border, borderRadius: 10, padding: 12, marginBottom: 8 },
  doctorSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.light },
  doctorName: { fontWeight: '700', color: COLORS.text },
  muted: { color: COLORS.muted, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: 18, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: '#fff' },
  chipSelected: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.primary, fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 15 },
  message: { color: '#16a34a', marginTop: 12, fontWeight: '600' },
  error: { color: COLORS.danger },
  button: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
