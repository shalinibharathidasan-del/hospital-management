import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { api, COLORS, formatDateTime } from '../api'

// Prescriptions written by doctors after completed visits
export default function PrescriptionsScreen() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/appointments/prescriptions').then(setRows).catch((err) => setError(err.message))
  }, [])

  if (error) return <Text style={styles.error}>{error}</Text>
  if (!rows) return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={rows}
      keyExtractor={(item) => String(item.id)}
      ListEmptyComponent={<Text style={styles.muted}>No prescriptions yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.doctor}>{item.doctor_name}</Text>
            <Text style={styles.muted}>{formatDateTime(item.appointment_date)}</Text>
          </View>
          <Text style={styles.diagnosis}>Diagnosis: {item.diagnosis}</Text>
          <Text style={styles.rxLabel}>℞ Prescription</Text>
          <Text style={styles.rx}>{item.prescription}</Text>
          {item.notes ? <Text style={styles.notes}>Advice: {item.notes}</Text> : null}
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  header: { backgroundColor: COLORS.light, padding: 12 },
  doctor: { fontWeight: '700', fontSize: 16, color: COLORS.text },
  muted: { color: COLORS.muted, fontSize: 13 },
  diagnosis: { paddingHorizontal: 12, paddingTop: 10, fontWeight: '600', color: COLORS.text },
  rxLabel: { paddingHorizontal: 12, paddingTop: 8, color: COLORS.primary, fontWeight: '700' },
  rx: { marginHorizontal: 12, marginTop: 4, padding: 10, backgroundColor: '#f8fafc', borderLeftWidth: 3, borderLeftColor: COLORS.primary, lineHeight: 20 },
  notes: { padding: 12, color: COLORS.muted, fontSize: 13 },
  error: { color: COLORS.danger, padding: 16 },
})
