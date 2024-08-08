import { ObjectId } from "mongodb";

class UserModel {
  constructor(db) {
    this.collection = db.collection("users");
  }

  async findUserByEmail(email) {
    return this.collection.findOne({ email });
  }

  async createUser(user) {
    return this.collection.insertOne(user);
  }
}

export default UserModel;
