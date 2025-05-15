"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useWebSocket } from "@/hooks/use-web-socket"
import { useStepReducer, ShippingStep } from "@/hooks/use-step-reducer"
import { mockShippingData } from "@/mock-data"
import { ShippingFeedContainer } from "@/components/shipping-feed/shipping-feed-container"
import { ShippingProvider } from "@/contexts/shipping-context"
import { ShippingData } from "@/types/shipping"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StepperAccordion } from "@/components/shipping-feed/stepper-accordion"
import { ShippingDetailsCard } from "@/components/shipping-feed/shipping-details-card" 
import { QuotesCard } from "@/components/shipping-feed/quotes-card"
import { ConfirmationCard } from "@/components/shipping-feed/confirmation-card"
import { PaymentCard } from "@/components/shipping-feed/payment-card"
import { LabelCard } from "@/components/shipping-feed/label-card"

// Initial data with all mock data for testing
const initialData: ShippingData = {
  currentStep: 0,
  details: mockShippingData.details,
  quotes: mockShippingData.quotes,
  confirmation: mockShippingData.confirmation,
  payment: mockShippingData.payment,
  label: mockShippingData.label,
  loadingQuotes: false,
  loadingLabel: false
}

// Maximum number of WebSocket messages to keep in state
const MAX_MESSAGES = 10

