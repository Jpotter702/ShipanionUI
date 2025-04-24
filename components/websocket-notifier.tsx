"use client"

import { useEffect, useRef } from "react"
import { useShipping } from "@/contexts/shipping-context"
import { useToast } from "@/contexts/toast-context"
import { MessageType, ContextualUpdateType } from "@/hooks/use-web-socket"
import { playSound } from "@/lib/sound-effects"

export function WebSocketNotifier() {
  const { shippingData, isConnected, sessionId } = useShipping()
  const { addToast } = useToast()
  const prevConnectedRef = useRef(isConnected)
  const prevStepRef = useRef(shippingData.currentStep)
  const prevSessionIdRef = useRef(sessionId)

  // Show connection status changes
  useEffect(() => {
    // Skip initial render
    if (prevConnectedRef.current === isConnected) {
      prevConnectedRef.current = isConnected
      return
    }

    if (isConnected) {
      addToast({
        title: "Connected",
        description: "WebSocket connection established",
        type: "success",
        duration: 3000,
      })

      // Play success sound when connected
      playSound('success', 0.2)
    } else {
      addToast({
        title: "Disconnected",
        description: "WebSocket connection lost. Attempting to reconnect...",
        type: "warning",
        duration: 5000,
      })

      // Play error sound when disconnected
      playSound('error', 0.2)
    }

    prevConnectedRef.current = isConnected
  }, [isConnected, addToast])

  // Show session ID changes
  useEffect(() => {
    // Skip initial render
    if (prevSessionIdRef.current === sessionId) {
      prevSessionIdRef.current = sessionId
      return
    }

    if (sessionId) {
      addToast({
        title: "Session Active",
        description: `Connected to session: ${sessionId.substring(0, 8)}...`,
        type: "info",
        duration: 4000,
        action: {
          label: "Share",
          onClick: () => {
            // Create a shareable link with the session ID
            const url = new URL(window.location.href)
            url.searchParams.set('session_id', sessionId)
            navigator.clipboard.writeText(url.toString())

            addToast({
              title: "Link Copied",
              description: "Session link copied to clipboard",
              type: "success",
              duration: 2000,
            })

            // Play notification sound when link is copied
            playSound('notification', 0.2)
          }
        }
      })

      // Play notification sound when session is active
      playSound('notification', 0.2)
    }

    prevSessionIdRef.current = sessionId
  }, [sessionId, addToast])

  // Show step changes
  useEffect(() => {
    const currentStep = shippingData.currentStep

    // Skip initial render
    if (prevStepRef.current === currentStep) {
      prevStepRef.current = currentStep
      return
    }

    // Only show notifications for advancing steps
    if (currentStep > prevStepRef.current) {
      const stepMessages = [
        "Shipping details updated",
        "Shipping quotes received",
        "Shipping confirmation ready",
        "Payment processed",
        "Shipping label created"
      ]

      if (currentStep < stepMessages.length) {
        addToast({
          title: `Step ${currentStep + 1}`,
          description: stepMessages[currentStep],
          type: "info",
          duration: 3000,
        })
      }
    }

    prevStepRef.current = currentStep
  }, [shippingData.currentStep, addToast])

  return null // This component doesn't render anything
}
