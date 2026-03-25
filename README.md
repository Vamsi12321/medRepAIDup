# MedAware - Drug Awareness Platform

A modern, professional web application for healthcare professionals to stay updated with drug launches, CME events, and medical insights.

## Features

### 🏠 Home Dashboard
- Recently launched drugs with beautiful gradient cards
- Personalized drug recommendations
- Upcoming CME events
- Specialty-based filtering
- Real-time statistics

### 🔍 Drug Search
- Keyword and semantic search modes
- Advanced filtering by specialty
- Comprehensive drug database
- Beautiful table view with ratings
- Quick access to drug details

### 💊 Drug Details
- Complete drug information (indication, dosage, side effects)
- Downloadable documents (brochures, clinical trials, presentations)
- AI-powered Q&A chatbot for drug queries
- Interactive chat interface with example questions
- Professional document management

### 📅 CME Events
- Upcoming and past events
- Event registration system
- CME credits tracking
- Event recordings access
- Speaker information
- Attendee statistics

### 💬 Chat
- Real-time messaging with colleagues
- Conversation management
- Unread message indicators
- Professional chat interface
- Medical representative communication

### 👤 Profile
- Personal information management
- Activity statistics
- Recent activity tracking
- Notification preferences
- Professional credentials display

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Language**: JavaScript
- **UI Features**: Glass morphism, gradient effects, smooth animations

## Getting Started

1. Navigate to the project directory:
```bash
cd drug-awareness-platform
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
drug-awareness-platform/
├── app/
│   ├── page.js                    # Home Dashboard
│   ├── drug-search/
│   │   └── page.js               # Drug Search
│   ├── drug-details/
│   │   └── [id]/
│   │       └── page.js           # Drug Details with AI Chat
│   ├── cme-events/
│   │   └── page.js               # CME Events
│   ├── chat/
│   │   └── page.js               # Chat System
│   ├── profile/
│   │   └── page.js               # User Profile
│   ├── layout.js                 # Root Layout
│   └── globals.css               # Global Styles
├── components/
│   └── Navbar.js                 # Navigation Component
└── README.md
```

## Design Features

- **Modern Gradient Design**: Vibrant gradient colors throughout the interface
- **Clean White Background**: Professional light theme with subtle gradients
- **3D Card Effects**: Enhanced hover animations with scale and shadow effects
- **Smooth Transitions**: Fluid animations using cubic-bezier timing
- **Responsive Design**: Optimized for all device sizes
- **Professional UI**: Medical-grade interface with attention to detail
- **Color-Coded Sections**: Each feature area has its own gradient theme
- **Interactive Elements**: Engaging hover states and visual feedback
- **Status Indicators**: Real-time status badges and online indicators
- **Accessibility**: Semantic HTML and proper contrast ratios

## Future Enhancements

- Backend integration with real database
- RAG (Retrieval Augmented Generation) for AI responses
- Twilio integration for real-time chat
- User authentication and authorization
- Advanced search with embeddings
- Real-time notifications
- Video conferencing for CME events
- Document upload and management

## Static Data

Currently, the application uses static data for demonstration. All features are fully functional with mock data including:
- 8+ drugs in the database
- 4 upcoming CME events
- 3 past events with recordings
- Multiple chat conversations
- Complete user profile

## License

MIT License - feel free to use this for your projects!
