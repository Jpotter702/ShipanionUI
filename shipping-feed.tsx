"use client"

import { useEffect, useState } from "react"
import { ShippingFeedContainer } from "@/components/shipping-feed/shipping-feed-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { mockShippingData } from "@/mock-data"
import { ShippingProvider } from "@/contexts/shipping-context"
import { ActionType } from "@/reducers/shipping-reducer"
import { SessionDisplay } from "@/components/session-display"
import { WebSocketTester } from "@/components/websocket-tester"
import { ToastProvider } from "@/contexts/toast-context"
import { WebSocketNotifier } from "@/components/websocket-notifier"
import { ConnectionStatus } from "@/components/connection-status"
import { SoundToggle } from "@/components/sound-toggle"

// Initial data with all mock data for testing
const initialData: ShippingData = {
  currentStep: 0,
  details: mockShippingData.details,
  quotes: mockShippingData.quotes,
  confirmation: mockShippingData.confirmation,
  payment: mockShippingData.payment,
  label: mockShippingData.label,
}

export default function ShippingFeedPage() {
  // For testing, let's add a button to advance the step
  const [testStep, setTestStep] = useState(0)

  // Get token from localStorage if available
  const [token, setToken] = useState<string | undefined>(undefined)

  useEffect(() => {
    // In a real app, you would get this from your auth system
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('shipanion_token') : null
    if (storedToken) {
      setToken(storedToken)
    } else {
      // For testing, use a default token
      setToken('test-token-123')
    }
  }, [])

  return (
    <ToastProvider>
      <ShippingProvider
        initialData={initialData}
        websocketUrl={process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000/ws'}
        token={token}
      >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            className="text-2xl font-bold"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Shipping Assistant
          </motion.h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // This now dispatches an action to the reducer
                  const step = Math.max(0, testStep - 1);
                  setTestStep(step);

                  // In a real app, you would dispatch to the reducer
                  // dispatch({
                  //   type: ActionType.SET_CURRENT_STEP,
                  //   payload: step
                  // });
                }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
              >
                Prev Step
              </button>
              <span className="text-sm font-medium">Step: {testStep}</span>
              <button
                onClick={() => {
                  // This now dispatches an action to the reducer
                  const step = Math.min(4, testStep + 1);
                  setTestStep(step);

                  // In a real app, you would dispatch to the reducer
                  // dispatch({
                  //   type: ActionType.SET_CURRENT_STEP,
                  //   payload: step
                  // });
                }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
              >
                Next Step
              </button>
            </div>
            <SessionDisplay />
            <SoundToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* The ShippingFeedContainer now gets data from the context */}
        <ShippingFeedContainer />

        {/* WebSocket Tester (only in development) */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8">
            <WebSocketTester />
          </div>
        )}
      </motion.div>

      {/* Invisible components for notifications and status */}
      <WebSocketNotifier />
      <ConnectionStatus />
      </ShippingProvider>
    </ToastProvider>
  )
}
