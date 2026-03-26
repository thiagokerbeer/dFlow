import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="hero-badge">DeskFlow</div>
        <h1>Criar conta</h1>
        <p className="muted">Cadastro para acessar a plataforma.</p>

        <form className="form" onSubmit={handleSubmit}>
          <input
            placeholder="Nome"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <input
            placeholder="E-mail"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            placeholder="Senha"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          {error && <div className="error-box">{error}</div>}
          <button type="submit">Cadastrar</button>
        </form>

        <div className="auth-footer">
          <span>Já possui conta?</span>
          <Link to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
