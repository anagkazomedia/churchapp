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
                if (cached) {
                    setUser(JSON.parse(cached));
                    // If we have a cache, let the user in IMMEDIATELY
                    // We will still sync with the server in the background
                    setIsLoading(false); 
                }
            } catch (e) {
                console.log("Error loading cache", e);
            } finally {
                // 2. Sync with server (refreshUser handles its own loading state)
                await refreshUser();
            }
        }
        initializeAuth();
    }, []);

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
            console.log("Sync failed (Offline or Timeout):", error.message);
            
            // Only log the user out if the server EXPLICITLY says the session is dead
            if (error.code === 401 || error.code === 403) {
                setUser(null);
                await SecureStore.deleteItemAsync(CACHE_KEY);
            }
            // If it's a timeout or network error, we stay logged in with CACHED data
        } finally {
            setIsLoading(false); // <--- Guaranteed to run
        }
    }

    async function login(email, password) {
        setIsLoading(true); // Show loading while logging in
        try {
            await account.createEmailPasswordSession(email, password);
            return await refreshUser();
        } catch (error) {
            setIsLoading(false);
            throw new Error(error.message);
        }
    }
    
    async function register(email, password) {
        setIsLoading(true);
        try {
            await account.create(ID.unique(), email, password);
            return await login(email, password);
        } catch (error) {
            setIsLoading(false);
            throw new Error(error.message);
        }
    }

    async function logout() {
        try {
            await account.deleteSession("current");
            setUser(null);
            await SecureStore.deleteItemAsync(CACHE_KEY);
        } catch (error) {
            console.log("Logout error:", error);
        }
    }

    return (
        <UserContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            isLoading, 
            refreshUser 
        }}>
            {children}
        </UserContext.Provider>
    );
}