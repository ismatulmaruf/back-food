import { ObjectId } from "mongodb";

class MealModel {
  constructor(db) {
    this.collection = db.collection("meals");
  }

  async getAllMeals() {
    return this.collection.find().toArray();
  }

  async createMeal(meal) {
    return this.collection.insertOne(meal);
  }

  async updateMeal(id, updateData) {
    return this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
  }

  async deleteMeal(id) {
    return this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}

export default MealModel;
