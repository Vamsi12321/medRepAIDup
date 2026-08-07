// Sample Data for Drug Awareness Platform MongoDB

// Sample Companies
const sampleCompanies = [
  {
    companyId: "company001",
    name: "PharmaTech Solutions",
    email: "contact@pharmatech.com",
    phone: "+1-555-0123",
    address: {
      street: "123 Medical Plaza",
      city: "Healthcare City",
      state: "HC",
      zipCode: "12345",
      country: "USA"
    },
    website: "https://pharmatech.com",
    description: "Leading pharmaceutical company specializing in diabetes and cardiovascular medications",
    status: "active",
    drugFormConfig: {
      fields: [
        // Default locked fields
        { id: "drug_name", name: "Drug Name", type: "text", required: true, locked: true },
        { id: "brand_name", name: "Brand Name", type: "text", required: true, locked: true },
        { id: "generic_name", name: "Generic Name", type: "text", required: false, locked: true },
        { id: "drug_class", name: "Drug Class", type: "text", required: false, locked: true },
        { id: "company_id", name: "Company ID", type: "text", required: true, locked: true },
        { id: "status", name: "Status", type: "select", required: true, locked: true, options: ["Active", "Inactive", "Pending"] },
        // Custom fields for this company
        { id: "specialization", name: "Specialization", type: "multiselect", required: true, options: ["cardiology", "diabetology", "neurology", "oncology"] },
        { id: "indications", name: "Indications", type: "textarea", required: true },
        { id: "dosage", name: "Dosage", type: "text", required: true },
        { id: "side_effects", name: "Side Effects", type: "textarea", required: false },
        { id: "contraindications", name: "Contraindications", type: "textarea", required: false },
        { id: "launch_date", name: "Launch Date", type: "date", required: true },
        { id: "brochure_url", name: "Brochure PDF", type: "file", required: false }
      ]
    }
  },
  {
    companyId: "company002",
    name: "MediCorp Industries",
    email: "info@medicorp.com",
    phone: "+1-555-0456",
    address: {
      street: "456 Pharma Street",
      city: "Medicine Town",
      state: "MT",
      zipCode: "67890",
      country: "USA"
    },
    status: "active",
    drugFormConfig: {
      fields: [
        // Default locked fields (same for all companies)
        { id: "drug_name", name: "Drug Name", type: "text", required: true, locked: true },
        { id: "brand_name", name: "Brand Name", type: "text", required: true, locked: true },
        { id: "generic_name", name: "Generic Name", type: "text", required: false, locked: true },
        { id: "drug_class", name: "Drug Class", type: "text", required: false, locked: true },
        { id: "company_id", name: "Company ID", type: "text", required: true, locked: true },
        { id: "status", name: "Status", type: "select", required: true, locked: true, options: ["Active", "Inactive", "Pending"] },
        // Different custom fields for this company
        { id: "specialization", name: "Medical Specialty", type: "select", required: true, options: ["cardiology", "diabetology", "neurology"] },
        { id: "indications", name: "Treatment Indications", type: "textarea", required: true },
        { id: "mechanism_of_action", name: "Mechanism of Action", type: "textarea", required: true },
        { id: "dosage", name: "Recommended Dosage", type: "text", required: true },
        { id: "drug_interactions", name: "Drug Interactions", type: "textarea", required: false },
        { id: "launch_date", name: "Market Launch Date", type: "date", required: true }
      ]
    }
  }
];

// Sample Users
const sampleUsers = [
  {
    email: "admin@mrx.com",
    password: "$2b$10$hashedpassword", // In real app, hash with bcrypt
    role: "admin",
    firstName: "System",
    lastName: "Administrator",
    status: "active",
    emailVerified: true
  },
  {
    email: "sarah.johnson@hospital.com",
    password: "$2b$10$hashedpassword",
    role: "doctor",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+1-555-1001",
    status: "active",
    emailVerified: true
  },
  {
    email: "mike.chen@pharmatech.com",
    password: "$2b$10$hashedpassword",
    role: "mr",
    firstName: "Mike",
    lastName: "Chen",
    phone: "+1-555-1002",
    status: "active",
    emailVerified: true
  },
  {
    email: "lisa@medicorp.com",
    password: "$2b$10$hashedpassword",
    role: "company",
    firstName: "Lisa",
    lastName: "Rodriguez",
    phone: "+1-555-1003",
    status: "active",
    emailVerified: true
  }
];

