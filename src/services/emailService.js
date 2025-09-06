const transporter = require('../config/email');

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'https://facevitals-main-i343.vercel.app'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your facescan® Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">facescan®</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Welcome to facescan®!</h2>
          <p style="color: #6b7280;">Thank you for signing up. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 8px;">
              Verify Email
            </a>
          </div>
          <p style="color: #6b7280;">Or copy and paste this link in your browser:</p>
          <p style="color: #3b82f6; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #9ca3af; font-size: 14px;">This link will expire in 24 hours.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; background: #f3f4f6;">
          If you didn't create an account, please ignore this email.
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'https://facevitals-main-i343.vercel.app'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your facescan® Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">facescan®</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Reset Your Password</h2>
          <p style="color: #6b7280;">You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 8px;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280;">Or copy and paste this link in your browser:</p>
          <p style="color: #3b82f6; word-break: break-all;">${resetUrl}</p>
          <p style="color: #9ca3af; font-size: 14px;">This link will expire in 1 hour.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; background: #f3f4f6;">
          If you didn't request a password reset, please ignore this email.
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
