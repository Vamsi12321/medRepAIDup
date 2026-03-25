# API Endpoints Guide for Drug Awareness Platform

## Authentication Endpoints

### POST /api/auth/register
Register a new user
```json
{
  "email": "doctor@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "doctor",
  "phone": "+1234567890"
}
```

### POST /api/auth/login
User login
```json
{
  "email": "doctor@example.com",
  "password": "password123"
}
```

### POST /api/auth/logout
User logout (invalidate token)

### POST /api/auth/forgot-password
Request password reset
```json
{
  "email": "doctor@example.com"
}
```

### POST /api/auth/reset-password
Reset password with token
```json
{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

## User Management Endpoints

### GET /api/users/profile
Get current user profile

### PUT /api/users/profile
Update user profile
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### GET /api/users/:id
Get user by ID (admin only)

### GET /api/users
Get all users with filters (admin only)
Query params: `role`, `status`, `page`, `limit`

### PUT /api/users/:id/status
Update user status (admin only)
```json
{
  "status": "active"
}
```

## Company Management Endpoints

### GET /api/companies
Get all companies (admin only)

### POST /api/companies
Create new company (admin only)
```json
{
  "name": "PharmaTech Solutions",
  "email": "contact@pharmatech.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Medical Plaza",
    "city": "Healthcare City",
    "state": "HC",
    "zipCode": "12345",
    "country": "USA"
  }
}
```

### GET /api/companies/:id
Get company by ID

### PUT /api/companies/:id
Update company (admin only)

### DELETE /api/companies/:id
Delete company (admin only)

### GET /api/companies/:id/drug-form-config
Get company's drug form configuration

### PUT /api/companies/:id/drug-form-config
Update company's drug form configuration (admin only)
```json
{
  "fields": [
    {
      "id": "custom_field_1",
      "name": "Custom Field",
      "type": "text",
      "required": true,
      "locked": false
    }
  ]
}
```

## Drug Management Endpoints

### GET /api/drugs
Get drugs with filters
Query params: `companyId`, `specialization`, `status`, `search`, `symptoms`, `page`, `limit`

### POST /api/drugs
Create new drug (company users only)
```json
{
  "drugName": "Tirzepatide",
  "brandName": "Mounjaro",
  "genericName": "Tirzepatide",
  "drugClass": "GLP-1 receptor agonist",
  "specialization": ["diabetology"],
  "indications": "Treatment of type 2 diabetes",
  "dosage": "5 mg once weekly",
  "customFields": {
    "custom_field_1": "Custom value"
  }
}
```

### GET /api/drugs/:id
Get drug by ID

### PUT /api/drugs/:id
Update drug (company users only)

### DELETE /api/drugs/:id
Delete drug (company users only)

### GET /api/drugs/:id/versions
Get drug version history

### POST /api/drugs/search/symptoms
Search drugs by symptoms
```json
{
  "symptoms": ["chest pain", "high blood pressure"],
  "specialization": "cardiology"
}
```

## Doctor Profile Endpoints

### GET /api/doctors/profile
Get doctor profile

### PUT /api/doctors/profile
Update doctor profile
```json
{
  "licenseNumber": "MD123456",
  "specialization": ["cardiology", "diabetology"],
  "hospital": {
    "name": "City General Hospital",
    "address": {
      "street": "456 Hospital Ave",
      "city": "Medical City",
      "state": "MC",
      "zipCode": "67890"
    }
  },
  "experience": 10
}
```

### GET /api/doctors
Get all doctors (for MRs and companies)
Query params: `specialization`, `city`, `state`, `page`, `limit`

### GET /api/doctors/:id/connections
Get doctor's MR connections

## Medical Representative Endpoints

### GET /api/mrs/profile
Get MR profile

### PUT /api/mrs/profile
Update MR profile
```json
{
  "employeeId": "EMP001",
  "territory": {
    "name": "North Region",
    "cities": ["City A", "City B"],
    "zipCodes": ["12345", "67890"]
  }
}
```

### GET /api/mrs/:id/assigned-doctors
Get MR's assigned doctors

### POST /api/mrs/:id/assign-doctor
Assign doctor to MR
```json
{
  "doctorId": "doctor_object_id",
  "relationship": "primary"
}
```

### GET /api/mrs/:id/performance
Get MR performance metrics

## Connection Management Endpoints

### POST /api/connections/request
Send connection request
```json
{
  "targetUserId": "user_object_id",
  "message": "Would like to connect"
}
```

### GET /api/connections
Get user's connections
Query params: `status`, `page`, `limit`

### PUT /api/connections/:id/respond
Respond to connection request
```json
{
  "action": "accept" // or "decline"
}
```

### DELETE /api/connections/:id
Remove connection

## Meeting Management Endpoints

### GET /api/meetings
Get meetings
Query params: `status`, `type`, `startDate`, `endDate`, `page`, `limit`

### POST /api/meetings
Schedule new meeting
```json
{
  "title": "Product Discussion",
  "type": "visit",
  "doctorId": "doctor_object_id",
  "scheduledDate": "2024-03-20T10:00:00Z",
  "location": "doctor_office",
  "drugsDiscussed": ["drug_object_id"]
}
```

### GET /api/meetings/:id
Get meeting details

### PUT /api/meetings/:id
Update meeting

### PUT /api/meetings/:id/complete
Mark meeting as completed
```json
{
  "actualDate": "2024-03-20T10:30:00Z",
  "duration": 45,
  "outcome": "positive",
  "notes": "Productive discussion",
  "samplesProvided": [
    {
      "drugId": "drug_object_id",
      "quantity": 10
    }
  ]
}
```

## CME Events Endpoints

### GET /api/cme-events
Get CME events
Query params: `specialization`, `eventType`, `startDate`, `endDate`, `page`, `limit`

### POST /api/cme-events
Create CME event (company users only)
```json
{
  "title": "Cardiology Update 2024",
  "description": "Latest developments in cardiology",
  "eventType": "webinar",
  "startDate": "2024-04-15T14:00:00Z",
  "endDate": "2024-04-15T16:00:00Z",
  "cmeCredits": 2,
  "specializations": ["cardiology"],
  "venue": {
    "type": "online",
    "onlineLink": "https://zoom.us/meeting/123"
  }
}
```

### GET /api/cme-events/:id
Get CME event details

### POST /api/cme-events/:id/register
Register for CME event

### GET /api/cme-events/:id/attendees
Get event attendees (organizers only)

## File Management Endpoints

### POST /api/files/upload
Upload file
```
Content-Type: multipart/form-data
file: [file]
category: "drug_brochure"
associatedWith: {
  "entityType": "drug",
  "entityId": "drug_object_id"
}
```

### GET /api/files/:id
Get file details

### GET /api/files/:id/download
Download file

### DELETE /api/files/:id
Delete file

## Search & Analytics Endpoints

### GET /api/search/drugs
Search drugs
Query params: `q`, `type`, `specialization`, `symptoms`, `page`, `limit`

### POST /api/analytics/drug-view
Track drug view
```json
{
  "drugId": "drug_object_id",
  "viewDuration": 120,
  "sectionsViewed": ["overview", "dosage", "side_effects"]
}
```

### GET /api/analytics/dashboard
Get analytics dashboard data (admin only)

## Notification Endpoints

### GET /api/notifications
Get user notifications
Query params: `status`, `type`, `page`, `limit`

### PUT /api/notifications/:id/read
Mark notification as read

### PUT /api/notifications/read-all
Mark all notifications as read

## Admin Endpoints

### GET /api/admin/dashboard
Get admin dashboard statistics

### GET /api/admin/system-config
Get system configuration

### PUT /api/admin/system-config
Update system configuration
```json
{
  "key": "max_file_size",
  "value": 10485760,
  "description": "Maximum file upload size in bytes"
}
```

### GET /api/admin/audit-logs
Get audit logs
Query params: `userId`, `action`, `resource`, `startDate`, `endDate`, `page`, `limit`

### POST /api/admin/bulk-import/drugs
Bulk import drugs from Excel
```
Content-Type: multipart/form-data
file: [excel_file]
companyId: "company_object_id"
```

## Error Response Format

All API endpoints return errors in this format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

## Success Response Format

All API endpoints return success responses in this format:
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- Authentication endpoints: 5 requests per minute per IP
- General API endpoints: 100 requests per minute per user
- File upload endpoints: 10 requests per minute per user
- Search endpoints: 50 requests per minute per user