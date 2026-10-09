const userModel = require("../models/user.model")
const otpModel = require("../models/otp.model") // Import the new OTP model
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const { sendOTPEmail } = require("../services/email.service")

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

async function registerUserController(req, res) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email and password" })
        }

        // 1. Check if the user is already fully registered
        const isUserAlreadyExists = await userModel.findOne({ email })
        if (isUserAlreadyExists) {
            return res.status(400).json({ message: "Account already exists with this email address" })
        }

        // 2. Hash password and generate OTP
        const hash = await bcrypt.hash(password, 10)
        const otp = generateOTP()

        // 3. Save to temporary OTP collection (updates document if they request a new OTP)
        await otpModel.findOneAndUpdate(
            { email },
            { name, email, password: hash, otp },
            { upsert: true, new: true }
        )

        // 4. Send Email
        try {
            await sendOTPEmail(email, otp, name)
        } catch (emailError) {
            console.error("Nodemailer Error:", emailError)
            await otpModel.findOneAndDelete({ email }) // Clean up if email fails
            return res.status(500).json({ 
                message: "Failed to send verification email. Please check your backend configuration." 
            })
        }

        res.status(201).json({
            message: "Registration started. Please check your email for the OTP.",
            requiresVerification: true 
        })

    } catch (error) {
        console.error("Registration Error:", error)
        res.status(500).json({ message: "Internal server error during registration." })
    }
}

async function verifyEmailController(req, res) {
    try {
        const { email, code } = req.body

        if (!email || !code) {
            return res.status(400).json({ message: "Email and verification code are required" })
        }

        // 1. Find the pending registration in the OTP collection
        const pendingUser = await otpModel.findOne({ email })

        if (!pendingUser) {
            return res.status(400).json({ message: "OTP has expired or is invalid. Please register again." })
        }

        if (pendingUser.otp !== code) {
            return res.status(400).json({ message: "Invalid verification code" })
        }

        // 2. OTP is valid. Now officially create the user in the main database
        const user = await userModel.create({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password
        })

        // 3. Delete the temporary OTP document
        await otpModel.findOneAndDelete({ email })

        // 4. Generate JWT and log them in
        const token = jwt.sign(
            { id: user._id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, { httpOnly: true })

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

async function loginUserController(req, res) {
    const { email, password } = req.body

    // Login is simpler now. If they aren't in userModel, they haven't verified.
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

    res.cookie("token", token, { httpOnly: true })
    res.status(200).json({
        message: "User logged in successfully.",
        user: { id: user._id, name: user.name, email: user.email }
    })
}

async function logoutUserController(req, res) {
    const token = req.cookies.token
    if (token) {
        await tokenBlacklistModel.create({ token })
    }
    res.clearCookie("token")
    res.status(200).json({ message: "User logged out successfully" })
}

async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json({
        message: "User details fetched successfully",
        user: { id: user._id, name: user.name, email: user.email }
    })
}

module.exports = {
    registerUserController,
    verifyEmailController,
    loginUserController,
    logoutUserController,
    getMeController
}