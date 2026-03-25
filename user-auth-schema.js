// User Authentication Schema for Drug Awareness Platform
// MongoDB Schema with Mongoose

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Main User Schema for Authentication
const userSchema = new mongoose.Schema({
  // Basic Authentication Fields
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Role-based Access Control
  role: {
    type: String,
    required: [true, 'User role is required'],
    enum: {
      values: ['doctor', 'mr', 'company', 'admin'],
      message: 'Role must be one of: doctor, mr, company, admin'
    }
  },
  
  // Basic Profile Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  
  // Profile Image
  profileImage: {
    type: String, // URL to profile image
    default: null
  },
  
  // Account Status Management
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'pending', 'suspended'],
      message: 'Status must be one of: active, inactive, pending, suspended'
    },
    default: 'pending'
  },
  
  // Email Verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  
  // Password Reset
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // Login Tracking
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },
  
  // Role-specific Data References
  // These will reference separate collections for detailed profiles
  doctorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile'
  },
  mrProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MRProfile'
  },
  companyProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyProfile'
  },
  
  // Preferences
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de']
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find by email (case insensitive)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get users by role
userSchema.statics.findByRole = function(role, options = {}) {
  const query = this.find({ role });
  
  if (options.status) {
    query.where('status').equals(options.status);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  if (options.sort) {
    query.sort(options.sort);
  }
  
  return query;
};

// Static method for authentication
userSchema.statics.authenticate = async function(email, password) {
  const user = await this.findByEmail(email).select('+password +loginAttempts +lockUntil');
  
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  // Check if account is locked
  if (user.isLocked) {
    await user.incLoginAttempts();
    return { success: false, message: 'Account temporarily locked due to too many failed login attempts' };
  }
  
  // Check if account is active
  if (user.status !== 'active') {
    return { success: false, message: 'Account is not active. Please contact administrator.' };
  }
  
  // Check password
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incLoginAttempts();
    return { success: false, message: 'Invalid email or password' };
  }
  
  // Success - reset login attempts and update last login
  await user.resetLoginAttempts();
  user.lastLogin = new Date();
  await user.save();
  
  return { 
    success: true, 
    user: user.toJSON(),
    message: 'Login successful' 
  };
};

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;

// Example usage and helper functions:

// Create a new user
const createUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    return { success: true, user: user.toJSON() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login function
const loginUser = async (email, password) => {
  return await User.authenticate(email, password);
};

// Get user by ID with role check
const getUserById = async (userId, requesterRole = null) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Admin can see all users, others can only see their own profile
    if (requesterRole !== 'admin' && user._id.toString() !== userId) {
      return { success: false, message: 'Access denied' };
    }
    
    return { success: true, user: user.toJSON() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user profile
const updateUserProfile = async (userId, updateData, requesterRole = null) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Only admin or the user themselves can update profile
    if (requesterRole !== 'admin' && user._id.toString() !== userId) {
      return { success: false, message: 'Access denied' };
    }
    
    // Prevent role changes unless admin
    if (updateData.role && requesterRole !== 'admin') {
      delete updateData.role;
    }
    
    // Prevent status changes unless admin
    if (updateData.status && requesterRole !== 'admin') {
      delete updateData.status;
    }
    
    Object.assign(user, updateData);
    await user.save();
    
    return { success: true, user: user.toJSON() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get users with pagination and filtering (admin only)
const getUsers = async (options = {}, requesterRole = null) => {
  if (requesterRole !== 'admin') {
    return { success: false, message: 'Access denied' };
  }
  
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search
    } = options;
    
    const query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);
    
    return {
      success: true,
      users: users.map(user => user.toJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Export helper functions
module.exports = {
  User,
  createUser,
  loginUser,
  getUserById,
  updateUserProfile,
  getUsers
};

// Sample data for testing
const sampleUsers = [
  {
    email: 'admin@medrepai.com',
    password: 'admin123',
    role: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    status: 'active',
    emailVerified: true
  },
  {
    email: 'dr.sarah@hospital.com',
    password: 'doctor123',
    role: 'doctor',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+1-555-1001',
    status: 'active',
    emailVerified: true
  },
  {
    email: 'mike.mr@pharma.com',
    password: 'mr123',
    role: 'mr',
    firstName: 'Mike',
    lastName: 'Chen',
    phone: '+1-555-1002',
    status: 'active',
    emailVerified: true
  },
  {
    email: 'company@pharmatech.com',
    password: 'company123',
    role: 'company',
    firstName: 'Lisa',
    lastName: 'Rodriguez',
    phone: '+1-555-1003',
    status: 'active',
    emailVerified: true
  }
];

// Seed function for testing
const seedUsers = async () => {
  try {
    await User.deleteMany({}); // Clear existing users
    
    for (const userData of sampleUsers) {
      const result = await createUser(userData);
      if (result.success) {
        console.log(`Created user: ${userData.email} (${userData.role})`);
      } else {
        console.error(`Failed to create user ${userData.email}:`, result.error);
      }
    }
    
    console.log('User seeding completed!');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

// Uncomment to run seeding
// seedUsers();