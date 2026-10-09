import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, verifyEmail, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            
            // If the backend says they need to verify their email (OTP step)
            if (data.requiresVerification) {
                return data 
            }
            
            setUser(data.user)
            return data
        } catch (err) {
            throw err // Throw to UI to show in the error banner
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ name, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ name, email, password })
            return data
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyEmail = async ({ email, code }) => {
        setLoading(true)
        try {
            const data = await verifyEmail({ email, code })
            setUser(data.user) // User is now verified and logged in
            return data
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                if (data && data.user) {
                    setUser(data.user)
                } else {
                    setUser(null)
                }
            } catch (err) { 
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()
    }, [setUser, setLoading])

    return { user, loading, handleRegister, handleVerifyEmail, handleLogin, handleLogout }
}