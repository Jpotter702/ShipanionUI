"use client"

import { useShipping } from "@/contexts/shipping-context"
import { motion, AnimatePresence } from "framer-motion"
import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export function ConnectionStatus() {
  const { isConnected } = useShipping()
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [showStatus, setShowStatus] = useState(true)
  
  // Handle reconnecting state
  useEffect(() => {
    if (!isConnected) {
      setIsReconnecting(true)
    } else {
      // Add a small delay before turning off reconnecting state
      const timer = setTimeout(() => {
        setIsReconnecting(false)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [isConnected])
  
  // Auto-hide the status after a delay when connected
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        setShowStatus(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    } else {
      setShowStatus(true)
    }
  }, [isConnected])
  
  // Show on hover
  const handleMouseEnter = () => {
    setShowStatus(true)
  }
  
  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      onMouseEnter={handleMouseEnter}
    >
      <AnimatePresence>
        {showStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg ${
              isConnected 
                ? "bg-green-500 text-white" 
                : "bg-red-500 text-white"
            }`}
          >
            {isConnected ? (
              <Wifi className="h-4 w-4" />
            ) : isReconnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {isConnected 
                ? "Connected" 
                : isReconnecting 
                  ? "Reconnecting..." 
                  : "Disconnected"
              }
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Always visible indicator dot */}
      {!showStatus && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`h-3 w-3 rounded-full shadow-lg ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
      )}
    </div>
  )
}
