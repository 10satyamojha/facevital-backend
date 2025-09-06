module.exports = {
  // Response messages
  MESSAGES: {
    AUTH: {
      REGISTER_SUCCESS: 'User registered successfully. Please check your email to verify your account.',
      LOGIN_SUCCESS: 'Login successful',
      LOGOUT_SUCCESS: 'Logged out successfully',
      EMAIL_VERIFIED: 'Email verified successfully',
      PASSWORD_RESET: 'Password reset successfully',
      VERIFICATION_SENT: 'Verification email sent successfully',
      INVALID_CREDENTIALS: 'Invalid credentials',
      USER_NOT_FOUND: 'User not found',
      USER_EXISTS: 'User already exists',
      NOT_VERIFIED: 'Please verify your email before logging in',
    },
    PROFILE: {
      CREATED: 'Profile created successfully',
      UPDATED: 'Profile updated successfully',
      NOT_FOUND: 'Profile not found',
      INCOMPLETE: 'Please complete your profile before scanning',
    },
    SCAN: {
      SUCCESS: 'Scan completed successfully',
      QUALITY_ISSUE: 'Scan quality is not sufficient',
      PROCESSING_ERROR: 'Unable to process scan',
      NOT_FOUND: 'Scan result not found',
    },
    VALIDATION: {
      REQUIRED_FIELDS: 'All required fields must be provided',
      INVALID_EMAIL: 'Invalid email format',
      INVALID_PASSWORD: 'Password does not meet requirements',
      INVALID_AGE: 'User must be 18 years or older',
      INVALID_TOKEN: 'Invalid or expired token',
    }
  },

  // Validation rules
  VALIDATION: {
    PASSWORD: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 64,
      REGEX: {
        UPPERCASE: /[A-Z]/,
        LOWERCASE: /[a-z]/,
        DIGIT: /\d/,
        SYMBOL: /[@#$%^&*+\-_=;:<>?|~]/
      }
    },
    AGE: {
      MIN: 18,
      MAX: 120
    },
    SCAN: {
      MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
      ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
      MIN_QUALITY_SCORE: 0.7
    }
  },

  // Scan result ranges
  HEALTH_RANGES: {
    HEART_RATE: {
      MIN: 60,
      MAX: 100,
      CRITICAL_LOW: 40,
      CRITICAL_HIGH: 120
    },
    BLOOD_PRESSURE: {
      SYSTOLIC: {
        MIN: 90,
        MAX: 120,
        HIGH: 140
      },
      DIASTOLIC: {
        MIN: 60,
        MAX: 80,
        HIGH: 90
      }
    },
    TEMPERATURE: {
      MIN: 97.0,
      MAX: 99.0,
      FEVER: 100.4
    },
    BREATHING_RATE: {
      MIN: 12,
      MAX: 20
    },
    OXYGEN_SATURATION: {
      MIN: 95,
      CRITICAL: 90
    }
  }
};
