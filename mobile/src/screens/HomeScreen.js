import { useCallback, useEffect, useState } from 'react'
import { Alert, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { api, COLORS } from '../api'
import AppointmentCard from '../components/AppointmentCard'

// Upcoming appointments + appointment notifications. Pull down to refresh.
export default function HomeScreen({ user }) {
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [a, n] = await Promise.all([api('/appointments/my'), api('/notifications')])
      setAppointments(a.filter((x) => x.status === 'Booked'))
      setNotifications(n.slice(0, 6))
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const cancel = async (a) => {
    const doCancel = async () => {
      try {
        await api(`/appointments/${a.id}/cancel`, { method: 'PATCH' })
        load()
      } catch (err) {
        setError(err.message)
      }
    }
    // Alert with buttons is not supported on web, so confirm there instead
    if (Platform.OS === 'web') {
      if (window.confirm(`Cancel appointment with ${a.doctor_name}?`)) doCancel()
    } else {
      Alert.alert('Cancel appointment', `Cancel appointment with ${a.doctor_name}?`, [
        { text: 'No' },
        { text: 'Yes, cancel', style: 'destructive', onPress: doCancel },
      ])
    }
  }

  const unread = notifications.filter((n) => !n.is_read).length

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <Text style={styles.greeting}>Hello, {user.name.split(' ')[0]} 👋</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.section}>Upcoming appointments</Text>
      {appointments.length === 0 && <Text style={styles.muted}>No upcoming appointments. Book one from the Book tab.</Text>}
      {appointments.map((a) => (
        <AppointmentCard key={a.id} appointment={a} onCancel={cancel} />
      ))}

      <View style={styles.sectionRow}>
        <Text style={styles.section}>Notifications</Text>
        {unread > 0 && <Text style={styles.badge}>{unread} new</Text>}
      </View>
      {notifications.map((n) => (
        <View key={n.id} style={[styles.note, !n.is_read && styles.unread]}>
          <Text style={styles.noteText}>🔔 {n.message}</Text>
        </View>
      ))}
      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  section: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginVertical: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { backgroundColor: COLORS.danger, color: '#fff', fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  muted: { color: COLORS.muted },
  error: { color: COLORS.danger, marginBottom: 8 },
  note: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  unread: { backgroundColor: '#e0f2fe', borderColor: '#7dd3fc' },
  noteText: { color: COLORS.text, fontSize: 14 },
})
