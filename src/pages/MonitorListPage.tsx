import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { monitorService } from "@/services/monitor/monitor.service";
import type { Monitor, MonitorStatus } from "@/types/monitor/monitor.types";
import { Modal } from "@/components/ui/Modal";
import { MonitorAuthenticationForm } from "@/components/monitor/MonitorAuthenticationForm";
import { monitorAuthenticationService } from "@/services/monitor-authentication/monitor-authentication.service";
import type { MonitorAuthenticationPayload } from "@/types/monitor-authentication/monitor-authentication.types";
import { MonitorRequestFields } from "@/components/monitor/MonitorRequestFields";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

export function MonitorListPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<MonitorStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    url: "",
    method: "GET",
    intervalSeconds: 60,
    timeoutMs: 5000,
  });
  const [submitting, setSubmitting] = useState(false);
  const [authentication, setAuthentication] = useState<MonitorAuthenticationPayload>({ authType: "none", credentials: {} });
  const [requestBody, setRequestBody] = useState<Record<string, unknown> | undefined>();
  const [requestHeaders, setRequestHeaders] = useState<Record<string, string> | undefined>();
  const [editMonitor, setEditMonitor] = useState<Monitor | null>(null);
  const [editForm, setEditForm] = useState({ name: "", url: "", method: "GET", intervalSeconds: 60, timeoutMs: 5000 });
  const [editBody, setEditBody] = useState<Record<string, unknown> | undefined>();
  const [editHeaders, setEditHeaders] = useState<Record<string, string> | undefined>();
  const [editAuthentication, setEditAuthentication] = useState<MonitorAuthenticationPayload>({ authType: "none", credentials: {} });
  const [editAuthenticationDirty, setEditAuthenticationDirty] = useState(false);
  const [editing, setEditing] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

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
      const monitor = await monitorService.create({
        ...form,
        body: requestBody,
        headers: requestHeaders,
        intervalSeconds: Number(form.intervalSeconds),
        timeoutMs: Number(form.timeoutMs),
        enabled: true,
      });
      if (authentication.authType !== "none") await monitorAuthenticationService.save(monitor.id, authentication);
      setDialogOpen(false);
      setForm({
        name: "",
        url: "",
        method: "GET",
        intervalSeconds: 60,
        timeoutMs: 5000,
      });
      setAuthentication({ authType: "none", credentials: {} });
      setRequestBody(undefined);
      setRequestHeaders(undefined);
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

  async function openEdit(monitor: Monitor) {
    setEditMonitor(monitor);
    setEditForm({ name: monitor.name, url: monitor.url, method: monitor.method, intervalSeconds: monitor.intervalSeconds, timeoutMs: monitor.timeoutMs });
    setEditBody(monitor.body || undefined);
    setEditHeaders(monitor.headers || undefined);
    setEditAuthenticationDirty(false);
    const authentication = await monitorAuthenticationService.get(monitor.id).catch(() => null);
    setEditAuthentication(authentication ? { authType: authentication.authType, credentials: {}, loginUrl: authentication.loginUrl || undefined, loginMethod: authentication.loginMethod || undefined, loginBodyType: authentication.loginBodyType, tokenJsonPath: authentication.tokenJsonPath || undefined, expiresInJsonPath: authentication.expiresInJsonPath || undefined, expiresAtJsonPath: authentication.expiresAtJsonPath || undefined, authorizationHeader: authentication.authorizationHeader, authorizationScheme: authentication.authorizationScheme, refreshSkewSeconds: authentication.refreshSkewSeconds } : { authType: "none", credentials: {} });
    setError("");
  }

  async function updateMonitor(event: React.FormEvent) {
    event.preventDefault();
    if (!editMonitor) return;
    setEditing(true); setError("");
    try {
      await monitorService.update(editMonitor.id, { ...editForm, body: editBody, headers: editHeaders });
      if (editAuthenticationDirty) await monitorAuthenticationService.save(editMonitor.id, editAuthentication);
      setEditMonitor(null);
      const response = await monitorService.list({ keyword: keyword || undefined, status: status || undefined, size: 10, page });
      setMonitors(response.list); setPages(response.pagination.pages || 1);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update the monitor.") }
    finally { setEditing(false) }
  }

  async function removeMonitor(monitor: Monitor) {
    const confirmed = await confirm({ title: "Delete monitor?", description: `This will permanently remove “${monitor.name}” and its check history.`, confirmLabel: "Delete monitor" });
    if (!confirmed) return;
    try { await monitorService.remove(monitor.id); setNotice("Monitor deleted."); setTimeout(() => setNotice(""), 3500); const response = await monitorService.list({ keyword: keyword || undefined, status: status || undefined, size: 10, page }); setMonitors(response.list); setPages(response.pagination.pages || 1) }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete the monitor.") }
  }

  return (
    <div className="page-wrap">
      {notice && <div className="toast">{notice}</div>}
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
              <span>Actions</span>
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
                <span className="row-actions"><button className="row-action edit" title="Edit monitor" onClick={(event) => { event.preventDefault(); event.stopPropagation(); openEdit(monitor) }}><Pencil size={14} /></button><button className="row-action" title="Delete monitor" onClick={(event) => { event.preventDefault(); event.stopPropagation(); void removeMonitor(monitor) }}><Trash2 size={14} /></button></span>
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
            <MonitorAuthenticationForm value={authentication} onChange={setAuthentication} />
            <MonitorRequestFields method={form.method} body={requestBody} headers={requestHeaders} onBodyChange={setRequestBody} onHeadersChange={setRequestHeaders} />
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
      {editMonitor && <Modal eyebrow="Monitor settings" title="Edit monitor" onClose={() => setEditMonitor(null)}><form onSubmit={updateMonitor}><label>Name<input required value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} /></label><label>Endpoint URL<input required type="url" value={editForm.url} onChange={(event) => setEditForm({ ...editForm, url: event.target.value })} /></label><div className="form-row"><label>Method<select value={editForm.method} onChange={(event) => setEditForm({ ...editForm, method: event.target.value })}><option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option></select></label><label>Interval (sec)<input min="1" type="number" value={editForm.intervalSeconds} onChange={(event) => setEditForm({ ...editForm, intervalSeconds: Number(event.target.value) })} /></label><label>Timeout (ms)<input min="1" type="number" value={editForm.timeoutMs} onChange={(event) => setEditForm({ ...editForm, timeoutMs: Number(event.target.value) })} /></label></div><MonitorRequestFields method={editForm.method} body={editBody} headers={editHeaders} onBodyChange={setEditBody} onHeadersChange={setEditHeaders} /><MonitorAuthenticationForm value={editAuthentication} onChange={(next) => { setEditAuthentication(next); setEditAuthenticationDirty(true) }} /><p className="secret-note">Existing credentials are never displayed. Re-enter a secret only when changing authentication.</p><div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setEditMonitor(null)}>Cancel</button><button className="primary-btn" disabled={editing}>{editing ? "Saving..." : "Save changes"}</button></div></form></Modal>}
      {confirmDialog}
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
