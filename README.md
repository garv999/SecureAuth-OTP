# SecureAuth-OTP

### A production-ready, enterprise-grade multi-provider identity and access management system built with React, Firebase, and Vite.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Firestore](https://img.shields.io/badge/Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=orange)](https://firebase.google.com/docs/firestore)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev)
[![Vitest](https://img.shields.io/badge/Vitest-393939?style=for-the-badge&logo=vitest&logoColor=729B1B)](https://vitest.dev)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Live Demo**: [https://auth-otp-8693d.web.app](https://auth-otp-8693d.web.app)  
**GitHub Repository**: [https://github.com/garv999/SecureAuth-OTP](https://github.com/garv999/SecureAuth-OTP)

---

## Table of Contents

- [Highlights](#highlights)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Production Build](#production-build)
- [Testing](#testing)
- [Security Features](#security-features)
- [Performance Optimizations](#performance-optimizations)
- [Deployment](#deployment)
- [Project Status](#project-status)
- [Roadmap](#roadmap)
- [Future Improvements](#future-improvements)
- [Author](#author)
- [License](#license)

---

## Highlights

* **Multi-provider Authentication**: Seamless Google OAuth and secure SMS-based Phone OTP login with reCAPTCHA.
* **Account Linking & Merging**: Link multiple login methods (Google + Phone) to a unified profile record.
* **Enterprise Audit Center**: Read-only, append-only security logs with client-side filters, risk-level badges, and scroll-based pagination.
* **Active Session Management**: Real-time display of active browser sessions with single-click remote revocation.
* **Trusted Devices**: Hardware fingerprint trust mapping to secure account access.
* **Cross-Tab Synchronization**: Zero-reload sync of Theme, User settings, Trusted devices, Active sessions, and History logs across tabs via browser Storage Events.
* **Firebase Integration**: Leverages Firebase Authentication and Firestore subcollections.
* **Responsive UI**: Glassmorphism design and micro-animations with support for dark/light mode themes.
* **Firebase Hosting**: High-speed CDN hosting with optimized environment configurations.

---

## Screenshots

| Login Page | Dashboard Overview |
| --- | --- |
| ![Login Page](Screenshots/login_page.png) | ![Dashboard](Screenshots/Dashboard.png) |
| **Security Page** | **Activity Timeline** |
| ![Security Page](Screenshots/Security.png) | ![Activity Page](Screenshots/Activity_page.png) |
| **Audit Center** | **Settings Page** |
| ![Audit Center](Screenshots/audit_center.png) | ![Settings](Screenshots/settings.png) |

---

## Tech Stack

* **Frontend**: [React 19](https://react.dev) + [Vite](https://vitejs.dev)
* **Routing**: [React Router DOM v6](https://reactrouter.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Database & Auth**: [Firebase v10](https://firebase.google.com/) (Authentication & Cloud Firestore)
* **Styling**: CSS custom variables & CSS modules
* **Unit Testing**: [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/)
* **E2E Testing**: [Playwright](https://playwright.dev)
* **CI/CD**: GitHub Actions

---

## Project Architecture

```
                                +-------------------+
                                |    React Client   |
                                +---------+---------+
                                          |
                     +--------------------+--------------------+
                     |                                         |
                     v                                         v
           +---------+---------+                     +---------+---------+
           | Firebase Auth SDK |                     |  Firestore SDK    |
           +---------+---------+                     +---------+---------+
                     |                                         |
                     v (Token / OAuth)                         v (Query / Writes)
           +---------+---------+                     +---------+---------+
           | Firebase Auth API |                     |  Cloud Firestore  |
           +-------------------+                     +-------------------+
```

---

## Folder Structure

```
src/
├── assets/              # Static assets, styling tokens, and raw media
├── components/          # Reusable UI components (Buttons, Modals, Layout)
├── config/              # Application environment config files
├── constants/           # Global app configurations and thresholds
├── context/             # Global Context providers (AuthProvider, AppProvider)
├── hooks/               # Custom hooks (useAuth, useAppContext)
├── pages/               # Main route pages (Dashboard, Security, Activity, AuditCenter, etc.)
├── services/            # Backend service integrations (firebase, firestore)
└── utils/               # Formatting, normalization, and event metadata utilities
```

---

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/garv999/SecureAuth-OTP.git
   cd SecureAuth-OTP
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## Production Build

To compile the production-ready bundle:
```bash
npm run build
```

---

## Testing

The codebase includes component unit tests and E2E browser integration tests. All suites are currently green:

| Command | tool | Scope | status |
| --- | --- | --- | --- |
| `npm run lint` | ESLint | Code quality & static analysis | Passing |
| `npm run build` | Vite Compiler | Production compilation verification | Passing |
| `npm test -- --run` | Vitest | Component & state unit tests | Passing (15/15) |
| `npx playwright test` | Playwright | browser integration E2E tests | Passing (3/3) |

---

## Security Features

* **Firestore Security Rules**: Explicit rules defining identity isolation and append-only constraints for the `/users/{userId}/audit_logs` collections, preventing log deletion.
* **Immutable Audit Trail**: Prevent client-side updates and deletes on security logs, preserving auditing integrity.
* **Trusted Device Evaluation**: Cryptographic fallback protection checking device fingerprints against known identifiers.
* **Session Normalization**: Production-quality schema normalization validating structure and default options for incoming Firestore session objects.
* **Cross-Tab Synchronization**: Automated storage events listener checking data values before updating React state, preventing render/write feedback loops.
* **Storage Hardening**: Exception handlers validating and defaulting local storage fields to prevent crashes from malformed JSON.
* **Protected Routes**: Custom authentication middleware securing system views from unauthenticated redirects.

---

## Performance Optimizations

* **Vite HMR**: Lightning-fast hot module replacement.
* **Code Splitting**: Route-level dynamic imports.
* **Firestore Pagination**: Queries are explicitly paginated via `.limit()` and `.startAfter()` constraints in the Audit Center.
* **Optimized Session Loading**: Sessions query is capped via `.limit(50)` and ordered by `lastActivity` desc to avoid database scan overheads.
* **Centralized Event Metadata**: All event labels, classes, and icons are mapped inside a single `src/utils/eventMetadata.js` module to optimize bundles and reuse assets.

---

## Deployment

The project is configured for one-click deployment using **Firebase Hosting**. Hosting configurations, Firestore Security Rules, and database indexes are pre-configured:

1. Log in to Firebase CLI:
   ```bash
   firebase login
   ```

2. Deploy the application bundle and configurations:
   ```bash
   firebase deploy
   ```

Live Host: [https://auth-otp-8693d.web.app](https://auth-otp-8693d.web.app)

---

## Project Status

**Production Ready**
* [x] **Firebase Hosting** deployed
* [x] **Firestore Security Rules** configured
* [x] **GitHub Actions** CI/CD pipeline enabled
* [x] **Production build** compiles green
* [x] **ESLint** checks passing
* [x] **Unit tests** fully passing (15/15)
* [x] **E2E tests** fully passing (3/3)

---

## Roadmap

- [x] Google Authentication
- [x] Phone Authentication
- [x] Account Linking
- [x] Session Management
- [x] Trusted Devices
- [x] Audit Center
- [x] Cross-tab Synchronization
- [x] Firebase Hosting
- [ ] Cloud Functions
- [ ] Email Notifications
- [ ] Admin Dashboard

---

## Future Improvements

* **Cloud Functions**: Migrate audit logging and session termination to backend Cloud Functions.
* **Server-Side Revocation**: Implement server-side tokens revocation when a session is terminated.
* **Push Notifications**: Real-time push notifications for remote session registrations.
* **Device Geolocation**: Extract and display precise geographical details of active sessions.
* **Admin dashboard**: Multi-tenant admin overview interface to monitor user registrations.

---

## Author

**Garv Agarwal**

* GitHub: [@garv999](https://github.com/garv999)
* Live Demo: [https://auth-otp-8693d.web.app](https://auth-otp-8693d.web.app)

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
