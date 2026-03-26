import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { adminRoutes } from "./routes/adminRoutes";
import { authRoutes } from "./routes/authRoutes";
import { ticketRoutes } from "./routes/ticketRoutes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "DeskFlow API running"
  });
});

app.use("/auth", authRoutes);
app.use("/tickets", ticketRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
