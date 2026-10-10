import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api` 
        : "https://interview-ai-server-a5fr.onrender.com/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

export const register = async (formData) => {
    try {
        const response = await API.post("/auth/register", formData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Server error during registration.");
    }
};

export const login = async (credentials) => {
    try {
        const response = await API.post("/auth/login", credentials);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Invalid email or password.");
    }
};

export const getMe = async () => {
    try {
        const response = await API.get("/auth/get-me");
        return response.data;
    } catch (error) {
        return null;
    }
};

export const logout = async () => {
    try {
        const response = await API.post("/auth/logout");
        return response.data;
    } catch (error) {
        throw new Error("Failed to log out.");
    }
};