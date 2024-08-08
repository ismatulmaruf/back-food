import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";

const secretKey = process.env.SECRET_KEY;

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const userModel = new UserModel(req.app.locals.db);

  try {
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = { email, password: hashedPassword };
    await userModel.createUser(newUser);
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Failed to register user" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const userModel = new UserModel(req.app.locals.db);

  try {
    const user = await userModel.findUserByEmail(email);

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
};
