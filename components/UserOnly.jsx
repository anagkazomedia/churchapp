import { useRouter } from "expo-router";
import { useUser } from "../hooks/useUser";
import { useEffect } from "react";
import ThemedLoader from "./ThemedLoader";

const UserOnly = ({ children }) => {
    const { user, authChecked } = useUser();
    const router = useRouter();

    useEffect(() => {
        // If auth is checked AND there is no user, redirect to login
        if (authChecked && !user?.loggedIn) {
            router.replace('/login'); // Redirect guests away
        }
    }, [user, authChecked]);

    // 1. Still checking? Show loader.
    if (!authChecked) {
        return <ThemedLoader />;
    }

    // 2. Not logged in? Return null while the redirect (in useEffect) happens.
    if (!user?.loggedIn) {
        return null;
    }

    // 3. Logged in? Show the protected content.
    return children;
}

export default UserOnly;