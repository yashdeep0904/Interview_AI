require("dotenv").config()
const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

// Import Database Connection
const connectToDB = require("./src/config/database")

// Import Routes
const authRouter = require("./src/routes/auth.routes")
const interviewRouter = require("./src/routes/interview.routes")

const app = express()

// 1. Establish Database Connection
connectToDB()

// 2. Global Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

// 3. API Routes
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// 4. Start Server
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})