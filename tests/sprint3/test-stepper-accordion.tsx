"use client"

import { useState } from 'react'
import { StepperAccordion } from '@/components/shipping-feed/stepper-accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShippingStep } from '@/hooks/use-step-reducer'

/**
 * Test component for StepperAccordion
 * 
 * This component allows testing the StepperAccordion with different step states.
 */
export default function TestStepperAccordion() {
  // State for the current step
  const [currentStep, setCurrentStep] = useState(0)
  
  // State for the step reducer state
  const [stepState, setStepState] = useState({
    currentStep: ShippingStep.ZIP_COLLECTED,
    completedSteps: [] as ShippingStep[],
    lastUpdated: new Date()
  })
  
  // Define the steps for the StepperAccordion
  const steps = [
    {
      title: "Shipping Details",
      content: (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-medium">Shipping Details Content</h3>
          <p className="text-sm text-gray-500">This is the content for the shipping details step.</p>
        </div>
      ),
      isComplete: currentStep > 0,
      isActive: currentStep === 0,
      isUpdated: false
    },
    {
      title: "Shipping Quotes",
      content: (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-medium">Shipping Quotes Content</h3>
          <p className="text-sm text-gray-500">This is the content for the shipping quotes step.</p>
        </div>
      ),
      isComplete: currentStep > 1,
      isActive: currentStep === 1,
      isUpdated: false
    },
    {
      title: "Confirmation",
      content: (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-medium">Confirmation Content</h3>
          <p className="text-sm text-gray-500">This is the content for the confirmation step.</p>
        </div>
      ),
      isComplete: currentStep > 2,
      isActive: currentStep === 2,
      isUpdated: false
    },
    {
      title: "Label",
      content: (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-medium">Label Content</h3>
          <p className="text-sm text-gray-500">This is the content for the label step.</p>
        </div>
      ),
      isComplete: currentStep > 3,
      isActive: currentStep === 3,
      isUpdated: false
    }
  ]
  
  // Function to advance the current step
  const advanceStep = () => {
    setCurrentStep(prev => Math.min(3, prev + 1))
  }
  
  // Function to go back to the previous step
  const previousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }
  
  // Function to advance the step reducer state
  const advanceStepState = () => {
    const nextStep = Math.min(3, stepState.currentStep + 1) as ShippingStep
    setStepState(prev => ({
      ...prev,
      currentStep: nextStep,
      completedSteps: [...prev.completedSteps, nextStep],
      lastUpdated: new Date()
    }))
  }
  
  // Function to go back to the previous step in the step reducer state
  const previousStepState = () => {
    const prevStep = Math.max(0, stepState.currentStep - 1) as ShippingStep
    setStepState(prev => ({
      ...prev,
      currentStep: prevStep,
      lastUpdated: new Date()
    }))
  }
  
  // Function to mark a step as completed
  const completeStep = (step: ShippingStep) => {
    if (!stepState.completedSteps.includes(step)) {
      setStepState(prev => ({
        ...prev,
        completedSteps: [...prev.completedSteps, step],
        lastUpdated: new Date()
      }))
    }
  }
  
  // Function to mark a step as updated
  const markStepAsUpdated = (index: number) => {
    const newSteps = [...steps]
    newSteps[index] = {
      ...newSteps[index],
      isUpdated: true
    }
    // We need to force a re-render
    setCurrentStep(prev => prev)
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">StepperAccordion Test</h1>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Step Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Current Step: {currentStep}</span>
                <div className="flex gap-2">
                  <Button onClick={previousStep} variant="outline" size="sm">Previous</Button>
                  <Button onClick={advanceStep} variant="outline" size="sm">Next</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {steps.map((_, index) => (
                  <Button 
                    key={index}
                    onClick={() => markStepAsUpdated(index)}
                    variant="secondary"
                    size="sm"
                  >
                    Mark Step {index} as Updated
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Step Reducer Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Current Step: {stepState.currentStep}</span>
                <div className="flex gap-2">
                  <Button onClick={previousStepState} variant="outline" size="sm">Previous</Button>
                  <Button onClick={advanceStepState} variant="outline" size="sm">Next</Button>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Completed Steps:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {stepState.completedSteps.length > 0 ? (
                    stepState.completedSteps.map(step => (
                      <span key={step} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                        Step {step}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No steps completed yet</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map(step => (
                  <Button 
                    key={step}
                    onClick={() => completeStep(step as ShippingStep)}
                    variant="secondary"
                    size="sm"
                    disabled={stepState.completedSteps.includes(step as ShippingStep)}
                  >
                    Complete Step {step}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">StepperAccordion Component:</h2>
        <StepperAccordion 
          steps={steps} 
          currentStep={currentStep} 
          stepState={stepState} 
        />
      </div>
    </div>
  )
}
