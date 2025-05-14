import { connect } from "mongoose";

const connectDB = async () => {
  try {
    const conn = await connect(`${process.env.MONGODB_URI}`);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Optional: exit the app if DB fails
  }
};

export default connectDB;
