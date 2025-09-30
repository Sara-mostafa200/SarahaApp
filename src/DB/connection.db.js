import mongoose from "mongoose";

const connectionDB = async () => {
  try {
    const testConnection = await mongoose.connect(
      process.env.DB_URL
    );
    console.log("db connected successfully");
  } catch (error) {
    console.log("db connected failed", { error });
  }
};

export default connectionDB;
