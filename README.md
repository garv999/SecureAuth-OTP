# SecureAuth-OTP

A modern, professional phone authentication web application built with React, Firebase, and Framer Motion. This project demonstrates high-quality UI/UX practices, clean code structure, and robust authentication integration.

## 🚀 Features
- **Phone Authentication:** Secure OTP-based login via Firebase.
- **Modern UI:** Dark-themed, responsive design using Tailwind CSS.
- **Smooth Animations:** Interactive transitions powered by Framer Motion.
- **OTP Optimization:** Auto-focus inputs, resend timer, and validation.
- **Error Handling:** Graceful feedback for user errors and network issues.

## 🛠 Tech Stack
- **Frontend:** React (Vite)
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Auth
- **Animations:** Framer Motion
- **Icons:** React Icons
- **Type Checking:** Prop-types

## 📂 Project Structure
```text
src/
├── assets/             # Static assets (images, icons)
├── components/         
│   ├── common/         # Reusable UI components (Buttons, Inputs)
│   └── auth/           # Authentication-specific components
├── hooks/              # Custom React hooks (useAuth, useTimer)
├── pages/              # Top-level page components
├── services/           # Firebase configuration and business logic
├── utils/              # Helper functions and constants
├── styles/             # Custom CSS/Tailwind extensions
├── App.jsx             # Root component
└── main.jsx            # Entry point
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/SecureAuth-OTP.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 License
This project is licensed under the MIT License.
