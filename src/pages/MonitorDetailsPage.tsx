import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { monitorService } from "@/services/monitor/monitor.service";
import type { Incident } from "@/types/incident/incident.types";
import type { MonitorCheck } from "@/types/monitor/monitor.types";

export function MonitorDetailsPage() {
  const { monitorId = "" } = useParams();
  const [tab, setTab] = useState<"checks" | "incidents">("checks");
  const [checks, setChecks] = useState<MonitorCheck[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    if (tab === "checks") {
      monitorService
        .checks(monitorId, { size: 10, page })
        .then((response) => {
          setPages(response.pagination.pages || 1);
          setChecks(response.list);
        })
        .catch((reason) =>
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível carregar o histórico.",
          ),
        )
        .finally(() => setLoading(false));
    } else {
      monitorService
        .incidents(monitorId, { size: 10, page })
        .then((response) => {
          setPages(response.pagination.pages || 1);
          setIncidents(response.list);
        })
        .catch((reason) =>
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível carregar o histórico.",
          ),
        )
        .finally(() => setLoading(false));
    }
  }, [monitorId, tab, page]);
  function changeTab(nextTab: "checks" | "incidents") {
    setTab(nextTab);
    setPage(1);
    setError("");
  }
  return (
    <div className="page-wrap">
      <Link className="back-link" to="/monitors">
        ← Back to monitors
      </Link>
      <section className="detail-hero">
        <div>
          <p className="eyebrow">Monitor details</p>
          <h1>Monitor history</h1>
        </div>
      </section>
      <section className="panel resource-panel">
        <div className="tabs">
          <button
            className={tab === "checks" ? "tab active" : "tab"}
            onClick={() => changeTab("checks")}
          >
            Checks
          </button>
          <button
            className={tab === "incidents" ? "tab active" : "tab"}
            onClick={() => changeTab("incidents")}
          >
            Incidents
          </button>
        </div>
        {error && <div className="form-error">{error}</div>}
        {loading ? (
          <div className="empty-state">Carregando histórico...</div>
        ) : tab === "checks" ? (
          <ChecksTable checks={checks} />
        ) : (
          <IncidentsTable incidents={incidents} />
        )}
        <div className="pagination">
          <span>
            Page {page} of {pages}
          </span>
          <div>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              ←
            </button>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)}>
              →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
function ChecksTable({ checks }: { checks: MonitorCheck[] }) {
  if (!checks.length)
    return <div className="empty-state">Nenhum check registrado.</div>;
  return (
    <div className="resource-table">
      <div className="resource-head">
        <span>Result</span>
        <span>Status code</span>
        <span>Latency</span>
        <span>Checked at</span>
      </div>
      {checks.map((check) => (
        <div className="resource-row static-row" key={check.id}>
          <span>
            <strong className={check.success ? "success-text" : "failure-text"}>
              {check.success ? "Success" : "Failed"}
            </strong>
            <small>
              {check.error ||
                (check.timedOut ? "Request timed out" : "No errors")}
            </small>
          </span>
          <span>{check.statusCode ?? "—"}</span>
          <span>{check.latencyMs === null ? "—" : `${check.latencyMs}ms`}</span>
          <span className="muted">
            {new Date(check.checkedAt).toLocaleString("pt-BR")}
          </span>
          {check.responseBody !== null && (
            <details className="response-preview">
              <summary>Response body</summary>
              <pre>
                {typeof check.responseBody === "string"
                  ? check.responseBody
                  : JSON.stringify(check.responseBody, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
function IncidentsTable({ incidents }: { incidents: Incident[] }) {
  if (!incidents.length)
    return <div className="empty-state">Nenhum incidente registrado.</div>;
  return (
    <div className="resource-table">
      <div className="resource-head">
        <span>Incident</span>
        <span>Status</span>
        <span>Started at</span>
        <span>Duration</span>
      </div>
      {incidents.map((incident) => (
        <div className="resource-row static-row" key={incident.id}>
          <span>
            <strong>
              {incident.status === "open"
                ? "Open incident"
                : "Resolved incident"}
            </strong>
          </span>
          <span
            className={`status ${incident.status === "open" ? "down" : "up"}`}
          >
            <i />
            {incident.status}
          </span>
          <span className="muted">
            {new Date(incident.startedAt).toLocaleString("pt-BR")}
          </span>
          <span>
            {incident.durationSeconds ? `${incident.durationSeconds}s` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
