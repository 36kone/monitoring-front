import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await login(form);
      if (response.tokenRole === "mfa") {
        setError("A autenticação 2FA será adicionada na próxima etapa.");
        return;
      }
      navigate(
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname || "/",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Falha ao entrar. Verifique suas credenciais.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="login-page">
      <div className="login-glow" />
      <form className="login-card" onSubmit={submit}>
        <div className="brand login-brand">
          <span className="brand-mark">⌁</span>
          <span>
            pulse<span className="brand-dot">.</span>
          </span>
        </div>
        <p className="eyebrow">API observability</p>
        <h1>Welcome back.</h1>
        <p className="login-copy">
          Acompanhe tudo que importa no seu workspace.
        </p>
        {error && <div className="form-error">{error}</div>}
        <label>
          E-mail
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com"
          />
        </label>
        <label>
          Senha
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Sua senha"
          />
        </label>
        <button className="primary-btn login-submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar no workspace →"}
        </button>
      </form>
    </div>
  );
}
