import { useEffect, useState } from "react"

export function MonitorRequestFields({ method, body, headers, onBodyChange, onHeadersChange }: { method: string; body: Record<string, unknown> | undefined; headers: Record<string, string> | undefined; onBodyChange: (body: Record<string, unknown> | undefined) => void; onHeadersChange: (headers: Record<string, string> | undefined) => void }) {
  const [bodyText, setBodyText] = useState(JSON.stringify(body || {}, null, 2))
  const [headersText, setHeadersText] = useState(JSON.stringify(headers || {}, null, 2))
  useEffect(() => { setBodyText(JSON.stringify(body || {}, null, 2)); setHeadersText(JSON.stringify(headers || {}, null, 2)) }, [method])
  if (!["POST", "PUT", "PATCH"].includes(method)) return null
  return <div className="request-fields"><label>Request body (JSON)<textarea value={bodyText} onChange={(event) => { setBodyText(event.target.value); try { const parsed = JSON.parse(event.target.value); onBodyChange(Object.keys(parsed).length ? parsed : undefined) } catch { /* wait for valid JSON */ } }} /></label><label>Extra headers (JSON)<textarea value={headersText} onChange={(event) => { setHeadersText(event.target.value); try { const parsed = JSON.parse(event.target.value); onHeadersChange(Object.keys(parsed).length ? parsed : undefined) } catch { /* wait for valid JSON */ } }} /></label></div>
}
