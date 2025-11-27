"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";
import styles from "./toast.module.css";

type ToastType = "success" | "error" | "info";

interface ToastData {
  type: ToastType;
  message: string;
}

type AddToastFn = (type: ToastType, message: string) => void;

const ToastContext = createContext<AddToastFn | null>(null);

function Toast({ index, data }: { index: number; data: ToastData }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  });

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className={`${styles.icon} ${styles.iconSuccess}`} />;
      case "error":
        return <XCircle className={`${styles.icon} ${styles.iconError}`} />;
      case "info":
        return <Info className={`${styles.icon} ${styles.iconInfo}`} />;
    }
  };

  return (
    <div
      className={styles.toast}
      style={{ "--index": index } as React.CSSProperties}
      data-mounted={mounted}
    >
      {getIcon(data.type)}
      <span className={styles.message}>{data.message}</span>
    </div>
  );
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast: AddToastFn = (type, message) => {
    setToasts((prev) => [...prev, { type, message }]);
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className={styles.toaster}>
        {toasts.map((toast, i) => (
          <Toast key={i} index={toasts.length - (i + 1)} data={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const addToast = useContext(ToastContext);
  if (!addToast) {
    throw new Error("useToast must be used within a Toaster");
  }

  return {
    success: (message: string) => addToast("success", message),
    error: (message: string) => addToast("error", message),
    info: (message: string) => addToast("info", message),
  };
}
