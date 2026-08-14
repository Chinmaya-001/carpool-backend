const nodemailer = require("nodemailer");
const { OTP } = require("./otpSchema");

// Create transport dynamically based on env variables, fallback to dry-run
const createMailTransport = () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("WARNING: SMTP credentials not set in .env. Email service will run in DRY-RUN mode.");
        return {
            sendMail: async (mailOptions) => {
                console.log("---------------- DRY-RUN EMAIL OTP ----------------");
                console.log(`To: ${mailOptions.to}`);
                console.log(`Subject: ${mailOptions.subject}`);
                console.log(`Body: ${mailOptions.text}`);
                console.log("---------------------------------------------------");
                return { messageId: "dry-run-id" };
            }
        };
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendEmailOtp = async (email, otp) => {
    const transporter = createMailTransport();
    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || '"Carpool Service" <no-reply@carpool.com>',
        to: email,
        subject: "Your Carpool One-Time Password (OTP)",
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px;">
                <h2 style="color: #333;">Carpool Authentication</h2>
                <p>Hello,</p>
                <p>Use the following One-Time Password (OTP) to sign in to your Carpool account:</p>
                <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f4f4f4; text-align: center; border-radius: 4px; letter-spacing: 2px; color: #4CAF50;">
                    ${otp}
                </div>
                <p>This code is valid for 5 minutes. Please do not share this OTP with anyone.</p>
                <p>Regards,<br/>Carpool Team</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return false;
    }
};

const generateAndSendEmailOtp = async (email) => {
    const otpExpireTime = parseInt(process.env.OTP_EXPIRATION_TIME || "5");
    const otp = Math.floor(100000 + Math.random() * 900000);

    const isOtpSaved = await OTP.create({
        email: email,
        otp: otp,
        expirationTime: new Date(Date.now() + otpExpireTime * 60 * 1000)
    });

    if (!isOtpSaved) {
        return {
            success: false,
            message: "OTP is not saved",
            data: null
        };
    }

    console.log("Email OTP saved. Sending to:", email);

    // Send email in background
    sendEmailOtp(email, otp).then((isSent) => {
        if (!isSent) console.error("Failed to send OTP email to:", email);
    });

    return {
        success: true,
        data: isOtpSaved
    };
};

module.exports = {
    sendEmailOtp,
    generateAndSendEmailOtp
};
