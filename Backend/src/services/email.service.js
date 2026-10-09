const nodemailer = require("nodemailer");

// Create standard Gmail transporter with TLS fallback for cloud deployments
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Prevents cloud proxy SSL handshake failures
    }
});

/**
 * Sends OTP Verification email to user
 */
async function sendOTPEmail(toEmail, otp, name) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("SERVER ERROR: EMAIL_USER or EMAIL_PASS environment variables are missing!");
        throw new Error("Server missing email credentials.");
    }

    const mailOptions = {
        from: `"HiredMind" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `${otp} is your HiredMind verification code`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Hired<span style="color: #10b981;">Mind</span></h2>
                <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hi ${name || 'there'},</p>
                <p style="color: #334155; font-size: 15px; line-height: 1.5;">Use the following 6-digit verification code to complete your signup:</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #10b981;">${otp}</span>
                </div>
                
                <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not create an account, you can safely ignore this message.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${toEmail}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("Nodemailer execution error:", error);
        throw error;
    }
}

module.exports = { sendOTPEmail };