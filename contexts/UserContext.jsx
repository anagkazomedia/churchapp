import { createContext, useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import { ID } from 'react-native-appwrite';
import * as SecureStore from 'expo-secure-store'; // 1. Import SecureStore

export const UserContext = createContext();

const CACHE_KEY = 'user_session_cache';

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 2. Load cached user immediately on startup
    useEffect(() => {
        async function loadCachedUser() {
            try {
                const cached = await SecureStore.getItemAsync(CACHE_KEY);
                if (cached) {
                    setUser(JSON.parse(cached));
                }
            } catch (e) {
                console.log("Error loading cache", e);
            } finally {
                // Now check the server to sync
                refreshUser();
            }
        }
        loadCachedUser();
    }, []);

    async function refreshUser() {
        try {
            const response = await account.get();
            setUser(response);
            // 3. Update the cache with fresh data
            await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(response));
            return response;
        } catch (error) {
            // 🛠️ FIX: If offline, we DO NOT set user to null. 
            // We only clear it if the session is actually expired (401).
            if (error.code === 401 || error.code === 403) {
                setUser(null);
                await SecureStore.deleteItemAsync(CACHE_KEY);
            }
            console.log("Auth Check (likely offline):", error.message);
        } finally {
            setAuthChecked(true);
            setIsLoading(false);
        }
    }

    async function login(email, password) {
        try {
            await account.createEmailPasswordSession(email, password);
            const freshUser = await refreshUser();
            return freshUser;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    async function register(email, password) {
        try {
            await account.create(ID.unique(), email, password);
            return await login(email, password);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async function logout() {
        try {
            await account.deleteSession("current");
            setUser(null);
            // 4. Clear the cache on logout
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
            authChecked, 
            isLoading, 
            refreshUser 
        }}>
            {children}
        </UserContext.Provider>
    );
}