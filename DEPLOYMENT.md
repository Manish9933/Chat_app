# 🚀 Deployment Guide: Signature Chat

This guide provides step-by-step instructions for deploying Signature Chat to various production environments.

## 📡 Backend Deployment (Node.js + Socket.IO)

**IMPORTANT**: Because this app uses Socket.io, it requires a persistent server connection. **Standard Vercel/Netlify serverless functions are not recommended for the backend.**

### 🌐 Render (Recommended)
1. Sign up at [Render.com](https://render.com/).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the **Root Directory** to `server`.
5. Set the **Build Command** to `npm install`.
6. Set the **Start Command** to `node server.js` (or `npm start`).
7. In the **Environment** tab, add your variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ENCRYPTION_KEY`
   - `CLIENT_URL` (Your frontend URL)
8. Deploy the service.

### ☁️ AWS (Elastic Beanstalk / EC2)
1. Create a new Elastic Beanstalk environment (Node.js).
2. Upload the contents of the `/server` folder as a ZIP (or use AWS CLI).
3. Set environment variables in the AWS console.
4. Ensure Port 5000 (or your configured `PORT`) is open in the Security Group.

---

## 🎨 Frontend Deployment (React + Vite)

### ▲ Vercel
1. Sign up at [Vercel](https://vercel.com/).
2. "Add New Project" and import your GitHub repo.
3. In the "Project Settings":
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_BACKEND_URL`: The URL of your deployed backend (e.g., `https://your-backend.onrender.com`).
5. Click **Deploy**.

### ◈ Netlify
1. Sign up at [Netlify](https://www.netlify.com/).
2. "Add new site" -> "Import from GitHub".
3. Settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
4. Add `VITE_BACKEND_URL` in "Site configuration" -> "Environment variables".

---

## 🛠 Database & Media Setup

### 🍃 MongoDB Atlas
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. "Connect" -> "Drivers" -> Copy the Connection String.
3. Replace `<password>` with your database user password.

### ☁️ Cloudinary
1. Create an account at [Cloudinary](https://cloudinary.com/).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the Dashboard.
3. These go into your backend environment variables.

---

## 🔒 Production Best Practices
1. **Security**: Ensure `NODE_ENV` is set to `production` in your backend variables.
2. **CORS**: Set `CLIENT_URL` strictly to your frontend domain to prevent unauthorized access.
3. **Encryption**: Generate a unique 64-character hex string for `ENCRYPTION_KEY`. Do not share this.
