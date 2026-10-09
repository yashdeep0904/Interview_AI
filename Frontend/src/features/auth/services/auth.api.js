import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
    withCredentials: true
})

export async function register({ name, email, password }) {
    try {
        // Note: Using 'name' instead of 'username' to match the UI
        const response = await api.post('/api/auth/register', { name, email, password })
        return response.data
    } catch (err) {
        throw err.response?.data || { message: "Registration failed. Please try again." }
    }
}

export async function verifyEmail({ email, code }) {
    try {
        const response = await api.post('/api/auth/verify-email', { email, code })
        return response.data
    } catch (err) {
        throw err.response?.data || { message: "Invalid or expired verification code." }
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", { email, password })
        return response.data
    } catch (err) {
        throw err.response?.data || { message: "Incorrect email or password." }
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        console.error("Logout error:", err)
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        // If unauthorized, just return null (don't throw a visible error)
        return null
    }
}