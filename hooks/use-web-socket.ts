"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { mockShippingData } from "@/mock-data"

// Define message interface for type safety
interface WebSocketMessage {
  data: any
  type: string
}

// Define WebSocket message types from our backend
export enum MessageType {
  QUOTE_READY = 'quote_ready',
  LABEL_CREATED = 'label_created',
  CONTEXTUAL_UPDATE = 'contextual_update',
  CLIENT_TOOL_RESULT = 'client_tool_result',
  ERROR = 'error'
}

// Define contextual update types
export enum ContextualUpdateType {
  QUOTE_READY = 'quote_ready',
  LABEL_CREATED = 'label_created',
  ZIP_COLLECTED = 'zip_collected',
  WEIGHT_CONFIRMED = 'weight_confirmed'
}

interface WebSocketOptions {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  token?: string
  sessionId?: string
}

// Helper function to check if we're in a preview environment
function isPreviewEnvironment() {
  if (typeof window === "undefined") return true // SSR

  return (
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("codesandbox.io") ||
    window.location.hostname.includes("localhost") ||
    window.location.hostname.includes("127.0.0.1") ||
    // Add any other preview domains you use
    window.location.hostname === ""
  )
}

export function useWebSocket({ url, reconnectInterval = 3000, maxReconnectAttempts = 5, token, sessionId }: WebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId)

  // Determine if we should use fallback immediately
  const shouldUseFallback = !url || url === "wss://your-websocket-endpoint.com" || isPreviewEnvironment()

  const [useFallback, setUseFallback] = useState(shouldUseFallback)

  const webSocketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const cycleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Function to simulate WebSocket messages with mock data
  const simulateMockMessages = useCallback(() => {
    console.log("Starting mock data simulation")

    // Helper function to create a mock message
    const createMockMessage = (data: any): WebSocketMessage => ({
      data: JSON.stringify(data),
      type: "message",
    })

    // Clear any existing intervals and timeouts
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (cycleTimeoutRef.current) {
      clearTimeout(cycleTimeoutRef.current)
      cycleTimeoutRef.current = null
    }

    // Send all mock data immediately for testing
    console.log("Setting all mock data for testing")
    setLastMessage(
      createMockMessage({
        currentStep: 0,
        details: mockShippingData.details,
        quotes: mockShippingData.quotes,
        confirmation: mockShippingData.confirmation,
        payment: mockShippingData.payment,
        label: mockShippingData.label,
      }),
    )

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current)
      }
    }
  }, [])

  // Only attempt to connect if we're not using fallback
  useEffect(() => {
    // If we should use fallback, don't even try to connect
    if (useFallback) {
      simulateMockMessages()
      return
    }

    // Only try to connect in browser environment
    if (typeof window === "undefined") return

    let socket: WebSocket
    let connectionTimeout: NodeJS.Timeout

    try {
      // Build the WebSocket URL with token and session ID
      let wsUrl = url
      const params = new URLSearchParams()

      if (token) {
        params.append('token', token)
      }

      if (currentSessionId) {
        params.append('session_id', currentSessionId)
      }

      // Add params to URL if we have any
      if (params.toString()) {
        wsUrl = `${url}?${params.toString()}`
      }

      console.log("Attempting to connect to WebSocket:", wsUrl)

      // Set a timeout to switch to fallback if connection takes too long
      connectionTimeout = setTimeout(() => {
        console.log("WebSocket connection timed out")
        setUseFallback(true)
      }, 5000)

      socket = new WebSocket(wsUrl)
      webSocketRef.current = socket

      socket.addEventListener("open", () => {
        console.log("WebSocket connection established")
        clearTimeout(connectionTimeout)
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
      })

      socket.addEventListener("message", (event) => {
        try {
          const parsedData = JSON.parse(event.data)
          console.log("Received WebSocket message:", parsedData)

          // Check for session ID in the message
          if (parsedData.session_id && !currentSessionId) {
            console.log("Setting session ID from message:", parsedData.session_id)
            setCurrentSessionId(parsedData.session_id)

            // Store session ID in localStorage for reconnection
            if (typeof window !== 'undefined') {
              localStorage.setItem('shipanion_session_id', parsedData.session_id)
            }
          }

          // Process the message based on its type
          if (parsedData.type === MessageType.CONTEXTUAL_UPDATE) {
            console.log("Received contextual update:", parsedData)
          } else if (parsedData.type === MessageType.CLIENT_TOOL_RESULT) {
            console.log("Received client tool result:", parsedData)
          }

          setLastMessage({
            data: event.data,
            type: parsedData.type || "message",
          })
        } catch (err) {
          console.error("Error parsing WebSocket message:", err)
          setLastMessage({
            data: event.data,
            type: "message",
          })
        }
      })

      socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:", event)
        setIsConnected(false)

        // Try to reconnect unless we're using the fallback
        if (!useFallback && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          const delay = reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1)

          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${delay}ms`)

          reconnectTimeoutRef.current = setTimeout(() => {
            // This will trigger a re-render and attempt reconnection
            setError(new Error("Connection closed. Reconnecting..."))
          }, delay)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log("Max reconnection attempts reached, switching to fallback mode")
          setUseFallback(true)
        }
      })

      socket.addEventListener("error", (err) => {
        console.error("WebSocket error:", err)
        setError(new Error("Failed to connect to WebSocket server"))
        setUseFallback(true)
      })
    } catch (err) {
      console.error("Error creating WebSocket:", err)
      setError(err instanceof Error ? err : new Error("Unknown WebSocket error"))
      setUseFallback(true)
      clearTimeout(connectionTimeout)
    }

    // Clean up on unmount
    return () => {
      if (connectionTimeout) clearTimeout(connectionTimeout)

      if (webSocketRef.current) {
        try {
          webSocketRef.current.close()
        } catch (err) {
          console.error("Error closing WebSocket:", err)
        }
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current)
      }
    }
  }, [url, reconnectInterval, maxReconnectAttempts, useFallback, simulateMockMessages, token, currentSessionId])

  // Function to send messages
  const sendMessage = useCallback(
    (data: string | object) => {
      if (useFallback) {
        console.log("Mock send message:", data)
        return
      }

      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        const message = typeof data === "string" ? data : JSON.stringify(data)
        webSocketRef.current.send(message)
      } else {
        console.error("WebSocket is not connected")
      }
    },
    [useFallback],
  )

  return { isConnected, lastMessage, sendMessage, error, useFallback, sessionId: currentSessionId }
}