export default function ShippingWSDemo() {
  // References to prevent stale data in callbacks
  const messageIdCounterRef = useRef(0)
  
  const [token, setToken] = useState<string | undefined>(undefined)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [webSocketMessages, setWebSocketMessages] = useState<any[]>([])
  const [lastMessageType, setLastMessageType] = useState<string | null>(null)
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<Date | null>(null)
  
  // Current shipping data
  const [shippingData, setShippingData] = useState<ShippingData>(initialData)
  
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

  // Throttled message processor to prevent excessive rendering
  const processMessage = useCallback((message: any) => {
    if (!message) return;

    try {
      // Parse the message if it's a string
      const parsedMessage = typeof message.data === 'string' 
        ? JSON.parse(message.data) 
        : message.data
      
      // Add unique client ID to message
      const messageWithId = {
        ...parsedMessage,
        clientId: `msg-${Date.now()}-${++messageIdCounterRef.current}`
      }

      // Update message metadata
      setLastMessageType(messageWithId.type)
      setLastMessageTimestamp(new Date())
      
      // Add message to list (limited number to prevent memory issues)
      setWebSocketMessages(prev => [messageWithId, ...prev].slice(0, MAX_MESSAGES))
      
      // Handle message based on type
      if (messageWithId.type === 'contextual_update') {
        processContextualUpdate(messageWithId)
      } else if (messageWithId.type === 'quote_ready') {
        processQuoteReady(messageWithId)
      } else if (messageWithId.type === 'label_created') {
        processLabelCreated(messageWithId)
      }
    } catch (error) {
      console.error("Error processing message:", error)
    }
  }, [])

  // Process incoming messages with debouncing to prevent rapid updates
  useEffect(() => {
    if (!lastMessage) return;
    
    const timer = setTimeout(() => {
      processMessage(lastMessage);
    }, 50); // Small delay to batch rapid messages
    
    return () => clearTimeout(timer);
  }, [lastMessage, processMessage])

  // Update connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected')
      setConnectionError(null)
    } else if (connectionStatus === 'connected') {
      setConnectionStatus('connecting')
    }
  }, [isConnected, connectionStatus])

  // Process contextual updates
  const processContextualUpdate = useCallback((message: any) => {
    if (message.text === 'zip_collected') {
      setShippingData(prev => {
        // Create a copy of the existing details or initialize if null
        const prevDetails = prev.details || { 
          originZip: '', 
          destinationZip: '', 
          weight: 0 
        };
        
        return {
          ...prev,
          currentStep: 1,
          details: {
            ...prevDetails,
            originZip: message.data.origin_zip || '',
            destinationZip: message.data.destination_zip || ''
          }
        };
      });
      
      // Update step state
      setStep(ShippingStep.ZIP_COLLECTED)
      completeStep(ShippingStep.ZIP_COLLECTED)
    } 
    else if (message.text === 'weight_confirmed') {
      setShippingData(prev => {
        // Create a copy of the existing details or initialize if null
        const prevDetails = prev.details || { 
          originZip: '', 
          destinationZip: '', 
          weight: 0 
        };
        
        return {
          ...prev,
          currentStep: 1,
          details: {
            ...prevDetails,
            weight: message.data.weight || 0,
            unit: message.data.unit || 'lbs'
          }
        };
      });
      
      // Update step state
      setStep(ShippingStep.WEIGHT_CONFIRMED)
      completeStep(ShippingStep.WEIGHT_CONFIRMED)
    }
  }, [setStep, completeStep])

  // Process shipping quotes
  const processQuoteReady = useCallback((message: any) => {
    if (message.payload && message.payload.quotes) {
      setShippingData(prev => ({
        ...prev,
        currentStep: 2,
        quotes: message.payload.quotes,
        loadingQuotes: false
      }))
      
      // Update step state
      setStep(ShippingStep.QUOTE_READY)
      completeStep(ShippingStep.QUOTE_READY)
    }
  }, [setStep, completeStep])

  // Process label creation
  const processLabelCreated = useCallback((message: any) => {
    if (message.payload) {
      setShippingData(prev => {
        return {
          ...prev,
          currentStep: 4,
          label: {
            labelPdfUrl: message.payload.label_url || '',
            trackingNumber: message.payload.tracking_number || '',
            qrCodeUrl: message.payload.qr_code || '',
          },
          loadingLabel: false
        };
      });
      
      // Update step state
      setStep(ShippingStep.LABEL_CREATED)
      completeStep(ShippingStep.LABEL_CREATED)
    }
  }, [setStep, completeStep])

  // Function to send a ping message to test the connection
  const handlePing = useCallback(() => {
    if (isConnected) {
      sendMessage({
        type: 'ping',
        requestId: `ping-${Date.now()}`,
        timestamp: Date.now() / 1000
      })
    } else {
      setConnectionError("WebSocket is not connected")
    }
  }, [isConnected, sendMessage])

  // Map step names for display
  const stepNames = useMemo(() => ({
    [ShippingStep.ZIP_COLLECTED]: "ZIP Collected",
    [ShippingStep.WEIGHT_CONFIRMED]: "Weight Confirmed",
    [ShippingStep.QUOTE_READY]: "Quote Ready",
    [ShippingStep.LABEL_CREATED]: "Label Created"
  }), [])

  // Configure steps for the stepper accordion
  const steps = useMemo(() => [
    {
      title: "Shipping Details",
      content: <ShippingDetailsCard data={shippingData.details} />,
      isComplete: stepState.completedSteps.includes(ShippingStep.ZIP_COLLECTED),
      isActive: stepState.currentStep === ShippingStep.ZIP_COLLECTED,
      isUpdated: lastMessageType === 'contextual_update' && lastMessageTimestamp !== null
    },
    {
      title: "Shipping Quotes",
      content: <QuotesCard data={shippingData.quotes} loading={shippingData.loadingQuotes} />,
      isComplete: stepState.completedSteps.includes(ShippingStep.QUOTE_READY),
      isActive: stepState.currentStep === ShippingStep.QUOTE_READY,
      isUpdated: lastMessageType === 'quote_ready' && lastMessageTimestamp !== null
    },
    {
      title: "Confirmation",
      content: <ConfirmationCard data={shippingData.confirmation} />,
      isComplete: stepState.completedSteps.includes(ShippingStep.QUOTE_READY) && stepState.currentStep > ShippingStep.QUOTE_READY,
      isActive: false,
      isUpdated: false
    },
    {
      title: "Payment",
      content: <PaymentCard data={shippingData.payment} />,
      isComplete: stepState.completedSteps.includes(ShippingStep.LABEL_CREATED),
      isActive: false,
      isUpdated: false
    },
    {
      title: "Label",
      content: <LabelCard 
        data={shippingData.label} 
        // Remove the loading prop if it's not defined in LabelCardProps
      />,
      isComplete: stepState.completedSteps.includes(ShippingStep.LABEL_CREATED),
      isActive: stepState.currentStep === ShippingStep.LABEL_CREATED,
      isUpdated: lastMessageType === 'label_created' && lastMessageTimestamp !== null
    }
  ], [shippingData, stepState, lastMessageType, lastMessageTimestamp])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Shipping WebSocket Demo - Full UI</span>
            <Badge variant={
                connectionStatus === 'connected' ? 'default' :
                connectionStatus === 'connecting' ? 'secondary' :
                connectionStatus === 'error' ? 'destructive' : 'outline'
              }
            >
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'connecting' && (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Connecting...
                </span>
              )}
              {connectionStatus === 'error' && 'Error'}
              {connectionStatus === 'idle' && 'Idle'}
            </Badge>
          </CardTitle>
          <CardDescription>
            This demo shows how WebSocket messages control the complete shipping UI. 
            Run the <code>ws_ui_demo.py</code> script from ShipanionWS to see it in action.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="shipping">
            <TabsList className="mb-4">
              <TabsTrigger value="shipping">Shipping Process</TabsTrigger>
              <TabsTrigger value="stepper">Stepper Accordion</TabsTrigger>
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
                    {lastMessageTimestamp && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last updated: {lastMessageTimestamp.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* The full shipping feed container - pass initialData but avoid re-setup of WebSocket */}
                <ShippingProvider 
                  initialData={initialData}
                  token={token}
                >
                  <ShippingFeedContainer />
                </ShippingProvider>
              </div>
            </TabsContent>
            
            <TabsContent value="stepper">
              <div className="space-y-4">
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>StepperAccordion Component</AlertTitle>
                  <AlertDescription>
                    This shows the isolated StepperAccordion component directly controlled by WebSocket messages.
                  </AlertDescription>
                </Alert>
                
                <StepperAccordion 
                  steps={steps} 
                  currentStep={stepState.currentStep} 
                  stepState={stepState} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="messages">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Recent WebSocket Messages ({webSocketMessages.length}/{MAX_MESSAGES})</h3>
                  <Button size="sm" onClick={handlePing} disabled={!isConnected}>
                    Send Ping
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 max-h-[400px] overflow-auto">
                  {webSocketMessages.length > 0 ? (
                    webSocketMessages.map((message) => (
                      <div key={message.clientId} className="mb-4 last:mb-0 border-b pb-3 last:border-0">
                        <div className="flex justify-between items-center text-sm font-medium mb-1">
                          <Badge variant={
                            message.type === 'contextual_update' ? 'outline' :
                            message.type === 'quote_ready' ? 'secondary' :
                            message.type === 'label_created' ? 'default' : 'default'
                          }>
                            {message.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp * 1000).toLocaleTimeString()}
                          </span>
                        </div>
                        <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-auto">
                          {JSON.stringify(message, null, 2)}
                        </pre>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 text-gray-500">
                      No messages received yet. Run the WebSocket demo script to see messages.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="text-sm text-gray-500">
          {connectionError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{connectionError}</AlertDescription>
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