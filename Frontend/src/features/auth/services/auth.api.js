import axios from "axios";

// Base API Configuration
const API = axios.create({
    baseURL: "https://interview-ai-server-a5fr.onrender.com/api" || "https://localhost:5173",
    withCredentials: true, // Enables cookie handling for auth sessions
    headers: {
        "Content-Type": "application/json"
    }
});

// 1. Register User API
export const register = async (formData) => {
    try {
        const response = await API.post("/auth/register", formData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Server error during registration."
        );
    }
};

// 2. Verify Email OTP API
export const verifyEmail = async ({ email, code }) => {
    try {
        const response = await API.post("/auth/verify-otp", { email, otp: code });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Invalid or expired verification code."
        );
    }
};

// 3. Login API
export const login = async (credentials) => {
    try {
        const response = await API.post("/auth/login", credentials);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Invalid email or password."
        );
    }
};

// 4. Get Current Auth User
export const getMe = async () => {
    try {
        const response = await API.get("/auth/get-me");
        return response.data;
    } catch (error) {
        return null;
    }
};

// 5. Logout API
export const logout = async () => {
    try {
        const response = await API.post("/auth/logout");
        return response.data;
    } catch (error) {
        throw new Error("Failed to log out.");
    }
};