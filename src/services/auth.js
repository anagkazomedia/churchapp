import * as SecureStore from 'expo-secure-store';
import api from './api';

export const loginUser = async (username, password) => {
    const response = await api.post('token/', { username, password });
    await SecureStore.setItemAsync('access', response.data.access);
    await SecureStore.setItemAsync('refresh', response.data.refresh);
    return response.data;
};

export const registerUser = async (username, password) => {
    // Django 'username' usually maps to email if you use email-as-username
    await api.post('register/', { username, password });
};

export const logoutUser = async () => {
    await SecureStore.deleteItemAsync('access');
    await SecureStore.deleteItemAsync('refresh');
};