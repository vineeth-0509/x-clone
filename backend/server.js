import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on the port ${PORT}`);
  connectMongoDB();
});
