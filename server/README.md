# Signature Chat - Backend

The robust Node.js/Express engine powering real-time communication, media management, and secure data storage.

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   Create a `.env` file based on `.env.example`.

3. Run the server:
   ```bash
   npm run server   # Development (Nodemon)
   npm start        # Production
   ```

## 🛠 Tech Stack
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.io (Real-time engine)
- Cloudinary (Media storage)
- JWT & bcryptjs (Security)
- Crypto (AES-256-GCM encryption at rest)

## 📁 Architecture
- `config/`: Centralized application constants.
- `controllers/`: Handles API request logic.
- `lib/`: Shared utilities (Socket, DB, Encryption).
- `models/`: Mongoose schemas.
- `routes/`: Express route definitions.
- `middleware/`: Authentication and security filters.
