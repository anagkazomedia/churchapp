import { createContext, useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import { ID } from 'react-native-appwrite';
import * as SecureStore from 'expo-secure-store';

export const UserContext = createContext();
const CACHE_KEY = 'user_session_cache';

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadCachedUser() {
            try {
                const cached = await SecureStore.getItemAsync(CACHE_KEY);
                if (cached) setUser(JSON.parse(cached));
            } catch (e) {
                console.log("Cache Load Error:", e);
            } finally {
                refreshUser();
            }
        }
        loadCachedUser();
    }, []);

    async function clearLocalSession() {
        setUser(null);
        await SecureStore.deleteItemAsync(CACHE_KEY);
    }

    async function refreshUser() {
        try {
            const response = await account.get();
            setUser(response);
            await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(response));
            return response;
        } catch (error) {
            // FIX: If the user is blocked or unauthorized, wipe local data immediately
            if (error.code === 401 || error.code === 403 || error.message.includes('blocked')) {
                console.log("Security trigger: Wiping local session...");
                await clearLocalSession();
            }
            return null;
        } finally {
            setAuthChecked(true);
            setIsLoading(false);
        }
    }

    async function login(email, password) {
        try {
            // Always try to clear a current session before starting a new one
            try { await account.deleteSession("current"); } catch (e) {} 
            await account.createEmailPasswordSession(email, password);
            return await refreshUser();
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    async function register(email, password, name) {
        try {
            try { await account.deleteSession("current"); } catch (e) {}
            await clearLocalSession();
            await account.create(ID.unique(), email, password, name || 'User');
            return await login(email, password);
        } catch (error) {
            if (error.code === 409) {
                throw new Error("This email is already in use. If you recently deleted your account, please use a different email or contact support.");
            }
            throw new Error(error.message);
        }
    }

    async function logout() {
        try {
            await account.deleteSession("current");
        } catch (e) {
            console.log("Logout cleanup:", e.message);
        } finally {
            await clearLocalSession();
        }
    }

    return (
        <UserContext.Provider value={{ user, login, register, logout, authChecked, isLoading, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}