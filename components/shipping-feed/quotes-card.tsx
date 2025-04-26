"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ShippingQuotes, Quote } from "@/types/shipping"
import { Clock, DollarSign } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useRef } from "react"

interface QuotesCardProps {
  data: ShippingQuotes | null
  loading?: boolean
}

export function QuotesCard({ data, loading = false }: QuotesCardProps) {
  // State to track if quotes were just received (for animation)
  const [justReceived, setJustReceived] = useState(false)
  const prevDataRef = useRef<ShippingQuotes | null>(null)

  // Debug logging
  useEffect(() => {
    console.log("QuotesCard data:", data, "loading:", loading)
  }, [data, loading])

  // Detect when new quotes are received
  useEffect(() => {
    // Check if we're receiving quotes for the first time or getting new quotes
    if (data && (!prevDataRef.current || data.quotes.length !== prevDataRef.current.quotes.length)) {
      console.log("New quotes received, triggering animation")
      setJustReceived(true)

      // Reset the flag after a short delay to allow for re-animation on future updates
      const timer = setTimeout(() => {
        setJustReceived(false)
      }, 2000)

      return () => clearTimeout(timer)
    }

    // Update the ref with current data
    prevDataRef.current = data
  }, [data])

  // Show loading state if loading is true or if there's no data
  if (loading || !data) {
    return (
      <Card className="w-full dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? "Fetching Shipping Options..." : "Shipping Options"}
            </motion.span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Show skeleton loading UI */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="border rounded-lg p-4 flex items-center justify-between animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </motion.div>
            ))}

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 mt-4"
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
              {loading ? "Getting the best rates for you..." : "Waiting for shipping quotes..."}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render quotes dynamically from reducer state
  return (
    <Card className="w-full dark:border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Shipping Options
          </motion.span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {data.quotes && data.quotes.length > 0 ? (
            data.quotes.map((quote, index) => (
              <QuoteItem
                key={index}
                quote={quote}
                isSelected={index === (data.selectedIndex ?? 0)}
                delay={index * 0.1}
                isNew={justReceived}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 dark:text-gray-400 text-center py-4"
              // Reset the animation when new quotes are received
              key={justReceived ? "new-quotes" : "existing-quotes"}
            >
              {quotes.length > 0 ? (
                quotes.map((quote, index) => (
                  <QuoteItem
                    key={`${quote.carrier}-${quote.service}-${index}`}
                    quote={quote}
                    isSelected={index === selectedIndex}
                    delay={index * 0.15}
                    isNew={justReceived}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 dark:text-gray-400 text-center py-4"
                >
                  No shipping quotes available
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface QuoteItemProps {
  quote: Quote
  isSelected: boolean
  delay: number
  isNew?: boolean
}

function QuoteItem({ quote, isSelected, delay, isNew = false }: QuoteItemProps) {
  // Animation variants for quote items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay,
        type: "spring",
        stiffness: 100
      }
    }
  }

  // Enhanced animation for newly received quotes
  const newQuoteAnimation = isNew ? {
    initial: { opacity: 0, scale: 0.9, y: 10 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 120,
        damping: 8
      }
    }
  } : {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay,
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <motion.div
      variants={itemVariants}
      {...newQuoteAnimation}
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
            <motion.h3
              className="font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.15, duration: 0.3 }}
            >
              {quote.carrier}
            </motion.h3>
            <motion.p
              className="text-sm text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.3 }}
            >
              {quote.service}
            </motion.p>
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
