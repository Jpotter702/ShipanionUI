"use client"

import { useEffect, useState } from 'react'
import { useStepReducer, ShippingStep } from '@/hooks/use-step-reducer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageType, ContextualUpdateType } from '@/hooks/use-web-socket'

/**
 * Test component for step reducer
 * 
 * This component simulates receiving WebSocket messages and displays
 * the current step and completed steps.
 */
export default function TestStepReducer() {
  // Create a mock WebSocket message
  const [mockMessage, setMockMessage] = useState<any>(null)
  
  // Use the step reducer with our mock message
  const { state: stepState, setStep, completeStep } = useStepReducer(mockMessage)
  
  // Map step names for display
  const stepNames = {
    [ShippingStep.ZIP_COLLECTED]: "ZIP Collected",
    [ShippingStep.WEIGHT_CONFIRMED]: "Weight Confirmed",
    [ShippingStep.QUOTE_READY]: "Quote Ready",
    [ShippingStep.LABEL_CREATED]: "Label Created"
  }
  
  // Simulate receiving a ZIP_COLLECTED message
  const simulateZipCollected = () => {
    const message = {
      data: JSON.stringify({
        type: MessageType.CONTEXTUAL_UPDATE,
        text: ContextualUpdateType.ZIP_COLLECTED,
        data: {
          from: "90210",
          to: "10001"
        }
      }),
      type: "message"
    }
    
    setMockMessage(message)
  }
  
  // Simulate receiving a WEIGHT_CONFIRMED message
  const simulateWeightConfirmed = () => {
    const message = {
      data: JSON.stringify({
        type: MessageType.CONTEXTUAL_UPDATE,
        text: ContextualUpdateType.WEIGHT_CONFIRMED,
        data: {
          weight_lbs: 5.2
        }
      }),
      type: "message"
    }
    
    setMockMessage(message)
  }
  
  // Simulate receiving a QUOTE_READY message
  const simulateQuoteReady = () => {
    const message = {
      data: JSON.stringify({
        type: MessageType.QUOTE_READY,
        payload: {
          all_options: [
            {
              carrier: "UPS",
              service_name: "Ground",
              cost: 12.99,
              transit_days: 3
            },
            {
              carrier: "USPS",
              service_name: "Priority Mail",
              cost: 9.99,
              transit_days: 2
            }
          ]
        }
      }),
      type: "message"
    }
    
    setMockMessage(message)
  }
  
  // Simulate receiving a LABEL_CREATED message
  const simulateLabelCreated = () => {
    const message = {
      data: JSON.stringify({
        type: MessageType.LABEL_CREATED,
        payload: {
          label_url: "https://example.com/label.pdf",
          tracking_number: "1Z999AA10123456784",
          qr_code: "https://example.com/qr.png"
        }
      }),
      type: "message"
    }
    
    setMockMessage(message)
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Step Reducer Test</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Current Step:</h2>
              <Badge variant="outline" className="text-sm font-medium">
                {stepNames[stepState.currentStep]}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Completed Steps:</h3>
              <div className="flex flex-wrap gap-2">
                {stepState.completedSteps.length > 0 ? (
                  stepState.completedSteps.map((step) => (
                    <Badge key={step} variant="secondary" className="text-xs">
                      {stepNames[step]}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No steps completed yet</span>
                )}
              </div>
            </div>
            {stepState.lastUpdated && (
              <div className="text-xs text-gray-500">
                Last updated: {stepState.lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Simulate WebSocket Messages</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={simulateZipCollected} variant="outline">
            Simulate ZIP Collected
          </Button>
          <Button onClick={simulateWeightConfirmed} variant="outline">
            Simulate Weight Confirmed
          </Button>
          <Button onClick={simulateQuoteReady} variant="outline">
            Simulate Quote Ready
          </Button>
          <Button onClick={simulateLabelCreated} variant="outline">
            Simulate Label Created
          </Button>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Manual Controls</h2>
        <div className="flex gap-4">
          <Button 
            onClick={() => {
              const prevStep = Math.max(0, stepState.currentStep - 1) as ShippingStep;
              setStep(prevStep);
            }}
            variant="secondary"
          >
            Previous Step
          </Button>
          <Button 
            onClick={() => {
              const nextStep = Math.min(3, stepState.currentStep + 1) as ShippingStep;
              setStep(nextStep);
              completeStep(nextStep);
            }}
            variant="secondary"
          >
            Next Step
          </Button>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Last Message:</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-60">
          {mockMessage ? JSON.stringify(JSON.parse(mockMessage.data), null, 2) : "No message sent yet"}
        </pre>
      </div>
    </div>
  )
}
