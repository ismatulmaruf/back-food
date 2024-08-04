import { ObjectId } from "mongodb";

export const getOrders = async (db) => {
  return db.collection("orders").find().toArray();
};

export const createOrder = async (db, order) => {
  return db.collection("orders").insertOne(order);
};

export const updateOrderStatus = async (db, id, status) => {
  return db
    .collection("orders")
    .updateOne({ _id: new ObjectId(id) }, { $set: { status } });
};

export const deleteOrder = async (db, id) => {
  return db.collection("orders").deleteOne({ _id: new ObjectId(id) });
};
