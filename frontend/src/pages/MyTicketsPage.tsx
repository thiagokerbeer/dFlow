import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { TicketCard } from "../components/TicketCard";
import { api } from "../lib/api";
import type { Ticket } from "../types";

export function MyTicketsPage() {
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

  return (
    <Layout title="Meus chamados">
      {loading ? (
        <div className="card">Carregando...</div>
      ) : tickets.length === 0 ? (
        <div className="card">Nenhum chamado encontrado.</div>
      ) : (
        <div className="list-grid">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </Layout>
  );
}
