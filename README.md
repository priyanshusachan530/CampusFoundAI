<div align="center">

# 🎓 CampusLinkAI

**Intelligent Lost & Found Platform for University Campuses**  
Automated multi-attribute matching, anti-fraud ownership verification, real-time Firebase cloud synchronization, and security custody tracking.

<br />

<a href="https://campus-found-ai.vercel.app" target="_blank" rel="noopener noreferrer">
  <img src="https://img.shields.io/badge/🚀%20LIVE%20DEMO-VISIT%20CAMPUSFOUNDAI-0070F3?style=for-the-badge&logo=vercel&logoColor=white&labelColor=000000" alt="Visit CampusFoundAI Live Demo" height="54" />
</a>

<br /><br />

[![Live URL](https://img.shields.io/badge/Live%20URL-campus--found--ai.vercel.app-0070F3?style=flat-square&logo=vercel&logoColor=white)](https://campus-found-ai.vercel.app)
[![Firebase](https://img.shields.io/badge/Cloud%20Database-Firebase%20Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://campusfoundai.firebaseapp.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**🌐 Live Application:** [https://campus-found-ai.vercel.app](https://campus-found-ai.vercel.app)

</div>

---

## Features

- **Real-Time Cloud Synchronization**: Powered by Firebase Firestore on the 100% Free Spark Tier. Reports, claims, and matches update instantly across devices without page reloads.
- **1-Click Google Sign-In & Email Auth**: Secure student and faculty authentication using Firebase Authentication (`@university.edu` support) and fast offline demo mode accounts.
- **Intelligent Attribute Matching**: Correlation engine that compares categories, colors, brands, timestamps, and campus locations to calculate similarity match scores.
- **Anti-Fraud Ownership Verification**: Two-step verification using secret questions, serial numbers, passwords, and admin review approval workflows.
- **Multi-Role Access Control**:
  - **Students & Faculty**: Report lost/found items, track active reports, file claims, browse catalog.
  - **Campus Security / Staff**: Custody logging, location checkpoints, item status verification.
  - **Administrator**: Comprehensive audit dashboard, claim adjudications, analytics, and data management.
- **Data Portability**: Instant one-click JSON database backup and restore from the user interface.

---

## Tech Stack

- **Frontend**: React 19, React Router v7, Tailwind CSS v4
- **Animations & Icons**: Motion, Lucide React
- **Cloud Backend**: Firebase 12 (Firestore, Firebase Authentication, Analytics)
- **Tooling & Bundler**: Vite 6, TypeScript

---

## Getting Started Locally

### 1. Prerequisites
- Node.js 18+ installed on your system
- npm or bun

### 2. Installation
Clone or extract the project folder, then run:

```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Deploy / Update on Vercel

You can extract this code and update your Vercel project with zero friction.

### Option A: Via GitHub (Recommended for automatic updates)
1. Extract or download the project files to your laptop.
2. Commit and push the files to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: integrate Firebase cloud database and Google sign-in"
   git push origin main
   ```
3. Vercel will automatically detect the push and deploy the update.

### Option B: Via Vercel CLI (Direct deploy from your laptop)
1. In your terminal inside the project folder:
   ```bash
   npm i -g vercel
   vercel --prod
   ```

### Environment Variables on Vercel
In your **Vercel Dashboard > Project Settings > Environment Variables**, add your Firebase project credentials (found in **Firebase Console > Project Settings > General**):

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `your-app.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage Bucket URL | `your-app.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging Sender ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | `1:123456789012:web:...` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics Measurement ID (Optional) | `G-...` |
| `VITE_ADMIN_EMAIL` | Admin Email (Optional) | `admin@university.edu` |

> **Important for Google Sign-In on Vercel**:  
> In your [Firebase Console](https://console.firebase.google.com/) under **Authentication > Settings > Authorized domains**, add `campus-found-ai.vercel.app` so Google Sign-In popup works seamlessly.

---

## Firebase Firestore Rules

Deploy the included `firestore.rules` file to your Firebase project:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{itemId} {
      allow read: if true;
      allow write: if true;
    }
    match /claims/{claimId} {
      allow read: if true;
      allow write: if true;
    }
    match /matches/{matchId} {
      allow read: if true;
      allow write: if true;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if true;
    }
    match /notifications/{notifId} {
      allow read, write: if true;
    }
  }
}
```

