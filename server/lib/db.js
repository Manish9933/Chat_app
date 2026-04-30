import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("📌 Database Connected");
    });

    mongoose.connection.on("error", (err) => {
      console.log("❌ DB Error:", err.message);
    });

    console.log("Attempting to connect to DB with URI:", process.env.MONGODB_URI ? "Found" : "UNDEFINED");
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.log("❌ Failed to connect DB:", err.message);
    console.log("URI was:", process.env.MONGODB_URI);
    process.exit(1);
  }
};
