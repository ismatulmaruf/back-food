import OrderModel from "../models/orderModel.js";
import { ObjectId } from "mongodb";

export const getAllOrders = async (req, res) => {
  const orderModel = new OrderModel(req.app.locals.db);

  try {
    const orders = await orderModel.getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const createOrder = async (req, res) => {
  const orderData = req.body.order;

  if (
    !orderData ||
    !orderData.items ||
    orderData.items.length === 0 ||
    !orderData.customer.email ||
    !orderData.customer.email.includes("@") ||
    !orderData.customer.name ||
    orderData.customer.name.trim() === "" ||
    !orderData.customer.street ||
    orderData.customer.street.trim() === "" ||
    !orderData.customer["postal-code"] ||
    orderData.customer["postal-code"].trim() === "" ||
    !orderData.customer.city ||
    orderData.customer.city.trim() === ""
  ) {
    return res.status(400).json({
      message:
        "Missing data: Email, name, street, postal code or city is missing.",
    });
  }

  const orderModel = new OrderModel(req.app.locals.db);

  try {
    const newOrder = {
      ...orderData,
      status: "pending",
    };

    await orderModel.createOrder(newOrder);
    res.status(201).json({ message: "Order created!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order" });
  }
};

export const completeOrder = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  const orderModel = new OrderModel(req.app.locals.db);

  try {
    const result = await orderModel.completeOrder(id);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order marked as completed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete order" });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  const orderModel = new OrderModel(req.app.locals.db);

  try {
    const result = await orderModel.deleteOrder(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete order" });
  }
};
