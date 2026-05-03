import { useRouter } from "expo-router"
import { useUser } from "../hooks/useUser"
import { useEffect } from "react"
import ThemedLoader from "./ThemedLoader"

const UserOnly = ({ children }) => {
    const { user, authChecked } = useUser()
    const router = useRouter()

    // REMOVED: The useEffect that forces a redirect to /register

    if (!authChecked) {
        return <ThemedLoader />
    }

    // IMPROVEMENT: We now return children regardless of whether 'user' exists.
    // The component now simply ensures that we've at least CHECKED the auth status
    // before showing the UI, preventing "flicker."
    return children
}

export default UserOnly