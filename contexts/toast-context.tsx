"use client"

import React, { createContext, useContext, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider as UIToastProvider,
  ToastTitle,
  ToastViewport
} from "@/components/ui/toast"

// Define toast types
export type ToastType = "default" | "destructive" | "success" | "warning" | "info"

// Define toast interface
export interface ToastMessage {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Define context interface
interface ToastContextType {
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, "id">) => string
  removeToast: (id: string) => void
  updateToast: (id: string, toast: Partial<ToastMessage>) => void
}

// Create context
const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => "",
  removeToast: () => {},
  updateToast: () => {},
})

// Create provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Add a new toast
  const addToast = (toast: Omit<ToastMessage, "id">) => {
    const id = uuidv4()
    const newToast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove toast after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }

    return id
  }

  // Remove a toast by ID
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Update an existing toast
  const updateToast = (id: string, toast: Partial<ToastMessage>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...toast } : t))
    )
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      <UIToastProvider>
        {children}
        <ToastViewport />
        {toasts.map(({ id, title, description, type, action }) => (
          <Toast key={id} variant={type} onOpenChange={(open) => !open && removeToast(id)}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action && (
              <ToastAction altText={action.label} onClick={action.onClick}>
                {action.label}
              </ToastAction>
            )}
            <ToastClose />
          </Toast>
        ))}
      </UIToastProvider>
    </ToastContext.Provider>
  )
}

// Create custom hook
export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
