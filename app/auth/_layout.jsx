import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { useUser } from "../../hooks/useUser";
import GuestOnly from "../../components/GuestOnly";

export default function AuthLayout() {
    // The useUser hook will now pull from SecureStore 
    // to determine if a session exists.
    const { user } = useUser();

    return (
        <GuestOnly>
            {/* StatusBar style='auto' will automatically switch 
               between light/dark based on the system theme. 
            */}
            <StatusBar barStyle="default" />
            <Stack
                screenOptions={{ 
                    headerShown: false, 
                    animation: "none" 
                }} 
            />
        </GuestOnly>
    );
}