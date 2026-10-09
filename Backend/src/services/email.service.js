const nodemailer = require("nodemailer");

// Explicit SMTP settings for cloud environments like Render
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Uses SSL on port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Sends an OTP verification email to the user
 */
async function sendOTPEmail(toEmail, otp, name) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("EMAIL_USER or EMAIL_PASS environment variables are missing!");
        throw new Error("Missing email credentials in server environment variables.");
    }

    const mailOptions = {
        from: `"HiredMind AI" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Your HiredMind Verification Code",
        html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #0f172a; margin: 0; font-size: 24px;">Hired<span style="color: #10b981;">Mind</span></h2>
                </div>
                <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hi ${name},</p>
                <p style="color: #475569; font-size: 16px; line-height: 1.5;">Welcome to HiredMind! To complete your registration and verify your email address, please enter the following 6-digit code:</p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; border: 1px solid #e2e8f0;">
                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #10b981;">${otp}</span>
                </div>
                
                <p style="color: #64748b; font-size: 14px; line-height: 1.5;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} HiredMind. All rights reserved.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`OTP email sent successfully to ${toEmail}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("Nodemailer SMTP Error:", error);
        throw new Error(`Email delivery failed: ${error.message}`);
    }
}

module.exports = { sendOTPEmail };