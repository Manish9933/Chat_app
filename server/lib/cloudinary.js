import { v2 as cloudinary } from "cloudinary";
import "dotenv/config"; // Ensure variables are loaded

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn("⚠️ Cloudinary environment variables are missing! Uploads will fail.");
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.replace(/['"]/g, ""),
    api_key: process.env.CLOUDINARY_API_KEY?.replace(/['"]/g, ""),
    api_secret: process.env.CLOUDINARY_API_SECRET?.replace(/['"]/g, ""),
});

export default cloudinary;