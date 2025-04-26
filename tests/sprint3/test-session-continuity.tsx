"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWebSocket } from '@/hooks/use-web-socket'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'

/**
 * Test component for session continuity
 * 
 * This component tests:
 * 1. WebSocket connection with session_id
 * 2. Reconnection logic
 * 3. Session state restoration
 */
export default function TestSessionContinuity() {
  // State for the session ID
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [storedSessionId, setStoredSessionId] = useState<string | null>(null)
  const [reconnectCount, setReconnectCount] = useState(0)
  const [sessionState, setSessionState] = useState<any>(null)
  const [testStep, setTestStep] = useState(0)
  
  // Load session ID from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('shipanion_session_id')
    setStoredSessionId(stored)
  }, [])
  
  // Initialize WebSocket connection
  const { lastMessage, isConnected, sendMessage, disconnect, connect } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000/ws',
    token: 'test-token-123',
    sessionId: sessionId,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    onReconnect: () => {
      setReconnectCount(prev => prev + 1)
    }
  })
  
  // Process incoming messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data)
        console.log('Received message:', data)
        
        // Extract session ID from message
        if (data.session_id && !sessionId) {
          setSessionId(data.session_id)
          localStorage.setItem('shipanion_session_id', data.session_id)
        }
        
        // Extract session state from message
        if (data.type === 'session_state') {
          setSessionState(data.state)
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }
  }, [lastMessage, sessionId])
  
  // Send a test message
  const sendTestMessage = () => {
    sendMessage({
      type: 'get_rates',
      payload: {
        origin_zip: '90210',
        destination_zip: '10001',
        weight: 5.0,
        dimensions: '12x10x8',
        pickup_requested: false
      }
    })
    
    // Update test step
    setTestStep(1)
  }
  
  // Force disconnect
  const forceDisconnect = () => {
    disconnect()
    setTestStep(2)
  }
  
  // Reconnect with session ID
  const reconnectWithSession = () => {
    if (sessionId) {
      connect(sessionId)
      setTestStep(3)
    } else {
      alert('No session ID available')
    }
  }
  
  // Request session state
  const requestSessionState = () => {
    if (sessionId) {
      sendMessage({
        type: 'get_session_state',
        session_id: sessionId
      })
      setTestStep(4)
    } else {
      alert('No session ID available')
    }
  }
  
  // Clear session
  const clearSession = () => {
    localStorage.removeItem('shipanion_session_id')
    setSessionId(null)
    setStoredSessionId(null)
    setSessionState(null)
    setTestStep(0)
    setReconnectCount(0)
    disconnect()
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Session Continuity Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Connected:</span>
                <Badge variant={isConnected ? "success" : "destructive"}>
                  {isConnected ? "Yes" : "No"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Session ID:</span>
                {sessionId ? (
                  <Badge variant="outline" className="font-mono text-xs">
                    {sessionId.substring(0, 12)}...
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    None
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Stored Session ID:</span>
                {storedSessionId ? (
                  <Badge variant="outline" className="font-mono text-xs">
                    {storedSessionId.substring(0, 12)}...
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    None
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Reconnect Count:</span>
                <Badge variant="secondary">
                  {reconnectCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={sendTestMessage} 
                disabled={!isConnected || testStep > 0}
              >
                1. Send Test Message
              </Button>
              
              <Button 
                onClick={forceDisconnect} 
                disabled={!isConnected || !sessionId || testStep < 1 || testStep > 1}
                variant="destructive"
              >
                2. Force Disconnect
              </Button>
              
              <Button 
                onClick={reconnectWithSession} 
                disabled={isConnected || !sessionId || testStep < 2 || testStep > 2}
                variant="outline"
              >
                3. Reconnect with Session ID
              </Button>
              
              <Button 
                onClick={requestSessionState} 
                disabled={!isConnected || !sessionId || testStep < 3 || testStep > 3}
              >
                4. Request Session State
              </Button>
              
              <Button 
                onClick={clearSession} 
                variant="secondary"
              >
                Reset Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {testStep >= 1 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border border-gray-300" />
              )}
              <span className={testStep >= 1 ? "font-medium" : "text-gray-500"}>
                Step 1: Send Test Message
              </span>
              {testStep === 1 && (
                <Badge variant="outline" className="ml-auto">Current</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {testStep >= 2 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border border-gray-300" />
              )}
              <span className={testStep >= 2 ? "font-medium" : "text-gray-500"}>
                Step 2: Force Disconnect
              </span>
              {testStep === 2 && (
                <Badge variant="outline" className="ml-auto">Current</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {testStep >= 3 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border border-gray-300" />
              )}
              <span className={testStep >= 3 ? "font-medium" : "text-gray-500"}>
                Step 3: Reconnect with Session ID
              </span>
              {testStep === 3 && (
                <Badge variant="outline" className="ml-auto">Current</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {testStep >= 4 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border border-gray-300" />
              )}
              <span className={testStep >= 4 ? "font-medium" : "text-gray-500"}>
                Step 4: Request Session State
              </span>
              {testStep === 4 && (
                <Badge variant="outline" className="ml-auto">Current</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {sessionState && (
        <Card>
          <CardHeader>
            <CardTitle>Session State</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-60 text-xs">
              {JSON.stringify(sessionState, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      {testStep === 4 && sessionState && (
        <Alert className="mt-8" variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Test Completed Successfully!</AlertTitle>
          <AlertDescription>
            Session continuity is working correctly. The session was maintained across disconnection and reconnection.
          </AlertDescription>
        </Alert>
      )}
      
      {testStep === 4 && !sessionState && (
        <Alert className="mt-8" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Test Failed</AlertTitle>
          <AlertDescription>
            Session state could not be retrieved. Session continuity may not be working correctly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
