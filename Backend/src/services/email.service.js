const nodemailer = require("nodemailer");

/**
 * Creates a Gmail SMTP transporter with socket timeouts to prevent 502 server hangs
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false // Prevents proxy SSL handshake failures on Render
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000
    });
};

/**
 * Sends OTP verification email
 */
async function sendOTPEmail(toEmail, otp, name) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("EMAIL_USER or EMAIL_PASS environment variables are missing on server.");
    }

    const transporter = createTransporter();

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
                
                <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes.</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail };