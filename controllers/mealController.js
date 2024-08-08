import MealModel from "../models/mealModel.js";
import { ObjectId } from "mongodb";

export const getAllMeals = async (req, res) => {
  const mealModel = new MealModel(req.app.locals.db);

  try {
    const meals = await mealModel.getAllMeals();
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch meals" });
  }
};

export const createMeal = async (req, res) => {
  const mealData = req.body;

  if (
    !mealData.name ||
    mealData.name.trim() === "" ||
    !mealData.description ||
    mealData.description.trim() === "" ||
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

  const mealModel = new MealModel(req.app.locals.db);

  try {
    const newMeal = {
      name: mealData.name.trim(),
      description: mealData.description.trim(),
      price: parseFloat(mealData.price),
      image: mealData.image,
    };

    await mealModel.createMeal(newMeal);
    res.status(201).json({ message: "Meal created successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to create meal" });
  }
};

export const updateMeal = async (req, res) => {
  const { id } = req.params;
  const mealData = req.body;

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

  const mealModel = new MealModel(req.app.locals.db);

  try {
    const result = await mealModel.updateMeal(id, mealData);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.status(200).json({ message: "Meal updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update meal" });
  }
};

export const deleteMeal = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  const mealModel = new MealModel(req.app.locals.db);

  try {
    const result = await mealModel.deleteMeal(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.status(200).json({ message: "Meal deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete meal" });
  }
};
