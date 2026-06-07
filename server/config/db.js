import mongoose from "mongoose";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();
// import colors from "colors";

// a mongoose stuf (mongoose.connect ....) return always a promise
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    // console.log(
    //   "MONGO_URI:",
    //   process.env.MONGO_URI
    // ); // Debugging line
    
    
    const conn = await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
    console.log(chalk.yellow(`Database Name: ${conn.connection.name}`));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
export default connectDB;
