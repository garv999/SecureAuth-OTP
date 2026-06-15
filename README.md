# SecureAuth-OTP 🛡️

SecureAuth-OTP is a modern, high-performance phone authentication web application built with **React**, **Firebase**, and **Framer Motion**. It provides a polished, production-ready user experience for verifying identities via SMS-based OTP (One-Time Password).

![SecureAuth-OTP Banner](https://via.placeholder.com/1200x400/0f172a/3b82f6?text=SecureAuth-OTP+Authentication+Flow)

## ✨ Features

- **📱 Firebase Phone Authentication:** Secure SMS-based verification using real-world authentication protocols.
- **🛡️ Protected Routes:** Robust navigation system preventing unauthorized access to the dashboard.
- **🔄 Session Persistence:** Automatically restores user sessions using Firebase `onAuthStateChanged`.
- **⚡ Modern UI/UX:** A beautiful dark-themed interface built with **Tailwind CSS**.
- **🎬 Smooth Animations:** Interactive page transitions and micro-interactions powered by **Framer Motion**.
- **🧩 Reusable Components:** Clean, modular code structure with dedicated components for inputs, buttons, and layouts.
- **📱 Responsive Design:** Fully optimized for mobile, tablet, and desktop screens.
- **🔔 Real-time Feedback:** Polished toast notifications for success, errors, and system status.
- **🕵️ Invisible reCAPTCHA:** Enhanced security without interrupting the user flow.

## 🛠️ Tech Stack

- **Frontend:** React 19 (Vite)
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Auth (Phone)
- **Navigation:** React Router 7
- **Animations:** Framer Motion
- **Icons:** React Icons
- **Notifications:** React Hot Toast

## 📂 Project Structure

```text
src/
├── assets/             # Static assets (images, icons)
├── components/         
│   ├── common/         # Reusable UI (Buttons, Skeletons)
│   └── auth/           # Auth specific (PhoneInput, OtpInput)
├── hooks/              # Custom hooks (useAuth for session management)
├── pages/              # Routed pages (Login, Verify, Dashboard)
├── services/           # Firebase configuration
├── styles/             # Global CSS & Tailwind directives
├── App.jsx             # Root component with routing & toast config
└── main.jsx            # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- npm or yarn
- A Firebase Project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/SecureAuth-OTP.git
   cd SecureAuth-OTP
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   Create a `.env` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Enable Phone Auth in Firebase Console:**
   - Go to **Authentication** > **Sign-in method**.
   - Enable **Phone**.
   - (Optional) Add test phone numbers (e.g., `+91 9837043593` with code `123456`).

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔒 Security Features

- **Environment Variables:** All sensitive Firebase keys are managed via `.env` and never committed to version control.
- **Client-side Verification:** Strict validation for phone numbers and 6-digit OTP codes.
- **Firebase Security Rules:** Authentication state is verified on every secure route access.

## 🎓 Learning Outcomes

- Implementing complex authentication flows in React.
- Mastering Firebase Auth state listeners and persistence.
- Creating professional UI animations with Framer Motion.
- Managing non-serializable objects in React state (DataCloneError prevention).
- Building scalable, recruiter-friendly folder structures.

## 🔮 Future Enhancements

- [ ] Multi-factor authentication (MFA) support.
- [ ] User profile management (Name, Avatar).
- [ ] Multi-country code support with search.
- [ ] Dark/Light mode toggle.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
