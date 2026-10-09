import React from 'react'
import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className='spinner-wrapper'>
                    <div className='spinner-glow'></div>
                    <svg className='spinner-icon' xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                </div>
                <h1>Authenticating...</h1>
            </main>
        )
    }

    if (!user) {
        return <Navigate to={'/login'} replace />
    }
    
    return children
}

export default Protected