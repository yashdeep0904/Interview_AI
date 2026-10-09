const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true
        },
        otp: {
            type: String,
            required: [true, "OTP code is required"]
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 600 // Auto-deletes document from MongoDB after 10 minutes
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("OTP", otpSchema);