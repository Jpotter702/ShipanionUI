"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { mockShippingData } from "@/mock-data"
// Remove lodash import since it's not available
// import { throttle } from "lodash" 

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
  CLIENT_TOOL_CALL = 'client_tool_call',
  ERROR = 'error'
}

// Define contextual update types
export enum ContextualUpdateType {
  QUOTE_READY = 'quote_ready',
  LABEL_CREATED = 'label_created',
  ZIP_COLLECTED = 'zip_collected',
  WEIGHT_CONFIRMED = 'weight_confirmed'
}

// Define client tool types
export enum ClientToolType {
  GET_SHIPPING_QUOTES = 'get_shipping_quotes',
  CREATE_LABEL = 'create_label'
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

// Custom throttle implementation in case lodash isn't available
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastResult: ReturnType<T>;

  return function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    lastArgs = args;

    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        if (lastArgs) {
          lastResult = func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, wait);
      return lastResult = func.apply(this, args);
    }

    return lastResult;
  };
}

// Use our custom throttle implementation directly
// const throttleFn = typeof throttle !== 'undefined' ? throttle : customThrottle;

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

  // Memoize the URL to prevent unnecessary reconnections
  const memoizedUrl = useMemo(() => {
    let wsUrl = url;
    const params = new URLSearchParams();

    if (token) {
      params.append('token', token);
    }

    if (currentSessionId) {
      params.append('session_id', currentSessionId);
    }

    if (params.toString()) {
      wsUrl = `${url}?${params.toString()}`;
    }

    return wsUrl;
  }, [url, token, currentSessionId]);

  // Throttled message setter to prevent excessive re-renders
  const throttledSetLastMessage = useRef(
    throttle((message: WebSocketMessage) => {
      setLastMessage(message);
    }, 100) // Throttle to max 10 updates per second
  ).current;

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

    // Send all mock data immediately for testing - ONCE only
    console.log("Setting mock data for testing")
    throttledSetLastMessage(
      createMockMessage({
        currentStep: 0,
        details: mockShippingData.details,
        quotes: mockShippingData.quotes,
        confirmation: mockShippingData.confirmation,
        payment: mockShippingData.payment,
        label: mockShippingData.label,
      })
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
      return () => {};
    }

    // Only try to connect in browser environment
    if (typeof window === "undefined") return () => {};

    let connectionTimeout: NodeJS.Timeout;
    let socket: WebSocket;

    // Cleanup function to properly clean up all resources
    const cleanup = () => {
      if (connectionTimeout) clearTimeout(connectionTimeout);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (webSocketRef.current) {
        // Remove all event listeners first
        const ws = webSocketRef.current;
        ws.removeEventListener("open", onOpen);
        ws.removeEventListener("message", onMessage);
        ws.removeEventListener("close", onClose);
        ws.removeEventListener("error", onError);
        
        // Then close the connection
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          try {
            ws.close();
          } catch (err) {
            console.error("Error closing WebSocket:", err);
          }
        }
        
        webSocketRef.current = null;
      }
    };

    try {
      console.log("Attempting to connect to WebSocket:", memoizedUrl);

      // Set a timeout to switch to fallback if connection takes too long
      connectionTimeout = setTimeout(() => {
        console.log("WebSocket connection timed out");
        setUseFallback(true);
      }, 5000);

      // Event handlers
      const onOpen = () => {
        console.log("WebSocket connection established");
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      const onMessage = (event: MessageEvent) => {
        try {
          const parsedData = JSON.parse(event.data);
          console.log("Received WebSocket message type:", parsedData.type);

          // Check for session ID in the message
          if (parsedData.session_id && !currentSessionId) {
            console.log("Setting session ID from message:", parsedData.session_id);
            setCurrentSessionId(parsedData.session_id);

            // Store session ID in localStorage for reconnection
            if (typeof window !== 'undefined') {
              localStorage.setItem('shipanion_session_id', parsedData.session_id);
            }
          }

          // Use the throttled setter for all messages
          throttledSetLastMessage({
            data: event.data,
            type: parsedData.type || "message",
          });
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
          throttledSetLastMessage({
            data: event.data,
            type: "message",
          });
        }
      };

      const onClose = (event: CloseEvent) => {
        console.log("WebSocket connection closed:", event);
        setIsConnected(false);

        // Try to reconnect unless we're using the fallback
        if (!useFallback && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          // Exponential backoff, but clamp to 2s min, 10s max
          const baseDelay = Math.max(1000, reconnectInterval);
          const delay = Math.min(10000, baseDelay * Math.pow(1.5, reconnectAttemptsRef.current - 1));

          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${delay}ms`);

          reconnectTimeoutRef.current = setTimeout(() => {
            // This will trigger a re-render and attempt reconnection
            setError(new Error("Connection closed. Reconnecting..."));
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log("Max reconnection attempts reached, switching to fallback mode");
          setUseFallback(true);
        }
      };

      const onError = (err: Event) => {
        console.error("WebSocket error:", err);
        setError(new Error("Failed to connect to WebSocket server"));
      };

      // Create socket and set up event listeners
      socket = new WebSocket(memoizedUrl);
      webSocketRef.current = socket;

      socket.addEventListener("open", onOpen);
      socket.addEventListener("message", onMessage);
      socket.addEventListener("close", onClose);
      socket.addEventListener("error", onError);

    } catch (err) {
      console.error("Error creating WebSocket:", err);
      setError(err instanceof Error ? err : new Error("Unknown WebSocket error"));
      setUseFallback(true);
      clearTimeout(connectionTimeout);
    }

    // Clean up function
    return cleanup;
  }, [memoizedUrl, reconnectInterval, maxReconnectAttempts, useFallback, simulateMockMessages]);

  // Function to send a message through the WebSocket
  const sendMessage = useCallback((data: any) => {
    const messageToSend = typeof data === 'string' ? data : JSON.stringify(data);
    
    if (webSocketRef.current && isConnected) {
      try {
        webSocketRef.current.send(messageToSend);
        return true;
      } catch (err) {
        console.error("Error sending WebSocket message:", err);
        return false;
      }
    } else {
      console.warn("Cannot send message: WebSocket is not connected");
      return false;
    }
  }, [isConnected]);

  return { isConnected, lastMessage, sendMessage, error, useFallback, sessionId: currentSessionId }
}
