"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info, Loader2 } from "lucide-react"
import { useWebSocket } from "@/hooks/use-web-socket"
import { useStepReducer, ShippingStep } from "@/hooks/use-step-reducer"
import { motion, AnimatePresence } from "framer-motion"

// Define types for WebSocket messages
interface WebSocketMessage {
  type: string
  text?: string
  data?: any
  payload?: any
  timestamp: number
  requestId?: string  // Make requestId optional since it might be missing
  [key: string]: any
}

export default function WSUIDemo() {
  // State for the demo
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const [token, setToken] = useState<string | undefined>(undefined)
  const [demoStatus, setDemoStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [demoError, setDemoError] = useState<string | null>(null)
  
  // Get token from localStorage if available
  useEffect(() => {
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
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8001/ws',
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

  // Process incoming messages
  useEffect(() => {
    if (lastMessage) {
      try {
        // Parse the message if it's a string
        const parsedMessage = typeof lastMessage.data === 'string' 
          ? JSON.parse(lastMessage.data) 
          : lastMessage.data

        // Add a unique clientId to each message to ensure unique keys
        const messageWithId = {
          ...parsedMessage,
          clientId: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        };

        // Add message to the messages list
        setMessages(prev => [messageWithId, ...prev].slice(0, 20))

        // Update demo status based on connection
        setDemoStatus(isConnected ? 'connected' : 'connecting')
      } catch (error) {
        console.error("Error processing message:", error)
      }
    }
  }, [lastMessage, isConnected])

  // Update connection status
  useEffect(() => {
    if (isConnected) {
      setDemoStatus('connected')
      setDemoError(null)
    } else if (demoStatus === 'connected') {
      setDemoStatus('connecting')
    }
  }, [isConnected, demoStatus])

  // Function to send a ping message to test the connection
  const handlePing = () => {
    if (isConnected) {
      sendMessage({
        type: 'ping',
        requestId: `ping-${Date.now()}`,
        timestamp: Date.now() / 1000
      })
    } else {
      setDemoError("WebSocket is not connected")
    }
  }

  // Helper function to display request ID
  const formatRequestId = (requestId?: string) => {
    if (!requestId) return "N/A";
    return `${requestId.substring(0, 8)}...`;
  }

  // Render a message based on its type
  const renderMessage = (message: WebSocketMessage) => {
    const timestamp = new Date(message.timestamp * 1000).toLocaleTimeString()
    
    switch (message.type) {
      case 'contextual_update':
        return (
          <Alert className="mb-4 border-blue-400 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-700 dark:text-blue-300">
              Contextual Update: {message.text}
            </AlertTitle>
            <AlertDescription className="text-blue-600 dark:text-blue-400">
              {message.text === 'zip_collected' && (
                <div>
                  Origin ZIP: {message.data?.origin_zip}, 
                  Destination ZIP: {message.data?.destination_zip}
                </div>
              )}
              {message.text === 'weight_confirmed' && (
                <div>
                  Weight: {message.data?.weight} {message.data?.unit}
                </div>
              )}
              <div className="text-xs mt-1 text-blue-500">
                {timestamp} • ID: {formatRequestId(message.requestId)}
              </div>
            </AlertDescription>
          </Alert>
        )
      
      case 'quote_ready':
        return (
          <Alert className="mb-4 border-green-400 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-700 dark:text-green-300">
              Shipping Quotes Ready
            </AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-400">
              <div className="space-y-2 mt-2">
                {message.payload?.quotes?.map((quote: any, index: number) => (
                  <div key={index} className="flex justify-between items-center border-b pb-1 border-green-200 dark:border-green-800">
                    <span>{quote.carrier} {quote.service_name}</span>
                    <span>${quote.cost.toFixed(2)} • {quote.transit_days} days</span>
                  </div>
                ))}
              </div>
              <div className="text-xs mt-2 text-green-500">
                {timestamp} • ID: {formatRequestId(message.requestId)}
              </div>
            </AlertDescription>
          </Alert>
        )
      
      case 'label_created':
        return (
          <Alert className="mb-4 border-purple-400 dark:border-purple-800 bg-purple-50 dark:bg-purple-950">
            <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <AlertTitle className="text-purple-700 dark:text-purple-300">
              Shipping Label Created
            </AlertTitle>
            <AlertDescription className="text-purple-600 dark:text-purple-400">
              <div className="space-y-1 mt-1">
                <div><strong>Carrier:</strong> {message.payload?.carrier} {message.payload?.service_name}</div>
                <div><strong>Tracking:</strong> {message.payload?.tracking_number}</div>
                <div><strong>Cost:</strong> ${message.payload?.cost?.toFixed(2)}</div>
                {message.payload?.qr_code && (
                  <div className="mt-2">
                    <img src={message.payload.qr_code} alt="QR Code" className="w-24 h-24 border-2 border-purple-200 dark:border-purple-800" />
                  </div>
                )}
              </div>
              <div className="text-xs mt-2 text-purple-500">
                {timestamp} • ID: {formatRequestId(message.requestId)}
              </div>
            </AlertDescription>
          </Alert>
        )
      
      case 'notification':
        return (
          <Alert className="mb-4 border-amber-400 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-700 dark:text-amber-300">
              {message.payload?.title || "Notification"}
            </AlertTitle>
            <AlertDescription className="text-amber-600 dark:text-amber-400">
              {message.payload?.message}
              <div className="text-xs mt-1 text-amber-500">
                {timestamp} • ID: {formatRequestId(message.requestId)}
              </div>
            </AlertDescription>
          </Alert>
        )
      
      default:
        return (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>
              {message.type}
            </AlertTitle>
            <AlertDescription>
              <pre className="text-xs overflow-auto max-h-20">
                {JSON.stringify(message, null, 2)}
              </pre>
              <div className="text-xs mt-1 text-gray-500">
                {timestamp} • ID: {formatRequestId(message.requestId)}
              </div>
            </AlertDescription>
          </Alert>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>WebSocket UI Control Demo</span>
            <Badge variant={
                demoStatus === 'connected' ? 'success' :
                demoStatus === 'connecting' ? 'warning' :
                demoStatus === 'error' ? 'destructive' : 'outline'
              }
            >
              {demoStatus === 'connected' && 'Connected'}
              {demoStatus === 'connecting' && (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Connecting...
                </span>
              )}
              {demoStatus === 'error' && 'Error'}
              {demoStatus === 'idle' && 'Idle'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Demonstrates how ShipanionWS can control the UI via WebSocket messages.
            Run the <code>ws_ui_demo.py</code> script in the ShipanionWS backend to send UI commands.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="shipping">
            <TabsList className="mb-4">
              <TabsTrigger value="shipping">Shipping Process</TabsTrigger>
              <TabsTrigger value="messages">WebSocket Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="shipping">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                
                <div>
                  <h3 className="font-medium mb-2">Latest Updates:</h3>
                  <AnimatePresence>
                    {messages.length > 0 ? (
                      messages.slice(0, 5).map((message, index) => (
                        <motion.div
                          key={message.clientId || `msg-${index}-${Date.now()}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {renderMessage(message)}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center p-4 border border-dashed rounded-lg text-gray-500">
                        No messages received yet
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="messages">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Raw WebSocket Messages</h3>
                  <Button size="sm" onClick={handlePing} disabled={!isConnected}>
                    Send Ping
                  </Button>
                </div>
                
                <div className="border rounded-lg overflow-auto max-h-96 p-4">
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div key={message.clientId || `raw-${index}-${Date.now()}`} className="mb-4 last:mb-0">
                        <div className="flex justify-between items-center text-sm font-medium mb-1">
                          <span>{message.type}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp * 1000).toLocaleTimeString()}
                          </span>
                        </div>
                        <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-auto">
                          {JSON.stringify(message, null, 2)}
                        </pre>
                        {index < messages.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      No messages received yet
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          {demoError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{demoError}</AlertDescription>
            </Alert>
          )}
          <div>
            WebSocket URL: {process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8001/ws'}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 