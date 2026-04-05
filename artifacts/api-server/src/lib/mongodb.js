import mongoose from "mongoose";
import { logger } from "./logger";
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/foodrush";
export async function connectMongoDB() {
    try {
        await mongoose.connect(MONGO_URI);
        logger.info({ uri: MONGO_URI.replace(/\/\/.*@/, "//***@") }, "Connected to MongoDB");
    }
    catch (err) {
        logger.error({ err }, "Failed to connect to MongoDB");
        process.exit(1);
    }
}
export default mongoose;
