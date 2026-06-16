# SecureAuth Pro 🛡️

SecureAuth Pro is an enterprise-grade, high-performance Identity & Access Management (IAM) application built with React, Firebase, and Vite. It provides a production-ready authentication experience with a focus on session integrity, multi-device intelligence, and zero-trust security principles.

## 🏛️ Architecture Overview

SecureAuth Pro leverages a modern, modular architecture:
- **Frontend Framework**: React 19 optimized via Vite for lightning-fast HMR and production bundling.
- **Authentication Provider**: Firebase Auth utilizing SMS-based One-Time Passwords (OTP) with invisible reCAPTCHA integration.
- **State Management**: Context API (`useAppContext`, `useAuth`) orchestrates global state, eliminating prop drilling while keeping the component tree lean.
- **Styling & UI**: Tailwind CSS paired with Framer Motion for rich, performant glassmorphism aesthetics and complex route transitions.

## 🔐 Authentication Flow

1. **Initialization**: The application attempts to silently restore the Firebase authentication state.
2. **Identity Request**: Unauthenticated users navigate to `/login` to enter a validated 10-digit phone number.
3. **reCAPTCHA Verification**: Invisible reCAPTCHA v3 validates the user request before hitting Firebase servers.
4. **OTP Delivery**: Firebase dispatches a 6-digit SMS code.
5. **OTP Verification**: The `/verify` route presents a strict, masked input interface. Successful confirmation exchanges the OTP for a short-lived Firebase ID token and a long-lived refresh token.
6. **Route Protection**: The router captures the original requested URL (`location.state.from`), restoring the user's intended navigation path upon success.

## 🔄 Session Lifecycle

Sessions in SecureAuth Pro are tracked both by Firebase (cryptographically) and internally (for multi-device intelligence):
- **Creation**: Upon successful OTP validation, a unique `sessionId` and browser fingerprint are generated and stored in `sessionStorage` and `localStorage`.
- **Inactivity Monitoring**: The application actively listens for user interactions (mouse, keyboard, touch). If 12 hours (`INACTIVITY_LIMIT`) elapse without interaction, the session is aggressively terminated to prevent unauthorized access.
- **Restoration**: On page reload, the system verifies `localStorage` data against the `INACTIVITY_LIMIT` before trusting the session. Stale sessions are purged automatically.

## 📱 Multi-Device Strategy

SecureAuth Pro supports sophisticated concurrent session management:
- **Device Fingerprinting**: Captures user agent, OS, and hardware profile to uniquely identify devices.
- **Trusted Devices**: Users can mark specific hardware as "Trusted", persisting this status in `localStorage`. Trusted devices bypass certain secondary checks.
- **Remote Revocation**: The Security Dashboard allows users to monitor all active sessions globally and instantly revoke access to unrecognized or stale devices.

## ⚙️ Environment Setup

SecureAuth Pro relies on strict environment variable configuration. 

1. Copy the example configuration file:
   ```bash
   cp .env.example .env
   ```
2. Populate `.env` with your Firebase project credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
*Note: The application will fail gracefully and log a distinct error if required variables are missing.*

## 🛡️ Security Considerations

- **Secret Protection**: `.env` files are strictly gitignored. Configuration is injected at build time.
- **Temporal Dead Zone Prevention**: Critical authentication state cannot be accessed prior to initialization.
- **Cross-Site Scripting (XSS)**: Inputs are strictly typed and validated (e.g., numeric-only OTP parsing) before execution.
- **Local Storage Integrity**: Session objects stored in `localStorage` are continually validated against timestamp expiry limits; manual manipulation cannot bypass the 12-hour inactivity hard limit.
- **Error Handling**: A top-level `ErrorBoundary` intercepts unexpected rendering failures, logging them silently while displaying a professional fallback UI to prevent data leakage.

## 🧪 Testing Strategy

SecureAuth Pro enforces strict quality gates through comprehensive automated testing:
- **Unit & Component Testing**: Powered by **Vitest** and **React Testing Library**. Core utilities (e.g., session age formatters) and critical UI components (e.g., the `Button` component loading states) are individually isolated and tested for behavioral correctness.
- **End-to-End (E2E) Testing**: **Playwright** simulates real user journeys, ensuring critical flows—such as authenticated redirection, phone number validation, and logout mechanics—work flawlessly across modern browsers.

Run tests locally:
```bash
npm run test          # Run Vitest (Unit/Component)
npm run test:e2e      # Run Playwright (E2E Headless)
npm run test:e2e:headed # Run Playwright (E2E Visible)
```

## 📈 Monitoring & Logging Strategy

To guarantee operational visibility without compromising user privacy, we utilize an abstraction layer:
- **`monitoring.js`**: A centralized wrapper currently set up to capture exceptions and route failures. It contains hooks ready for instant integration with platforms like **Sentry** or **Crashlytics**.
- **`logger.js`**: A distinct logging utility that separates developer diagnostics from production noise. It filters `info` and `warn` levels in production unless overridden by feature flags.
- **Health Checks**: A startup diagnostic script (`healthCheck.js`) validates environment variables, `localStorage` availability, and feature flag statuses before rendering the React tree.

## 🔄 CI/CD Pipeline

Continuous Integration is orchestrated via **GitHub Actions** (`.github/workflows/ci.yml`). Every push and pull request triggers a pipeline that:
1. Installs dependencies (`npm ci`).
2. Enforces code quality (`npm run lint`).
3. Executes the unit test suite (`npm run test -- --run`).
4. Validates production compilation (`npm run build`).

A failure at any step halts the deployment process, ensuring that only verified, secure code reaches production.

## 🚀 Operational Readiness Checklist

Before deploying SecureAuth Pro to a live production environment (e.g., Vercel, Netlify, or AWS), ensure the following:
- [ ] **Environment Variables**: Inject all `VITE_FIREBASE_*` variables into your hosting provider's CI/CD settings.
- [ ] **Feature Flags**: Toggle `VITE_ENABLE_MONITORING` and `VITE_ENABLE_ANALYTICS` based on your compliance requirements.
- [ ] **Authorized Domains**: Whitelist your production domain in the Firebase Console (Authentication > Settings > Authorized domains).
- [ ] **Security Rules**: Deploy strict Firestore/Storage security rules if utilizing backend databases.

## ⚠️ Known Limitations

- **Rate Limiting**: Firebase Phone Authentication imposes strict rate limits on SMS delivery. During heavy testing, you may encounter `auth/too-many-requests`. It is recommended to use test phone numbers configured in the Firebase Console for automated pipelines.
- **Session Intelligence Granularity**: The current OS/Device detection relies on `navigator.userAgent` parsing. While effective, it may classify specialized or highly masked browsers generically.

## 📜 License

Distributed under the MIT License.
