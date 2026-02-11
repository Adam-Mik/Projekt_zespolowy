import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: 'http://192.168.0.146:8000/api/',
  timeout: 10000,
});

// Interceptor do dodawania tokenu do każdego żądania
api.interceptors.request.use(async (request) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    request.headers.Authorization = `Token ${token}`;
  }
  
  console.log('➡️ REQUEST');
  console.log('URL:', (request.baseURL || '') + (request.url || ''));
  console.log('METHOD:', request.method);
  console.log('DATA:', request.data);
  console.log('HEADERS:', request.headers);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('✅ RESPONSE');
    console.log('STATUS:', response.status);
    console.log('DATA:', response.data);
    return response;
  },
  error => {
    console.log('❌ AXIOS ERROR FULL DUMP');
    console.log('message:', error.message);
    console.log('code:', error.code);
    console.log('config:', error.config);

    if (error.request) {
      console.log('REQUEST EXISTS but NO RESPONSE');
      console.log(error.request);
    }

    if (error.response) {
      console.log('RESPONSE STATUS:', error.response.status);
      console.log('RESPONSE DATA:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Funkcje do zarządzania autentykacją
export const authApi = {
  async register(username: string, password: string) {
    const response = await api.post('/users/', { username, password });
    return response.data;
  },

  async login(username: string, password: string) {
    const response = await api.post('/login/', { username, password });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('authToken');
  },

  async getToken() {
    return await AsyncStorage.getItem('authToken');
  },
};
