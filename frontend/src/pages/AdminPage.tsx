import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { TicketCard } from "../components/TicketCard";
import { api } from "../lib/api";
import type { Ticket } from "../types";

type Metrics = {
  totalUsers: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  waitingResponseTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  highPriorityTickets: number;
};

export function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  useEffect(() => {
    async function loadData() {
      const dashboard = await api.get<{ metrics: Metrics }>("/admin/dashboard");
      setMetrics(dashboard.metrics);
    }

    void loadData();
  }, []);

  useEffect(() => {
    async function loadTickets() {
      const params = new URLSearchParams();

      if (status) params.append("status", status);
      if (priority) params.append("priority", priority);

      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get<Ticket[]>(`/admin/tickets${query}`);
      setTickets(response);
    }

    void loadTickets();
  }, [status, priority]);

  return (
    <Layout title="Painel administrativo">
      <div className="grid metrics-grid">
        <div className="card metric-card">
          <span>Usuários</span>
          <strong>{metrics?.totalUsers ?? 0}</strong>
        </div>
        <div className="card metric-card">
          <span>Total de chamados</span>
          <strong>{metrics?.totalTickets ?? 0}</strong>
        </div>
        <div className="card metric-card">
          <span>Em aberto</span>
          <strong>{metrics?.openTickets ?? 0}</strong>
        </div>
        <div className="card metric-card">
          <span>Alta prioridade</span>
          <strong>{metrics?.highPriorityTickets ?? 0}</strong>
        </div>
      </div>

      <div className="card filter-bar">
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Todos os status</option>
          <option value="OPEN">Aberto</option>
          <option value="IN_PROGRESS">Em andamento</option>
          <option value="WAITING_RESPONSE">Aguardando resposta</option>
          <option value="RESOLVED">Resolvido</option>
          <option value="CLOSED">Fechado</option>
        </select>

        <select value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="">Todas as prioridades</option>
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
        </select>
      </div>

      <div className="list-grid">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} admin />
        ))}
      </div>
    </Layout>
  );
}
