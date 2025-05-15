"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { ShippingData } from '@/types/shipping'
import { shippingReducer, initialState, ActionType } from '@/reducers/shipping-reducer'
import { useWebSocket } from '@/hooks/use-web-socket'

// Define the context type
interface ShippingContextType {
  shippingData: ShippingData
  dispatch: React.Dispatch<any>
  isConnected: boolean
  sessionId?: string
  sendMessage: (data: string | object) => void
}

// Create the context with a default value
const ShippingContext = createContext<ShippingContextType>({
  shippingData: initialState,
  dispatch: () => null,
  isConnected: false,
  sendMessage: () => null
})

// Custom hook to use the shipping context
export const useShipping = () => useContext(ShippingContext)

// Props for the provider component
interface ShippingProviderProps {
  children: React.ReactNode
  initialData?: Partial<ShippingData>
  websocketUrl?: string
  token?: string
  sessionId?: string
}

// Helper to debounce action dispatches
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Provider component
export function ShippingProvider({
  children,
  initialData,
  websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8001/ws',
  token,
  sessionId: initialSessionId
}: ShippingProviderProps) {
  // Initialize with merged initial data
  const mergedInitialState = useMemo(() => 
    ({ ...initialState, ...initialData }),
    [] // Only compute this once on mount
  );

  // Create the reducer
  const [shippingData, dispatch] = useReducer(shippingReducer, mergedInitialState)

  // Get session ID from localStorage if available
  const storedSessionId = typeof window !== 'undefined' ? localStorage.getItem('shipanion_session_id') : null
  const sessionIdToUse = initialSessionId || storedSessionId || undefined

  // Initialize WebSocket connection
  const { isConnected, lastMessage, sendMessage, error, useFallback, sessionId } = useWebSocket({
    url: websocketUrl,
    token,
    sessionId: sessionIdToUse,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  })

  // Wrap dispatch in useCallback to prevent unnecessary re-renders
  const processMessage = useCallback((message: any) => {
    if (!message) return;
    
    dispatch({
      type: ActionType.PROCESS_WEBSOCKET_MESSAGE,
      payload: message
    });
  }, []);
  
  // Process WebSocket messages with a debounce to prevent excessive updates
  useEffect(() => {
    if (!lastMessage) return;
    
    const timer = setTimeout(() => {
      processMessage(lastMessage);
    }, 50); // Small delay to batch potential rapid messages
    
    return () => clearTimeout(timer);
  }, [lastMessage, processMessage]);

  // Create the context value with memoization to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    shippingData,
    dispatch,
    isConnected,
    sessionId,
    sendMessage
  }), [shippingData, isConnected, sessionId, sendMessage]);

  return (
    <ShippingContext.Provider value={contextValue}>
      {children}
    </ShippingContext.Provider>
  )
}
