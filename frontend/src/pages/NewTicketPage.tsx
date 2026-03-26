import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { api } from "../lib/api";

export function NewTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM"
  });
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await api.post("/tickets", form);
      navigate("/tickets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar chamado");
    }
  }

  return (
    <Layout title="Novo chamado">
      <div className="card form-card">
        <form className="form" onSubmit={handleSubmit}>
          <input
            placeholder="Título"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
          <textarea
            placeholder="Descrição"
            rows={6}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <input
            placeholder="Categoria"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          />
          <select
            value={form.priority}
            onChange={(event) => setForm({ ...form, priority: event.target.value })}
          >
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
          </select>

          {error && <div className="error-box">{error}</div>}

          <button type="submit">Criar chamado</button>
        </form>
      </div>
    </Layout>
  );
}
