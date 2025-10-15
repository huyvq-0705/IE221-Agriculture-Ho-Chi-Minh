import * as React from "react"
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"
import { create } from "zustand"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type ToastState = {
  toasts: ToasterToast[]
  addToast: (toast: ToasterToast) => void
  updateToast: (toast: Partial<ToasterToast> & { id: string }) => void
  dismissToast: (toastId?: string) => void
  removeToast: (toastId?: string) => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const { toasts } = get()
    const newToasts = [toast, ...toasts].slice(0, TOAST_LIMIT)
    set({ toasts: newToasts })
  },
  updateToast: (toast) => {
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === toast.id ? { ...t, ...toast } : t
      ),
    }))
  },
  dismissToast: (toastId) => {
    if (toastId) {
      // Find the toast and update its open state
      set((state) => ({
        toasts: state.toasts.map((t) =>
          t.id === toastId ? { ...t, open: false } : t
        ),
      }))
    } else {
      // Dismiss all toasts
      set((state) => ({
        toasts: state.toasts.map((t) => ({ ...t, open: false })),
      }))
    }
  },
  removeToast: (toastId) => {
    if (toastId) {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== toastId),
      }))
    } else {
      set({ toasts: [] })
    }
  },
}))

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type Toast = Omit<ToasterToast, "id">

function toast(props: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    useToastStore.getState().updateToast({ ...props, id })
  const dismiss = () => useToastStore.getState().dismissToast(id)

  useToastStore.getState().addToast({
    ...props,
    id,
    open: true,
    onOpenChange: (open) => {
      if (!open) {
        // Unmount component after it's closed
        setTimeout(() => {
          useToastStore.getState().removeToast(id)
        }, TOAST_REMOVE_DELAY)
      }
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const { toasts, ...rest } = useToastStore()

  return {
    toasts,
    toast,
    ...rest,
  }
}

export { useToast, toast }
