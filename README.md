<div align="center">
  
# FriendNest

**A modern social platform for connecting with language exchange partners through real-time chat, video calling, and community groups**

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Stream](https://img.shields.io/badge/Stream-Chat%20%26%20Video-FC521F?logo=stream)](https://getstream.io/)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & User Management
- **Secure User Registration**: Create account with email and password validation
- **Login/Logout**: JWT-based authentication with secure cookie storage
- **User Profile Setup**: Comprehensive onboarding process with profile customization
- **Profile Editing**: Edit your profile details including name, bio, languages, location, and profile picture
- **Random Avatar Generator**: Generate random profile pictures during onboarding and profile editing
- **Password Security**: Bcrypt encryption for secure password storage
- **Account Settings**: Comprehensive settings page with privacy controls, notification preferences, and account management

### 👥 Social Features
- **Friend Management**: Add, view, and manage friends on the platform
- **Remove Friends**: Unfriend users with a simple click and confirmation
- **Friend Requests**: Send and accept friend requests with real-time updates
- **User Recommendations**: Discover new language exchange partners based on your profile
- **Advanced Search**: Search users by name, native language, learning language, and location
- **Privacy Settings**: Control who can send you friend requests (everyone, friends of friends, or nobody)
- **Outgoing Requests Tracking**: See all friend requests you've sent

### 💬 Real-Time Communication

#### One-on-One Chat
- **Instant Messaging**: Real-time chat powered by Stream Chat
- **Chatroom Interface**: Split-view chatroom with friends list (22%) and chat area (78%)
- **Mobile Responsive**: Full-screen chat on mobile, split view on desktop
- **Message Features**:
  - Typing indicators
  - Message timestamps
  - Message search functionality
  - Unread message count badges
  - Read receipts (seen/read indicators)
- **Video Calling**: High-quality video calls using Stream Video SDK
- **Chat History**: Persistent message history and conversation threads
- **Online Status**: See when your friends are online

#### Group Chat & Communities
- **Language Learning Groups**: Create and join groups based on languages
- **Group Chat**: Real-time group messaging with automatic channel creation
- **Group Events**: Create, join, and manage group events/meetups
- **Group Management**:
  - Create groups with name, description, language, and cover image
  - Join/leave groups
  - View group members
  - Delete groups (creator only)
- **Event Management**:
  - Create events with title, description, date, and location
  - RSVP to events
  - View event attendees
  - Delete events (organizer only)

### 🔔 Notification System
- **Real-Time Notifications**: Instant notifications for:
  - Friend requests (incoming, accepted, removed)
  - New messages (with message preview)
  - Group chat messages
- **Notification Badge**: Unread notification count in navbar
- **Notification Page**: Centralized notifications page with:
  - Friend request notifications
  - Message notifications (clickable to navigate to chat)
  - Notification count tracking
  - Mark as read functionality
- **Smart Notification Logic**: 
  - No notifications when viewing active chat
  - Message count tracking per conversation
  - Automatic notification updates

### 🎨 User Experience
- **Responsive Design**: Fully responsive layout optimized for mobile, tablet, and desktop
- **Mobile Navigation**: Hamburger menu and drawer navigation for mobile devices
- **Theme Customization**: 30+ beautiful themes with dark mode support via DaisyUI
- **Modern UI**: Clean and intuitive interface built with Tailwind CSS and DaisyUI
- **Loading States**: Skeleton loaders and loading indicators for better UX
- **Error Handling**: Graceful error handling with user-friendly messages
- **Toast Notifications**: Beautiful toast notifications for user actions
- **Sticky Headers**: Chat headers remain visible while scrolling

### 🌍 Language Exchange Focus
- **Language Profiles**: Set your native and learning languages
- **Profile Customization**: Add bio, location, and profile pictures
- **Smart Matching**: Find partners based on language preferences
- **Language Badges**: Visual indicators showing native and learning languages with flag icons
- **Community Building**: Connect with people worldwide for language learning
- **Language-Based Groups**: Join groups focused on specific languages

### 📱 Pages & Navigation
- **Dashboard/Home**: View your friends and discover new learners
- **Friends Page**: Dedicated page to view all your friends
- **Profile Page**: View and edit your profile information
- **Search Page**: Advanced user search with filters
- **Notifications Page**: Manage friend requests, messages, and see activity
- **Chatroom Page**: Split-view chatroom interface
- **Chat Page**: Individual chat interface
- **Call Page**: Video calling interface
- **Groups Page**: Browse and create language learning groups
- **Group Detail Page**: View group details, members, and events
- **Group Chat Page**: Group messaging interface
- **Settings Page**: Account settings, privacy, and notification preferences

---

## 🛠 Tech Stack

### Frontend
- **React 19.0.0** - Modern UI library
- **Vite 6.3.1** - Fast build tool and dev server
- **React Router 7.5.1** - Client-side routing
- **TanStack Query 5.74.4** - Powerful data synchronization
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **DaisyUI 4.12.24** - Component library for Tailwind (30+ themes)
- **Stream Chat React 12.14.0** - Chat UI components
- **Stream Video React SDK 1.14.4** - Video calling functionality
- **Axios 1.8.4** - HTTP client
- **Zustand 5.0.3** - Lightweight state management
- **Lucide React 0.503.0** - Beautiful icon library
- **React Hot Toast 2.5.2** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express 4.21.0** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.13.2** - MongoDB object modeling
- **JWT (jsonwebtoken 9.0.2)** - Authentication tokens
- **bcryptjs 3.0.2** - Password hashing
- **Stream Chat 8.60.0** - Chat backend SDK
- **Cookie Parser 1.4.7** - Cookie parsing middleware
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 16.5.0** - Environment variable management

### Development Tools
- **Nodemon 3.1.9** - Auto-restart server in development
- **ESLint 9.22.0** - Code linting
- **PostCSS 8.5.3** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixing

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Stream.io account (for chat and video features)
- npm or yarn package manager

---

## 🔧 Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET_KEY=your_jwt_secret_key

# Stream.io Configuration
STEAM_API_KEY=your_stream_api_key
STEAM_API_SECRET=your_stream_api_secret
```

**Note**: The backend uses `STEAM_API_KEY` and `STEAM_API_SECRET` (not `STREAM_API_KEY`) to match the existing codebase.

### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
# Stream.io Configuration
VITE_STREAM_API_KEY=your_stream_api_key
```

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FriendNest.git
   cd FriendNest
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   - Create `.env` files in both `backend` and `frontend` directories
   - Add your configuration values (see [Environment Variables](#-environment-variables))

5. **Set up MongoDB**
   - Create a MongoDB database (local or cloud)
   - Update `MONGO_URI` in backend `.env` file

6. **Set up Stream.io**
   - Create an account at [getstream.io](https://getstream.io/)
   - Create a new app for Chat and Video
   - Copy your API key and secret to `.env` files
   - **Important**: Use `STEAM_API_KEY` and `STEAM_API_SECRET` in backend `.env`
   - Use `VITE_STREAM_API_KEY` in frontend `.env`

---

## 🎯 Usage

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:5001`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Start using FriendNest!

### Production Mode

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the production server**
   ```bash
   cd backend
   npm start
   ```

---

## 📁 Project Structure

```
FriendNest/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── chat.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── group.controller.js
│   │   │   └── notification.controller.js
│   │   ├── lib/              # Utility libraries
│   │   │   ├── db.js         # Database connection
│   │   │   └── stream.js    # Stream.io integration
│   │   ├── middleware/       # Express middleware
│   │   │   └── auth.middleware.js
│   │   ├── models/           # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── FriendRequest.js
│   │   │   ├── Group.js
│   │   │   └── Notification.js
│   │   ├── routes/           # API routes
│   │   │   ├── auth.route.js
│   │   │   ├── chat.route.js
│   │   │   ├── user.route.js
│   │   │   ├── group.route.js
│   │   │   └── notification.route.js
│   │   └── server.js         # Express server
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx (removed)
│   │   │   ├── FriendCard.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── CallButton.jsx
│   │   │   ├── MessageSearch.jsx
│   │   │   ├── ChatLoader.jsx
│   │   │   └── ...
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   ├── OnboardingPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── FriendsPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── ChatRoomPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── CallPage.jsx
│   │   │   ├── GroupsPage.jsx
│   │   │   ├── GroupDetailPage.jsx
│   │   │   └── GroupChatPage.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useAuthUser.js
│   │   │   ├── useLogout.js
│   │   │   └── useMessageNotifications.js
│   │   ├── lib/              # Utilities
│   │   │   ├── api.js
│   │   │   └── axios.js
│   │   ├── store/            # State management
│   │   │   └── useThemeStore.js
│   │   ├── constants/        # App constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/               # Static assets
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 📚 API Documentation

### Authentication Routes
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### User Routes
- `GET /api/users` - Get recommended users
- `GET /api/users/friends` - Get user's friends
- `GET /api/users/search` - Search users
- `POST /api/users/friend-request/:id` - Send friend request
- `PUT /api/users/friend-request/:id/accept` - Accept friend request
- `GET /api/users/friend-requests` - Get friend requests
- `PUT /api/users/profile` - Update profile
- `DELETE /api/users/friends/:id` - Remove friend
- `PUT /api/users/settings` - Update user settings

### Chat Routes
- `GET /api/chat/token` - Get Stream Chat token

### Group Routes
- `GET /api/groups` - Get all groups (with filters)
- `GET /api/groups/my-groups` - Get user's groups
- `GET /api/groups/:id` - Get group by ID
- `POST /api/groups` - Create a group
- `PUT /api/groups/:id` - Update group (creator only)
- `DELETE /api/groups/:id` - Delete group (creator only)
- `POST /api/groups/:id/join` - Join a group
- `POST /api/groups/:id/leave` - Leave a group
- `POST /api/groups/:id/events` - Create an event
- `POST /api/groups/:id/events/:eventId/join` - Join an event
- `POST /api/groups/:id/events/:eventId/leave` - Leave an event
- `DELETE /api/groups/:id/events/:eventId` - Delete an event (organizer only)

### Notification Routes
- `GET /api/notifications` - Get all notifications
- `POST /api/notifications/message` - Create message notification
- `PUT /api/notifications/:notificationId/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

---

## 🎯 Key Features Explained

### Chatroom Interface
The chatroom provides a split-view experience:
- **Desktop**: 22% friends list, 78% chat area
- **Mobile**: Full-screen chat when friend is selected
- **Features**: Unread message badges, typing indicators, message search
- **Toggle Sidebar**: Main sidebar can be hidden/shown with menu icon

### Groups & Communities
- **Automatic Channel Creation**: Stream Chat channels are automatically created when groups are created
- **Fallback Creation**: If a channel doesn't exist, it's created automatically when accessing group chat
- **Member Management**: Members are automatically added/removed from Stream channels when joining/leaving groups
- **Event System**: Full event management with RSVP functionality

### Notification System
- **Real-Time Updates**: Notifications appear immediately when messages are received
- **Smart Logic**: No notifications when viewing active chat
- **Message Counts**: Tracks unread message counts per conversation
- **Clickable Notifications**: Click message notifications to navigate to chat
- **Badge Updates**: Navbar badge updates in real-time (5-second refresh)

### Message Features
- **Typing Indicators**: See when friends are typing
- **Message Search**: Search through conversation history
- **Unread Counts**: Badge showing unread messages per friend
- **Read Receipts**: See when messages are read
- **Message Timestamps**: View when messages were sent

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- [Stream.io](https://getstream.io/) for providing excellent chat and video SDKs
- [Tailwind CSS](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com/) for beautiful UI components
- [Lucide](https://lucide.dev/) for the amazing icon library
- All the open-source contributors whose libraries made this project possible

---

<div align="center">

**Made with ❤️ for the language learning community**

[Report Bug](https://github.com/yourusername/FriendNest/issues) · [Request Feature](https://github.com/yourusername/FriendNest/issues) · [Documentation](https://github.com/yourusername/FriendNest/wiki)

</div>