// Sample Doctor Profiles
const sampleDoctors = [
  {
    // userId will be populated from the created user
    licenseNumber: "MD123456",
    specialization: ["cardiology", "diabetology"],
    hospital: {
      name: "City General Hospital",
      address: {
        street: "789 Hospital Ave",
        city: "Medical City",
        state: "MC",
        zipCode: "11111",
        country: "USA"
      },
      phone: "+1-555-2001"
    },
    experience: 12,
    education: [
      {
        degree: "MD",
        institution: "Harvard Medical School",
        year: 2010
      },
      {
        degree: "Residency in Cardiology",
        institution: "Johns Hopkins Hospital",
        year: 2014
      }
    ],
    preferences: {
      drugCategories: ["cardiovascular", "diabetes"],
      communicationPreferences: {
        email: true,
        sms: false,
        push: true
      }
    }
  }
];

// Sample Medical Representatives
const sampleMRs = [
  {
    // userId and companyId will be populated from created records
    employeeId: "EMP001",
    territory: {
      name: "North Region",
      regions: ["North East", "North West"],
      cities: ["Medical City", "Healthcare City"],
      zipCodes: ["11111", "12345"]
    },
    performance: {
      currentMonth: {
        visits: 25,
        newDoctorConnections: 3,
        samplesDistributed: 150,
        meetingsScheduled: 8
      },
      currentQuarter: {
        visits: 75,
        newDoctorConnections: 12,
        samplesDistributed: 450,
        meetingsScheduled: 24,
        salesTarget: 100000,
        salesAchieved: 85000
      }
    },
    joinDate: new Date("2023-01-15")
  }
];

// Sample Drugs
const sampleDrugs = [
  {
    drugName: "Tirzepatide",
    brandName: "Mounjaro",
    genericName: "Tirzepatide",
    drugClass: "GLP-1 receptor agonist",
    // companyId will be populated
    specialization: ["diabetology"],
    indications: "Treatment of type 2 diabetes mellitus in adults",
    mechanismOfAction: "Dual GIP and GLP-1 receptor agonist that improves glycemic control",
    dosage: "5 mg once weekly, may increase to 10 mg or 15 mg",
    sideEffects: ["nausea", "vomiting", "diarrhea", "decreased appetite"],
    contraindications: "Personal or family history of medullary thyroid carcinoma",
    drugInteractions: "May interact with insulin and insulin secretagogues",
    launchDate: new Date("2024-01-10"),
    symptoms: ["high blood sugar", "frequent urination", "excessive thirst", "fatigue"],
    customFields: {
      mechanism_of_action: "Dual GIP and GLP-1 receptor agonist",
      drug_interactions: "May interact with insulin and insulin secretagogues"
    },
    status: "active"
  },
  {
    drugName: "Atorvastatin",
    brandName: "Lipitor",
    genericName: "Atorvastatin Calcium",
    drugClass: "HMG-CoA reductase inhibitor",
    specialization: ["cardiology"],
    indications: "Hypercholesterolemia and cardiovascular disease prevention",
    mechanismOfAction: "Inhibits cholesterol synthesis by blocking HMG-CoA reductase enzyme",
    dosage: "10-80 mg once daily",
    sideEffects: ["muscle pain", "liver enzyme elevation", "headache", "digestive issues"],
    contraindications: "Active liver disease, pregnancy, breastfeeding",
    drugInteractions: "Warfarin, digoxin, cyclosporine, gemfibrozil",
    launchDate: new Date("2024-03-20"),
    symptoms: ["high cholesterol", "chest pain", "fatigue"],
    status: "active"
  },
  {
    drugName: "Metformin",
    brandName: "Glucophage",
    genericName: "Metformin HCl",
    drugClass: "Biguanide",
    specialization: ["diabetology"],
    indications: "Type 2 diabetes mellitus",
    mechanismOfAction: "Decreases hepatic glucose production and improves insulin sensitivity",
    dosage: "500-1000 mg twice daily with meals",
    sideEffects: ["diarrhea", "nausea", "metallic taste", "abdominal discomfort"],
    contraindications: "Severe kidney disease, metabolic acidosis, diabetic ketoacidosis",
    drugInteractions: "Alcohol, contrast agents, cimetidine",
    launchDate: new Date("2023-08-15"),
    symptoms: ["high blood sugar", "frequent urination", "excessive thirst", "fatigue"],
    status: "active"
  }
];

