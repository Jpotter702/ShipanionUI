"use client"

import { useState, useEffect } from 'react'
import { QuotesCard } from '@/components/shipping-feed/quotes-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageType, ClientToolType } from '@/hooks/use-web-socket'
import { ShippingQuotes } from '@/types/shipping'
import { useShipping } from '@/contexts/shipping-context'

/**
 * Test component for client_tool_result handling
 * 
 * This component simulates receiving a client_tool_result message with tool_name: get_shipping_quotes
 * and verifies that it's correctly dispatched to the reducer for the QuoteCard to render.
 */
export default function TestClientToolResult() {
  const { dispatch, shippingData } = useShipping()
  const [quotes, setQuotes] = useState<ShippingQuotes | null>(null)
  
  // Update local quotes state when shippingData.quotes changes
  useEffect(() => {
    if (shippingData.quotes) {
      setQuotes(shippingData.quotes)
    }
  }, [shippingData.quotes])
  
  // Simulate receiving a client_tool_result message with tool_name: get_shipping_quotes
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
  
  // Simulate receiving a client_tool_result message with an error
  const simulateErrorResult = () => {
    // Create a client_tool_result message with an error
    const message = {
      type: MessageType.CLIENT_TOOL_RESULT,
      tool_name: ClientToolType.GET_SHIPPING_QUOTES,
      tool_call_id: "test-shipping-quotes-error",
      result: {
        error: "Failed to get shipping quotes: timeout calling rates endpoint"
      },
      is_error: true
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
  
  // Reset the quotes
  const resetQuotes = () => {
    setQuotes(null)
    dispatch({
      type: 'SET_SHIPPING_QUOTES',
      payload: null
    })
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Client Tool Result Test</h1>
      
      <div className="flex gap-4 mb-8">
        <Button onClick={simulateClientToolResult}>
          Simulate Shipping Quotes Result
        </Button>
        
        <Button onClick={simulateErrorResult} variant="destructive">
          Simulate Error Result
        </Button>
        
        <Button onClick={resetQuotes} variant="outline">
          Reset Quotes
        </Button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Current Quotes State:</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-40">
          {JSON.stringify(quotes, null, 2)}
        </pre>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-2">QuotesCard Component:</h2>
        <QuotesCard data={quotes} />
      </div>
    </div>
  )
}
