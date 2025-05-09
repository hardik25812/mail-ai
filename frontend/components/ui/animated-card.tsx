"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, type CardProps } from "@/components/ui/card"

interface AnimatedCardProps extends CardProps {
  delay?: number
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, delay = 0, children, ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: delay,
          ease: "easeOut",
        }}
        whileHover={{
          y: -4,
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
          transition: { duration: 0.2 },
        }}
      >
        <Card ref={ref} className={cn("hover-card", className)} {...props}>
          {children}
        </Card>
      </motion.div>
    )
  },
)

AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }
