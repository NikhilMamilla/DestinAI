# DestinAI | Professional AI Travel & Booking Concierge

DestinAI (formerly Kiddoo) is a high-fidelity, real-time travel planning dashboard. It features a "Night-Map" dark mode aesthetic, integrated AI trip navigation, and a global hotel concierge.

## 🏝️ Key Features
- **Intelligent Planner**: Multi-stop routing with AI feedback (using Llama-3.3-70b).
- **Hotel Concierge**: Search and book hotels globally with real-time Firestore sync.
- **Travel Persona**: Personalized experiences based on 'Travel Style' (Backpacker, Explorer, Elite) and Currency.
- **Living Dashboard**: Real-time stay durations, trip countdowns, and 'Live' activity feeds.
- **Security First**: Full environment variable management and Firebase security rules protection.

## 🚀 Getting Started

### 1. Installation
```powershell
npm install
```

### 2. Environment Setup
Rename `.env.example` to `.env` and add your keys:
- `VITE_GOOGLE_MAPS_API_KEY` (Google Cloud)
- `VITE_GROQ_API_KEY` (Groq API for Llama)
- `VITE_FIREBASE_*` (Firebase Console Settings)

### 3. Usage
```powershell
npm run dev
```

### 4. Firestore Deploy
```powershell
firebase deploy --only firestore:rules,firestore:indexes
```

## 🛠️ Stack
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Database**: Firebase Firestore (Real-time snapshots)
- **Auth**: Firebase Authentication (Email/Google)
- **AI**: Groq SDK (Llama 3.3 Large Language Model)
- **Maps**: Google Maps JavaScript API

---
*Created with high-fidelity modernization focus.*
