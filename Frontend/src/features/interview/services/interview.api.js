import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://interview-ai-server-a5fr.onrender.com" || "https://localhost:5173",
    withCredentials: true,
});

export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    const response = await api.post("/api/interview/generate", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
};

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data;
};

export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/reports");
    return response.data;
};

export const generateResumePdf = async ({ interviewReportId }) => {
    // Note: Changed from POST to GET to match backend PDF download route
    const response = await api.get(`/api/interview/resume/${interviewReportId}/download`, {
        responseType: "blob"
    });

    return response.data;
};