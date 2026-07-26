import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";

export function AppLayout() {
  const { user, isAdmin, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });

  function openProfile() {
    setProfile({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setProfileError("");
    setProfileOpen(true);
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    try {
      await updateProfile(profile);
      setProfileOpen(false);
    } catch (reason) {
      setProfileError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível atualizar o perfil.",
      );
    } finally {
      setSavingProfile(false);
    }
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">⌁</span>
          <span>
            pulse<span className="brand-dot">.</span>
          </span>
        </div>
        {/* Workspace/multi-tenant selector planned for v2. */}
        <nav>
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
          <div
            className="profile profile-button"
            onClick={openProfile}
            role="button"
            tabIndex={0}
          >
            <span className="avatar">
              {user?.name?.slice(0, 2).toUpperCase() || "JD"}
            </span>
            <span>
              <strong>{user?.name || "User"}</strong>
              <small>{isAdmin ? "Administrator" : "Member"}</small>
            </span>
            <button
              className="logout-btn"
              onClick={(event) => {
                event.stopPropagation();
                logout();
                navigate("/login");
              }}
            >
              ↪
            </button>
          </div>
        </div>
      </aside>
      {profileOpen && (
        <Modal
          eyebrow="Account settings"
          title="Edit your profile"
          onClose={() => setProfileOpen(false)}
        >
          <form onSubmit={saveProfile}>
            {profileError && <div className="form-error">{profileError}</div>}
            <label>
              Name
              <input
                required
                value={profile.name}
                onChange={(event) =>
                  setProfile({ ...profile, name: event.target.value })
                }
              />
            </label>
            <label>
              E-mail
              <input
                required
                type="email"
                value={profile.email}
                onChange={(event) =>
                  setProfile({ ...profile, email: event.target.value })
                }
              />
            </label>
            <label>
              Phone
              <input
                required
                value={profile.phone}
                onChange={(event) =>
                  setProfile({ ...profile, phone: event.target.value })
                }
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setProfileOpen(false)}
              >
                Cancel
              </button>
              <button className="primary-btn" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
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
