"use client"

import { useEffect, useState } from "react"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"

interface ConfettiCelebrationProps {
  trigger: boolean
  duration?: number
}

export function ConfettiCelebration({ trigger, duration = 5000 }: ConfettiCelebrationProps) {
  const [isActive, setIsActive] = useState(false)
  const { width, height } = useWindowSize()
  
  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true)
      
      // Stop confetti after duration
      const timer = setTimeout(() => {
        setIsActive(false)
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [trigger, duration, isActive])
  
  if (!isActive) return null
  
  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={500}
      gravity={0.15}
    />
  )
}
