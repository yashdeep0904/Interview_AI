import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Register = () => {
    const { loading, handleRegister, handleVerifyEmail } = useAuth()
    const navigate = useNavigate()

    const [step, setStep] = useState(1) // 1: Registration Form, 2: OTP Verification
    const [formData, setFormData] = useState({ name: "", email: "", password: "" })
    const [otp, setOtp] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errorMsg) setErrorMsg("")
    }

    const onRegisterSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg("")

        try {
            // Assuming handleRegister calls /api/auth/register
            const res = await handleRegister(formData)
            if (res.error) throw new Error(res.error)
            
            setStep(2) // Move to OTP step
        } catch (err) {
            setErrorMsg(err.message || "Failed to create account.")
        }
    }

    const onVerifySubmit = async (e) => {
        e.preventDefault()
        setErrorMsg("")

        try {
            // Assuming handleVerifyEmail calls /api/auth/verify-email
            const res = await handleVerifyEmail({ email: formData.email, code: otp })
            if (res.error) throw new Error(res.error)
            
            navigate('/') // Success!
        } catch (err) {
            setErrorMsg(err.message || "Invalid or expired code.")
        }
    }

    return (
        <main className='auth-page'>
            <div className="form-container">
                <div className='brand-header'>
                    <div className='brand-icon'>HM</div>
                    <h2>HiredMind</h2>
                </div>

                {step === 1 ? (
                    <>
                        <h1>Create an Account</h1>
                        <p className='form-subtitle'>Start generating AI interview strategies today.</p>
                        
                        <form onSubmit={onRegisterSubmit}>
                            <div className="input-group">
                                <label htmlFor="name">Full Name</label>
                                <input onChange={handleChange} value={formData.name} type="text" id="name" name='name' placeholder='John Doe' required />
                            </div>
                            <div className="input-group">
                                <label htmlFor="email">Work Email</label>
                                <input onChange={handleChange} value={formData.email} type="email" id="email" name='email' placeholder='name@company.com' required />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <input onChange={handleChange} value={formData.password} type="password" id="password" name='password' placeholder='Create a strong password' required minLength={6} />
                            </div>

                            {errorMsg && (
                                <div className='error-banner'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <button className={`button primary-button ${loading ? 'loading' : ''}`} disabled={loading}>
                                {loading ? 'Creating Account...' : 'Continue'}
                            </button>
                        </form>
                        <p className='auth-switch'>Already have an account? <Link to={"/login"}>Sign in</Link></p>
                    </>
                ) : (
                    <>
                        <h1>Check your email</h1>
                        <p className='form-subtitle'>We sent a 6-digit verification code to <strong>{formData.email}</strong>.</p>
                        
                        <form onSubmit={onVerifySubmit}>
                            <div className="input-group otp-group">
                                <input 
                                    className='otp-input'
                                    onChange={(e) => { setOtp(e.target.value); if (errorMsg) setErrorMsg("") }} 
                                    value={otp} 
                                    type="text" 
                                    maxLength={6} 
                                    placeholder='000000' 
                                    required 
                                />
                            </div>

                            {errorMsg && (
                                <div className='error-banner'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <button className={`button primary-button ${loading ? 'loading' : ''}`} disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify & Activate'}
                            </button>
                        </form>
                        <p className='auth-switch'><button type="button" className='text-btn' onClick={() => setStep(1)}>Use a different email</button></p>
                    </>
                )}
            </div>
        </main>
    )
}

export default Register