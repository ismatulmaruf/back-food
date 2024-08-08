import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getAllMeals,
  createMeal,
  updateMeal,
  deleteMeal,
} from "../controllers/mealController.js";

const router = express.Router();

router.get("/", getAllMeals);
router.post("/", authenticateToken, createMeal);
router.put("/:id", authenticateToken, updateMeal);
router.delete("/:id", authenticateToken, deleteMeal);

export default router;
