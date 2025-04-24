"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PaymentData } from "@/types/shipping"
import { CreditCard, Calendar, Lock } from "lucide-react"
import { motion } from "framer-motion"

interface PaymentCardProps {
  data: PaymentData | null
}

export function PaymentCard({ data }: PaymentCardProps) {
  // Debug logging
  useEffect(() => {
    console.log("PaymentCard data:", data)
  }, [data])

  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardholderName, setCardholderName] = useState("")

  // Update state when data changes
  useEffect(() => {
    if (data) {
      setCardNumber(data.cardNumber || "")
      setExpiryDate(data.expiryDate || "")
      setCvv(data.cvv || "")
      setCardholderName(data.cardholderName || "")
    }
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
            Waiting for payment information...
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="w-full dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CreditCard className="h-5 w-5" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Payment Information
            </motion.span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div className="grid gap-4" variants={container} initial="hidden" animate="show">
            <motion.div className="grid gap-2" variants={item}>
              <Label htmlFor="cardholder-name">Cardholder Name</Label>
              <Input
                id="cardholder-name"
                placeholder="John Doe"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
              />
            </motion.div>

            <motion.div className="grid gap-2" variants={item}>
              <Label htmlFor="card-number">Card Number</Label>
              <div className="relative">
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                />
                <motion.div
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <div className="flex gap-1">
                    <div className="bg-white dark:bg-gray-700 rounded p-0.5">
                      <img src="/cards/visa.svg" alt="Visa" className="h-5 w-auto" />
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded p-0.5">
                      <img src="/cards/mastercard.svg" alt="Mastercard" className="h-5 w-auto" />
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded p-0.5">
                      <img src="/cards/amex.svg" alt="American Express" className="h-5 w-auto" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div className="grid grid-cols-2 gap-4" variants={item}>
              <div className="grid gap-2">
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <div className="relative">
                  <Input
                    id="expiry-date"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvv">CVV</Label>
                <div className="relative">
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <Lock className="h-3 w-3" />
              Your payment information is encrypted and secure
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
