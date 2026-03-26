import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import type { Ticket, TicketPriority } from "../types";

export function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM"
  });

  async function loadTicket() {
    if (!id) return;

    try {
      const response = await api.get<Ticket>(`/tickets/${id}`);
      setTicket(response);
      setStatus(response.status);
      setForm({
        title: response.title,
        description: response.description,
        category: response.category,
        priority: response.priority
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar chamado");
    }
  }

  useEffect(() => {
    void loadTicket();
  }, [id]);

  async function handleSave() {
    if (!id) return;

    try {
      await api.put(`/tickets/${id}`, form);
      setEditing(false);
      await loadTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar chamado");
    }
  }

  async function handleCloseTicket() {
    if (!id) return;

    try {
      await api.patch(`/tickets/${id}/close`);
      await loadTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fechar chamado");
    }
  }

  async function handleAdminStatus() {
    if (!id) return;

    try {
      await api.patch(`/admin/tickets/${id}/status`, { status });
      await loadTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar status");
    }
  }

  async function handleAdminComment() {
    if (!id) return;

    try {
      await api.post(`/admin/tickets/${id}/comments`, { message: commentMessage });
      setCommentMessage("");
      await loadTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao responder chamado");
    }
  }

  if (!ticket) {
    return (
      <Layout title="Detalhes do chamado">
        <div className="card">{error || "Carregando..."}</div>
      </Layout>
    );
  }

  const canEdit = user?.id === ticket.userId && ticket.status === "OPEN";
  const isAdmin = user?.role === "ADMIN";

  return (
    <Layout title="Detalhes do chamado">
      <div className="card details-card">
        {editing ? (
          <div className="form">
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
            <textarea
              rows={5}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <input
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            />
            <select
              value={form.priority}
              onChange={(event) =>
                setForm({ ...form, priority: event.target.value as TicketPriority })
              }
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
            </select>
            <div className="actions">
              <button onClick={handleSave}>Salvar alterações</button>
              <button className="secondary-button" onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2>{ticket.title}</h2>
            <p className="details-text">{ticket.description}</p>
            <div className="ticket-meta details-meta">
              <span>Status: {ticket.status}</span>
              <span>Prioridade: {ticket.priority}</span>
              <span>Categoria: {ticket.category}</span>
              {ticket.user && <span>Solicitante: {ticket.user.name}</span>}
            </div>

            <div className="actions">
              {canEdit && <button onClick={() => setEditing(true)}>Editar chamado</button>}
              {user?.id === ticket.userId && ticket.status !== "CLOSED" && (
                <button className="secondary-button" onClick={handleCloseTicket}>
                  Fechar chamado
                </button>
              )}
              <button className="ghost-button" onClick={() => navigate(-1)}>
                Voltar
              </button>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h3>Histórico / respostas</h3>
        {ticket.comments.length === 0 ? (
          <p className="muted">Nenhuma resposta ainda.</p>
        ) : (
          <div className="comments-list">
            {ticket.comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <strong>
                  {comment.user.name} • {comment.user.role}
                </strong>
                <p>{comment.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="card admin-panel-card">
          <h3>Ações do administrador</h3>
          <div className="admin-inline">
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="OPEN">Aberto</option>
              <option value="IN_PROGRESS">Em andamento</option>
              <option value="WAITING_RESPONSE">Aguardando resposta</option>
              <option value="RESOLVED">Resolvido</option>
              <option value="CLOSED">Fechado</option>
            </select>
            <button onClick={handleAdminStatus}>Atualizar status</button>
          </div>

          <div className="form">
            <textarea
              rows={4}
              placeholder="Responder chamado"
              value={commentMessage}
              onChange={(event) => setCommentMessage(event.target.value)}
            />
            <button onClick={handleAdminComment}>Enviar resposta</button>
          </div>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}
    </Layout>
  );
}
