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

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.CLIENT_URL,
    "https://interview-ai-client-1mwd.onrender.com"
].filter(Boolean); // Filter out undefined if FRONTEND_URL isn't set

// 2. Global Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like Postman or mobile apps) or matching allowed origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy error: Origin not allowed"));
        }
    },
    credentials: true
}));

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

  app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "HiredMind API is live and operational!"
    })
})

// 3. API Routes
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// 4. Start Server
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})