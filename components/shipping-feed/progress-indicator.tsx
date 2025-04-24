"use client"

import { useShipping } from "@/contexts/shipping-context"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function ProgressIndicator() {
  const { shippingData } = useShipping()
  const { currentStep } = shippingData
  const [progress, setProgress] = useState(0)
  
  // Calculate progress percentage
  useEffect(() => {
    // Total number of steps
    const totalSteps = 5
    
    // Calculate progress (0-100%)
    const newProgress = Math.min(100, Math.round((currentStep / (totalSteps - 1)) * 100))
    
    // Animate the progress change
    const timer = setTimeout(() => {
      setProgress(newProgress)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [currentStep])
  
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between mb-1 text-xs text-gray-500 dark:text-gray-400">
        <span>Shipping Progress</span>
        <span>{progress}%</span>
      </div>
      
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex justify-between mt-1 text-xs">
        <span className={currentStep >= 0 ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-600"}>
          Details
        </span>
        <span className={currentStep >= 1 ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-600"}>
          Quotes
        </span>
        <span className={currentStep >= 2 ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-600"}>
          Confirm
        </span>
        <span className={currentStep >= 3 ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-600"}>
          Payment
        </span>
        <span className={currentStep >= 4 ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-600"}>
          Label
        </span>
      </div>
    </div>
  )
}
