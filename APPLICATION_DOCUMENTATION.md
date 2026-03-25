# Drug Awareness Platform - Complete Application Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [Features & Functionality](#features--functionality)
5. [User Roles](#user-roles)
6. [Page-by-Page Breakdown](#page-by-page-breakdown)
7. [Design System](#design-system)
8. [Authentication Flow](#authentication-flow)
9. [Data Structure](#data-structure)
10. [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

**Application Name:** MedRepAI - Drug Awareness Platform

**Purpose:** A comprehensive web platform designed for healthcare professionals (doctors, medical representatives, pharmaceutical companies, and administrators) to stay updated with new drug launches, access medical information, participate in CME events, and network with other healthcare professionals.

**Target Audience:**
- Doctors (Primary users - fully functional)
- Medical Representatives (Coming soon)
- Pharmaceutical Companies (Coming soon)
- Administrators (Coming soon)

**Key Value Proposition:**
- Real-time updates on new drug launches
- Comprehensive drug information database
- AI-powered drug information assistant
- Professional networking for healthcare professionals
- CME (Continuing Medical Education) event management
- Secure document access and downloads

---

## 💻 Technology Stack

### Frontend Framework
- **Next.js 16.1.6** (App Router)
  - React 19.2.3
  - Server Components & Client Components
  - File-based routing
  - Dynamic routes for drug details

### Styling
- **Tailwind CSS 4.x**
  - Custom gradient designs
  - Responsive utilities
  - Custom animations
  - @tailwindcss/postcss for Next.js 16 compatibility

### Language
- **JavaScript** (No TypeScript)
- ES6+ features
- Client-side state management with React hooks

### Development Tools
- npm package manager
- Next.js development server
- Hot module replacement

---

## 🏗️ Application Architecture

### Project Structure
```
drug-awareness-platform/
├── app/
│   ├── layout.js                 # Root layout with metadata
│   ├── page.js                   # Home dashboard (protected)
│   ├── globals.css               # Global styles & animations
│   ├── login/
│   │   └── page.js              # Login page with role selection
│   ├── drug-search/
│   │   └── page.js              # Drug search & filtering
│   ├── drug-details/
│   │   └── [id]/
│   │       └── page.js          # Dynamic drug details with AI chat
│   ├── cme-events/
│   │   └── page.js              # CME events management
│   ├── doctor-network/
│   │   └── page.js              # Social networking for doctors
│   ├── profile/
│   │   └── page.js              # User profile & settings
│   └── not-found.js             # 404 page
├── components/
│   ├── Navbar.js                # Main navigation component
│   ├── Header.js                # (Legacy - not in use)
│   └── Sidebar.js               # (Legacy - not in use)
├── public/
│   └── [SVG assets]             # Static assets
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
└── jsconfig.json                # Path aliases (@/components)
```

### Routing Strategy
- **App Router** (Next.js 13+ convention)
- File-based routing
- Dynamic routes: `/drug-details/[id]`
- Client-side navigation with `next/link`
- Protected routes with localStorage authentication check

---

## ✨ Features & Functionality

### 1. Authentication System
**Status:** ✅ Fully Functional (Frontend only)

**Features:**
- Role-based login (4 roles: Doctor, MR, Company, Admin)
- Only Doctor role is currently active
- Email/password authentication (mock)
- Remember me checkbox
- Forgot password link (UI only)
- Login animation with loading state
- Logout animation with confirmation
- localStorage-based session management
- Automatic redirect to login if not authenticated

**Animation Details:**
- Login: 1.5-second animation with bouncing pill icon, pulsing dots, gradient background
- Logout: 1-second animation with waving hand icon, red/pink gradient
- Smooth fade-in effects using custom CSS keyframes

### 2. Home Dashboard
**Status:** ✅ Fully Functional

**Features:**
- Personalized welcome message
- Quick stats (24 new drugs, 8 CME events)
- Recently launched drugs (3 cards with gradient designs)
- Recommended drugs based on specialty (3 cards)
- Upcoming CME events (3 cards)
- Quick action buttons (Search Drugs, View Events)
- Protected route (requires authentication)

**Data Displayed:**
- Drug name, indication, company, launch date
- Drug ratings with star icons
- Event type, date, attendee count
- Color-coded cards by category

### 3. Drug Search
**Status:** ✅ Fully Functional

**Features:**
- Search bar with placeholder text
- Sorting: A-Z alphabetically
- View toggle: Grid view / List view
- 15 drugs in database
- Drug cards showing:
  - Name, company, category
  - Indication, dosage
  - Rating (out of 5 stars)
  - "New" badge for recent launches
- Click to view details
- Responsive grid layout (1-3 columns)
- Hover effects with scale and shadow

**Removed Features:**
- Category filter (removed per user request)
- Specialty filter (removed per user request)
- Pricing information (removed per user request)
- Prescription requirements (removed per user request)
- Cost information (removed per user request)
- "In Stock" badges (removed per user request)
- Relevance sorting (removed per user request)

### 4. Drug Details Page
**Status:** ✅ Fully Functional

**Features:**
- Dynamic routing: `/drug-details/[id]`
- Comprehensive drug information:
  - Name, rating, description
  - Indication, drug class
  - Dosage, side effects
  - Manufacturer
- Document downloads (4 types):
  - Drug Brochure (PDF)
  - Clinical Trial Report (PDF)
  - Presentation Slides (PPT)
  - Safety Data Sheet (PDF)
- AI-powered Q&A chatbot:
  - Ask questions about the drug
  - Example questions provided
  - Chat history display
  - User messages (purple gradient)
  - AI responses (white with border)
  - Loading state with "AI is thinking..."
  - 1.5-second simulated response time
- Color-coded information cards
- Gradient header with drug icon

### 5. CME Events
**Status:** ✅ Fully Functional

**Features:**
- Two tabs: Upcoming Events & Past Events
- Stats cards:
  - Upcoming events count
  - Recordings available count
- Upcoming events (4 events):
  - Title, description, date, time
  - Speaker information
  - Event type (Webinar, Conference, Workshop, Symposium)
  - Attendee count
  - Registration button
  - Color-coded by event type
- Past events (3 events):
  - Title, date, event type
  - View count
  - Recording badge
  - Watch recording button
- Responsive grid layout

**Removed Features:**
- CME Credits display (removed from event cards)
- CME Credits Earned stat (removed from profile)
- Total Attended stat (removed per user request)

### 6. Doctor Network
**Status:** ✅ Fully Functional

**Features:**
- Six tabs:
  1. **Feed** - Social feed with posts
  2. **My Network** - Connected doctors
  3. **Requests** - Connection requests
  4. **Discover** - Suggested connections
  5. **Messages** - Chat with doctors and MRs
  6. **MR Network** - Medical representatives

**Feed Tab:**
- Create post modal with text input
- Post cards with:
  - Author name, specialty, timestamp
  - Post content
  - Reactions (Like, Celebrate, Support, Insightful)
  - Comment and share buttons
  - Reaction counts

**My Network Tab:**
- Connected doctors list
- Profile pictures, names, specialties
- Hospital affiliations
- Connection status
- Message and View Profile buttons

**Requests Tab:**
- Pending connection requests
- Accept/Decline buttons
- Mutual connections count

**Discover Tab:**
- Suggested connections
- Connect button
- Profile information

**Messages Tab:**
- Conversation list with:
  - Contact names
  - Last message preview
  - Timestamp
  - Online/offline status
  - Unread message badges
- Full chat interface:
  - Message history
  - Different colors for doctors (purple) vs MRs (orange)
  - Message input with send button
  - Typing indicator

**MR Network Tab:**
- Medical representatives list
- Company information
- Territory coverage
- Products count
- Online/offline status
- Connect and View Products buttons

### 7. Profile Page
**Status:** ✅ Fully Functional

**Features:**
- Profile card with:
  - Avatar with initials
  - Online status indicator
  - Name, specialty
  - Contact information (email, phone)
  - Hospital affiliation
  - Years of experience
  - Medical license number
  - Edit profile button
- Activity statistics (3 stats):
  - Drugs Reviewed (48)
  - Events Attended (12)
  - Conversations (36)
- Recent activity feed (5 items):
  - Action description
  - Timestamp
  - Color-coded icons
- Preferences section:
  - Email notifications toggle
  - SMS alerts toggle
  - Weekly digest toggle
- Responsive layout (1-3 columns)

**Removed Features:**
- CME Credits Earned stat (removed per user request)

---

## 👥 User Roles

### 1. Doctor (Active)
**Status:** ✅ Fully Functional

**Access:**
- All features available
- Full navigation access
- Can search drugs
- Can view drug details
- Can register for CME events
- Can network with other doctors
- Can message other doctors and MRs
- Can manage profile

### 2. Medical Representative (Coming Soon)
**Status:** 🚧 Planned

**Planned Features:**
- Product portfolio management
- Doctor visit tracking
- Sample distribution
- Territory management
- Performance analytics

### 3. Pharmaceutical Company (Coming Soon)
**Status:** 🚧 Planned

**Planned Features:**
- Drug launch management
- Marketing campaign tracking
- MR team management
- Sales analytics
- Document distribution

### 4. Administrator (Coming Soon)
**Status:** 🚧 Planned

**Planned Features:**
- User management
- Content moderation
- System analytics
- Role permissions
- Platform configuration

---

## 📄 Page-by-Page Breakdown

### Login Page (`/login`)
**Purpose:** Authentication and role selection

**Components:**
- Role selection cards (4 roles)
- Login form (email, password)
- Remember me checkbox
- Forgot password link
- Register link
- Error message display
- Login animation overlay

**User Flow:**
1. User selects role (only Doctor is active)
2. User enters email and password
3. User clicks "Sign In as Doctor"
4. Loading animation appears (1.5 seconds)
5. Credentials stored in localStorage
6. Redirect to home page

**Validation:**
- Role must be "doctor"
- Email and password required
- Error messages for invalid inputs

### Home Page (`/`)
**Purpose:** Dashboard with overview of platform features

**Sections:**
1. Welcome banner with quick stats
2. Recently launched drugs (3 cards)
3. Recommended drugs (3 cards)
4. Upcoming CME events (3 cards)

**Protected Route:**
- Checks localStorage for userRole
- Redirects to /login if not authenticated

**Navigation:**
- Links to drug search
- Links to CME events
- Links to drug details

### Drug Search Page (`/drug-search`)
**Purpose:** Search and browse drug database

**Features:**
- Search input
- Sort dropdown (A-Z)
- View toggle (Grid/List)
- 15 drug cards
- Responsive grid

**Drug Data:**
- Name, company, category
- Indication, dosage
- Rating, status (New/Approved)
- Link to details page

### Drug Details Page (`/drug-details/[id]`)
**Purpose:** Detailed drug information and AI chat

**Sections:**
1. Drug header with rating
2. Drug information card
3. Documents & resources card
4. AI chat interface

**Dynamic Routing:**
- Uses Next.js dynamic routes
- ID parameter from URL
- Falls back to drug ID 1 if not found

**AI Chat:**
- Question input
- Example questions
- Chat history
- Loading state
- Simulated AI responses

### CME Events Page (`/cme-events`)
**Purpose:** Browse and register for medical education events

**Tabs:**
1. Upcoming Events (4 events)
2. Past Events (3 events with recordings)

**Stats:**
- Upcoming events count
- Recordings available count

**Event Data:**
- Title, description, date, time
- Speaker, type, attendees
- Registration/watch buttons

### Doctor Network Page (`/doctor-network`)
**Purpose:** Social networking for healthcare professionals

**Tabs:**
1. Feed - Posts and interactions
2. My Network - Connected doctors
3. Requests - Connection requests
4. Discover - Suggested connections
5. Messages - Chat interface
6. MR Network - Medical representatives

**Social Features:**
- Create posts
- React to posts
- Send connection requests
- Message other users
- View profiles

### Profile Page (`/profile`)
**Purpose:** User profile management and activity tracking

**Sections:**
1. Profile card with personal info
2. Activity statistics (3 stats)
3. Recent activity feed (5 items)
4. Preferences with toggles

**Data:**
- Name: Dr. Sharma
- Specialty: Cardiology
- Email: dr.sharma@hospital.com
- Phone: +91 98765 43210
- Hospital: City General Hospital
- Experience: 15 years
- License: MCI-12345678

---

## 🎨 Design System

### Color Palette

**Primary Gradients:**
- Indigo to Purple: `from-indigo-600 to-purple-600`
- Blue to Cyan: `from-blue-500 to-cyan-500`
- Purple to Pink: `from-purple-500 to-pink-500`
- Green to Emerald: `from-green-500 to-emerald-500`
- Orange to Red: `from-orange-500 to-red-500`

**Background:**
- Main: White (`bg-white`)
- Subtle gradient: `bg-gradient-to-br from-gray-50 via-white to-blue-50`
- Card backgrounds: White with borders

**Text Colors:**
- Primary: `text-gray-900`
- Secondary: `text-gray-600`
- Accent: `text-indigo-600`

### Typography

**Font Family:**
- System font stack (antialiased)

**Font Sizes:**
- Headings: `text-4xl` (36px), `text-3xl` (30px), `text-2xl` (24px)
- Body: `text-lg` (18px), `text-base` (16px)
- Small: `text-sm` (14px), `text-xs` (12px)

**Font Weights:**
- Bold: `font-bold` (700)
- Semibold: `font-semibold` (600)
- Medium: `font-medium` (500)

### Spacing

**Padding:**
- Cards: `p-8` (32px), `p-6` (24px)
- Buttons: `px-8 py-4` (32px x 16px)
- Sections: `py-10` (40px)

**Margins:**
- Sections: `mb-10` (40px), `mb-8` (32px)
- Elements: `mb-6` (24px), `mb-4` (16px)

**Gaps:**
- Grids: `gap-8` (32px), `gap-6` (24px)
- Flex: `space-x-4` (16px), `space-y-4` (16px)

### Border Radius

**Rounded Corners:**
- Large: `rounded-3xl` (24px)
- Medium: `rounded-2xl` (16px)
- Small: `rounded-xl` (12px)

### Shadows

**Box Shadows:**
- Large: `shadow-2xl`
- Medium: `shadow-xl`
- Small: `shadow-lg`
- Hover: `hover:shadow-2xl`

### Animations

**Transitions:**
- All properties: `transition-all`
- Duration: `duration-300`
- Timing: `ease-in-out`

**Transforms:**
- Hover scale: `hover:scale-105`
- Hover translate: `hover:-translate-y-2`
- Rotate: `hover:rotate-12`

**Custom Animations:**
- Fade in: `animate-fadeIn` (0.5s)
- Bounce: `animate-bounce`
- Pulse: `animate-pulse`
- Spin: `animate-spin`

### Components

**Cards:**
- White background
- Rounded corners (3xl)
- Shadow (2xl)
- Border (gray-100)
- Hover effects (scale, shadow)

**Buttons:**
- Primary: Gradient background, white text
- Secondary: Border, colored text
- Hover: Scale up, increase shadow
- Disabled: Opacity 50%, no pointer

**Inputs:**
- Border: 2px solid gray-200
- Focus: Ring indigo-500
- Rounded: xl
- Padding: px-6 py-4

**Badges:**
- Gradient background
- Rounded: xl
- Padding: px-4 py-2
- Font: bold

---

## 🔐 Authentication Flow

### Login Process

1. **User arrives at login page** (`/login`)
2. **User selects role** (Doctor, MR, Company, Admin)
   - Only Doctor is active
   - Other roles show "Coming Soon" badge
3. **User enters credentials**
   - Email address
   - Password
   - Optional: Remember me
4. **User clicks "Sign In"**
   - Validation checks:
     - Role must be "doctor"
     - Email and password required
   - If invalid: Error message displayed
5. **Login animation starts**
   - Button shows loading spinner
   - Full-screen overlay appears
   - Bouncing pill icon
   - "Logging you in..." message
   - 1.5-second delay
6. **Credentials stored**
   - `localStorage.setItem("userRole", "doctor")`
   - `localStorage.setItem("userEmail", email)`
7. **Redirect to home page** (`/`)

### Protected Routes

**All pages except `/login` are protected:**

```javascript
useEffect(() => {
  const userRole = localStorage.getItem("userRole");
  if (!userRole) {
    router.push("/login");
  }
}, [router]);
```

### Logout Process

1. **User clicks "Logout" button** in navbar
2. **Logout animation starts**
   - Full-screen overlay appears
   - Waving hand icon
   - "Logging you out..." message
   - Red/pink gradient background
   - 1-second delay
3. **Credentials removed**
   - `localStorage.removeItem("userRole")`
   - `localStorage.removeItem("userEmail")`
4. **Redirect to login page** (`/login`)

### Session Management

**Current Implementation:**
- localStorage-based (client-side only)
- No expiration
- No server-side validation
- No JWT tokens

**Future Implementation:**
- Server-side session management
- JWT tokens
- Refresh tokens
- Session expiration
- Secure HTTP-only cookies

---

## 📊 Data Structure

### Drug Object
```javascript
{
  id: 1,
  name: "CardioSafe",
  indication: "Hypertension",
  drugClass: "Calcium Channel Blocker",
  dosage: "5mg daily",
  sideEffects: "Dizziness, fatigue, headache",
  company: "XYZ Pharma",
  rating: 4.9,
  description: "CardioSafe is a novel calcium channel blocker...",
  category: "Cardiology",
  status: "New" | "Approved",
  color: "from-rose-500 via-pink-500 to-fuchsia-500"
}
```

### Event Object
```javascript
{
  id: 1,
  title: "Hypertension Management Webinar",
  date: "March 25, 2026",
  time: "10:00 AM - 12:00 PM",
  type: "Webinar" | "Conference" | "Workshop" | "Symposium",
  attendees: 245,
  speaker: "Dr. John Smith",
  description: "Learn the latest guidelines...",
  color: "from-blue-500 via-cyan-500 to-teal-500",
  icon: "🎥"
}
```

### Document Object
```javascript
{
  id: 1,
  name: "Drug Brochure",
  type: "PDF" | "PPT",
  size: "2.4 MB",
  icon: "📄",
  color: "from-red-500 to-orange-500"
}
```

### User Profile Object
```javascript
{
  name: "Dr. Sharma",
  specialty: "Cardiology",
  email: "dr.sharma@hospital.com",
  phone: "+91 98765 43210",
  hospital: "City General Hospital",
  experience: "15 years",
  license: "MCI-12345678"
}
```

### Activity Stat Object
```javascript
{
  label: "Drugs Reviewed",
  value: 48,
  icon: "💊",
  color: "from-blue-500 to-cyan-500"
}
```

### Chat Message Object
```javascript
{
  type: "user" | "ai",
  text: "Is this drug safe for elderly patients?"
}
```

### Post Object
```javascript
{
  id: 1,
  author: "Dr. Patel",
  specialty: "Cardiology",
  time: "2 hours ago",
  content: "Just attended an excellent webinar...",
  reactions: {
    like: 24,
    celebrate: 8,
    support: 5,
    insightful: 12
  },
  comments: 7,
  shares: 3
}
```

---

## 🚀 Future Enhancements

### Backend Integration

**Priority: High**

**Features:**
- RESTful API or GraphQL
- Database (PostgreSQL, MongoDB)
- User authentication (JWT)
- Session management
- Data persistence
- Real-time updates (WebSockets)

**Endpoints:**
- `/api/auth/login`
- `/api/auth/logout`
- `/api/drugs`
- `/api/drugs/:id`
- `/api/events`
- `/api/users/profile`
- `/api/messages`
- `/api/posts`

### AI Integration

**Priority: High**

**Features:**
- RAG (Retrieval Augmented Generation)
- Vector database (Pinecone, Weaviate)
- OpenAI API integration
- Drug information embeddings
- Semantic search
- Context-aware responses
- Citation of sources

**Implementation:**
- Embed drug documents
- Store in vector database
- Query with user questions
- Generate responses with GPT-4
- Include source citations

### Real-time Chat

**Priority: Medium**

**Features:**
- Twilio integration
- WebSocket connections
- Real-time message delivery
- Typing indicators
- Read receipts
- File sharing
- Voice/video calls

### Advanced Search

**Priority: Medium**

**Features:**
- Elasticsearch integration
- Fuzzy search
- Autocomplete
- Search suggestions
- Filters (multiple)
- Faceted search
- Search history

### Document Management

**Priority: Medium**

**Features:**
- File upload
- Cloud storage (AWS S3)
- Document versioning
- Access control
- Download tracking
- Preview generation
- OCR for PDFs

### Video Conferencing

**Priority: Low**

**Features:**
- Zoom/WebRTC integration
- Live CME events
- Screen sharing
- Recording
- Q&A sessions
- Polls and surveys

### Mobile App

**Priority: Low**

**Features:**
- React Native app
- iOS and Android
- Push notifications
- Offline mode
- Biometric authentication
- Camera integration

### Analytics Dashboard

**Priority: Low**

**Features:**
- User engagement metrics
- Drug popularity tracking
- Event attendance analytics
- Network growth metrics
- Custom reports
- Data visualization

### Notification System

**Priority: Medium**

**Features:**
- Email notifications
- SMS alerts
- Push notifications
- In-app notifications
- Notification preferences
- Digest emails

### Multi-language Support

**Priority: Low**

**Features:**
- Internationalization (i18n)
- Multiple languages
- RTL support
- Currency conversion
- Date/time localization

---

## 📝 Development Notes

### Current Limitations

1. **No Backend:** All data is static and hardcoded
2. **No Database:** No data persistence
3. **Mock Authentication:** localStorage only, no security
4. **Static AI Responses:** Simulated, not real AI
5. **No File Uploads:** Document downloads are simulated
6. **No Real-time Features:** Messages are static
7. **Single User:** No multi-user support
8. **No Search Functionality:** Search is UI only

### Known Issues

1. **Authentication:** Not secure, easily bypassed
2. **Data Loss:** Refresh loses all state
3. **No Validation:** Form inputs not fully validated
4. **No Error Handling:** Network errors not handled
5. **No Loading States:** Some actions lack feedback
6. **No Pagination:** All data loaded at once
7. **No Caching:** No optimization for repeated requests

### Best Practices Followed

1. **Component Structure:** Modular, reusable components
2. **Naming Conventions:** Clear, descriptive names
3. **Code Organization:** Logical file structure
4. **Responsive Design:** Mobile-first approach
5. **Accessibility:** Semantic HTML, ARIA labels
6. **Performance:** Optimized images, lazy loading
7. **SEO:** Metadata, proper headings
8. **User Experience:** Smooth animations, clear feedback

### Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Setup

**Node.js:** v18+ recommended
**npm:** v9+ recommended
**Browser:** Chrome, Firefox, Safari, Edge (latest)

---

## 🎓 Learning Resources

### Next.js Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Gradient Generator](https://tailwindcss.com/docs/gradient-color-stops)
- [Animation](https://tailwindcss.com/docs/animation)

### React
- [React Docs](https://react.dev)
- [Hooks](https://react.dev/reference/react)
- [Client Components](https://react.dev/reference/react/use-client)

---

## 📞 Support & Contact

For questions or issues, please refer to:
- Project README.md
- Code comments
- Component documentation

---

**Last Updated:** March 9, 2026
**Version:** 1.0.0
**Status:** Development (Doctor role fully functional)
