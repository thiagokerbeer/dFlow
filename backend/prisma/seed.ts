import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@deskflow.com";
  const userEmail = "user@deskflow.com";

  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  const userExists = await prisma.user.findUnique({ where: { email: userEmail } });

  const password = await bcrypt.hash("123456", 10);

  const admin =
    adminExists ??
    (await prisma.user.create({
      data: {
        name: "Administrador DeskFlow",
        email: adminEmail,
        password,
        role: "ADMIN"
      }
    }));

  const user =
    userExists ??
    (await prisma.user.create({
      data: {
        name: "Usuário DeskFlow",
        email: userEmail,
        password,
        role: "USER"
      }
    }));

  const ticketCount = await prisma.ticket.count();

  if (ticketCount === 0) {
    const ticket1 = await prisma.ticket.create({
      data: {
        title: "Erro ao acessar VPN da empresa",
        description: "Não consigo conectar na VPN desde hoje pela manhã.",
        category: "Infraestrutura",
        priority: "HIGH",
        status: "OPEN",
        userId: user.id
      }
    });

    const ticket2 = await prisma.ticket.create({
      data: {
        title: "Solicitação de acesso ao painel financeiro",
        description: "Preciso de acesso para consultar relatórios do setor.",
        category: "Acesso",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        userId: user.id
      }
    });

    await prisma.comment.createMany({
      data: [
        {
          message: "Recebemos sua solicitação e estamos verificando.",
          ticketId: ticket1.id,
          userId: admin.id
        },
        {
          message: "A solicitação foi encaminhada ao setor responsável.",
          ticketId: ticket2.id,
          userId: admin.id
        }
      ]
    });
  }

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
