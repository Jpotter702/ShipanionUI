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
import { useWebSocket } from "@/hooks/use-web-socket"
import { useStepReducer, ShippingStep } from "@/hooks/use-step-reducer"
import { Badge } from "@/components/ui/badge"
import { ShippingData } from "@/types/shipping"

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

  // Initialize WebSocket connection
  const { lastMessage, isConnected, sendMessage } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000/ws',
    token,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  })

  // Use our step reducer to track the current step
  const { state: stepState, setStep, completeStep } = useStepReducer(lastMessage)

  // Map step names for display
  const stepNames = {
    [ShippingStep.ZIP_COLLECTED]: "ZIP Collected",
    [ShippingStep.WEIGHT_CONFIRMED]: "Weight Confirmed",
    [ShippingStep.QUOTE_READY]: "Quote Ready",
    [ShippingStep.LABEL_CREATED]: "Label Created"
  }

  // Update testStep when stepState changes
  useEffect(() => {
    setTestStep(stepState.currentStep)
  }, [stepState.currentStep])

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
                  // Manually set the step (for testing)
                  const prevStep = Math.max(0, stepState.currentStep - 1) as ShippingStep;
                  setStep(prevStep);

                  // Update the test step for compatibility
                  setTestStep(prevStep);
                }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
              >
                Prev Step
              </button>
              <span className="text-sm font-medium">Step: {stepNames[stepState.currentStep]}</span>
              <button
                onClick={() => {
                  // Manually set the step (for testing)
                  const nextStep = Math.min(3, stepState.currentStep + 1) as ShippingStep;
                  setStep(nextStep);
                  completeStep(nextStep);

                  // Update the test step for compatibility
                  setTestStep(nextStep);
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

        {/* Step Indicator */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Current Step:</h2>
              <Badge variant="outline" className="text-sm font-medium">
                {stepNames[stepState.currentStep]}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <h3 className="text-sm font-medium mr-2">Completed Steps:</h3>
              {stepState.completedSteps.length > 0 ? (
                stepState.completedSteps.map((step) => (
                  <Badge key={step} variant="secondary" className="text-xs">
                    {stepNames[step]}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">No steps completed yet</span>
              )}
            </div>
            {stepState.lastUpdated && (
              <div className="text-xs text-gray-500 mt-1">
                Last updated: {stepState.lastUpdated.toLocaleTimeString()}
              </div>
            )}
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
