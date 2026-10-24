import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { api, COLORS } from '../api'

// Props: onLogin(token, user)
export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const { token, user } = await api('/auth/login', { method: 'POST', body: { email, password } })
      if (user.role !== 'patient') throw new Error('This app is for patients. Doctors please use the website.')
      onLogin(token, user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>✚</Text>
      <Text style={styles.title}>CityCare Hospital</Text>
      <Text style={styles.subtitle}>Patient app</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </Pressable>
      <Text style={styles.hint}>New patient? Register on the CityCare website.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.background },
  logo: { fontSize: 56, color: COLORS.primary, textAlign: 'center' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', color: COLORS.primary },
  subtitle: { textAlign: 'center', color: COLORS.muted, marginBottom: 28 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 12 },
  error: { color: COLORS.danger, marginBottom: 10 },
  button: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hint: { textAlign: 'center', color: COLORS.muted, marginTop: 16, fontSize: 13 },
})
