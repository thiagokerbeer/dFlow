import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Layout({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">DeskFlow</div>
          <p className="sidebar-subtitle">Sistema de chamados interno</p>
        </div>

        <nav className="nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/tickets/new">Novo chamado</Link>
          <Link to="/tickets">Meus chamados</Link>
          {user?.role === "ADMIN" && <Link to="/admin">Painel admin</Link>}
        </nav>

        <div className="sidebar-user">
          <strong>{user?.name}</strong>
          <span>{user?.role === "ADMIN" ? "Administrador" : "Usuário"}</span>
          <button className="secondary-button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="content-header">
          <h1>{title}</h1>
        </header>
        {children}
      </main>
    </div>
  );
}
