const userModel = require("../models/user.model")
const otpModel = require("../models/otp.model")
const tokenBlacklistModel = require("../models/blacklist.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { sendOTPEmail } = require("../services/email.service")

// Helper function to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

// Cookie Configuration for Local & Render Production Deployment
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
}

/**
 * @name registerUserController
 * @description Stores pending user in temporary OTP collection and sends email verification code
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email and password" })
        }

        // 1. Check if user is already registered in the main database
        const isUserAlreadyExists = await userModel.findOne({ email })
        if (isUserAlreadyExists) {
            return res.status(400).json({ message: "Account already exists with this email address" })
        }

        // 2. Hash password and generate OTP code
        const hash = await bcrypt.hash(password, 10)
        const otp = generateOTP()

        // 3. Upsert into temporary OTP collection (Auto-expires after 10 mins)
        await otpModel.findOneAndUpdate(
            { email },
            { name, email, password: hash, otp },
            { upsert: true, new: true }
        )

        // 4. Send Email via Nodemailer
        try {
            await sendOTPEmail(email, otp, name)
        } catch (emailError) {
            console.error("Nodemailer Delivery Error:", emailError)
            await otpModel.findOneAndDelete({ email }) // Clean up temporary record if email fails
            return res.status(500).json({ 
                message: "Failed to send verification email. Please check server configuration." 
            })
        }

        res.status(201).json({
            message: "Registration initiated. Please check your email for the verification code.",
            requiresVerification: true 
        })

    } catch (error) {
        console.error("Registration Error:", error)
        res.status(500).json({ message: "Internal server error during registration." })
    }
}

/**
 * @name verifyEmailController
 * @description Validates OTP, moves pending record into primary users collection, and issues JWT
 * @access Public
 */
async function verifyEmailController(req, res) {
    try {
        const { email, code } = req.body

        if (!email || !code) {
            return res.status(400).json({ message: "Email and verification code are required" })
        }

        // 1. Find pending record in temporary OTP collection
        const pendingUser = await otpModel.findOne({ email })

        if (!pendingUser) {
            return res.status(400).json({ message: "OTP code has expired or is invalid. Please register again." })
        }

        if (pendingUser.otp !== code) {
            return res.status(400).json({ message: "Invalid verification code" })
        }

        // 2. Officially register user in main MongoDB collection
        const user = await userModel.create({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password
        })

        // 3. Remove temporary OTP record
        await otpModel.findOneAndDelete({ email })

        // 4. Generate JWT session token
        const token = jwt.sign(
            { id: user._id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, COOKIE_OPTIONS)

        res.status(200).json({
            message: "Email verified successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Verification Error:", error)
        res.status(500).json({ message: "Internal server error during verification." })
    }
}

/**
 * @name loginUserController
 * @description Authenticates registered users and issues JWT cookie
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" })
        }

        const token = jwt.sign(
            { id: user._id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, COOKIE_OPTIONS)

        res.status(200).json({
            message: "User logged in successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Login Error:", error)
        res.status(500).json({ message: "Internal server error during login." })
    }
}

/**
 * @name logoutUserController
 * @description Clears token cookie and adds token to blacklist
 * @access Public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token", COOKIE_OPTIONS)

        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (error) {
        console.error("Logout Error:", error)
        res.status(500).json({ message: "Internal server error during logout." })
    }
}

/**
 * @name getMeController
 * @description Fetches current authenticated user profile
 * @access Private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.error("GetMe Error:", error)
        res.status(500).json({ message: "Internal server error." })
    }
}

module.exports = {
    registerUserController,
    verifyEmailController,
    loginUserController,
    logoutUserController,
    getMeController
}