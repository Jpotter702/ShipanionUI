"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
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

// Provider component
export function ShippingProvider({
  children,
  initialData,
  websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000/ws',
  token,
  sessionId: initialSessionId
}: ShippingProviderProps) {
  // Initialize with merged initial data
  const mergedInitialState = { ...initialState, ...initialData }
  
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
  
  // Process WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      dispatch({
        type: ActionType.PROCESS_WEBSOCKET_MESSAGE,
        payload: lastMessage
      })
    }
  }, [lastMessage])
  
  // Log connection status changes
  useEffect(() => {
    console.log('WebSocket connection status:', isConnected ? 'Connected' : 'Disconnected')
    if (error) {
      console.error('WebSocket error:', error)
    }
  }, [isConnected, error])
  
  // Log when session ID changes
  useEffect(() => {
    if (sessionId) {
      console.log('Active session ID:', sessionId)
    }
  }, [sessionId])
  
  // Create the context value
  const contextValue: ShippingContextType = {
    shippingData,
    dispatch,
    isConnected,
    sessionId,
    sendMessage
  }
  
  return (
    <ShippingContext.Provider value={contextValue}>
      {children}
    </ShippingContext.Provider>
  )
}
