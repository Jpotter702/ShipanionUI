"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ShippingDetails } from "@/types/shipping"
import { Package2 } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect } from "react"

interface ShippingDetailsCardProps {
  data: ShippingDetails | null
}

export function ShippingDetailsCard({ data }: ShippingDetailsCardProps) {
  // Debug logging
  useEffect(() => {
    console.log("ShippingDetailsCard data:", data)
  }, [data])

  if (!data || !data.originZip) {
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
            Waiting for shipping details...
          </motion.div>
        </CardContent>
      </Card>
    )
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
              <Package2 className="h-5 w-5" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Package Information
            </motion.span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Origin", value: data.originZip },
              { label: "Destination", value: data.destinationZip },
              { label: "Weight", value: `${data.weight} lbs` },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="space-y-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
              >
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="text-lg font-semibold">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
