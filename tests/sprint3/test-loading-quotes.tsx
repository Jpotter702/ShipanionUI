"use client"

import { useState, useEffect } from 'react'
import { QuotesCard } from '@/components/shipping-feed/quotes-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageType, ClientToolType } from '@/hooks/use-web-socket'
import { ShippingQuotes } from '@/types/shipping'
import { useShipping } from '@/contexts/shipping-context'

/**
 * Test component for loading state while waiting for quotes
 * 
 * This component simulates the loading state while waiting for quotes to arrive.
 */
export default function TestLoadingQuotes() {
  const { dispatch, shippingData } = useShipping()
  const [quotes, setQuotes] = useState<ShippingQuotes | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Update local quotes state when shippingData.quotes changes
  useEffect(() => {
    if (shippingData.quotes) {
      setQuotes(shippingData.quotes)
    }
    
    // Update loading state
    setLoading(shippingData.loadingQuotes)
  }, [shippingData.quotes, shippingData.loadingQuotes])
  
  // Simulate sending a client_tool_call for shipping quotes
  const simulateClientToolCall = () => {
    // Create a client_tool_call message
    const message = {
      type: MessageType.CLIENT_TOOL_CALL,
      tool_name: ClientToolType.GET_SHIPPING_QUOTES,
      tool_call_id: `quotes-${Date.now()}`
    }
    
    // Dispatch the message to the reducer
    dispatch({
      type: 'PROCESS_WEBSOCKET_MESSAGE',
      payload: {
        data: JSON.stringify(message),
        type: MessageType.CLIENT_TOOL_CALL
      }
    })
    
    // Simulate receiving a result after a delay
    setTimeout(() => {
      simulateClientToolResult()
    }, 3000)
  }
  
  // Simulate receiving a client_tool_result for shipping quotes
  const simulateClientToolResult = () => {
    // Create a client_tool_result message
    const message = {
      type: MessageType.CLIENT_TOOL_RESULT,
      tool_name: ClientToolType.GET_SHIPPING_QUOTES,
      tool_call_id: "test-shipping-quotes",
      result: [
        {
          carrier: "UPS",
          service: "Ground",
          price: 12.99,
          eta: "3-5 business days"
        },
        {
          carrier: "USPS",
          service: "Priority Mail",
          price: 9.99,
          eta: "2-3 business days"
        },
        {
          carrier: "FedEx",
          service: "Express Saver",
          price: 14.99,
          eta: "1-2 business days"
        }
      ],
      is_error: false
    }
    
    // Dispatch the message to the reducer
    dispatch({
      type: 'PROCESS_WEBSOCKET_MESSAGE',
      payload: {
        data: JSON.stringify(message),
        type: MessageType.CLIENT_TOOL_RESULT
      }
    })
  }
  
  // Reset the quotes and loading state
  const resetQuotes = () => {
    setQuotes(null)
    dispatch({
      type: 'SET_SHIPPING_QUOTES',
      payload: null
    })
    
    dispatch({
      type: 'SET_LOADING_QUOTES',
      payload: false
    })
  }
  
  // Manually set the loading state
  const setLoadingState = (isLoading: boolean) => {
    dispatch({
      type: 'SET_LOADING_QUOTES',
      payload: isLoading
    })
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Loading Quotes Test</h1>
      
      <div className="flex gap-4 mb-8">
        <Button onClick={simulateClientToolCall}>
          Simulate Quote Request
        </Button>
        
        <Button onClick={() => setLoadingState(true)} variant="outline">
          Set Loading: True
        </Button>
        
        <Button onClick={() => setLoadingState(false)} variant="outline">
          Set Loading: False
        </Button>
        
        <Button onClick={resetQuotes} variant="destructive">
          Reset
        </Button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Current State:</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Loading:</span> {loading ? "True" : "False"}
            </div>
            <div>
              <span className="font-medium">Has Quotes:</span> {quotes ? "True" : "False"}
            </div>
          </div>
          {quotes && (
            <div className="mt-4">
              <span className="font-medium">Quote Count:</span> {quotes.quotes.length}
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-2">QuotesCard Component:</h2>
        <QuotesCard data={quotes} loading={loading} />
      </div>
    </div>
  )
}
