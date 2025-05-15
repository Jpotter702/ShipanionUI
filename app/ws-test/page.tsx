"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WSTestPage() {
  const [status, setStatus] = useState<string>("Disconnected")
  const [messages, setMessages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Test token from ws_ui_demo.py
  const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIn0.dNsYhOKsYlKZzUmOJl8Zpf9SbJ4DJxhd3AU6pO-PWko"
  
  useEffect(() => {
    const wsUrl = `ws://localhost:8001/ws?token=${TEST_TOKEN}`
    
    console.log("Connecting to WebSocket:", wsUrl)
    
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log("WebSocket connected")
      setStatus("Connected")
      setError(null)
      
      // Send a ping message
      const pingMessage = {
        type: "ping",
        requestId: `ping-${Date.now()}`,
        timestamp: Date.now() / 1000
      }
      
      ws.send(JSON.stringify(pingMessage))
    }
    
    ws.onmessage = (event) => {
      console.log("Received message:", event.data)
      setMessages(prev => [event.data, ...prev].slice(0, 10))
    }
    
    ws.onerror = (event) => {
      console.error("WebSocket error:", event)
      setStatus("Error")
      setError("Failed to connect. Check console for details.")
    }
    
    ws.onclose = () => {
      console.log("WebSocket closed")
      setStatus("Disconnected")
    }
    
    return () => {
      ws.close()
    }
  }, [])
  
  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>WebSocket Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <strong>Status:</strong> {status}
          </div>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
              {error}
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Messages:</h3>
            {messages.length > 0 ? (
              <ul className="space-y-2">
                {messages.map((msg, index) => (
                  <li key={index} className="p-2 bg-gray-100 rounded">
                    <pre className="text-xs whitespace-pre-wrap">{msg}</pre>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No messages received</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 