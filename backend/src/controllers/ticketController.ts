import { Request, Response } from "express";
import { TicketPriority } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma";

const createTicketSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().min(5, "Descrição deve ter no mínimo 5 caracteres"),
  category: z.string().min(2, "Categoria obrigatória"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM")
});

const updateTicketSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  category: z.string().min(2).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional()
});

export async function createTicket(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const parsedBody = createTicketSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: parsedBody.error.flatten().fieldErrors
      });
    }

    const ticket = await prisma.ticket.create({
      data: {
        ...parsedBody.data,
        userId: req.user.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.status(201).json({
      message: "Chamado criado com sucesso",
      ticket
    });
  } catch {
    return res.status(500).json({ message: "Erro interno ao criar chamado" });
  }
}

export async function getMyTickets(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        userId: req.user.userId
      },
      include: {
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

export async function getTicketById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ message: "Chamado não encontrado" });
    }

    const isOwner = ticket.userId === req.user.userId;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    return res.status(200).json(ticket);
  } catch {
    return res.status(500).json({ message: "Erro interno ao buscar chamado" });
  }
}

export async function updateTicket(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const { id } = req.params;
    const parsedBody = updateTicketSchema.safeParse(req.body);

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

    if (ticket.userId !== req.user.userId) {
      return res.status(403).json({ message: "Você só pode editar seus próprios chamados" });
    }

    if (ticket.status !== "OPEN") {
      return res.status(400).json({ message: "Só é possível editar chamado em aberto" });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: parsedBody.data
    });

    return res.status(200).json({
      message: "Chamado atualizado com sucesso",
      ticket: updatedTicket
    });
  } catch {
    return res.status(500).json({ message: "Erro interno ao atualizar chamado" });
  }
}

export async function closeTicket(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ message: "Chamado não encontrado" });
    }

    if (ticket.userId !== req.user.userId) {
      return res.status(403).json({ message: "Você só pode fechar seus próprios chamados" });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: "CLOSED"
      }
    });

    return res.status(200).json({
      message: "Chamado fechado com sucesso",
      ticket: updatedTicket
    });
  } catch {
    return res.status(500).json({ message: "Erro interno ao fechar chamado" });
  }
}
