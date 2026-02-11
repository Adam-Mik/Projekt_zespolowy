// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authApi } from '../api/client';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Błąd', 'Uzupełnij wszystkie pola');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        // Rejestracja
        await authApi.register(username, password);
        Alert.alert('Sukces', 'Konto zostało utworzone. Zaloguj się teraz.');
        setIsRegistering(false);
        setPassword('');
      } else {
        // Login
        const response = await authApi.login(username, password);
        if (response.token) {
          Alert.alert('Sukces', 'Zalogowano pomyślnie!');
          onLoginSuccess();
        }
      }
    } catch (err: any) {
      console.log('Błąd autentykacji:', err);
      const errorMessage = isRegistering 
        ? 'Nie można utworzyć konta. Użytkownik może już istnieć.'
        : 'Błędny login lub hasło.';
      Alert.alert('Błąd', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="wallet-outline" size={64} color="#38bdf8" />
          </View>
          <Text style={styles.appTitle}>Expense Tracker</Text>
          <Text style={styles.appSubtitle}>Zarządzaj wspólnymi wydatkami</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>
            {isRegistering ? 'Utwórz konto' : 'Zaloguj się'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Login</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={20} color="#38bdf8" />
              <TextInput
                placeholder="Wpisz swoją nazwę użytkownika"
                placeholderTextColor="#64748b"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hasło</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock" size={20} color="#38bdf8" />
              <TextInput
                placeholder="Wpisz swoje hasło"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#64748b" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <>
                <MaterialCommunityIcons name="login" size={20} color="#0f172a" />
                <Text style={styles.loginButtonText}>
                  {isRegistering ? 'Utwórz konto' : 'Zaloguj się'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerSection}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>lub</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => {
              setIsRegistering(!isRegistering);
              setPassword('');
            }}
            disabled={loading}
          >
            <Text style={styles.toggleButtonText}>
              {isRegistering 
                ? 'Masz już konto? Zaloguj się' 
                : 'Nie masz konta? Utwórz je teraz'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#38bdf8',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  formSection: {
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    flex: 1,
    padding: 14,
    color: '#f1f5f9',
    fontSize: 16,
    marginHorizontal: 10,
  },
  loginButton: {
    backgroundColor: '#38bdf8',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#38bdf8',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#64748b',
    shadowOpacity: 0.2,
  },
  loginButtonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#64748b',
    marginHorizontal: 12,
    fontSize: 12,
  },
  toggleButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 32,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  credentialBox: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 12,
  },
  credentialLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  credentialValue: {
    color: '#38bdf8',
    fontWeight: 'bold',
  },
});
