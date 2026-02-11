import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashboardScreen from './src/screens/DashboardScreen';
import CalculatorScreen from './src/screens/CalculatorScreen';
import ArchiveScreen from './src/screens/ArchiveScreen';
import LoginScreen from './src/screens/LoginScreen';
import { authApi } from './src/api/client';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    } catch (err) {
      console.log('Błąd sprawdzania logowania:', err);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return null; // Możesz dodać loading screen tutaj
  }

  if (!isLoggedIn) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { 
            backgroundColor: '#1e293b',
            borderBottomWidth: 1,
            borderBottomColor: '#334155',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#f1f5f9',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerRight: () => (
            <MaterialCommunityIcons 
              name="logout" 
              size={24} 
              color="#f87171" 
              onPress={handleLogout}
              style={{ marginRight: 16, padding: 8 }}
            />
          ),
          tabBarStyle: { 
            backgroundColor: '#1e293b', 
            height: 70,
            borderTopWidth: 1,
            borderTopColor: '#334155',
            paddingTop: 8,
            paddingBottom: 12,
          },
          tabBarActiveTintColor: '#38bdf8',
          tabBarInactiveTintColor: '#64748b',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: -2,
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: any;

            if (route.name === 'Dashboard') iconName = 'wallet-outline';
            else if (route.name === 'Calculator') iconName = 'calculator';
            else if (route.name === 'Archive') iconName = 'archive-outline';

            return <MaterialCommunityIcons name={iconName} size={size + 4} color={color} />;
          },
          headerShown: true,
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Wydatki',
          }}
        />
        <Tab.Screen 
          name="Calculator" 
          component={CalculatorScreen}
          options={{
            tabBarLabel: 'Kalkulator',
          }}
        />
        <Tab.Screen 
          name="Archive" 
          component={ArchiveScreen}
          options={{
            tabBarLabel: 'Archiwum',
          }}
        />
      </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
