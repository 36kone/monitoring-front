import { useCallback, useState } from "react"
import { Modal } from "@/components/ui/Modal"

interface Confirmation { title: string; description: string; confirmLabel: string; resolve: (confirmed: boolean) => void }

export function useConfirmDialog() {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const confirm = useCallback((options: Omit<Confirmation, "resolve">) => new Promise<boolean>((resolve) => setConfirmation({ ...options, resolve })), [])
  const close = (confirmed: boolean) => { confirmation?.resolve(confirmed); setConfirmation(null) }
  const dialog = confirmation && <Modal eyebrow="Confirmation required" title={confirmation.title} onClose={() => close(false)}><p className="confirm-description">{confirmation.description}</p><div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => close(false)}>Cancel</button><button type="button" className="danger-btn" onClick={() => close(true)}>{confirmation.confirmLabel}</button></div></Modal>
  return { confirm, dialog }
}
