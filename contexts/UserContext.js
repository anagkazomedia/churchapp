import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false); // Add this state

    useEffect(() => {
        const checkUser = async () => {
            try {
                const access = await SecureStore.getItemAsync('access');
                if (access) setUser({ loggedIn: true });
            } catch (e) {
                console.error("Auth check failed", e);
            } finally {
                setAuthChecked(true); // Always set to true when check is done
            }
        };
        checkUser();
    }, []);

    const login = (email) => setUser({ email, loggedIn: true });
    
    const logout = () => {
        SecureStore.deleteItemAsync('access');
        SecureStore.deleteItemAsync('refresh');
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, authChecked, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};