"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Sistema de feedback del panel: toasts + confirm + prompt, para reemplazar
// alert()/confirm()/prompt() del navegador. Un solo provider montado en el
// layout de /admin expone useFeedback() en todo el panel.

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  msg: string;
  leaving?: boolean;
}

interface ConfirmOpts {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}
interface PromptOpts {
  title: string;
  message?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: "text" | "number";
  confirmLabel?: string;
}
type ModalState =
  | { kind: "confirm"; opts: ConfirmOpts; resolve: (v: boolean) => void }
  | { kind: "prompt"; opts: PromptOpts; resolve: (v: string | null) => void }
  | null;

interface FeedbackApi {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
  prompt: (opts: PromptOpts) => Promise<string | null>;
}

const Ctx = createContext<FeedbackApi | null>(null);

export function useFeedback(): FeedbackApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFeedback debe usarse dentro de <FeedbackProvider>");
  return ctx;
}

let nextId = 1;

export default function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 220);
  }, []);

  const pushToast = useCallback(
    (kind: ToastKind, msg: string) => {
      const id = nextId++;
      setToasts((ts) => [...ts, { id, kind, msg }]);
      window.setTimeout(() => dismiss(id), 3800);
    },
    [dismiss]
  );

  const api: FeedbackApi = {
    toast: {
      success: (m) => pushToast("success", m),
      error: (m) => pushToast("error", m),
      info: (m) => pushToast("info", m),
    },
    confirm: (opts) =>
      new Promise<boolean>((resolve) => setModal({ kind: "confirm", opts, resolve })),
    prompt: (opts) =>
      new Promise<string | null>((resolve) => setModal({ kind: "prompt", opts, resolve })),
  };

  // Enfocar el control principal al abrir un modal.
  useEffect(() => {
    if (!modal) return;
    const t = window.setTimeout(() => {
      if (modal.kind === "prompt") inputRef.current?.focus();
      else confirmBtnRef.current?.focus();
    }, 30);
    return () => window.clearTimeout(t);
  }, [modal]);

  function closeModal(result: boolean | string | null) {
    if (!modal) return;
    if (modal.kind === "confirm") modal.resolve(result as boolean);
    else modal.resolve(result as string | null);
    setModal(null);
  }

  return (
    <Ctx.Provider value={api}>
      {children}

      {/* Toasts */}
      <div className="caja-toasts" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`caja-toast caja-toast--${t.kind} ${t.leaving ? "is-leaving" : ""}`}
            role="status"
            onClick={() => dismiss(t.id)}
          >
            <span className="caja-toast__icon" aria-hidden>
              {t.kind === "success" ? "✓" : t.kind === "error" ? "!" : "i"}
            </span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Modal (confirm / prompt) */}
      {modal && (
        <ModalShell
          opts={modal.opts}
          kind={modal.kind}
          inputRef={inputRef}
          confirmBtnRef={confirmBtnRef}
          onCancel={() => closeModal(modal.kind === "confirm" ? false : null)}
          onConfirm={(val) => closeModal(modal.kind === "confirm" ? true : val)}
        />
      )}
    </Ctx.Provider>
  );
}

function ModalShell({
  opts,
  kind,
  inputRef,
  confirmBtnRef,
  onCancel,
  onConfirm,
}: {
  opts: ConfirmOpts | PromptOpts;
  kind: "confirm" | "prompt";
  inputRef: React.RefObject<HTMLInputElement>;
  confirmBtnRef: React.RefObject<HTMLButtonElement>;
  onCancel: () => void;
  onConfirm: (val: string) => void;
}) {
  const promptOpts = kind === "prompt" ? (opts as PromptOpts) : null;
  const confirmOpts = kind === "confirm" ? (opts as ConfirmOpts) : null;
  const [val, setVal] = useState(promptOpts?.defaultValue ?? "");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(val);
  }

  return (
    <div className="caja-modal" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="caja-modal__card" role="dialog" aria-modal="true" aria-label={opts.title}>
        <h3 className="caja-modal__title">{opts.title}</h3>
        {opts.message && <p className="caja-modal__msg">{opts.message}</p>}

        {promptOpts ? (
          <form onSubmit={submit}>
            <label className="caja-field">
              {promptOpts.label && <span>{promptOpts.label}</span>}
              <input
                ref={inputRef}
                type={promptOpts.type ?? "text"}
                inputMode={promptOpts.type === "number" ? "decimal" : undefined}
                step={promptOpts.type === "number" ? "any" : undefined}
                value={val}
                placeholder={promptOpts.placeholder}
                onChange={(e) => setVal(e.target.value)}
              />
            </label>
            <div className="caja-modal__acciones">
              <button type="button" className="caja-btn caja-btn--ghost" onClick={onCancel}>
                Cancelar
              </button>
              <button type="submit" className="caja-btn caja-btn--primary">
                {promptOpts.confirmLabel ?? "Guardar"}
              </button>
            </div>
          </form>
        ) : (
          <div className="caja-modal__acciones">
            <button className="caja-btn caja-btn--ghost" onClick={onCancel}>
              {confirmOpts?.cancelLabel ?? "Cancelar"}
            </button>
            <button
              ref={confirmBtnRef}
              className={`caja-btn ${confirmOpts?.danger ? "caja-btn--danger" : "caja-btn--primary"}`}
              onClick={() => onConfirm("")}
            >
              {confirmOpts?.confirmLabel ?? "Confirmar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
