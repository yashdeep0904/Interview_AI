import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className={`q-card ${open ? 'q-card--open' : ''}`}>
            <div className='q-card__header' onClick={() => setOpen(!open)}>
                <div className='q-card__header-left'>
                    <span className='q-card__index'>Q{index + 1}</span>
                    <p className='q-card__question'>{item.question}</p>
                </div>
                <span className='q-card__chevron'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='tag tag--intention'>Interviewer's Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='tag tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='roadmap-card'>
        <div className='roadmap-card__header'>
            <span className='roadmap-card__badge'>Day {day.day}</span>
            <h3 className='roadmap-card__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-card__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='bullet' />
                    <p>{task}</p>
                </li>
            ))}
        </ul>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()
    const navigate = useNavigate() 

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <div className='spinner-wrapper'>
                    <div className='spinner-glow'></div>
                    <svg className='spinner-icon' xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                </div>
                <h1>Loading your interview plan...</h1>
                <p>Retrieving your custom AI strategy</p>
            </main>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
        report.matchScore >= 60 ? 'score--mid' : 'score--low'

    return (
        <div className='dashboard-page'>
            <div className='dashboard-layout'>
                
                {/* ── Left Sidebar (Navigation) ── */}
                <aside className='sidebar sidebar--left'>
                    <div className="sidebar__top">
                        <button className='back-btn' onClick={() => navigate('/')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                            Back to Home
                        </button>

                        <div className='nav-menu'>
                            <p className='nav-menu__label'>Preparation Sections</p>
                            {NAV_ITEMS.map(item => (
                                <button
                                    key={item.id}
                                    className={`nav-item ${activeNav === item.id ? 'nav-item--active' : ''}`}
                                    onClick={() => setActiveNav(item.id)}
                                >
                                    <span className='nav-item__icon'>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar__bottom">
                        <button onClick={() => getResumePdf(interviewId)} className='download-btn'>
                            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
                            Download PDF Resume
                        </button>
                    </div>
                </aside>

                {/* ── Center Content (Main) ── */}
                <main className='dashboard-main'>
                    {activeNav === 'technical' && (
                        <section className='content-section fade-in'>
                            <header className='content-header'>
                                <div>
                                    <h2>Technical Questions</h2>
                                    <p>Role-specific skills and scenario analysis</p>
                                </div>
                                <span className='count-badge'>{report.technicalQuestions.length} items</span>
                            </header>
                            <div className='card-list'>
                                {report.technicalQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section className='content-section fade-in'>
                            <header className='content-header'>
                                <div>
                                    <h2>Behavioral Questions</h2>
                                    <p>Leadership, conflict resolution, and culture fit</p>
                                </div>
                                <span className='count-badge'>{report.behavioralQuestions.length} items</span>
                            </header>
                            <div className='card-list'>
                                {report.behavioralQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section className='content-section fade-in'>
                            <header className='content-header'>
                                <div>
                                    <h2>Preparation Roadmap</h2>
                                    <p>Your day-by-day action plan</p>
                                </div>
                                <span className='count-badge'>{report.preparationPlan.length} Days</span>
                            </header>
                            <div className='roadmap-grid'>
                                {report.preparationPlan.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                {/* ── Right Sidebar (Stats) ── */}
                <aside className='sidebar sidebar--right'>
                    {/* Match Score */}
                    <div className='stat-card'>
                        <h3 className='stat-card__title'>Profile Match</h3>
                        <div className={`match-ring ${scoreColor}`}>
                            <div className='match-ring__inner'>
                                <span className='match-ring__value'>{report.matchScore}</span>
                                <span className='match-ring__pct'>%</span>
                            </div>
                        </div>
                        <p className='stat-card__desc'>
                            {report.matchScore >= 80 ? 'Strong match for this role!' : 
                             report.matchScore >= 60 ? 'Moderate match. Focus on gaps.' : 
                             'Challenging match. High prep required.'}
                        </p>
                    </div>

                    {/* Skill Gaps */}
                    <div className='stat-card'>
                        <div className='stat-card__header'>
                            <h3 className='stat-card__title'>Skill Gaps Detected</h3>
                            <span className='gap-count'>{report.skillGaps.length}</span>
                        </div>
                        <div className='skill-list'>
                            {report.skillGaps.length > 0 ? (
                                report.skillGaps.map((gap, i) => (
                                    <div key={i} className={`skill-tag skill-tag--${gap.severity?.toLowerCase() || 'medium'}`}>
                                        <span className='skill-tag__dot'></span>
                                        {gap.skill}
                                    </div>
                                ))
                            ) : (
                                <p className='stat-card__desc'>No major skill gaps detected!</p>
                            )}
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    )
}

export default Interview