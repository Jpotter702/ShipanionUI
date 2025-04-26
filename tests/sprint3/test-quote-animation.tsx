"use client"

import { useEffect, useState } from 'react'
import { QuotesCard } from '@/components/shipping-feed/quotes-card'
import { ShippingQuotes } from '@/types/shipping'
import { Button } from '@/components/ui/button'

/**
 * Test component for QuotesCard animation
 * 
 * This component simulates receiving a quote_ready message and displays
 * the QuotesCard component with the animated quotes.
 */
export default function TestQuoteAnimation() {
  const [quotes, setQuotes] = useState<ShippingQuotes | null>(null)
  
  // Simulate receiving quotes
  const simulateQuoteReady = () => {
    // Reset quotes first to simulate a new request
    setQuotes(null)
    
    // After a short delay, set the quotes to simulate receiving a quote_ready message
    setTimeout(() => {
      setQuotes({
        quotes: [
          {
            carrier: "UPS",
            service: "Ground",
            cost: 12.99,
            estimatedDelivery: "3-5 business days",
          },
          {
            carrier: "USPS",
            service: "Priority Mail",
            cost: 9.99,
            estimatedDelivery: "2-3 business days",
          },
          {
            carrier: "FedEx",
            service: "Express Saver",
            cost: 14.99,
            estimatedDelivery: "1-2 business days",
          },
        ],
        selectedIndex: 1,
      })
    }, 1000)
  }
  
  // Simulate receiving different quotes
  const simulateNewQuotes = () => {
    setQuotes({
      quotes: [
        {
          carrier: "DHL",
          service: "Express",
          cost: 18.99,
          estimatedDelivery: "1-2 business days",
        },
        {
          carrier: "UPS",
          service: "Next Day Air",
          cost: 24.99,
          estimatedDelivery: "1 business day",
        },
        {
          carrier: "FedEx",
          service: "2Day",
          cost: 19.99,
          estimatedDelivery: "2 business days",
        },
        {
          carrier: "USPS",
          service: "First Class",
          cost: 7.99,
          estimatedDelivery: "3-5 business days",
        },
      ],
      selectedIndex: 0,
    })
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quote Animation Test</h1>
      
      <div className="flex gap-4 mb-8">
        <Button onClick={simulateQuoteReady}>
          Simulate quote_ready
        </Button>
        
        <Button onClick={simulateNewQuotes} disabled={!quotes}>
          Simulate new quotes
        </Button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Current State:</h2>
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
