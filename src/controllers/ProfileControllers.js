const Profile = require('../models/profile');
const User = require('../models/user');

class ProfileController {
  async createOrUpdateProfile(req, res, next) {
    try {
      const userId = req.user.userId; // Set via auth middleware

      const {
        firstName = '',
        lastName = '',
        email = '',
        phone = '',
        dateOfBirth = '',
        gender = '',
        height = '',
        weight = '',
        unit = 'metric',
        bloodType = '',
        allergies = [],
        medications = [],
        emergencyContact = {},
        activityLevel = 'moderate',
      } = req.body;

      // Basic validation example
      if (!firstName || !lastName || !email || !dateOfBirth || !gender || !height || !weight) {
        return res.status(400).json({
          message: 'Required profile fields are missing',
          received: req.body,
        });
      }

      // Validate age via dateOfBirth -> calculate age
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        return res.status(400).json({ message: 'User must be at least 18 years old' });
      }

      // Find existing profile
      let profile = await Profile.findOne({ userId });

      if (profile) {
        // Update existing profile
        Object.assign(profile, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          dateOfBirth,
          sex: gender.toLowerCase(),
          height,
          weight,
          unit: unit.toLowerCase(),
          bloodGroup: bloodType,
          allergies,
          medications,
          emergencyContact,
          activityLevel,
          updatedAt: new Date(),
        });
      } else {
        // Create new profile
        profile = new Profile({
          userId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          dateOfBirth,
          sex: gender.toLowerCase(),
          height,
          weight,
          unit: unit.toLowerCase(),
          bloodGroup: bloodType,
          allergies,
          medications,
          emergencyContact,
          activityLevel,
        });
      }

      await profile.save();

      res.status(200).json({
        success: true,
        message: profile.isNew ? 'Profile created successfully' : 'Profile updated successfully',
        profile: {
          id: profile._id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          sex: profile.sex,
          height: profile.height,
          weight: profile.weight,
          unit: profile.unit,
          bloodGroup: profile.bloodGroup,
          allergies: profile.allergies,
          medications: profile.medications,
          emergencyContact: profile.emergencyContact,
          activityLevel: profile.activityLevel,
          bmi: profile.bmi,
          bmiCategory: profile.bmiCategory,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
        userId: profile.userId,
      });
    } catch (error) {
      console.error('Profile creation/update error:', error);
      res.status(500).json({
        message: 'Server error while saving profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).select('-password -verificationToken -resetPasswordToken');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const profile = await Profile.findOne({ userId });

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          userName: user.userName,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        profile: profile ? {
          id: profile._id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          sex: profile.sex,
          height: profile.height,
          weight: profile.weight,
          unit: profile.unit,
          bloodGroup: profile.bloodGroup,
          allergies: profile.allergies,
          medications: profile.medications,
          emergencyContact: profile.emergencyContact,
          activityLevel: profile.activityLevel,
          bmi: profile.bmi,
          bmiCategory: profile.bmiCategory,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        } : null,
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({
        message: 'Server error while fetching profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  async checkProfileExists(req, res, next) {
    try {
      const userId = req.user.userId;
      const profile = await Profile.findOne({ userId });
      res.status(200).json({
        success: true,
        hasProfile: !!profile,
        profile: profile ? {
          id: profile._id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          sex: profile.sex,
          height: profile.height,
          weight: profile.weight,
          unit: profile.unit,
          bloodGroup: profile.bloodGroup,
          allergies: profile.allergies,
          medications: profile.medications,
          emergencyContact: profile.emergencyContact,
          activityLevel: profile.activityLevel,
          bmi: profile.bmi,
          bmiCategory: profile.bmiCategory,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        } : null
      });
    } catch (error) {
      console.error('Profile check error:', error);
      res.status(500).json({
        message: 'Server error while checking profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  async deleteProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const profile = await Profile.findOneAndDelete({ userId });
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      res.status(200).json({
        success: true,
        message: 'Profile deleted successfully'
      });
    } catch (error) {
      console.error('Profile deletion error:', error);
      res.status(500).json({
        message: 'Server error while deleting profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }
}

module.exports = new ProfileController();
