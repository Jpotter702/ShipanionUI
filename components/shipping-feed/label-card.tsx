"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LabelData } from "@/types/shipping"
import { FileText, Printer, Mail, QrCode } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect } from "react"

interface LabelCardProps {
  data: LabelData | null
}

export function LabelCard({ data }: LabelCardProps) {
  // Debug logging
  useEffect(() => {
    console.log("LabelCard data:", data)
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
            Waiting for shipping label...
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  // Ensure we have the required data
  const labelPdfUrl = data.labelPdfUrl || "/placeholder.svg?height=400&width=300"
  const trackingNumber = data.trackingNumber || "N/A"
  const qrCodeUrl = data.qrCodeUrl || "/placeholder.svg?height=200&width=200"

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
              <FileText className="h-5 w-5" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Shipping Label
            </motion.span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <motion.div
            className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="aspect-[8.5/11] bg-white dark:bg-gray-700 border shadow-sm mx-auto max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <iframe src={labelPdfUrl} className="w-full h-full" title="Shipping Label" />
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              className="flex flex-col items-center p-4 border rounded-lg dark:border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <motion.div
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
              >
                <QrCode className="h-24 w-24 mb-2" />
              </motion.div>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">Scan to track your package</p>
              <p className="text-xs font-mono mt-1">{trackingNumber}</p>
            </motion.div>

            <motion.div
              className="flex flex-col gap-2"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                  },
                },
              }}
              initial="hidden"
              animate="show"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button className="w-full flex items-center gap-2 transition-all duration-300">
                  <Printer className="h-4 w-4" />
                  Print Label
                </Button>
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 transition-all duration-300 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <Mail className="h-4 w-4" />
                  Email Label
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
