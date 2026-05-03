import { createContext, useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import { ID } from 'react-native-appwrite';
import * as SecureStore from 'expo-secure-store';

export const UserContext = createContext();
const CACHE_KEY = 'user_session_cache';

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        async function initializeAuth() {
            try {
                const cached = await SecureStore.getItemAsync(CACHE_KEY);
                if (cached) {
                    setUser(JSON.parse(cached));
                }
            } catch (e) {
                console.log("Cache Load Error:", e);
            } finally {
                await refreshUser();
                setAuthChecked(true); 
            }
        }
        initializeAuth();
    }, []);

    async function clearLocalSession() {
        setUser(null);
        await SecureStore.deleteItemAsync(CACHE_KEY);
    }

    async function refreshUser() {
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout")), 3000)
        );

        try {
            const response = await Promise.race([
                account.get(),
                timeout
            ]);

            setUser(response);
            await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(response));
            return response;
        } catch (error) {
            console.log("Sync failed or Guest Mode:", error.message);
            if (error.code === 401 || error.code === 403) {
                await clearLocalSession();
            }
        } finally {
            setIsLoading(false);
            setAuthChecked(true);
        }
    }

    async function login(email, password) {
        setIsLoading(true);
        try {
            // KILL CURRENT SESSION: Forcefully clear any existing session
            try { 
                await account.deleteSession("current"); 
            } catch (e) {
                // Ignore if no session exists
            } 
            
            await account.createEmailPasswordSession(email, password);
            const userResponse = await refreshUser();
            return userResponse;
        } catch (error) {
            setIsLoading(false);
            throw new Error(error.message);
        }
    }
    
    async function register(email, password, name = 'User') {
        setIsLoading(true);
        try {
            // KILL CURRENT SESSION: This prevents the "Account already exists" 
            // error that happens when a session is active in the background.
            try { 
                await account.deleteSession("current"); 
            } catch (e) {
                // Ignore if no session exists
            }

            await clearLocalSession();
            
            // Use ID.unique() to ensure no ID conflicts
            await account.create(ID.unique(), email, password, name);
            
            // Login the newly created user
            return await login(email, password);
        } catch (error) {
            setIsLoading(false);
            throw new Error(error.message);
        }
    }

    async function logout() {
        try {
            // Attempt to kill session on the server
            await account.deleteSession("current");
        } catch (error) {
            console.log("Logout error (likely already logged out):", error);
        } finally {
            // ALWAYS clear local state, even if server call fails
            await clearLocalSession();
        }
    }

    return (
        <UserContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            isLoading, 
            authChecked, 
            refreshUser 
        }}>
            {children}
        </UserContext.Provider>
    );
}