import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const { handleLogout } = useAuth() 
    
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const [errorMsg, setErrorMsg] = useState("") 
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const handleGenerateReport = async () => {
        setErrorMsg("") 

        if (!jobDescription.trim()) {
            setErrorMsg("Please paste a Target Job Description before generating.")
            return
        }

        const resumeFile = selectedFile || (resumeInputRef.current && resumeInputRef.current.files[0])
        if (!resumeFile && !selfDescription.trim()) {
            setErrorMsg("Please either upload a Resume or write a Quick Self-Description.")
            return
        }

        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        if (data?._id) {
            navigate(`/interview/${data._id}`)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            if (errorMsg) setErrorMsg("") 
        }
    }

    const clearFile = (e) => {
        e.preventDefault() 
        setSelectedFile(null)
        if (resumeInputRef.current) {
            resumeInputRef.current.value = "" 
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className='spinner-wrapper'>
                    <div className='spinner-glow'></div>
                    <svg className='spinner-icon' xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                </div>
                <h1>Analyzing your profile &amp; role...</h1>
                <p>Our AI is cross-referencing your experience with the job requirements to build your custom strategy.</p>
                <button className='cancel-btn' onClick={() => window.location.reload()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Cancel & Go Back
                </button>
            </main>
        )
    }

    return (
        <div className='home-page'>
            {/* Top Navigation Bar */}
            <nav className='app-nav'>
                <div className='app-nav__brand' onClick={() => navigate('/')}>
                    <div className='brand-icon'>HM</div>
                    <span className='brand-title'>Hired<span className='highlight-text'>Mind</span></span>
                </div>
                
                {/* Right Side Actions */}
                <div className='app-nav__actions'>
                    <div className='app-nav__badge'>
                        <span className='live-dot'></span> AI Engine Active
                    </div>
                    <button onClick={handleLogout} className='logout-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Sign Out
                    </button>
                </div>
            </nav>

            <div className='home-container'>
                {/* Hero Header */}
                <header className='hero-header'>
                    <div className='pill-badge'>AI Interview Strategist</div>
                    <h1>Build Your Winning <span className='highlight'>Interview Plan</span></h1>
                    <p>Provide the target job description and your profile. Our intelligence engine generates tailored technical questions, behavioral frameworks, and a day-by-day roadmap.</p>
                </header>

                {/* Main Workspace Card */}
                <div className='interview-card'>
                    <div className='interview-card__body'>
                        
                        {/* Left Panel - Job Description */}
                        <div className='panel panel--left'>
                            <div className='panel__header'>
                                <div className='panel__title-group'>
                                    <span className='panel__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                    </span>
                                    <h2>Target Job Description</h2>
                                </div>
                                <span className='badge badge--required'>Required</span>
                            </div>
                            
                            <div className='textarea-wrapper'>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => {
                                        setJobDescription(e.target.value)
                                        if (errorMsg) setErrorMsg("") 
                                    }}
                                    className='panel__textarea'
                                    placeholder={`Paste the full job description here...\n\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                                    maxLength={5000}
                                />
                                <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className='panel-divider' />

                        {/* Right Panel - Profile */}
                        <div className='panel panel--right'>
                            <div className='panel__header'>
                                <div className='panel__title-group'>
                                    <span className='panel__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    </span>
                                    <h2>Candidate Profile</h2>
                                </div>
                            </div>

                            {/* Upload Resume */}
                            <div className='upload-section'>
                                <div className='section-header'>
                                    <label className='section-label'>Upload Resume</label>
                                    <span className='badge badge--best'>Recommended</span>
                                </div>
                                
                                <label className={`dropzone ${selectedFile ? 'dropzone--success' : ''}`} htmlFor='resume'>
                                    {selectedFile ? (
                                        <div className='dropzone__content'>
                                            <div className='dropzone__icon-wrapper success'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                            </div>
                                            <p className='dropzone__title'>{selectedFile.name}</p>
                                            <button onClick={clearFile} className='dropzone__remove-btn'>Remove File</button>
                                        </div>
                                    ) : (
                                        <div className='dropzone__content'>
                                            <div className='dropzone__icon-wrapper'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                            </div>
                                            <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                            <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>
                                        </div>
                                    )}
                                    <input ref={resumeInputRef} onChange={handleFileChange} hidden type='file' id='resume' accept='.pdf,.docx' />
                                </label>
                            </div>

                            {/* OR Divider */}
                            <div className='or-divider'>
                                <div className='line'></div>
                                <span>OR MANUAL INPUT</span>
                                <div className='line'></div>
                            </div>

                            {/* Quick Self-Description */}
                            <div className='self-description'>
                                <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                                <textarea
                                    value={selfDescription}
                                    onChange={(e) => {
                                        setSelfDescription(e.target.value)
                                        if (errorMsg) setErrorMsg("") 
                                    }}
                                    id='selfDescription'
                                    className='panel__textarea panel__textarea--short'
                                    placeholder="Briefly describe your experience, key skills, and years of experience..."
                                />
                            </div>

                            {/* Info Box */}
                            <div className='info-box'>
                                <svg className='info-box__icon' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required alongside the job description.</p>
                            </div>
                        </div>
                    </div>

                    {/* ERROR NOTIFICATION BANNER */}
                    {errorMsg && (
                        <div className='error-banner'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Card Footer */}
                    <div className='interview-card__footer'>
                        <div className='footer-info'>
                            <svg className='pulse-icon' xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            <span>Deep AI Analysis &bull; ~30s generation time</span>
                        </div>
                        <button onClick={handleGenerateReport} className='generate-btn'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                            Generate Interview Strategy
                        </button>
                    </div>
                </div>

                {/* Recent Reports Section */}
                {reports && reports.length > 0 && (
                    <section className='recent-reports'>
                        <div className='section-title-wrap'>
                            <h2>Recent Interview Plans</h2>
                            <span className='report-counter'>{reports.length} Saved</span>
                        </div>
                        <div className='reports-grid'>
                            {reports.map(report => (
                                <div key={report._id} className='report-card' onClick={() => navigate(`/interview/${report._id}`)}>
                                    <div className='report-card__top'>
                                        <h3>{report.title || 'Untitled Position'}</h3>
                                        <span className={`score-badge ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                            {report.matchScore}% Match
                                        </span>
                                    </div>
                                    <p className='report-date'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                    <div className='report-card__action'>
                                        <span>View Strategy Plan</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Page Footer */}
                <footer className='page-footer'>
                    <div className='brand'>
                        <div className='brand-dot'></div>
                        <span>HiredMind &copy; 2026</span>
                    </div>
                    <div className='links'>
                        <a href='#'>Privacy Policy</a>
                        <a href='#'>Terms of Service</a>
                        <a href='#'>Support</a>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default Home