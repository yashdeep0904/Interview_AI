import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg("")

        try {
            const res = await handleLogin({ email, password })
            
            // Handle specific unverified error from our backend logic
            if (res.requiresVerification) {
                navigate('/register', { state: { requiresVerification: true, email } })
                return
            }

            if (res.error) throw new Error(res.error)
            
            navigate('/')
        } catch (err) {
            setErrorMsg(err.message || "Incorrect email or password.")
        }
    }

    return (
        <main className='auth-page'>
            <div className="form-container">
                <div className='brand-header'>
                    <div className='brand-icon'>HM</div>
                    <h2>HiredMind</h2>
                </div>
                
                <h1>Welcome Back</h1>
                <p className='form-subtitle'>Enter your credentials to access your workspace</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); if (errorMsg) setErrorMsg("") }}
                            type="email" id="email" name='email' placeholder='name@company.com' required
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); if (errorMsg) setErrorMsg("") }}
                            type="password" id="password" name='password' placeholder='••••••••' required
                        />
                    </div>

                    {errorMsg && (
                        <div className='error-banner'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <button className={`button primary-button ${loading ? 'loading' : ''}`} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <p className='auth-switch'>Don't have an account? <Link to={"/register"}>Register</Link></p>
            </div>
        </main>
    )
}

export default Login