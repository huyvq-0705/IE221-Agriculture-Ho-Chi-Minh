// src/hooks/use-toast.tsx
"use client";

import * as React from "react";
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";
import { create } from "zustand";

const TOAST_LIMIT = 5;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  // duration in ms (optional)
  duration?: number;
  // open state controlled by store
  open?: boolean;
  // optional callback (keeps parity with earlier store)
  onOpenChange?: (open: boolean) => void;
};

type ToastState = {
  toasts: ToasterToast[];
  addToast: (toast: ToasterToast) => void;
  updateToast: (toast: Partial<ToasterToast> & { id: string }) => void;
  dismissToast: (toastId?: string) => void;
  removeToast: (toastId?: string) => void;
};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const { toasts } = get();
    const newToasts = [toast, ...toasts].slice(0, TOAST_LIMIT);
    set({ toasts: newToasts });
  },
  updateToast: (toast) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === toast.id ? { ...t, ...toast } : t)),
    }));
  },
  dismissToast: (toastId) => {
    if (toastId) {
      set((state) => ({
        toasts: state.toasts.map((t) => (t.id === toastId ? { ...t, open: false } : t)),
      }));
    } else {
      set((state) => ({
        toasts: state.toasts.map((t) => ({ ...t, open: false })),
      }));
    }
  },
  removeToast: (toastId) => {
    if (toastId) {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== toastId) }));
    } else {
      set({ toasts: [] });
    }
  },
}));

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Toast = Omit<ToasterToast, "id">;

function toast(props: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    useToastStore.getState().updateToast({ ...props, id });
  const dismiss = () => useToastStore.getState().dismissToast(id);

  // Determine duration: prefer provided props.duration, else default 4000ms
  const defaultDuration = (props as any).duration ?? 4000;

  useToastStore.getState().addToast({
    ...props,
    id,
    open: true,
    duration: defaultDuration,
    onOpenChange: (open: boolean) => {
      if (!open) {
        // Remove from store after a short delay to allow exit animation.
        // Use the toast's duration as a reasonable baseline for removal delay fallback.
        const removeDelay = Math.max(300, defaultDuration);
        setTimeout(() => {
          useToastStore.getState().removeToast(id);
        }, removeDelay);
      }
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  const { toasts, ...rest } = useToastStore();
  return {
    toasts,
    toast,
    ...rest,
  };
}

export { useToast, toast };