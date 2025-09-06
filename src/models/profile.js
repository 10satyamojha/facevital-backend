const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {                   // use frontend friendly camelCase
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {                      // explicit email field if needed
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
   
  },
  height: {
    type: Number,
    required: true,
    min: 50,
    max: 300
  },
  weight: {
    type: Number,
    required: true,
    min: 20,
    max: 500
  },
  unit: {
    type: String,
    enum: ['metric', 'imperial'],
    default: 'metric'
  },
  bloodType: {                 // renamed for frontend map to bloodType
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  allergies: [{
    type: String,
    trim: true
  }],
  medications: [{
    type: String,
    trim: true
  }],
  emergencyContact: {          // add emergencyContact if you have it in frontend
    name: { type: String },
    phone: { type: String }
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    default: 'moderate'
  },
  frames: [{
    type: String, // frame URLs or filenames
  }],
  bmi: {
    type: Number,
    default: 0
  },
  bmiCategory: {
    type: String,
    enum: ['underweight', 'normal', 'overweight', 'obese'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// BMI calculation before save (keep as is)
profileSchema.pre('save', function(next) {
  if (this.height && this.weight) {
    let heightInMeters = this.height;
    let weightInKg = this.weight;
    
    if (this.unit === 'imperial') {
      heightInMeters = this.height * 2.54 / 100;
      weightInKg = this.weight * 0.453592;
    } else {
      heightInMeters = this.height / 100;
    }
    
    this.bmi = parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(1));
    
    if (this.bmi < 18.5) {
      this.bmiCategory = 'underweight';
    } else if (this.bmi < 25) {
      this.bmiCategory = 'normal';
    } else if (this.bmi < 30) {
      this.bmiCategory = 'overweight';
    } else {
      this.bmiCategory = 'obese';
    }
  }
  next();
});

// Index on userId 
profileSchema.index({ userId: 1 });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
