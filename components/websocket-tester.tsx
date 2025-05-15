"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageType, ContextualUpdateType } from "@/hooks/use-web-socket"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { useWebSocket } from "@/hooks/use-web-socket"

/**
 * WebSocket Tester Component
 * 
 * This component provides buttons to send test messages to the WebSocket server.
 * It's more reliable than the automated demo script and allows manual testing.
 */
const WebSocketTester = () => {
  const [token, setToken] = useState<string | undefined>(undefined)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [lastResponse, setLastResponse] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Get token from localStorage if available
  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('shipanion_token') : null
    if (storedToken) {
      setToken(storedToken)
    } else {
      // For testing, use a default token
      setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIn0.dNsYhOKsYlKZzUmOJl8Zpf9SbJ4DJxhd3AU6pO-PWko')
    }
  }, [])

  // Initialize WebSocket connection
  const { lastMessage, isConnected, sendMessage, error } = useWebSocket({
    url: 'ws://localhost:8001/ws',
    token,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  })

  // Update connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected')
    } else if (connectionStatus === 'connected') {
      setConnectionStatus('connecting')
    } else if (error) {
      setConnectionStatus('error')
    }
  }, [isConnected, connectionStatus, error])

  // Process incoming messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const parsedMessage = typeof lastMessage.data === 'string' 
          ? JSON.parse(lastMessage.data) 
          : lastMessage.data
        
        // Store as formatted JSON string
        setLastResponse(JSON.stringify(parsedMessage, null, 2))
        
        // Check for session ID
        if (parsedMessage.session_id && !sessionId) {
          setSessionId(parsedMessage.session_id)
        }
      } catch (error) {
        console.error("Error processing message:", error)
        setLastResponse(String(lastMessage.data))
      }
    }
  }, [lastMessage, sessionId])

  // ZIP code collection button
  const handleSendZipCode = () => {
    sendMessage({
      type: "contextual_update",
      text: "zip_collected",
      data: {
        origin_zip: "10001",
        destination_zip: "90210",
        session_id: sessionId
      },
      requestId: `zip-${Date.now()}`,
      timestamp: Date.now() / 1000
    })
  }

  // Weight confirmation button
  const handleSendWeight = () => {
    sendMessage({
      type: "contextual_update",
      text: "weight_confirmed",
      data: {
        weight: 2.5,
        unit: "lbs",
        session_id: sessionId
      },
      requestId: `weight-${Date.now()}`,
      timestamp: Date.now() / 1000
    })
  }

  // Shipping quotes button
  const handleSendQuotes = () => {
    sendMessage({
      type: "client_tool_call",
      payload: {
        client_tool_call: {
          tool_name: "get_shipping_quotes",
          tool_call_id: `quotes-${Date.now()}`,
          parameters: {
            origin_zip: "10001",
            destination_zip: "90210",
            weight: 2.5,
            weight_unit: "lbs"
          }
        },
        session_id: sessionId
      },
      requestId: `quotes-${Date.now()}`,
      timestamp: Date.now() / 1000
    })
  }

  // Notification button
  const handleSendNotification = () => {
    sendMessage({
      type: "notification",
      payload: {
        type: "success",
        title: "Test Notification",
        message: "This is a test notification from the WebSocket tester!",
        session_id: sessionId
      },
      requestId: `notification-${Date.now()}`,
      timestamp: Date.now() / 1000
    })
  }

  // Label creation button
  const handleSendLabel = () => {
    sendMessage({
      type: "client_tool_call",
      payload: {
        client_tool_call: {
          tool_name: "create_label",
          tool_call_id: `label-${Date.now()}`,
          parameters: {
            carrier: "UPS",
            service_name: "Ground", 
            origin_zip: "10001",
            destination_zip: "90210",
            weight: 2.5,
            weight_unit: "lbs"
          }
        },
        session_id: sessionId
      },
      requestId: `label-${Date.now()}`,
      timestamp: Date.now() / 1000
    })
  }

  // Ping test button
  const handlePing = () => {
    sendMessage({
      type: "ping",
      requestId: `ping-${Date.now()}`,
      timestamp: Date.now() / 1000
    })
  }

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>WebSocket Control Panel</span>
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
          Use these buttons to manually control the shipping UI with WebSocket messages
        </CardDescription>
        {sessionId && (
          <Badge variant="outline" className="mt-2">
            Session ID: {sessionId}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button size="sm" onClick={handleSendZipCode} disabled={!isConnected}>
            1. Send ZIP Codes
          </Button>
          <Button size="sm" onClick={handleSendWeight} disabled={!isConnected}>
            2. Send Weight
          </Button>
          <Button size="sm" onClick={handleSendQuotes} disabled={!isConnected}>
            3. Send Quotes
          </Button>
          <Button size="sm" onClick={handleSendNotification} disabled={!isConnected}>
            4. Send Notification
          </Button>
          <Button size="sm" onClick={handleSendLabel} disabled={!isConnected}>
            5. Send Label
          </Button>
          <Button size="sm" variant="outline" onClick={handlePing} disabled={!isConnected}>
            Test Ping
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-800 rounded-lg">
            <p className="font-medium">Connection Error:</p>
            <p className="text-sm">{error.message}</p>
            <p className="text-sm mt-2">
              Make sure the WebSocket server is running with: 
              <code className="px-1 py-0.5 bg-red-100 rounded text-xs ml-1">
                python -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
              </code>
            </p>
          </div>
        )}
        
        <div className="border rounded-lg p-4 max-h-[300px] overflow-auto">
          <h3 className="text-sm font-medium mb-2">Last Response:</h3>
          {lastResponse ? (
            <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-auto">
              {lastResponse}
            </pre>
          ) : (
            <div className="text-center p-4 text-gray-500">
              No messages received yet. Click a button to send a message.
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-gray-500 flex flex-col items-start w-full">
        <div>
          WebSocket URL: {process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8001/ws'}
        </div>
        <div className="mt-1">
          Token: {token ? `${token.substring(0, 15)}...` : 'None'}
        </div>
      </CardFooter>
    </Card>
  )
}

export { WebSocketTester }
export default WebSocketTester
