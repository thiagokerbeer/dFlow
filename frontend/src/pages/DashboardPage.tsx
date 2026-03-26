import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { TicketCard } from "../components/TicketCard";
import { api } from "../lib/api";
import type { Ticket } from "../types";
import { useAuth } from "../contexts/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        const response = await api.get<Ticket[]>("/tickets/my");
        setTickets(response);
      } finally {
        setLoading(false);
      }
    }

    void loadTickets();
  }, []);

  const openTickets = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const closedTickets = tickets.filter((ticket) => ticket.status === "CLOSED").length;

  return (
    <Layout title="Dashboard">
      <div className="grid metrics-grid">
        <div className="card metric-card">
          <span>Total de chamados</span>
          <strong>{tickets.length}</strong>
        </div>
        <div className="card metric-card">
          <span>Em aberto</span>
          <strong>{openTickets}</strong>
        </div>
        <div className="card metric-card">
          <span>Fechados</span>
          <strong>{closedTickets}</strong>
        </div>
        <div className="card metric-card">
          <span>Perfil</span>
          <strong>{user?.role === "ADMIN" ? "Administrador" : "Usuário"}</strong>
        </div>
      </div>

      <div className="section-header">
        <h2>Chamados recentes</h2>
      </div>

      {loading ? (
        <div className="card">Carregando...</div>
      ) : tickets.length === 0 ? (
        <div className="card">Você ainda não criou chamados.</div>
      ) : (
        <div className="list-grid">
          {tickets.slice(0, 3).map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </Layout>
  );
}
