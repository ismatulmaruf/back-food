import { ObjectId } from "mongodb";

class OrderModel {
  constructor(db) {
    this.collection = db.collection("orders");
  }

  async getAllOrders() {
    return this.collection.find().toArray();
  }

  async createOrder(order) {
    return this.collection.insertOne(order);
  }

  async completeOrder(id) {
    return this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "completed" } }
    );
  }

  async deleteOrder(id) {
    return this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}

export default OrderModel;
