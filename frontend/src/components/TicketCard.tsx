import { Link } from "react-router-dom";
import type { Ticket } from "../types";

const statusLabel = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  WAITING_RESPONSE: "Aguardando resposta",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado"
};

const priorityLabel = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta"
};

export function TicketCard({ ticket, admin = false }: { ticket: Ticket; admin?: boolean }) {
  return (
    <div className="card ticket-card">
      <div className="ticket-row">
        <div>
          <h3>{ticket.title}</h3>
          <p>{ticket.description}</p>
        </div>
        <div className="ticket-badges">
          <span className={`badge status-${ticket.status.toLowerCase()}`}>
            {statusLabel[ticket.status]}
          </span>
          <span className={`badge priority-${ticket.priority.toLowerCase()}`}>
            {priorityLabel[ticket.priority]}
          </span>
        </div>
      </div>

      <div className="ticket-meta">
        <span>Categoria: {ticket.category}</span>
        {admin && ticket.user && <span>Solicitante: {ticket.user.name}</span>}
      </div>

      <Link className="link-button" to={`/tickets/${ticket.id}`}>
        Ver detalhes
      </Link>
    </div>
  );
}
