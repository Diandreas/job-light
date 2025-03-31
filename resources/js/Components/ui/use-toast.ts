"use client"

import * as React from "react"
import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
}

const toast = ({ title, description, variant, action }: ToastProps) => {
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      action
    })
  }

  return sonnerToast(title, {
    description,
    action
  })
}

const useToast = () => {
  return {
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId)
      } else {
        sonnerToast.dismiss()
      }
    }
  }
}

export { useToast, toast }
export type { ToastProps }
