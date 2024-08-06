import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const app = express();
const url = process.env.DATABASE;
const dbName = "food";
let db;

app.use(bodyParser.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const secretKey = process.env.SECRET_KEY;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = { email, password: hashedPassword };
    await db.collection("users").insertOne(newUser);
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Failed to register user" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await db.collection("users").findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign({ email: user.email }, secretKey, {
      expiresIn: "1h",
    });
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: "Failed to login" });
  }
});

app.get("/meals", async (req, res) => {
  console.log(url);
  try {
    const meals = await db.collection("meals").find().toArray();
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch meals" });
  }
});

app.post("/orders", async (req, res) => {
  const orderData = req.body.order;

  if (
    orderData === null ||
    orderData.items === null ||
    orderData.items.length === 0
  ) {
    return res.status(400).json({ message: "Missing data." });
  }

  if (
    orderData.customer.email === null ||
    !orderData.customer.email.includes("@") ||
    orderData.customer.name === null ||
    orderData.customer.name.trim() === "" ||
    orderData.customer.street === null ||
    orderData.customer.street.trim() === "" ||
    orderData.customer["postal-code"] === null ||
    orderData.customer["postal-code"].trim() === "" ||
    orderData.customer.city === null ||
    orderData.customer.city.trim() === ""
  ) {
    return res.status(400).json({
      message:
        "Missing data: Email, name, street, postal code or city is missing.",
    });
  }

  try {
    const newOrder = {
      ...orderData,
      status: "pending",
    };
    await db.collection("orders").insertOne(newOrder);
    res.status(201).json({ message: "Order created!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order" });
  }
});

// Complete Order
app.post("/orders/:id/complete", authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const result = await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(id) }, { $set: { status: "completed" } });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order marked as completed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete order" });
  }
});

// Delete Order
app.delete("/orders/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const result = await db
      .collection("orders")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete order" });
  }
});

app.get("/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await db.collection("orders").find().toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.post("/meals", authenticateToken, async (req, res) => {
  const mealData = req.body; // Directly get the body
  console.log(mealData);

  // Validate the meal data
  if (
    !mealData ||
    !mealData.name ||
    !mealData.name.trim() ||
    !mealData.description ||
    !mealData.description.trim() ||
    !mealData.price ||
    isNaN(mealData.price) ||
    !mealData.image ||
    !mealData.image.startsWith("http")
  ) {
    return res.status(400).json({
      message:
        "Missing or invalid data: Name, description, price, or image URL is missing or invalid.",
    });
  }

  try {
    const newMeal = {
      name: mealData.name.trim(),
      description: mealData.description.trim(),
      price: parseFloat(mealData.price),
      image: mealData.image,
    };

    await db.collection("meals").insertOne(newMeal);
    res.status(201).json({ message: "Meal created successfully!" });
  } catch (err) {
    console.error("Failed to create meal:", err);
    res.status(500).json({ message: "Failed to create meal" });
  }
});

// Update meal by ID
app.put("/meals/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const mealData = req.body; // Get mealData directly from req.body

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (
    !mealData.name ||
    mealData.name.trim() === "" ||
    !mealData.description ||
    mealData.description.trim() === "" ||
    !mealData.price ||
    isNaN(mealData.price)
  ) {
    return res.status(400).json({
      message:
        "Missing data: Name, description or price is missing or invalid.",
    });
  }

  try {
    // Prepare update data
    const updateData = { ...mealData };

    // Check if imageUrl is provided and update accordingly
    if (mealData.imageUrl) {
      updateData.imageUrl = mealData.imageUrl;
    }

    const result = await db
      .collection("meals")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.status(200).json({ message: "Meal updated successfully" });
  } catch (err) {
    console.error(err); // Log error details for debugging
    res.status(500).json({ message: "Failed to update meal" });
  }
});

app.delete("/meals/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const result = await db
      .collection("meals")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.status(200).json({ message: "Meal deleted successfully" });
  } catch (err) {
    console.error("Error deleting meal:", err); // Additional logging
    res.status(500).json({ message: "Failed to delete meal" });
  }
});

app.use((req, res) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  res.status(404).json({ message: "Not found" });
});

const startServer = async () => {
  try {
    const client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to MongoDB");

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

startServer();

// mongodb+srv://maruf509599:103vuttpBKyL87e1@cluster0.a5hbucg.mongodb.net/
// mongodb+srv://maruf509599:103vuttpBKyL87e1@cluster0.a5hbucg.mongodb.net/food?retryWrites=true&w=majority&appName=Cluster0
