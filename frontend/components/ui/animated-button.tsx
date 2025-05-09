"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface AnimatedButtonProps extends ButtonProps {
  gradient?: boolean
  animationVariant?: "default" | "bounce" | "pulse" | "expand" | "glow"
  isLoading?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

const getAnimationVariant = (variant: AnimatedButtonProps["animationVariant"]) => {
  switch (variant) {
    case "bounce":
      return {
        hover: { y: -5, transition: { type: "spring", stiffness: 400 } },
        tap: { y: 2, transition: { type: "spring", stiffness: 600 } },
      }
    case "pulse":
      return {
        hover: { scale: [1, 1.05, 1.03], transition: { duration: 0.4 } },
        tap: { scale: 0.97 },
      }
    case "expand":
      return {
        hover: { scale: 1.05, transition: { duration: 0.2 } },
        tap: { scale: 0.98 },
      }
    case "glow":
      return {
        hover: { scale: 1.02 },
        tap: { scale: 0.98 },
      }
    default:
      return {
        hover: { scale: 1.02 },
        tap: { scale: 0.98 },
      }
  }
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      gradient = false,
      animationVariant = "default",
      isLoading = false,
      iconLeft,
      iconRight,
      children,
      ...props
    },
    ref,
  ) => {
    const animations = getAnimationVariant(animationVariant)

    return (
      <motion.div
        className="inline-block"
        whileHover={animations.hover}
        whileTap={animations.tap}
        transition={{ duration: 0.2 }}
      >
        <Button
          ref={ref}
          className={cn(
            gradient ? "gradient-button border-0" : "",
            animationVariant === "glow" ? "btn-glow" : "",
            className,
          )}
          disabled={isLoading || props.disabled}
          {...props}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isLoading && iconLeft && <span className="mr-2">{iconLeft}</span>}
          {children}
          {!isLoading && iconRight && <span className="ml-2">{iconRight}</span>}
        </Button>
      </motion.div>
    )
  },
)

AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton }
