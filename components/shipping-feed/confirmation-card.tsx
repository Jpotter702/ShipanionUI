"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ShippingConfirmation } from "@/types/shipping"
import { MapPin, Package } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect } from "react"

interface ConfirmationCardProps {
  data: ShippingConfirmation | null
}

export function ConfirmationCard({ data }: ConfirmationCardProps) {
  // Debug logging
  useEffect(() => {
    console.log("ConfirmationCard data:", data)
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
            Waiting for shipping confirmation...
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  // Ensure we have the required data
  const fromAddress = data.fromAddress || {
    name: "N/A",
    street: "N/A",
    city: "N/A",
    state: "N/A",
    zip: "N/A",
  }

  const toAddress = data.toAddress || {
    name: "N/A",
    street: "N/A",
    city: "N/A",
    state: "N/A",
    zip: "N/A",
  }

  const packageDetails = data.packageDetails || {
    weight: 0,
    dimensions: "N/A",
    service: "N/A",
    carrier: "N/A",
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
          <CardTitle className="text-lg">Shipping Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div className="space-y-4" variants={item}>
              <div className="flex items-start gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                </motion.div>
                <div>
                  <h3 className="font-medium">From</h3>
                  <address className="not-italic text-sm text-gray-600 dark:text-gray-400">
                    {fromAddress.name}
                    <br />
                    {fromAddress.street}
                    <br />
                    {fromAddress.city}, {fromAddress.state} {fromAddress.zip}
                  </address>
                </div>
              </div>
            </motion.div>
            <motion.div className="space-y-4" variants={item}>
              <div className="flex items-start gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                >
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                </motion.div>
                <div>
                  <h3 className="font-medium">To</h3>
                  <address className="not-italic text-sm text-gray-600 dark:text-gray-400">
                    {toAddress.name}
                    <br />
                    {toAddress.street}
                    <br />
                    {toAddress.city}, {toAddress.state} {toAddress.zip}
                  </address>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="border-t dark:border-gray-800 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div className="flex items-start gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
              >
                <Package className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              </motion.div>
              <div>
                <h3 className="font-medium">Package Details</h3>
                <motion.div
                  className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {[
                    { label: "Weight", value: `${packageDetails.weight} lbs` },
                    { label: "Dimensions", value: packageDetails.dimensions },
                    { label: "Service", value: packageDetails.service },
                    { label: "Carrier", value: packageDetails.carrier },
                  ].map((detail, index) => (
                    <motion.div key={detail.label} variants={item}>
                      <span className="text-gray-500 dark:text-gray-400">{detail.label}:</span> {detail.value}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
