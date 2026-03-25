// MongoDB Schemas for Drug Awareness Platform
// Use with Mongoose ODM

const mongoose = require('mongoose');

// ================================
// 1. USER MANAGEMENT SCHEMAS
// ================================

// Base User Schema (for authentication and common fields)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['doctor', 'mr', 'company', 'admin']
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String, // URL to profile image
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  lastLogin: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Company Schema
const companySchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  website: String,
  description: String,
  logo: String, // URL to company logo
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  // Admin user for this company
  adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Custom drug form configuration
  drugFormConfig: {
    fields: [{
      id: String,
      name: String,
      type: {
        type: String,
        enum: ['text', 'textarea', 'select', 'multiselect', 'date', 'number', 'file', 'url']
      },
      required: Boolean,
      locked: Boolean, // Cannot be modified by admin
      options: [String], // For select/multiselect fields
      placeholder: String,
      validation: {
        minLength: Number,
        maxLength: Number,
        pattern: String
      }
    }],
    lastModified: {
      type: Date,
      default: Date.now
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
// Doctor Profile Schema
const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  specialization: [{
    type: String,
    enum: ['cardiology', 'diabetology', 'neurology', 'oncology', 'gastroenterology', 'endocrinology', 'psychiatry', 'respiratory', 'other']
  }],
  hospital: {
    name: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    phone: String
  },
  clinic: {
    name: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    phone: String
  },
  experience: {
    type: Number, // Years of experience
    min: 0
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  certifications: [{
    name: String,
    issuingBody: String,
    issueDate: Date,
    expiryDate: Date
  }],
  // Network connections
  connectedMRs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRepresentative'
  }],
  // Preferences
  preferences: {
    drugCategories: [String],
    communicationPreferences: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    },
    meetingAvailability: {
      days: [String], // ['monday', 'tuesday', etc.]
      timeSlots: [String] // ['9:00-10:00', '14:00-15:00', etc.]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Medical Representative Schema
const medicalRepresentativeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  territory: {
    name: String,
    regions: [String],
    cities: [String],
    zipCodes: [String]
  },
  // Assigned doctors
  assignedDoctors: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    assignedDate: Date,
    relationship: {
      type: String,
      enum: ['primary', 'secondary', 'prospect'],
      default: 'prospect'
    },
    lastContact: Date,
    notes: String
  }],
  // Performance metrics
  performance: {
    currentMonth: {
      visits: Number,
      newDoctorConnections: Number,
      samplesDistributed: Number,
      meetingsScheduled: Number
    },
    currentQuarter: {
      visits: Number,
      newDoctorConnections: Number,
      samplesDistributed: Number,
      meetingsScheduled: Number,
      salesTarget: Number,
      salesAchieved: Number
    },
    yearToDate: {
      visits: Number,
      newDoctorConnections: Number,
      samplesDistributed: Number,
      meetingsScheduled: Number,
      salesTarget: Number,
      salesAchieved: Number
    }
  },
  // Manager information
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  joinDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ================================
// 2. DRUG MANAGEMENT SCHEMAS
// ================================

