"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5 text-green-500" />,
        info: <InfoIcon className="size-5 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-500" />,
        error: <OctagonXIcon className="size-5 text-destructive" />,
        loading: <Loader2Icon className="size-5 animate-spin text-primary" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1.5rem", // More rounded for cute look
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
