"use client"

import { motion } from "framer-motion"
import { Mail } from "lucide-react"

export function Logo() {
  return (
    <motion.div
      className="flex items-center gap-2 text-primary"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: 0.2,
          type: "spring",
          stiffness: 200,
        }}
      >
        <Mail size={28} className="text-primary" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="font-bold text-xl"
      >
        InboxAI
      </motion.div>
    </motion.div>
  )
}