// Drug Schema (Dynamic based on company configuration)
const drugSchema = new mongoose.Schema({
  // Core required fields (always present)
  drugName: {
    type: String,
    required: true,
    trim: true
  },
  brandName: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  drugClass: {
    type: String,
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'discontinued'],
    default: 'pending'
  },
  
  // Standard drug information fields
  specialization: [{
    type: String,
    enum: ['cardiology', 'diabetology', 'neurology', 'oncology', 'gastroenterology', 'endocrinology', 'psychiatry', 'respiratory', 'other']
  }],
  indications: String,
  mechanismOfAction: String,
  dosage: String,
  sideEffects: [String],
  contraindications: String,
  drugInteractions: String,
  launchDate: Date,
  
  // File attachments
  brochureUrl: String,
  packageInsertUrl: String,
  clinicalDataUrl: String,
  
  // Dynamic fields (based on company configuration)
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Symptom mapping for search
  symptoms: [String],
  
  // Approval and regulatory
  regulatoryInfo: {
    fdaApproved: Boolean,
    approvalDate: Date,
    ndc: String, // National Drug Code
    rxcui: String // RxNorm Concept Unique Identifier
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Drug Version History (for tracking changes)
const drugVersionSchema = new mongoose.Schema({
  drugId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drug',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  changes: {
    type: Map,
    of: {
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changeReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ================================
// 3. CME EVENTS SCHEMA
// ================================

const cmeEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  eventType: {
    type: String,
    enum: ['webinar', 'conference', 'workshop', 'seminar', 'online_course'],
    required: true
  },
  organizer: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    organizerName: String,
    contactEmail: String,
    contactPhone: String
  },
  // Event details
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  timezone: String,
  venue: {
    type: {
      type: String,
      enum: ['online', 'physical', 'hybrid']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    onlineLink: String,
    platform: String // Zoom, Teams, etc.
  },
  // CME Information
  cmeCredits: {
    type: Number,
    min: 0
  },
  accreditationBody: String,
  targetAudience: [String],
  specializations: [{
    type: String,
    enum: ['cardiology', 'diabetology', 'neurology', 'oncology', 'gastroenterology', 'endocrinology', 'psychiatry', 'respiratory', 'other']
  }],
  // Registration
  registrationRequired: {
    type: Boolean,
    default: true
  },
  maxAttendees: Number,
  registrationDeadline: Date,
  registrationFee: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  // Content
  agenda: [{
    time: String,
    topic: String,
    speaker: String,
    duration: Number // in minutes
  }],
  speakers: [{
    name: String,
    title: String,
    bio: String,
    photo: String
  }],
  materials: [{
    title: String,
    type: String, // 'pdf', 'video', 'slides', etc.
    url: String,
    size: Number
  }],
  // Attendees
  registeredAttendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registrationDate: Date,
    attended: Boolean,
    certificateIssued: Boolean,
    feedback: {
      rating: Number,
      comments: String
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
// ================================
// 4. NETWORKING & COMMUNICATION SCHEMAS
// ================================

// Doctor-MR Connection Schema
const connectionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  mrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRepresentative',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending'
  },
  connectionDate: {
    type: Date,
    default: Date.now
  },
  lastInteraction: Date,
  interactionCount: {
    type: Number,
    default: 0
  },
  // Connection metadata
  initiatedBy: {
    type: String,
    enum: ['doctor', 'mr'],
    required: true
  },
  notes: String,
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Meeting/Visit Schema
const meetingSchema = new mongoose.Schema({
  title: String,
  type: {
    type: String,
    enum: ['visit', 'call', 'video_call', 'email', 'presentation'],
    required: true
  },
  // Participants
  mrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRepresentative',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  // Meeting details
  scheduledDate: Date,
  actualDate: Date,
  duration: Number, // in minutes
  location: {
    type: String,
    enum: ['doctor_office', 'hospital', 'clinic', 'online', 'conference', 'other']
  },
  address: String,
  // Content discussed
  drugsDiscussed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drug'
  }],
  samplesProvided: [{
    drugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drug'
    },
    quantity: Number,
    batchNumber: String
  }],
  materialsShared: [{
    title: String,
    type: String,
    url: String
  }],
  // Meeting outcome
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  outcome: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'follow_up_required']
  },
  notes: String,
  followUpRequired: Boolean,
  followUpDate: Date,
  // Feedback
  doctorFeedback: {
    rating: Number,
    comments: String
  },
  mrFeedback: {
    rating: Number,
    comments: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ================================
// 5. SEARCH & ANALYTICS SCHEMAS
// ================================

// Search History Schema (for analytics and personalization)
const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  searchType: {
    type: String,
    enum: ['drug_name', 'symptom', 'indication', 'company', 'category'],
    required: true
  },
  searchQuery: {
    type: String,
    required: true
  },
  searchTerms: [String], // For symptom searches
  resultsCount: Number,
  clickedResults: [{
    drugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drug'
    },
    position: Number, // Position in search results
    clickTime: Date
  }],
  sessionId: String,
  userAgent: String,
  ipAddress: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Drug View Analytics
const drugViewSchema = new mongoose.Schema({
  drugId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drug',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userRole: String,
  viewDuration: Number, // in seconds
  sectionsViewed: [String], // Which sections of drug details were viewed
  actionsPerformed: [{
    action: String, // 'download_brochure', 'share', 'bookmark', etc.
    timestamp: Date
  }],
  referrer: String, // How they got to this drug page
  sessionId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ================================
// 6. SYSTEM & ADMIN SCHEMAS
// ================================

// System Configuration Schema
const systemConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: mongoose.Schema.Types.Mixed,
  description: String,
  category: {
    type: String,
    enum: ['general', 'email', 'security', 'features', 'limits']
  },
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array']
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true // 'drug', 'user', 'company', etc.
  },
  resourceId: String,
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['system', 'drug_update', 'meeting_reminder', 'cme_event', 'connection_request', 'message'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'sms', 'push']
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  readAt: Date,
  sentAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ================================
// 7. FILE MANAGEMENT SCHEMA
// ================================

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: String,
  // File categorization
  category: {
    type: String,
    enum: ['drug_brochure', 'package_insert', 'clinical_data', 'profile_image', 'company_logo', 'cme_material', 'other']
  },
  // Associated entities
  associatedWith: {
    entityType: String, // 'drug', 'user', 'company', 'cme_event'
    entityId: mongoose.Schema.Types.ObjectId
  },
  // Access control
  visibility: {
    type: String,
    enum: ['public', 'private', 'company_only', 'role_based'],
    default: 'private'
  },
  allowedRoles: [String],
  // Metadata
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloaded: Date,
  // File processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },
  virusScanStatus: {
    type: String,
    enum: ['pending', 'clean', 'infected', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ================================
// 8. EXPORT MODELS
// ================================

module.exports = {
  User: mongoose.model('User', userSchema),
  Company: mongoose.model('Company', companySchema),
  Doctor: mongoose.model('Doctor', doctorSchema),
  MedicalRepresentative: mongoose.model('MedicalRepresentative', medicalRepresentativeSchema),
  Drug: mongoose.model('Drug', drugSchema),
  DrugVersion: mongoose.model('DrugVersion', drugVersionSchema),
  CMEEvent: mongoose.model('CMEEvent', cmeEventSchema),
  Connection: mongoose.model('Connection', connectionSchema),
  Meeting: mongoose.model('Meeting', meetingSchema),
  SearchHistory: mongoose.model('SearchHistory', searchHistorySchema),
  DrugView: mongoose.model('DrugView', drugViewSchema),
  SystemConfig: mongoose.model('SystemConfig', systemConfigSchema),
  AuditLog: mongoose.model('AuditLog', auditLogSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  File: mongoose.model('File', fileSchema)
};

// ================================
// 9. INDEXES FOR PERFORMANCE
// ================================

// User indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

// Company indexes
companySchema.index({ companyId: 1 });
companySchema.index({ status: 1 });

// Doctor indexes
doctorSchema.index({ userId: 1 });
doctorSchema.index({ licenseNumber: 1 });
doctorSchema.index({ specialization: 1 });

// MR indexes
medicalRepresentativeSchema.index({ userId: 1 });
medicalRepresentativeSchema.index({ companyId: 1 });
medicalRepresentativeSchema.index({ employeeId: 1 });

// Drug indexes
drugSchema.index({ companyId: 1, status: 1 });
drugSchema.index({ specialization: 1 });
drugSchema.index({ symptoms: 1 });
drugSchema.index({ drugName: 'text', brandName: 'text', indications: 'text' });

// CME Event indexes
cmeEventSchema.index({ startDate: 1, endDate: 1 });
cmeEventSchema.index({ specializations: 1 });
cmeEventSchema.index({ status: 1 });

// Connection indexes
connectionSchema.index({ doctorId: 1, mrId: 1 });
connectionSchema.index({ status: 1 });

// Meeting indexes
meetingSchema.index({ mrId: 1, scheduledDate: 1 });
meetingSchema.index({ doctorId: 1, scheduledDate: 1 });

// Search history indexes
searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ searchType: 1, createdAt: -1 });

// Drug view indexes
drugViewSchema.index({ drugId: 1, createdAt: -1 });
drugViewSchema.index({ userId: 1, createdAt: -1 });

// Notification indexes
notificationSchema.index({ recipientId: 1, status: 1, createdAt: -1 });

// File indexes
fileSchema.index({ entityType: 1, entityId: 1 });
fileSchema.index({ uploadedBy: 1, createdAt: -1 });
