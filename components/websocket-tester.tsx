"use client"

import { useState } from "react"
import { useShipping } from "@/contexts/shipping-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageType, ContextualUpdateType } from "@/hooks/use-web-socket"

export function WebSocketTester() {
  const { sendMessage, isConnected, sessionId } = useShipping()
  const [messageText, setMessageText] = useState("")
  
  // Sample messages for testing
  const sampleMessages = {
    zipCollected: {
      type: MessageType.CONTEXTUAL_UPDATE,
      text: ContextualUpdateType.ZIP_COLLECTED,
      data: {
        from: "90210",
        to: "10001"
      },
      timestamp: Date.now(),
      requestId: crypto.randomUUID()
    },
    
    weightConfirmed: {
      type: MessageType.CONTEXTUAL_UPDATE,
      text: ContextualUpdateType.WEIGHT_CONFIRMED,
      data: {
        weight_lbs: 5.2
      },
      timestamp: Date.now(),
      requestId: crypto.randomUUID()
    },
    
    quoteReady: {
      type: MessageType.CONTEXTUAL_UPDATE,
      text: ContextualUpdateType.QUOTE_READY,
      data: {
        all_options: [
          {
            carrier: "FedEx",
            service_name: "Ground",
            cost: 12.99,
            transit_days: 3
          },
          {
            carrier: "UPS",
            service_name: "Ground",
            cost: 14.99,
            transit_days: 3
          },
          {
            carrier: "USPS",
            service_name: "Priority Mail",
            cost: 9.99,
            transit_days: 2
          }
        ]
      },
      timestamp: Date.now(),
      requestId: crypto.randomUUID()
    },
    
    labelCreated: {
      type: MessageType.CONTEXTUAL_UPDATE,
      text: ContextualUpdateType.LABEL_CREATED,
      data: {
        tracking_number: "1Z999AA1234567890",
        label_url: "/placeholder.svg?height=400&width=300",
        qr_code: "/placeholder.svg?height=200&width=200"
      },
      timestamp: Date.now(),
      requestId: crypto.randomUUID()
    }
  }
  
  // Function to send a custom message
  const sendCustomMessage = () => {
    try {
      const message = JSON.parse(messageText)
      sendMessage(message)
    } catch (error) {
      console.error("Invalid JSON:", error)
      alert("Invalid JSON. Please check your message format.")
    }
  }
  
  // Function to send a sample message
  const sendSampleMessage = (messageKey: keyof typeof sampleMessages) => {
    const message = {
      ...sampleMessages[messageKey],
      timestamp: Date.now(),
      requestId: crypto.randomUUID()
    }
    
    // Add session ID if available
    if (sessionId) {
      message.session_id = sessionId
    }
    
    sendMessage(message)
    setMessageText(JSON.stringify(message, null, 2))
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>WebSocket Tester</CardTitle>
        <CardDescription>
          Test the WebSocket integration by sending sample messages
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="samples">
          <TabsList className="mb-4">
            <TabsTrigger value="samples">Sample Messages</TabsTrigger>
            <TabsTrigger value="custom">Custom Message</TabsTrigger>
          </TabsList>
          
          <TabsContent value="samples" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => sendSampleMessage('zipCollected')}
                disabled={!isConnected}
                variant="outline"
              >
                Send ZIP Collected
              </Button>
              
              <Button 
                onClick={() => sendSampleMessage('weightConfirmed')}
                disabled={!isConnected}
                variant="outline"
              >
                Send Weight Confirmed
              </Button>
              
              <Button 
                onClick={() => sendSampleMessage('quoteReady')}
                disabled={!isConnected}
                variant="outline"
              >
                Send Quote Ready
              </Button>
              
              <Button 
                onClick={() => sendSampleMessage('labelCreated')}
                disabled={!isConnected}
                variant="outline"
              >
                Send Label Created
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="custom">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter JSON message..."
              className="font-mono text-sm h-40"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm">
          Status: <span className={isConnected ? "text-green-500" : "text-red-500"}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        
        <Button 
          onClick={sendCustomMessage}
          disabled={!isConnected || !messageText}
        >
          Send Custom Message
        </Button>
      </CardFooter>
    </Card>
  )
}
