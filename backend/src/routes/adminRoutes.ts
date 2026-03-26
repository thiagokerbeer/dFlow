import { Router } from "express";
import {
  createAdminComment,
  getAdminDashboard,
  getAllTickets,
  updateTicketStatus
} from "../controllers/adminController";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

const adminRoutes = Router();

adminRoutes.get("/dashboard", authMiddleware, adminMiddleware, getAdminDashboard);
adminRoutes.get("/tickets", authMiddleware, adminMiddleware, getAllTickets);
adminRoutes.patch("/tickets/:id/status", authMiddleware, adminMiddleware, updateTicketStatus);
adminRoutes.post("/tickets/:id/comments", authMiddleware, adminMiddleware, createAdminComment);

export { adminRoutes };
