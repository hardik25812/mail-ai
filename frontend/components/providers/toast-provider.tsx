"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description, variant = "default", duration = 5000 }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, variant, duration }])
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  useEffect(() => {
    const handleToast = (e: Event) => {
      const { detail } = e as CustomEvent
      if (detail) {
        toast(detail)
      }
    }
    
    window.addEventListener("toast", handleToast)
    return () => window.removeEventListener("toast", handleToast)
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function toast(props: Omit<Toast, "id">) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("toast", { detail: props })
    window.dispatchEvent(event)
  }
}

function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, toast.duration)
    
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  return (
    <div
      className={`rounded-md border p-4 shadow-md transition-all duration-300 animate-in slide-in-from-right-full 
        ${toast.variant === "destructive" 
          ? "bg-destructive text-destructive-foreground border-destructive/50" 
          : "bg-background border-border"
        }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-medium">{toast.title}</h3>
          {toast.description && <p className="text-sm mt-1 opacity-90">{toast.description}</p>}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="rounded-full p-1 hover:bg-muted transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  )
}
