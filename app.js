import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import mealRoutes from "./routes/mealRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import "dotenv/config"; // To load environment variables

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*", // Default to '*' if CORS_ORIGIN is not set
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use("/auth", authRoutes);
app.use("/meals", mealRoutes);
app.use("/orders", orderRoutes);

app.use((req, res) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  res.status(404).json({ message: "Not found" });
});

export default app;
