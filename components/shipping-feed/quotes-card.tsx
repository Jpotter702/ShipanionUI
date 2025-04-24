"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ShippingQuotes, Quote } from "@/types/shipping"
import { Clock, DollarSign } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect } from "react"

interface QuotesCardProps {
  data: ShippingQuotes | null
}

export function QuotesCard({ data }: QuotesCardProps) {
  // Debug logging
  useEffect(() => {
    console.log("QuotesCard data:", data)
  }, [data])

  if (!data) {
    return (
      <Card className="w-full dark:border-gray-800">
        <CardContent className="p-6 flex items-center justify-center h-32">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-gray-400 dark:text-gray-500 flex items-center gap-2"
          >
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-400 dark:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Waiting for shipping quotes...
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  // Ensure we have quotes array and selectedIndex
  const quotes = data.quotes || []
  const selectedIndex = data.selectedIndex || 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="w-full dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Available Shipping Options</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {quotes.length > 0 ? (
            quotes.map((quote, index) => (
              <QuoteItem key={index} quote={quote} isSelected={index === selectedIndex} delay={index * 0.15} />
            ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4">No shipping quotes available</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface QuoteItemProps {
  quote: Quote
  isSelected: boolean
  delay: number
}

function QuoteItem({ quote, isSelected, delay }: QuoteItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay,
        duration: 0.4,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{ scale: 1.02 }}
      className={`border rounded-lg p-4 transition-colors duration-300 ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-md p-1"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.1, duration: 0.3 }}
          >
            <img
              src={`/carriers/${quote.carrier.toLowerCase()}.svg`}
              alt={quote.carrier}
              className="max-w-full max-h-full"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                console.log(`Failed to load carrier image for ${quote.carrier}`)
              }}
            />
          </motion.div>
          <div>
            <h3 className="font-medium">{quote.carrier}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{quote.service}</p>
          </div>
        </div>
        <div className="text-right">
          <motion.div
            className="flex items-center gap-1 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.3 }}
          >
            <DollarSign className="h-4 w-4" />
            <span>${quote.cost.toFixed(2)}</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.3 }}
          >
            <Clock className="h-3 w-3" />
            <span>{quote.estimatedDelivery}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
