import { MongoClient } from "mongodb";

const url = process.env.DATABASE;
const dbName = "food";

export const connectToDatabase = async () => {
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  console.log("Connected to MongoDB");
  return client.db(dbName);
};
