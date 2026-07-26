export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function formatLatency(value?: number | null) {
  return value === null || value === undefined ? "—" : `${value}ms`;
}
