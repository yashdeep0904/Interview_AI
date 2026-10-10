import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        const data = await login({ email, password });
        if (data && data.user) {
            setUser(data.user);
        }
        return data;
    };

    const handleRegister = async ({ name, email, password }) => {
        const data = await register({ name, email, password });
        if (data && data.user) {
            setUser(data.user);
        }
        return data;
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setUser(null);
        }
    };

    return { user, loading, handleRegister, handleLogin, handleLogout };
};