// Sample CME Events
const sampleCMEEvents = [
  {
    title: "Advances in Diabetes Management 2024",
    description: "Latest developments in diabetes treatment and patient care",
    eventType: "webinar",
    startDate: new Date("2024-04-15T14:00:00Z"),
    endDate: new Date("2024-04-15T16:00:00Z"),
    timezone: "EST",
    venue: {
      type: "online",
      onlineLink: "https://zoom.us/meeting/diabetes2024",
      platform: "Zoom"
    },
    cmeCredits: 2,
    accreditationBody: "American Medical Association",
    targetAudience: ["Primary Care Physicians", "Endocrinologists", "Diabetes Educators"],
    specializations: ["diabetology", "endocrinology"],
    registrationRequired: true,
    maxAttendees: 500,
    registrationDeadline: new Date("2024-04-10T23:59:59Z"),
    agenda: [
      {
        time: "14:00-14:15",
        topic: "Welcome and Introduction",
        speaker: "Dr. Jane Smith",
        duration: 15
      },
      {
        time: "14:15-15:00",
        topic: "New GLP-1 Receptor Agonists",
        speaker: "Dr. Michael Johnson",
        duration: 45
      },
      {
        time: "15:00-15:45",
        topic: "Continuous Glucose Monitoring Updates",
        speaker: "Dr. Sarah Wilson",
        duration: 45
      },
      {
        time: "15:45-16:00",
        topic: "Q&A Session",
        speaker: "All Speakers",
        duration: 15
      }
    ],
    speakers: [
      {
        name: "Dr. Jane Smith",
        title: "Chief of Endocrinology, Medical Center",
        bio: "Leading expert in diabetes management with 20+ years experience"
      },
      {
        name: "Dr. Michael Johnson",
        title: "Clinical Research Director",
        bio: "Specialist in diabetes medications and clinical trials"
      }
    ],
    status: "published"
  }
];

// Sample System Configuration
const sampleSystemConfig = [
  {
    key: "max_file_size",
    value: 10485760, // 10MB
    description: "Maximum file upload size in bytes",
    category: "limits",
    dataType: "number"
  },
  {
    key: "allowed_file_types",
    value: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
    description: "Allowed file types for upload",
    category: "limits",
    dataType: "array"
  },
  {
    key: "email_notifications_enabled",
    value: true,
    description: "Enable email notifications system-wide",
    category: "email",
    dataType: "boolean"
  },
  {
    key: "user_registration_enabled",
    value: true,
    description: "Allow new user registrations",
    category: "general",
    dataType: "boolean"
  },
  {
    key: "session_timeout",
    value: 3600, // 1 hour in seconds
    description: "User session timeout in seconds",
    category: "security",
    dataType: "number"
  }
];

// Export all sample data
module.exports = {
  sampleCompanies,
  sampleUsers,
  sampleDoctors,
  sampleMRs,
  sampleDrugs,
  sampleCMEEvents,
  sampleSystemConfig
};

// Database seeding script example
const seedDatabase = async () => {
  try {
    const mongoose = require('mongoose');
    const models = require('./mongodb-schemas');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/drug-awareness-platform');
    
    // Clear existing data (be careful in production!)
    await Promise.all([
      models.User.deleteMany({}),
      models.Company.deleteMany({}),
      models.Doctor.deleteMany({}),
      models.MedicalRepresentative.deleteMany({}),
      models.Drug.deleteMany({}),
      models.CMEEvent.deleteMany({}),
      models.SystemConfig.deleteMany({})
    ]);
    
    // Insert companies first
    const companies = await models.Company.insertMany(sampleCompanies);
    console.log(`Inserted ${companies.length} companies`);
    
    // Insert users
    const users = await models.User.insertMany(sampleUsers);
    console.log(`Inserted ${users.length} users`);
    
    // Find specific users for profile creation
    const doctorUser = users.find(u => u.role === 'doctor');
    const mrUser = users.find(u => u.role === 'mr');
    const pharmatechCompany = companies.find(c => c.companyId === 'company001');
    
    // Insert doctor profile
    if (doctorUser) {
      const doctorProfile = { ...sampleDoctors[0], userId: doctorUser._id };
      await models.Doctor.create(doctorProfile);
      console.log('Inserted doctor profile');
    }
    
    // Insert MR profile
    if (mrUser && pharmatechCompany) {
      const mrProfile = { 
        ...sampleMRs[0], 
        userId: mrUser._id, 
        companyId: pharmatechCompany._id 
      };
      await models.MedicalRepresentative.create(mrProfile);
      console.log('Inserted MR profile');
    }
    
    // Insert drugs
    const drugsWithCompany = sampleDrugs.map(drug => ({
      ...drug,
      companyId: pharmatechCompany._id,
      createdBy: users.find(u => u.role === 'company')._id
    }));
    const drugs = await models.Drug.insertMany(drugsWithCompany);
    console.log(`Inserted ${drugs.length} drugs`);
    
    // Insert CME events
    const cmeEventsWithCreator = sampleCMEEvents.map(event => ({
      ...event,
      createdBy: users.find(u => u.role === 'company')._id,
      organizer: {
        companyId: pharmatechCompany._id,
        organizerName: pharmatechCompany.name,
        contactEmail: pharmatechCompany.email
      }
    }));
    const cmeEvents = await models.CMEEvent.insertMany(cmeEventsWithCreator);
    console.log(`Inserted ${cmeEvents.length} CME events`);
    
    // Insert system config
    const configs = await models.SystemConfig.insertMany(sampleSystemConfig);
    console.log(`Inserted ${configs.length} system configurations`);
    
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Uncomment to run seeding
// seedDatabase();