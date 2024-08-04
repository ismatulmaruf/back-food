import { MongoClient, ObjectId } from "mongodb";

class UserModel {
  constructor(db) {
    this.collection = db.collection("users");
  }

  async findByEmail(email) {
    return this.collection.findOne({ email });
  }

  async create(user) {
    return this.collection.insertOne(user);
  }
}

export default UserModel;
