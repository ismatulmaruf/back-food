import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getAllOrders,
  createOrder,
  completeOrder,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", authenticateToken, getAllOrders);
router.post("/", createOrder);
router.post("/:id/complete", authenticateToken, completeOrder);
router.delete("/:id", authenticateToken, deleteOrder);

export default router;
