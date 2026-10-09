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

// 2. Define Allowed Origins (Local Dev + Render Deployed Frontend)
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://interview-ai-client-1mwd.onrender.com",
    process.env.CLIENT_URL
].filter(Boolean)

// 3. CORS Middleware Configuration (Handles preflight OPTIONS requests automatically)
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error(`CORS Policy Violation: Origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}))

// 4. Global Body Parsers
app.use(express.json())
app.use(cookieParser())

// 5. Health Check Route
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "HiredMind API is live and operational!"
    })
})

// 6. API Routes
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// 7. Start Server
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})