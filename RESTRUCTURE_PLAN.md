# Application Restructure Plan

## New Folder Structure

```
drug-awareness-platform/
├── app/
│   ├── company/                    # Company Portal
│   │   ├── overview/
│   │   │   └── page.js            ✅ Created
│   │   ├── drug-management/
│   │   │   └── page.js            ✅ Created
│   │   ├── cme-events/
│   │   │   └── page.js            ✅ Created
│   │   ├── doctors/
│   │   │   └── page.js            ⏳ To Create
│   │   └── medical-reps/
│   │       └── page.js            ⏳ To Create
│   │
│   ├── doctor/                     # Doctor Portal
│   │   ├── home/
│   │   │   └── page.js            ⏳ To Create
│   │   ├── drug-search/
│   │   │   └── page.js            ⏳ To Create
│   │   ├── cme-events/
│   │   │   └── page.js            ⏳ To Create
│   │   ├── network/
│   │   │   └── page.js            ⏳ To Create
│   │   └── profile/
│   │       └── page.js            ⏳ To Create
│   │
│   ├── login/
│   │   └── page.js                ✅ Updated
│   └── page.js                     ⏳ Redirect page
│
├── components/
│   ├── company/
│   │   └── CompanyNavbar.js       ✅ Created
│   └── doctor/
│       └── DoctorNavbar.js        ✅ Created
```

## What's Been Created

### Company Portal
1. ✅ CompanyNavbar component with navigation
2. ✅ Overview page with stats and quick actions
3. ✅ Drug Management page with table and modals
4. ✅ CME Events page with event cards

### Doctor Portal
1. ✅ DoctorNavbar component with notifications

### Login
1. ✅ Updated to enable Company role
2. ✅ Redirects to /company/overview for company
3. ✅ Redirects to /doctor/home for doctor

## What Needs to Be Created

### Company Portal
- Doctors management page
- Medical Reps management page

### Doctor Portal
- Home page (dashboard)
- Drug Search page
- CME Events page
- Network page
- Profile page

### Root Page
- Redirect logic based on role

## Key Features Per Page

### Company Pages
- All pages have CompanyNavbar
- All pages check for company role
- Modals for add/edit operations
- Bulk upload functionality
- Tables for data management

### Doctor Pages
- All pages have DoctorNavbar with notifications
- All pages check for doctor role
- User-friendly interface
- Interactive features

Would you like me to continue creating the remaining pages?
