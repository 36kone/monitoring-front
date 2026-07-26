import type { ReactNode, MouseEvent } from "react";

export function Modal({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
}) {
  function stop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }
  return (
    <div className="modal-backdrop" onMouseDown={stop}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <p className="panel-kicker">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
