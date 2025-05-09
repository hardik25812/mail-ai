"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ToggleSwitchProps extends React.HTMLAttributes<HTMLButtonElement> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

const ToggleSwitch = React.forwardRef<HTMLButtonElement, ToggleSwitchProps>(
  ({ className, checked, onCheckedChange, disabled = false, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-8 h-4",
      md: "w-11 h-6",
      lg: "w-14 h-7",
    }

    const thumbSizeClasses = {
      sm: "w-3 h-3",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    }

    const thumbTranslate = {
      sm: 16,
      md: 20,
      lg: 28,
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          checked ? "bg-primary" : "bg-muted",
          disabled && "opacity-50 cursor-not-allowed",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        <motion.span
          className={cn("pointer-events-none inline-block rounded-full bg-white shadow-lg", thumbSizeClasses[size])}
          initial={false}
          animate={{
            x: checked ? thumbTranslate[size] : 2,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
    )
  },
)

ToggleSwitch.displayName = "ToggleSwitch"

export { ToggleSwitch }
