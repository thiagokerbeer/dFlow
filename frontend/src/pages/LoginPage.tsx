import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="hero-badge">Projeto 5 • DeskFlow</div>
        <h1>Entrar</h1>
        <p className="muted">Acesse sua área privada de chamados.</p>

        <form className="form" onSubmit={handleSubmit}>
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
          <button type="submit">Entrar</button>
        </form>

        <div className="auth-footer">
          <span>Não tem conta?</span>
          <Link to="/register">Criar conta</Link>
        </div>

        <div className="demo-box">
          <strong>Demo rápida</strong>
          <span>Admin: admin@deskflow.com / 123456</span>
          <span>User: user@deskflow.com / 123456</span>
        </div>
      </div>
    </div>
  );
}
