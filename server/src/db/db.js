import mongoose from "mongoose";
async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to the database successfully");
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
}
export default connectToDB;
