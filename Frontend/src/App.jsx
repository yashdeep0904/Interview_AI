import React from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"

// Auth Pages & Components
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import Protected from "./features/auth/components/Protected"

// Interview Pages
import Home from "./features/interview/pages/Home"
import Interview from "./features/interview/pages/Interview"

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: (
            <Protected>
                <Home />
            </Protected>
        )
    },
    {
        path: "/interview/:interviewId",
        element: (
            <Protected>
                <Interview />
            </Protected>
        )
    }
])

function App() {
    return (
        <AuthProvider>
            <InterviewProvider>
                <RouterProvider router={router} />
            </InterviewProvider>
        </AuthProvider>
    )
}

export default App

// '../../auth/hooks/useAuth.js'