const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../services/email.service");

// Helper function to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Cookie Configuration for Local & Render Production Deployment
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};

/**
 * @name registerUserController
 * @description Stores pending user in temporary OTP collection and sends email verification code
 * @access Public
 */
const registerUserController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide name, email, and password." 
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 2. Check if user already exists in primary collection
        const existingUser = await userModel.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "An account with this email already exists." 
            });
        }

        // 3. Generate 6-digit OTP
        const otp = generateOTP();

        // 4. Send Email via Nodemailer
        try {
            await sendOTPEmail(normalizedEmail, otp, name.trim());
        } catch (emailError) {
            console.error("Email Delivery Failed:", emailError.message);
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email. Please try again."
            });
        }

        // 5. Store temporary signup record in OTP DB (Overwrites old OTP if present)
        await otpModel.deleteMany({ email: normalizedEmail });
        await otpModel.create({ 
            email: normalizedEmail, 
            otp,
            name: name.trim(),
            password 
        });

        return res.status(200).json({
            success: true,
            requiresVerification: true,
            message: "Verification code sent to your email."
        });

    } catch (error) {
        console.error("Register Controller Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Internal server error during registration." 
        });
    }
};

/**
 * @name verifyEmailController
 * @description Validates OTP, moves pending record into primary users collection, and issues JWT
 * @access Public
 */
async function verifyEmailController(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and verification code are required" 
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Find pending record in temporary OTP collection
        const pendingUser = await otpModel.findOne({ email: normalizedEmail });

        if (!pendingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "OTP code has expired or is invalid. Please register again." 
            });
        }

        // 2. Validate OTP Match
        if (pendingUser.otp !== otp.toString().trim()) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid verification code" 
            });
        }

        // 3. Officially register user in main MongoDB collection
        const user = await userModel.create({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password
        });

        // 4. Remove temporary OTP record
        await otpModel.deleteOne({ email: normalizedEmail });

        // 5. Generate JWT session token
        const token = jwt.sign(
            { id: user._id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, COOKIE_OPTIONS);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Verification Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Internal server error during verification." 
        });
    }
}

/**
 * @name loginUserController
 * @description Authenticates registered users and issues JWT cookie
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide email and password" 
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        const token = jwt.sign(
            { id: user._id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, COOKIE_OPTIONS);

        return res.status(200).json({
            success: true,
            message: "User logged in successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error during login." 
        });
    }
}

/**
 * @name logoutUserController
 * @description Clears token cookie and adds token to blacklist
 * @access Public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token;

        if (token) {
            await tokenBlacklistModel.create({ token });
        }

        res.clearCookie("token", COOKIE_OPTIONS);

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error during logout." 
        });
    }
}

/**
 * @name getMeController
 * @description Fetches current authenticated user profile
 * @access Private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("GetMe Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error." 
        });
    }
}

module.exports = {
    registerUserController,
    verifyEmailController,
    loginUserController,
    logoutUserController,
    getMeController
};