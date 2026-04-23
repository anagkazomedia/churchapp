import { createContext, useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import { ID } from 'react-native-appwrite';
import * as SecureStore from 'expo-secure-store';

export const UserContext = createContext();
const CACHE_KEY = 'user_session_cache';

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function initializeAuth() {
            try {
                // 1. Instantly try to get cached user
                const cached = await SecureStore.getItemAsync(CACHE_KEY);
<<<<<<< HEAD
                if (cached) {
                    setUser(JSON.parse(cached));
                    // If we have a cache, let the user in IMMEDIATELY
                    // We will still sync with the server in the background
                    setIsLoading(false); 
                }
=======
                if (cached) setUser(JSON.parse(cached));
>>>>>>> 87d1ea2 (additional fix)
            } catch (e) {
                console.log("Cache Load Error:", e);
            } finally {
<<<<<<< HEAD
                // 2. Sync with server (refreshUser handles its own loading state)
                await refreshUser();
=======
                refreshUser();
>>>>>>> 87d1ea2 (additional fix)
            }
        }
        initializeAuth();
    }, []);

    async function clearLocalSession() {
        setUser(null);
        await SecureStore.deleteItemAsync(CACHE_KEY);
    }

    async function refreshUser() {
        // Create a promise that rejects after 3 seconds
        // This prevents the "logo hang" if the network is stuck
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout")), 3000)
        );

        try {
            // Race the Appwrite call against our 3-second timeout
            const response = await Promise.race([
                account.get(),
                timeout
            ]);

            setUser(response);
            await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(response));
            return response;
        } catch (error) {
<<<<<<< HEAD
            console.log("Sync failed (Offline or Timeout):", error.message);
            
            // Only log the user out if the server EXPLICITLY says the session is dead
            if (error.code === 401 || error.code === 403) {
                setUser(null);
                await SecureStore.deleteItemAsync(CACHE_KEY);
            }
            // If it's a timeout or network error, we stay logged in with CACHED data
=======
            // FIX: If the user is blocked or unauthorized, wipe local data immediately
            if (error.code === 401 || error.code === 403 || error.message.includes('blocked')) {
                console.log("Security trigger: Wiping local session...");
                await clearLocalSession();
            }
            return null;
>>>>>>> 87d1ea2 (additional fix)
        } finally {
            setIsLoading(false); // <--- Guaranteed to run
        }
    }

    async function login(email, password) {
        setIsLoading(true); // Show loading while logging in
        try {
            // Always try to clear a current session before starting a new one
            try { await account.deleteSession("current"); } catch (e) {} 
            await account.createEmailPasswordSession(email, password);
            return await refreshUser();
        } catch (error) {
            setIsLoading(false);
            throw new Error(error.message);
        }
    }
    
<<<<<<< HEAD
    async function register(email, password) {
        setIsLoading(true);
=======
    async function register(email, password, name) {
>>>>>>> 87d1ea2 (additional fix)
        try {
            try { await account.deleteSession("current"); } catch (e) {}
            await clearLocalSession();
            await account.create(ID.unique(), email, password, name || 'User');
            return await login(email, password);
        } catch (error) {
<<<<<<< HEAD
            setIsLoading(false);
=======
            if (error.code === 409) {
                throw new Error("This email is already in use. If you recently deleted your account, please use a different email or contact support.");
            }
>>>>>>> 87d1ea2 (additional fix)
            throw new Error(error.message);
        }
    }

    async function logout() {
        try {
            await account.deleteSession("current");
<<<<<<< HEAD
            setUser(null);
            await SecureStore.deleteItemAsync(CACHE_KEY);
        } catch (error) {
            console.log("Logout error:", error);
=======
        } catch (e) {
            console.log("Logout cleanup:", e.message);
        } finally {
            await clearLocalSession();
>>>>>>> 87d1ea2 (additional fix)
        }
    }

    return (
<<<<<<< HEAD
        <UserContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            isLoading, 
            refreshUser 
        }}>
=======
        <UserContext.Provider value={{ user, login, register, logout, authChecked, isLoading, refreshUser }}>
>>>>>>> 87d1ea2 (additional fix)
            {children}
        </UserContext.Provider>
    );
}