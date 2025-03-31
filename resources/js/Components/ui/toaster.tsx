"use client"

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className: 'border border-border bg-background text-foreground text-sm py-1 px-2',
        classNames: {
          error: 'border-destructive bg-destructive text-destructive-foreground',
        },
        style: {
          maxWidth: '300px',
          minWidth: '180px',
        }
      }}
      closeButton
      richColors
      expand={false}
      duration={1000}
    />
  )
}
