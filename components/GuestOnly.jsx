import { useRouter, useSegments } from "expo-router";
import { useUser } from "../hooks/useUser";
import { useEffect } from "react";
import ThemedLoader from "./ThemedLoader";

const GuestOnly = ({ children }) => {
    const { user, authChecked } = useUser();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        // If the check is done and the user is logged in, redirect them to the dashboard
        if (authChecked && user?.loggedIn) {
            router.replace('/dashboard/Home'); // Ensure this path matches your router
        }
    }, [user, authChecked, segments]);

    // 1. If we are still checking the storage, show the loader
    if (!authChecked) {
        return <ThemedLoader />;
    }

    // 2. If the user is already logged in, return null while the redirect happens
    if (user?.loggedIn) {
        return null; 
    }

    // 3. If we are done checking and user is NOT logged in, show the guest content (Login/Register)
    return children;
}

export default GuestOnly;