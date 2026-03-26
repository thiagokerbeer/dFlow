import { Request, Response } from "express";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma";

const updateStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_RESPONSE", "RESOLVED", "CLOSED"])
});

const createCommentSchema = z.object({
  message: z.string().min(2, "Mensagem obrigatória")
});

export async function getAdminDashboard(req: Request, res: Response) {
  try {
    const [users, tickets, open, inProgress, waiting, resolved, closed, highPriority] =
      await Promise.all([
        prisma.user.count(),
        prisma.ticket.count(),
        prisma.ticket.count({ where: { status: "OPEN" } }),
        prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
        prisma.ticket.count({ where: { status: "WAITING_RESPONSE" } }),
        prisma.ticket.count({ where: { status: "RESOLVED" } }),
        prisma.ticket.count({ where: { status: "CLOSED" } }),
        prisma.ticket.count({ where: { priority: "HIGH" } })
      ]);

    return res.status(200).json({
      metrics: {
        totalUsers: users,
        totalTickets: tickets,
        openTickets: open,
        inProgressTickets: inProgress,
        waitingResponseTickets: waiting,
        resolvedTickets: resolved,
        closedTickets: closed,
        highPriorityTickets: highPriority
      }
    });
  } catch {
    return res.status(500).json({ message: "Erro interno ao buscar dashboard" });
  }
}

export async function getAllTickets(req: Request, res: Response) {
  try {
    const { status, priority } = req.query;

    const tickets = await prisma.ticket.findMany({
      where: {
        status: status ? (String(status) as TicketStatus) : undefined,
        priority: priority ? (String(priority) as TicketPriority) : undefined
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json(tickets);
  } catch {
    return res.status(500).json({ message: "Erro interno ao listar chamados" });
  }
}

export async function updateTicketStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const parsedBody = updateStatusSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: parsedBody.error.flatten().fieldErrors
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ message: "Chamado não encontrado" });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: parsedBody.data.status
      }
    });

    return res.status(200).json({
      message: "Status atualizado com sucesso",
      ticket: updatedTicket
    });
  } catch {
    return res.status(500).json({ message: "Erro interno ao atualizar status" });
  }
}

export async function createAdminComment(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const { id } = req.params;
    const parsedBody = createCommentSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: parsedBody.error.flatten().fieldErrors
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ message: "Chamado não encontrado" });
    }

    const comment = await prisma.comment.create({
      data: {
        message: parsedBody.data.message,
        ticketId: id,
        userId: req.user.userId
      },
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        }
      }
    });

    return res.status(201).json({
      message: "Resposta adicionada com sucesso",
      comment
    });
  } catch {
    return res.status(500).json({ message: "Erro interno ao responder chamado" });
  }
}
