import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { monitorService } from "@/services/monitor/monitor.service";
import type { Monitor, MonitorStatus } from "@/types/monitor/monitor.types";
import { Modal } from "@/components/ui/Modal";

export function MonitorListPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<MonitorStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    url: "",
    method: "GET",
    intervalSeconds: 60,
    timeoutMs: 5000,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    monitorService
      .list({
        keyword: keyword || undefined,
        status: status || undefined,
        size: 10,
        page,
      })
      .then((response) => {
        setMonitors(response.list);
        setPages(response.pagination.pages || 1);
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível carregar os monitores.",
        ),
      )
      .finally(() => setLoading(false));
  }, [keyword, status, page]);

  async function createMonitor(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await monitorService.create({
        ...form,
        intervalSeconds: Number(form.intervalSeconds),
        timeoutMs: Number(form.timeoutMs),
        enabled: true,
      });
      setDialogOpen(false);
      setForm({
        name: "",
        url: "",
        method: "GET",
        intervalSeconds: 60,
        timeoutMs: 5000,
      });
      setPage(1);
      const response = await monitorService.list({
        keyword: keyword || undefined,
        status: status || undefined,
        size: 10,
        page: 1,
      });
      setMonitors(response.list);
      setPages(response.pagination.pages || 1);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível criar o monitor.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-wrap">
      <section className="hero">
        <div>
          <p className="eyebrow">Monitor / Services</p>
          <h1>Your monitors</h1>
          <p className="hero-copy">
            Todos os endpoints acompanhados pelo seu workspace.
          </p>
        </div>
        <button className="primary-btn" onClick={() => setDialogOpen(true)}>
          ＋ Add monitor
        </button>
      </section>
      <section className="panel resource-panel">
        <div className="resource-toolbar">
          <input
            className="search-input"
            placeholder="Search monitors..."
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
          />
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as MonitorStatus | "");
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="up">Operational</option>
            <option value="down">Down</option>
            <option value="degraded">Degraded</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        {error && <div className="form-error">{error}</div>}
        {loading ? (
          <div className="empty-state">Carregando monitores...</div>
        ) : monitors.length === 0 ? (
          <div className="empty-state">Nenhum monitor encontrado.</div>
        ) : (
          <div className="resource-table">
            <div className="resource-head">
              <span>Monitor</span>
              <span>Status</span>
              <span>Interval</span>
              <span>Last check</span>
              <span />
            </div>
            {monitors.map((monitor) => (
              <Link
                className="resource-row"
                to={`/monitors/${monitor.id}`}
                key={monitor.id}
              >
                <span>
                  <strong>{monitor.name}</strong>
                  <small>
                    <em>{monitor.method}</em>
                    {monitor.url}
                  </small>
                </span>
                <span className={`status ${monitor.status}`}>
                  <i />
                  {statusLabel[monitor.status]}
                </span>
                <span>{monitor.intervalSeconds}s</span>
                <span className="muted">
                  {formatRelative(monitor.lastCheckedAt)}
                </span>
                <span className="row-arrow">→</span>
              </Link>
            ))}
          </div>
        )}
        <Pagination current={page} pages={pages} onChange={setPage} />
      </section>
      {dialogOpen && (
        <Modal
          eyebrow="New monitor"
          title="Add a service"
          onClose={() => setDialogOpen(false)}
        >
          <form onSubmit={createMonitor}>
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Payments API"
              />
            </label>
            <label>
              Endpoint URL
              <input
                required
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://api.example.com/health"
              />
            </label>
            <div className="form-row">
              <label>
                Method
                <select
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>PATCH</option>
                  <option>DELETE</option>
                </select>
              </label>
              <label>
                Interval (sec)
                <input
                  min="1"
                  type="number"
                  value={form.intervalSeconds}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      intervalSeconds: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                Timeout (ms)
                <input
                  min="1"
                  type="number"
                  value={form.timeoutMs}
                  onChange={(e) =>
                    setForm({ ...form, timeoutMs: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </button>
              <button className="primary-btn" disabled={submitting}>
                {submitting ? "Creating..." : "Create monitor"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
const statusLabel: Record<MonitorStatus, string> = {
  up: "Operational",
  down: "Down",
  degraded: "Degraded",
  unknown: "Unknown",
};
function formatRelative(value: string | null) {
  if (!value) return "Never";
  const seconds = Math.max(
    1,
    Math.round((Date.now() - new Date(value).getTime()) / 1000),
  );
  return seconds < 60 ? `${seconds}s ago` : `${Math.round(seconds / 60)}m ago`;
}
function Pagination({
  current,
  pages,
  onChange,
}: {
  current: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="pagination">
      <span>
        Page {current} of {pages}
      </span>
      <div>
        <button disabled={current <= 1} onClick={() => onChange(current - 1)}>
          ←
        </button>
        <button
          disabled={current >= pages}
          onClick={() => onChange(current + 1)}
        >
          →
        </button>
      </div>
    </div>
  );
}
