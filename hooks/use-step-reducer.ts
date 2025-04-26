"use client"

import { useReducer, useEffect } from 'react'
import { MessageType, ContextualUpdateType } from './use-web-socket'

// Define the shipping steps
export enum ShippingStep {
  ZIP_COLLECTED = 0,
  WEIGHT_CONFIRMED = 1,
  QUOTE_READY = 2,
  LABEL_CREATED = 3
}

// Define the state interface
export interface StepState {
  currentStep: ShippingStep
  completedSteps: ShippingStep[]
  lastUpdated: Date | null
}

// Define action types
export enum StepActionType {
  SET_STEP = 'SET_STEP',
  COMPLETE_STEP = 'COMPLETE_STEP',
  PROCESS_WEBSOCKET_MESSAGE = 'PROCESS_WEBSOCKET_MESSAGE'
}

// Define action interfaces
interface SetStepAction {
  type: StepActionType.SET_STEP
  payload: ShippingStep
}

interface CompleteStepAction {
  type: StepActionType.COMPLETE_STEP
  payload: ShippingStep
}

interface ProcessWebSocketMessageAction {
  type: StepActionType.PROCESS_WEBSOCKET_MESSAGE
  payload: any
}

// Union type for all actions
export type StepAction = 
  | SetStepAction
  | CompleteStepAction
  | ProcessWebSocketMessageAction

// Initial state
const initialState: StepState = {
  currentStep: ShippingStep.ZIP_COLLECTED,
  completedSteps: [],
  lastUpdated: null
}

// Helper function to process WebSocket messages
function processWebSocketMessage(state: StepState, message: any): StepState {
  try {
    // Parse the message if it's a string
    const data = typeof message.data === 'string' ? JSON.parse(message.data) : message.data
    
    // Process based on message type
    switch (data.type) {
      case MessageType.CONTEXTUAL_UPDATE:
        return processContextualUpdate(state, data)
        
      case MessageType.ZIP_COLLECTED:
        return {
          ...state,
          currentStep: ShippingStep.ZIP_COLLECTED,
          completedSteps: [...state.completedSteps, ShippingStep.ZIP_COLLECTED],
          lastUpdated: new Date()
        }
        
      case MessageType.WEIGHT_CONFIRMED:
        return {
          ...state,
          currentStep: ShippingStep.WEIGHT_CONFIRMED,
          completedSteps: [...state.completedSteps, ShippingStep.WEIGHT_CONFIRMED],
          lastUpdated: new Date()
        }
        
      case MessageType.QUOTE_READY:
        return {
          ...state,
          currentStep: ShippingStep.QUOTE_READY,
          completedSteps: [...state.completedSteps, ShippingStep.QUOTE_READY],
          lastUpdated: new Date()
        }
        
      case MessageType.LABEL_CREATED:
        return {
          ...state,
          currentStep: ShippingStep.LABEL_CREATED,
          completedSteps: [...state.completedSteps, ShippingStep.LABEL_CREATED],
          lastUpdated: new Date()
        }
        
      default:
        return state
    }
  } catch (error) {
    console.error("Error processing WebSocket message in step reducer:", error)
    return state
  }
}

// Helper function to process contextual updates
function processContextualUpdate(state: StepState, data: any): StepState {
  const updateType = data.text as ContextualUpdateType
  
  switch (updateType) {
    case ContextualUpdateType.ZIP_COLLECTED:
      return {
        ...state,
        currentStep: ShippingStep.ZIP_COLLECTED,
        completedSteps: [...state.completedSteps, ShippingStep.ZIP_COLLECTED],
        lastUpdated: new Date()
      }
      
    case ContextualUpdateType.WEIGHT_CONFIRMED:
      return {
        ...state,
        currentStep: ShippingStep.WEIGHT_CONFIRMED,
        completedSteps: [...state.completedSteps, ShippingStep.WEIGHT_CONFIRMED],
        lastUpdated: new Date()
      }
      
    case ContextualUpdateType.QUOTE_READY:
      return {
        ...state,
        currentStep: ShippingStep.QUOTE_READY,
        completedSteps: [...state.completedSteps, ShippingStep.QUOTE_READY],
        lastUpdated: new Date()
      }
      
    case ContextualUpdateType.LABEL_CREATED:
      return {
        ...state,
        currentStep: ShippingStep.LABEL_CREATED,
        completedSteps: [...state.completedSteps, ShippingStep.LABEL_CREATED],
        lastUpdated: new Date()
      }
      
    default:
      return state
  }
}

// Reducer function
function stepReducer(state: StepState, action: StepAction): StepState {
  switch (action.type) {
    case StepActionType.SET_STEP:
      return {
        ...state,
        currentStep: action.payload,
        lastUpdated: new Date()
      }
      
    case StepActionType.COMPLETE_STEP:
      // Only add the step if it's not already in the completedSteps array
      if (state.completedSteps.includes(action.payload)) {
        return state
      }
      
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload],
        lastUpdated: new Date()
      }
      
    case StepActionType.PROCESS_WEBSOCKET_MESSAGE:
      return processWebSocketMessage(state, action.payload)
      
    default:
      return state
  }
}

// Hook to use the step reducer
export function useStepReducer(lastMessage: any = null) {
  const [state, dispatch] = useReducer(stepReducer, initialState)
  
  // Process WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      dispatch({
        type: StepActionType.PROCESS_WEBSOCKET_MESSAGE,
        payload: lastMessage
      })
    }
  }, [lastMessage])
  
  // Helper functions to dispatch actions
  const setStep = (step: ShippingStep) => {
    dispatch({
      type: StepActionType.SET_STEP,
      payload: step
    })
  }
  
  const completeStep = (step: ShippingStep) => {
    dispatch({
      type: StepActionType.COMPLETE_STEP,
      payload: step
    })
  }
  
  return {
    state,
    setStep,
    completeStep
  }
}
