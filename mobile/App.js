import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { COLORS, setToken } from './src/api'
import LoginScreen from './src/screens/LoginScreen'
import HomeScreen from './src/screens/HomeScreen'
import BookScreen from './src/screens/BookScreen'
import PrescriptionsScreen from './src/screens/PrescriptionsScreen'

const TABS = ['Home', 'Book', 'Prescriptions']

export default function App() {
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('Home')

  const handleLogin = (token, loggedInUser) => {
    setToken(token)
    setUser(loggedInUser)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setTab('Home')
  }

  if (!user) {
    return (
      <>
        <StatusBar style="dark" />
        <LoginScreen onLogin={handleLogin} />
      </>
    )
  }

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✚ CityCare</Text>
        <Pressable onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {tab === 'Home' && <HomeScreen user={user} />}
        {tab === 'Book' && <BookScreen onBooked={() => setTab('Home')} />}
        {tab === 'Prescriptions' && <PrescriptionsScreen />}
      </View>

      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <Pressable key={t} style={styles.tab} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  logout: { color: '#ccfbf1', fontWeight: '600' },
  content: { flex: 1 },
  tabBar: { flexDirection: 'row', height: 60, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { color: COLORS.muted, fontSize: 14 },
  tabActive: { color: COLORS.primary, fontWeight: '700' },
})
