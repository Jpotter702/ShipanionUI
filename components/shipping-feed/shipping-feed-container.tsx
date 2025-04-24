"use client"

import { useShipping } from "@/contexts/shipping-context"
import { ShippingFeed } from "./shipping-feed"
import { ProgressIndicator } from "./progress-indicator"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ConfettiCelebration } from "@/components/confetti-celebration"

export function ShippingFeedContainer() {
  const { shippingData, isConnected, sessionId } = useShipping()
  const [showSessionBadge, setShowSessionBadge] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const prevStepRef = useRef(shippingData.currentStep)

  // Show session badge after a delay
  useEffect(() => {
    if (sessionId) {
      const timer = setTimeout(() => {
        setShowSessionBadge(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [sessionId])

  // Trigger confetti when shipping is complete (step 4)
  useEffect(() => {
    const currentStep = shippingData.currentStep

    // Only trigger when moving to the final step
    if (currentStep === 4 && prevStepRef.current !== 4) {
      setShowConfetti(true)
    }

    prevStepRef.current = currentStep
  }, [shippingData.currentStep])

  return (
    <div className="relative">
      {/* Connection status badge */}
      <div className="absolute top-0 right-0 z-10">
        <Badge
          variant={isConnected ? "default" : "destructive"}
          className="mb-2 transition-colors duration-300"
        >
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>

        {/* Session ID badge */}
        {showSessionBadge && sessionId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Badge
              variant="outline"
              className="ml-2 font-mono text-xs"
              title="Session ID"
            >
              Session: {sessionId.substring(0, 8)}...
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Progress indicator */}
      <AnimatePresence>
        {shippingData.currentStep > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProgressIndicator />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main shipping feed */}
      <ShippingFeed data={shippingData} />

      {/* Confetti celebration */}
      <ConfettiCelebration trigger={showConfetti} duration={6000} />
    </div>
  )
}
