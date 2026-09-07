import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const ToastContext = createContext(null);

let idCounter = 0;
const EXIT_MS = 200;

function ToastItem({ toast }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const visible = entered && !toast.leaving;

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium border transition-all duration-200 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      } ${
        toast.type === "error"
          ? "bg-red-600 text-white border-red-500/50"
          : "bg-surface-2 text-ink border-subtle"
      }`}
    >
      {toast.type === "error" ? (
        <FaExclamationCircle className="text-red-200 flex-shrink-0" size={16} />
      ) : (
        <FaCheckCircle className="text-cyan-400 flex-shrink-0" size={16} />
      )}
      <span>{toast.message}</span>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    timersRef.current.delete(id);
  }, []);

  const showToast = useCallback(
    (message, { type = "success", duration = 2500 } = {}) => {
      const id = ++idCounter;
      setToasts((current) => [...current, { id, message, type, leaving: false }]);

      const exitTimer = setTimeout(() => {
        setToasts((current) => current.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      }, Math.max(duration - EXIT_MS, 0));

      const removeTimer = setTimeout(() => removeToast(id), duration);

      timersRef.current.set(id, [exitTimer, removeTimer]);
    },
    [removeToast]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(([exitTimer, removeTimer]) => {
        clearTimeout(exitTimer);
        clearTimeout(removeTimer);
      });
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
