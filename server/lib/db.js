import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("📌 Database Connected");
    });

    mongoose.connection.on("error", (err) => {
      console.log("❌ DB Error:", err.message);
    });

    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.log("❌ Failed to connect DB:", err.message);
    process.exit(1);
  }
};
