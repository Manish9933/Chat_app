# Signature Chat - Frontend

This is the React-based frontend for the Signature Chat platform. It features a premium Glassmorphism UI, real-time messaging, and WebRTC video/voice calls.

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   Create a `.env` file with `VITE_BACKEND_URL`.

3. Run the development server:
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack
- React 18 (Hooks, Context API)
- Vite (Build Tool)
- Tailwind CSS 4.0
- Socket.io-client
- Framer Motion
- Lucide React (Icons)

## 📁 Key Directories
- `src/components`: UI components organized by feature.
- `src/context`: Global state management for Auth, Chat, and Calls.
- `src/hooks`: Custom hooks for camera, audio, and speech recognition.
- `src/lib`: API client and socket initialization.
