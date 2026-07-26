import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard/dashboard.service";
import { monitorService } from "@/services/monitor/monitor.service";
import type { DashboardHome } from "@/types/dashboard/dashboard.types";

const emptyDashboard: DashboardHome = {
  overallUptime: 0,
  averageLatencyMs: 0,
  activeMonitors: 0,
  operationalMonitors: 0,
  openIncidents: 0,
  uptimeSeries: [],
  recentIncidents: [],
  monitors: [],
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardHome | null>(null);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    name: "",
    url: "",
    method: "GET",
    intervalSeconds: 60,
    timeoutMs: 5000,
  });

  useEffect(() => {
    dashboardService
      .getHome()
      .then(setData)
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível carregar o dashboard.",
        ),
      );
  }, []);
  async function createMonitor(event: React.FormEvent) {
    event.preventDefault();
    try {
      await monitorService.create({
        ...form,
        intervalSeconds: Number(form.intervalSeconds),
        timeoutMs: Number(form.timeoutMs),
        enabled: true,
      });
      setNotice("Monitor criado com sucesso.");
      setModal(false);
      setData(await dashboardService.getHome());
    } catch (reason) {
      setNotice(
        reason instanceof Error
          ? reason.message
          : "Não foi possível criar o monitor.",
      );
    }
    setTimeout(() => setNotice(""), 3500);
  }
  const dashboard = data || emptyDashboard;

  return (
    <div className="page-wrap">
      <section className="hero">
        <div>
          <p className="eyebrow">Workspace overview</p>
          <h1>
            Good morning<span className="brand-dot">.</span>
          </h1>
          <p className="hero-copy">Aqui está a saúde dos seus serviços hoje.</p>
        </div>
        <button className="primary-btn" onClick={() => setModal(true)}>
          ＋ Add monitor
        </button>
      </section>
      {notice && <div className="toast">{notice}</div>}
      {error && <div className="form-error">{error}</div>}
      <section className="metric-grid">
        <Metric
          label="Overall uptime"
          value={`${dashboard.overallUptime.toFixed(2)}%`}
          trend="↗ live"
        />
        <Metric
          label="Avg. response time"
          value={`${Math.round(dashboard.averageLatencyMs)}ms`}
          trend="live"
        />
        <Metric
          label="Active monitors"
          value={String(dashboard.activeMonitors)}
          detail={`${dashboard.operationalMonitors} operational`}
        />
        <Metric
          label="Open incidents"
          value={String(dashboard.openIncidents).padStart(2, "0")}
          detail="needs attention"
        />
      </section>
      <section className="overview-grid">
        <div className="panel health-panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Service health</p>
              <h2>Uptime overview</h2>
            </div>
            <select>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="chart-summary">
            <strong>{dashboard.overallUptime.toFixed(2)}%</strong>
            <span>
              Live data <small>from monitor checks</small>
            </span>
          </div>
          <div className="fake-chart">
            {dashboard.uptimeSeries.length ? (
              dashboard.uptimeSeries.map((point) => (
                <i
                  key={point.date}
                  title={`${point.date}: ${point.uptime}%`}
                  style={{ height: `${Math.max(4, point.uptime)}%` }}
                />
              ))
            ) : (
              <span className="empty-chart">No check data yet</span>
            )}
          </div>
        </div>
        <div className="panel incident-panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Attention required</p>
              <h2>Recent incidents</h2>
            </div>
            <span className="text-btn">View all →</span>
          </div>
          {dashboard.recentIncidents.length ? (
            dashboard.recentIncidents
              .slice(0, 3)
              .map((incident) => (
                <Incident
                  key={incident.id}
                  title={
                    incident.status === "open"
                      ? `${incident.monitorName} is down`
                      : `${incident.monitorName} recovered`
                  }
                  monitor={incident.monitorName}
                  time={formatDate(incident.startedAt)}
                />
              ))
          ) : (
            <div className="empty-state">No recent incidents.</div>
          )}
        </div>
      </section>
      <section className="panel monitors-panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">Your services</p>
            <h2>
              All monitors{" "}
              <span className="count">{dashboard.monitors.length}</span>
            </h2>
          </div>
          <span className="text-btn">Live status</span>
        </div>
        <div className="monitor-list">
          {dashboard.monitors.slice(0, 8).map((monitor, index) => (
            <div className="monitor-row" key={monitor.id}>
              <span className={`service-icon color-${index % 4}`}>
                {monitor.name.slice(0, 1)}
              </span>
              <span>
                <strong>{monitor.name}</strong>
                <small>
                  {monitor.method} {monitor.url}
                </small>
              </span>
              <span className={`status ${monitor.status}`}>
                <i />
                {statusLabel[monitor.status]}
              </span>
              <strong>
                {monitor.lastLatencyMs === null
                  ? "—"
                  : `${monitor.lastLatencyMs}ms`}
              </strong>
            </div>
          ))}
        </div>
      </section>
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setModal(false)
          }
        >
          <form className="modal" onSubmit={createMonitor}>
            <div className="modal-head">
              <div>
                <p className="panel-kicker">New monitor</p>
                <h2>Add a service</h2>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setModal(false)}
              >
                ×
              </button>
            </div>
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Payments API"
              />
            </label>
            <label>
              Endpoint URL
              <input
                required
                type="url"
                value={form.url}
                onChange={(event) =>
                  setForm({ ...form, url: event.target.value })
                }
                placeholder="https://api.example.com/health"
              />
            </label>
            <div className="form-row">
              <label>
                Method
                <select
                  value={form.method}
                  onChange={(event) =>
                    setForm({ ...form, method: event.target.value })
                  }
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>PATCH</option>
                  <option>DELETE</option>
                </select>
              </label>
              <label>
                Interval
                <input
                  type="number"
                  min="1"
                  value={form.intervalSeconds}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      intervalSeconds: Number(event.target.value),
                    })
                  }
                />
              </label>
              <label>
                Timeout
                <input
                  type="number"
                  min="1"
                  value={form.timeoutMs}
                  onChange={(event) =>
                    setForm({ ...form, timeoutMs: Number(event.target.value) })
                  }
                />
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>
              <button className="primary-btn">Create monitor</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
const statusLabel = {
  up: "Operational",
  down: "Down",
  degraded: "Degraded",
  unknown: "Unknown",
} as const;
function Metric({
  label,
  value,
  trend,
  detail,
}: {
  label: string;
  value: string;
  trend?: string;
  detail?: string;
}) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span
        className={
          trend?.includes("↘")
            ? "metric-delta negative"
            : "metric-delta positive"
        }
      >
        {trend || detail}
      </span>
    </div>
  );
}
function Incident({
  title,
  monitor,
  time,
}: {
  title: string;
  monitor: string;
  time: string;
}) {
  return (
    <div className="incident">
      <span className="incident-mark">
        <i />
      </span>
      <div>
        <strong>{title}</strong>
        <small>{monitor}</small>
      </div>
      <time>{time}</time>
    </div>
  );
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}
