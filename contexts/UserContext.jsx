import { createContext, useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import { ID } from 'react-native-appwrite';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    async function refreshUser() {
        try {
            const response = await account.get();
            setUser(response);
            return response;
        } catch (error) {
            // 🛠️ FIX: Only log out if the server explicitly says "Unauthorized" (401)
            // If it's a network error (offline), we keep the current user state.
            if (error.code === 401) {
                setUser(null);
            }
            console.log("Auth Check:", error.message);
        } finally {
            setAuthChecked(true);
            setIsLoading(false);
        }
    }

    async function login(email, password) {
        try {
            await account.createEmailPasswordSession(email, password);
            return await refreshUser();
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
            await account.deleteSessions("current");
            setUser(null);
        } catch (error) {
            console.log("Logout error:", error);
        }
    }

    useEffect(() => {
        refreshUser();
    }, []);

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