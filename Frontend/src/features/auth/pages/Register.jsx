import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../auth.form.scss";

const Register = () => {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { handleRegister } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errorMsg) setErrorMsg("");
    };

    const handleSubmitRegister = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
            setErrorMsg("Please fill in all fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            await handleRegister(formData);
            navigate("/"); // Navigate straight to dashboard on success
        } catch (err) {
            setErrorMsg(err.message || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="form-container">
                <div className="brand-header">
                    <div className="brand-icon">HM</div>
                    <h2>HiredMind</h2>
                </div>

                <h1>Create an Account</h1>
                <p className="form-subtitle">Start generating AI interview strategies today.</p>

                {errorMsg && (
                    <div className="error-banner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmitRegister}>
                    <div className="input-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Work Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="you@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    <button type="submit" className="primary-button" disabled={isSubmitting}>
                        {isSubmitting ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;