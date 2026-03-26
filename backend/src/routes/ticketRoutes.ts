import { Router } from "express";
import {
  closeTicket,
  createTicket,
  getMyTickets,
  getTicketById,
  updateTicket
} from "../controllers/ticketController";
import { authMiddleware } from "../middlewares/authMiddleware";

const ticketRoutes = Router();

ticketRoutes.post("/", authMiddleware, createTicket);
ticketRoutes.get("/my", authMiddleware, getMyTickets);
ticketRoutes.get("/:id", authMiddleware, getTicketById);
ticketRoutes.put("/:id", authMiddleware, updateTicket);
ticketRoutes.patch("/:id/close", authMiddleware, closeTicket);

export { ticketRoutes };
