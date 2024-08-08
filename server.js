import "dotenv/config";
import app from "./app.js";
import { connectToDatabase } from "./config/db.js";

const startServer = async () => {
  try {
    const db = await connectToDatabase();
    app.locals.db = db;

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

startServer();
