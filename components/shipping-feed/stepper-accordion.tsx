"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { playSound } from "@/lib/sound-effects"

interface Step {
  title: string
  content: ReactNode
  isComplete: boolean
  isActive: boolean
  isUpdated?: boolean
}

interface StepperAccordionProps {
  steps: Step[]
  currentStep: number
}

export function StepperAccordion({ steps, currentStep }: StepperAccordionProps) {
  // Track which steps have been manually opened
  const [openSteps, setOpenSteps] = useState<string[]>([`step-${currentStep}`])

  // Update open steps when currentStep changes
  useEffect(() => {
    if (!openSteps.includes(`step-${currentStep}`)) {
      setOpenSteps((prev) => [...prev, `step-${currentStep}`])

      // Play sound when automatically advancing to a new step
      // But don't play on initial render (when currentStep is 0)
      if (currentStep > 0) {
        playSound('step-advance', 0.3)
      }
    }
  }, [currentStep, openSteps])

  // Handle manual accordion changes
  const handleValueChange = (value: string[]) => {
    // Check if a new step was opened
    if (value.length > openSteps.length) {
      // Find the newly opened step
      const newStep = value.find(step => !openSteps.includes(step))
      if (newStep) {
        // Play the step advance sound
        playSound('step-advance', 0.3)
      }
    }

    setOpenSteps(value)
  }

  // Debug logging
  useEffect(() => {
    console.log(
      "StepperAccordion steps:",
      steps.map((step) => ({
        title: step.title,
        isComplete: step.isComplete,
        isActive: step.isActive,
      })),
    )
  }, [steps])

  return (
    <div className="relative">
      {/* Vertical line connecting steps */}
      <motion.div
        className="absolute left-6 top-10 bottom-10 w-0.5 bg-gray-200 dark:bg-gray-700 z-0"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5 }}
      />

      <Accordion type="multiple" value={openSteps} onValueChange={handleValueChange} className="relative z-10">
        {steps.map((step, index) => (
          <motion.div
            key={`step-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              ease: "easeOut",
            }}
          >
            <AccordionItem
              value={`step-${index}`}
              className={cn(
                "border-b border-l-0 border-r-0 border-t-0 pl-12 relative transition-all duration-300",
                step.isActive && "bg-gray-50 dark:bg-gray-800/50 rounded-md",
                step.isUpdated && !step.isActive && "border-l-2 border-l-blue-500 dark:border-l-blue-400",
              )}
            >
              {/* Step number or check icon - smaller size */}
              <motion.div
                className={cn(
                  "absolute left-0 top-4 flex items-center justify-center w-10 h-10 rounded-full border-2",
                  step.isComplete
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700",
                )}
                initial={false}
                animate={step.isComplete ? { scale: [1, 1.1, 1], borderColor: "#22c55e" } : {}}
                transition={{ duration: 0.3 }}
              >
                {step.isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                  </motion.div>
                ) : (
                  <span
                    className={cn(
                      "text-base font-semibold",
                      step.isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400",
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </motion.div>

              <AccordionTrigger
                className={cn(
                  "py-4 hover:no-underline transition-colors duration-200",
                  step.isActive ? "text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400",
                )}
              >
                <div className="flex items-center gap-2">
                  {step.title}
                  {step.isUpdated && !step.isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative"
                    >
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    </motion.div>
                  )}
                </div>
              </AccordionTrigger>

              <AccordionContent className="pt-2 pb-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  {step.content}
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  )
}
