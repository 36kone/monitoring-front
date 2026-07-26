import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">⌁</span>
          <span>
            pulse<span className="brand-dot">.</span>
          </span>
        </div>
        <div className="workspace">
          <span className="workspace-icon">
            {user?.name?.slice(0, 1).toUpperCase() || "A"}
          </span>
          <span>
            <small>Workspace</small>
            <strong>{user?.name || "Acme Inc."}</strong>
          </span>
          <span className="chevron">⌄</span>
        </div>
        <nav>
          <p className="nav-label">Monitor</p>
          <NavLink className="nav-item" to="/">
            <span>▦</span>Overview
          </NavLink>
          <NavLink className="nav-item" to="/monitors">
            <span>⌁</span>Monitors
          </NavLink>
          <NavLink className="nav-item" to="/incidents">
            <span>◉</span>Incidents
          </NavLink>
          {isAdmin && (
            <>
              <p className="nav-label nav-label-spaced">Admin</p>
              <NavLink className="nav-item" to="/admin">
                <span>♙</span>Users
              </NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="profile">
            <span className="avatar">
              {user?.name?.slice(0, 2).toUpperCase() || "JD"}
            </span>
            <span>
              <strong>{user?.name || "User"}</strong>
              <small>{isAdmin ? "Administrator" : "Member"}</small>
            </span>
            <button
              className="logout-btn"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              ↪
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Pulse</span>
            <b>/</b>
            <strong>Workspace</strong>
          </div>
          <div className="top-actions">
            <div className="live-pill">
              <span /> All systems operational
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
