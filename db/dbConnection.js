import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
const DB_Name = MONGO_URI.split("/")[3];

const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to DB -", DB_Name);
    })
    .catch((err) => {
      console.log("DB connected failed ->", err);
    });
};

export default dbConnection;
