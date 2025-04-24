"use client"

import { useEffect, useRef, useState } from "react"
import { StepperAccordion } from "./stepper-accordion"
import { ShippingDetailsCard } from "./shipping-details-card"
import { QuotesCard } from "./quotes-card"
import { ConfirmationCard } from "./confirmation-card"
import { PaymentCard } from "./payment-card"
import { LabelCard } from "./label-card"
import type { ShippingData } from "@/types/shipping"
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import { playSound, preloadSoundEffects } from "@/lib/sound-effects"

interface ShippingFeedProps {
  data: ShippingData
}

export function ShippingFeed({ data }: ShippingFeedProps) {
  const { currentStep, details, quotes, confirmation, payment, label } = data
  const prevStepRef = useRef(currentStep)

  // Animation controls for highlighting updated content
  const detailsControls = useAnimationControls()
  const quotesControls = useAnimationControls()
  const confirmationControls = useAnimationControls()
  const paymentControls = useAnimationControls()
  const labelControls = useAnimationControls()

  // Track manually opened steps for green checkmarks
  const [manuallyCompletedSteps, setManuallyCompletedSteps] = useState<number[]>([])

  // Track which sections have been updated
  const [updatedSections, setUpdatedSections] = useState<number[]>([])

  // Preload sound effects on component mount
  useEffect(() => {
    preloadSoundEffects()
  }, [])

  // Play a sound effect when the step changes
  useEffect(() => {
    if (prevStepRef.current !== currentStep && typeof window !== "undefined") {
      // Only play sound if the step has advanced (not on initial load)
      if (prevStepRef.current !== 0 && currentStep > prevStepRef.current) {
        // Play the step advance sound
        playSound('step-advance', 0.3)
      }

      // Mark all previous steps as completed
      const newCompletedSteps = []
      for (let i = 0; i < currentStep; i++) {
        newCompletedSteps.push(i)
      }
      setManuallyCompletedSteps((prev) => [...new Set([...prev, ...newCompletedSteps])])

      prevStepRef.current = currentStep
    }
  }, [currentStep])

  // Debug logging
  useEffect(() => {
    console.log("ShippingFeed data:", {
      currentStep,
      details,
      quotes,
      confirmation,
      payment,
      label,
      manuallyCompletedSteps,
    })
  }, [currentStep, details, quotes, confirmation, payment, label, manuallyCompletedSteps])

  // Detect changes in data and trigger animations
  useEffect(() => {
    if (details && !updatedSections.includes(0)) {
      detailsControls.start({
        scale: [1, 1.02, 1],
        boxShadow: [
          "0 0 0 rgba(59, 130, 246, 0)",
          "0 0 15px rgba(59, 130, 246, 0.5)",
          "0 0 0 rgba(59, 130, 246, 0)"
        ],
        transition: { duration: 0.5 }
      })
      setUpdatedSections(prev => [...prev, 0])

      // Play notification sound when details are updated
      playSound('notification', 0.2)
    }
  }, [details, updatedSections, detailsControls])

  useEffect(() => {
    if (quotes && !updatedSections.includes(1)) {
      quotesControls.start({
        scale: [1, 1.02, 1],
        boxShadow: [
          "0 0 0 rgba(59, 130, 246, 0)",
          "0 0 15px rgba(59, 130, 246, 0.5)",
          "0 0 0 rgba(59, 130, 246, 0)"
        ],
        transition: { duration: 0.5 }
      })
      setUpdatedSections(prev => [...prev, 1])

      // Play notification sound when quotes are received
      playSound('notification', 0.2)
    }
  }, [quotes, updatedSections, quotesControls])

  useEffect(() => {
    if (confirmation && !updatedSections.includes(2)) {
      confirmationControls.start({
        scale: [1, 1.02, 1],
        boxShadow: [
          "0 0 0 rgba(59, 130, 246, 0)",
          "0 0 15px rgba(59, 130, 246, 0.5)",
          "0 0 0 rgba(59, 130, 246, 0)"
        ],
        transition: { duration: 0.5 }
      })
      setUpdatedSections(prev => [...prev, 2])
    }
  }, [confirmation, updatedSections, confirmationControls])

  useEffect(() => {
    if (payment && !updatedSections.includes(3)) {
      paymentControls.start({
        scale: [1, 1.02, 1],
        boxShadow: [
          "0 0 0 rgba(59, 130, 246, 0)",
          "0 0 15px rgba(59, 130, 246, 0.5)",
          "0 0 0 rgba(59, 130, 246, 0)"
        ],
        transition: { duration: 0.5 }
      })
      setUpdatedSections(prev => [...prev, 3])
    }
  }, [payment, updatedSections, paymentControls])

  useEffect(() => {
    if (label && !updatedSections.includes(4)) {
      labelControls.start({
        scale: [1, 1.02, 1],
        boxShadow: [
          "0 0 0 rgba(59, 130, 246, 0)",
          "0 0 15px rgba(59, 130, 246, 0.5)",
          "0 0 0 rgba(59, 130, 246, 0)"
        ],
        transition: { duration: 0.5 }
      })
      setUpdatedSections(prev => [...prev, 4])

      // Play success sound when label is created
      playSound('success', 0.3)
    }
  }, [label, updatedSections, labelControls])

  // Function to handle manual step completion when a step is opened
  const handleStepOpened = (stepIndex: number) => {
    if (!manuallyCompletedSteps.includes(stepIndex - 1) && stepIndex > 0) {
      setManuallyCompletedSteps((prev) => [...prev, stepIndex - 1])
    }
  }

  const steps = [
    {
      title: "Shipping Details",
      content: (
        <motion.div animate={detailsControls}>
          <ShippingDetailsCard data={details} />
        </motion.div>
      ),
      isComplete: currentStep > 0 || manuallyCompletedSteps.includes(0),
      isActive: currentStep === 0,
      isUpdated: updatedSections.includes(0),
    },
    {
      title: "Shipping Quotes",
      content: (
        <motion.div animate={quotesControls}>
          <QuotesCard data={quotes} />
        </motion.div>
      ),
      isComplete: currentStep > 1 || manuallyCompletedSteps.includes(1),
      isActive: currentStep === 1,
      isUpdated: updatedSections.includes(1),
    },
    {
      title: "Confirmation",
      content: (
        <motion.div animate={confirmationControls}>
          <ConfirmationCard data={confirmation} />
        </motion.div>
      ),
      isComplete: currentStep > 2 || manuallyCompletedSteps.includes(2),
      isActive: currentStep === 2,
      isUpdated: updatedSections.includes(2),
    },
    {
      title: "Payment",
      content: (
        <motion.div animate={paymentControls}>
          <PaymentCard data={payment} />
        </motion.div>
      ),
      isComplete: currentStep > 3 || manuallyCompletedSteps.includes(3),
      isActive: currentStep === 3,
      isUpdated: updatedSections.includes(3),
    },
    {
      title: "Shipping Label",
      content: (
        <motion.div animate={labelControls}>
          <LabelCard data={label} />
        </motion.div>
      ),
      isComplete: currentStep > 4 || manuallyCompletedSteps.includes(4),
      isActive: currentStep === 4,
      isUpdated: updatedSections.includes(4),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`step-${currentStep}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <StepperAccordion steps={steps} currentStep={currentStep} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
