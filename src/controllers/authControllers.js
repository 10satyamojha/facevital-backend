const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const authConfig = require('../config/auth');
const { validateEmail, validatePassword } = require('../services/validationService');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

class AuthController {
  async register(req, res, next) {
    try {
      // Handle both PascalCase (from frontend) and camelCase
      const email = req.body.Email || req.body.email || '';
      const userName = req.body.UserName || req.body.userName || '';
      const password = req.body.Password || req.body.password || '';

      console.log('Received data:', { email, userName, password }); // Debugging
      console.log('Raw body:', req.body); // See what's actually coming

      if (!email || !userName || !password) {
        return res.status(400).json({ 
          message: 'Email, username and password are required',
          received: { 
            hasEmail: !!email, 
            hasUserName: !!userName, 
            hasPassword: !!password 
          }
        });
      }

      // Email validation
      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Password validation
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          message: 'Password does not meet requirements',
          requirements: passwordValidation.requirements
        });
      }

      // Check for existing user
      const existingUser = await User.findOne({
        $or: [ { email }, { userName } ]
      });

      if (existingUser) {
        if (existingUser.isVerified) {
          return res.status(409).json({ message: 'User already exists and is verified' });
        } else {
          // Resend verification email
          const verificationToken = crypto.randomBytes(32).toString('hex');
          existingUser.verificationToken = verificationToken;
          existingUser.verificationTokenExpires = Date.now() + authConfig.verificationTokenExpiry;
          await existingUser.save();
          await sendVerificationEmail(email, verificationToken);
          return res.status(200).json({ 
            message: 'Verification email resent. Please check your email.' 
          });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, authConfig.saltRounds);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create new user
      const newUser = new User({
        email,
        userName,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpires: Date.now() + authConfig.verificationTokenExpiry,
      });

      await newUser.save();
      await sendVerificationEmail(email, verificationToken);

      res.status(201).json({ 
        message: 'User registered successfully. Please check your email to verify your account.' 
      });

    } catch (error) {
      console.error('Registration error:', error);
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ message: 'Verification token is required' });
      }

      const user = await User.findOne({ 
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();

      res.status(200).json({ message: 'Email verified successfully' });

    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      // Frontend se LoginUserName aur LoginPassword aa raha hai
      const loginUserName = req.body.LoginUserName || req.body.loginUserName || '';
      const loginPassword = req.body.LoginPassword || req.body.loginPassword || '';

      console.log('Login attempt:', { loginUserName, loginPassword: loginPassword ? '[HIDDEN]' : 'empty' });

      // Check for presence
      if (!loginUserName || !loginPassword) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Find user by userName OR email (flexible login)
      const user = await User.findOne({
        $or: [
          { userName: loginUserName },
          { email: loginUserName }
        ]
      });

      if (!user) {
        console.log('User not found:', loginUserName);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if verified
      if (!user.isVerified) {
        return res.status(401).json({ 
          message: 'Please verify your email first. Check your inbox for the verification link.' 
        });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(loginPassword, user.password);
      if (!isPasswordValid) {
        console.log('Invalid password for user:', loginUserName);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Build JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, userName: user.userName },
        process.env.JWT_SECRET || 'your-secret-key', // Fallback for development
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      console.log('Login successful for:', user.userName);

      // Success response
      res.status(200).json({
        message: 'Login successful',
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          userName: user.userName
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const email = req.body.Email || req.body.email || '';

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal user existence
        return res.status(200).json({ 
          message: 'If an account exists, we have sent a password reset link' 
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + authConfig.resetTokenExpiry;
      await user.save();

      await sendPasswordResetEmail(email, resetToken);

      res.status(200).json({ 
        message: 'If an account exists, we have sent a password reset link' 
      });

    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const token = req.body.token || req.body.Token || '';
      const password = req.body.password || req.body.Password || '';

      if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required' });
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          message: 'Password does not meet requirements',
          requirements: passwordValidation.requirements
        });
      }

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      const hashedPassword = await bcrypt.hash(password, authConfig.saltRounds);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ message: 'Password reset successfully' });

    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req, res, next) {
    try {
      const email = req.body.Email || req.body.email || '';

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: 'User is already verified' });
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationToken = verificationToken;
      user.verificationTokenExpires = Date.now() + authConfig.verificationTokenExpiry;
      await user.save();

      await sendVerificationEmail(email, verificationToken);

      res.status(200).json({ message: 'Verification email sent successfully' });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();