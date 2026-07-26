import { useEffect, useState } from "react";
import userService from "@/services/user/user.service";
import { Modal } from "@/components/ui/Modal";
import type { User } from "@/types/user/user.types";

export function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    isAdmin: false,
  });

  useEffect(() => {
    setLoading(true);
    userService
      .list({ size: 50, keyword: search || undefined })
      .then((data) => setUsers(data.list))
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível carregar os usuários.",
        ),
      )
      .finally(() => setLoading(false));
  }, [search]);

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await userService.create({
        ...form,
        singleSession: true,
        mfaEnabled: false,
      });
      setDialogOpen(false);
      setForm({ name: "", email: "", password: "", phone: "", isAdmin: false });
      const data = await userService.list({
        size: 50,
        keyword: search || undefined,
      });
      setUsers(data.list);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível criar o usuário.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-wrap">
      <section className="hero">
        <div>
          <p className="eyebrow">Admin console</p>
          <h1>
            Users <span className="count">{users.length}</span>
          </h1>
          <p className="hero-copy">Gerencie quem tem acesso ao workspace.</p>
        </div>
        <button className="primary-btn" onClick={() => setDialogOpen(true)}>
          ＋ Add user
        </button>
      </section>
      <section className="panel user-panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">Directory</p>
            <h2>Workspace members</h2>
          </div>
          <input
            className="search-input"
            placeholder="Search users..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        {loading ? (
          <div className="empty-state">Carregando usuários...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">Nenhum usuário encontrado.</div>
        ) : (
          <div className="user-table">
            <div className="user-table-head">
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
              <span>Created</span>
            </div>
            {users.map((user) => (
              <div className="user-row" key={user.id}>
                <span className="user-cell">
                  <span className="avatar">
                    {user.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </span>
                </span>
                <span>
                  {user.isSuperUser
                    ? "Super admin"
                    : user.isAdmin
                      ? "Admin"
                      : "Member"}
                </span>
                <span className={user.isActive ? "status up" : "status down"}>
                  <i />
                  {user.isActive ? "Active" : "Inactive"}
                </span>
                <span className="muted">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
        {dialogOpen && (
          <Modal
            eyebrow="Workspace access"
            title="Add a user"
            onClose={() => setDialogOpen(false)}
          >
            <form onSubmit={createUser}>
              <label>
                Name
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Jane Doe"
                />
              </label>
              <div className="form-row">
                <label>
                  E-mail
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    placeholder="jane@company.com"
                  />
                </label>
                <label>
                  Phone
                  <input
                    required
                    value={form.phone}
                    onChange={(event) =>
                      setForm({ ...form, phone: event.target.value })
                    }
                    placeholder="+55 11..."
                  />
                </label>
              </div>
              <label>
                Password
                <input
                  required
                  minLength={5}
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  placeholder="At least 5 characters"
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.isAdmin}
                  onChange={(event) =>
                    setForm({ ...form, isAdmin: event.target.checked })
                  }
                />{" "}
                Grant administrator access
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </button>
                <button className="primary-btn" disabled={submitting}>
                  {submitting ? "Creating..." : "Create user"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </section>
    </div>
  );
}
