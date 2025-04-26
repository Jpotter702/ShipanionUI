"use client"

import { ShippingData, ShippingDetails, ShippingQuotes, ShippingConfirmation, PaymentData, LabelData } from "@/types/shipping"
import { MessageType, ContextualUpdateType, ClientToolType } from "@/hooks/use-web-socket"

// Define action types
export enum ActionType {
  SET_CURRENT_STEP = 'SET_CURRENT_STEP',
  SET_SHIPPING_DETAILS = 'SET_SHIPPING_DETAILS',
  SET_SHIPPING_QUOTES = 'SET_SHIPPING_QUOTES',
  SET_SHIPPING_CONFIRMATION = 'SET_SHIPPING_CONFIRMATION',
  SET_PAYMENT_DATA = 'SET_PAYMENT_DATA',
  SET_LABEL_DATA = 'SET_LABEL_DATA',
  SET_LOADING_QUOTES = 'SET_LOADING_QUOTES',
  SET_LOADING_LABEL = 'SET_LOADING_LABEL',
  PROCESS_WEBSOCKET_MESSAGE = 'PROCESS_WEBSOCKET_MESSAGE',
  LABEL_CREATED = 'LABEL_CREATED',
  TOOL_RESULT_RECEIVED = 'TOOL_RESULT_RECEIVED',
  QUOTE_REQUEST_SENT = 'QUOTE_REQUEST_SENT',
  QUOTE_REQUEST_RECEIVED = 'QUOTE_REQUEST_RECEIVED'
}

// Define action interfaces
interface SetCurrentStepAction {
  type: ActionType.SET_CURRENT_STEP
  payload: number
}

interface SetShippingDetailsAction {
  type: ActionType.SET_SHIPPING_DETAILS
  payload: ShippingDetails
}

interface SetShippingQuotesAction {
  type: ActionType.SET_SHIPPING_QUOTES
  payload: ShippingQuotes
}

interface SetShippingConfirmationAction {
  type: ActionType.SET_SHIPPING_CONFIRMATION
  payload: ShippingConfirmation
}

interface SetPaymentDataAction {
  type: ActionType.SET_PAYMENT_DATA
  payload: PaymentData
}

interface SetLabelDataAction {
  type: ActionType.SET_LABEL_DATA
  payload: LabelData
}

interface SetLoadingQuotesAction {
  type: ActionType.SET_LOADING_QUOTES
  payload: boolean
}

interface SetLoadingLabelAction {
  type: ActionType.SET_LOADING_LABEL
  payload: boolean
}

interface ProcessWebSocketMessageAction {
  type: ActionType.PROCESS_WEBSOCKET_MESSAGE
  payload: any
}

interface LabelCreatedAction {
  type: ActionType.LABEL_CREATED
  payload: LabelData
}

interface ToolResultReceivedAction {
  type: ActionType.TOOL_RESULT_RECEIVED
  payload: any // use a more specific type if available
}

interface QuoteRequestSentAction {
  type: ActionType.QUOTE_REQUEST_SENT
}

interface QuoteRequestReceivedAction {
  type: ActionType.QUOTE_REQUEST_RECEIVED
}

// Union type for all actions
export type ShippingAction =
  | SetCurrentStepAction
  | SetShippingDetailsAction
  | SetShippingQuotesAction
  | SetShippingConfirmationAction
  | SetPaymentDataAction
  | SetLabelDataAction
  | SetLoadingQuotesAction
  | SetLoadingLabelAction
  | ProcessWebSocketMessageAction
  | LabelCreatedAction
  | ToolResultReceivedAction
  | QuoteRequestSentAction
  | QuoteRequestReceivedAction

// Initial state
export const initialState: ShippingData = {
  currentStep: 0,
  details: null,
  quotes: null,
  confirmation: null,
  payment: null,
  label: null,
  loadingQuotes: false,
  loadingLabel: false
}

// Helper function to process contextual updates
function processContextualUpdate(state: ShippingData, data: any): ShippingData {
  const updateType = data.text as ContextualUpdateType
  const updateData = data.data

  switch (updateType) {
    case ContextualUpdateType.ZIP_COLLECTED:
      return {
        ...state,
        currentStep: 0,
        details: {
          ...state.details,
          originZip: updateData.from,
          destinationZip: updateData.to
        }
      }

    case ContextualUpdateType.WEIGHT_CONFIRMED:
      return {
        ...state,
        currentStep: 0,
        details: {
          ...state.details,
          weight: updateData.weight_lbs
        }
      }

    case ContextualUpdateType.QUOTE_READY:
      // Map the data to our ShippingQuotes format
      const quotes = {
        quotes: updateData.all_options?.map((option: any) => ({
          carrier: option.carrier,
          service: option.service_name,
          cost: option.cost,
          estimatedDelivery: `${option.transit_days} days`
        })) || [],
        selectedIndex: 0 // Default to the first option
      }

      return {
        ...state,
        currentStep: 1, // Move to quotes step
        quotes
      }

    case ContextualUpdateType.LABEL_CREATED:
      const label = {
        labelPdfUrl: updateData.label_url,
        trackingNumber: updateData.tracking_number,
        qrCodeUrl: updateData.qr_code
      }

      return {
        ...state,
        currentStep: 4, // Move to label step
        label
      }

    default:
      return state
  }
}

// Helper function to process client tool results
function processClientToolResult(state: ShippingData, data: any): ShippingData {
  console.log("Processing client tool result:", data)

  // Check if it's an error
  if (data.is_error) {
    console.error("Client tool error:", data.result?.error || "Unknown error")
    return state
  }

  // Check for the tool_name property from our formatted message
  if (data.tool_name === ClientToolType.GET_SHIPPING_QUOTES) {
    console.log("Processing shipping quotes result:", data.result)

    // Make sure we have a valid result array
    if (!Array.isArray(data.result)) {
      console.error("Invalid shipping quotes result format:", data.result)
      return state
    }

    // This is a shipping quotes result
    const quotes = {
      quotes: data.result.map((quote: any) => ({
        carrier: quote.carrier,
        service: quote.service,
        cost: quote.price,
        estimatedDelivery: quote.eta
      })),
      selectedIndex: 0
    }

    return {
      ...state,
      currentStep: 1, // Move to quotes step
      quotes,
      loadingQuotes: false // Set loading to false when quotes are received
    }
  }
  // Process based on the tool call ID or result structure (fallback for backward compatibility)
  else if (data.tool_call_id?.includes('shipping_quotes') ||
      (Array.isArray(data.result) && data.result[0]?.carrier && data.result[0]?.price)) {
    // This is a shipping quotes result
    const quotes = {
      quotes: data.result.map((quote: any) => ({
        carrier: quote.carrier,
        service: quote.service,
        cost: quote.price,
        estimatedDelivery: quote.eta
      })),
      selectedIndex: 0
    }

    return {
      ...state,
      currentStep: 1, // Move to quotes step
      quotes,
      loadingQuotes: false // Set loading to false when quotes are received
    }
  }
  // Check for the tool_name property for create_label
  else if (data.tool_name === ClientToolType.CREATE_LABEL) {
    console.log("Processing create label result:", data.result)

    // Make sure we have a valid result
    if (!data.result || !data.result.tracking_number || !data.result.label_url) {
      console.error("Invalid create label result format:", data.result)
      return state
    }

    // This is a label creation result
    const label = {
      labelPdfUrl: data.result.label_url,
      trackingNumber: data.result.tracking_number,
      qrCodeUrl: data.result.qr_code
    }

    return {
      ...state,
      currentStep: 4, // Move to label step
      label,
      loadingLabel: false // Set loading to false when label is received
    }
  }
  // Fallback for backward compatibility
  else if (data.tool_call_id?.includes('create_label') ||
            (data.result?.tracking_number && data.result?.label_url)) {
    // This is a label creation result
    const label = {
      labelPdfUrl: data.result.label_url,
      trackingNumber: data.result.tracking_number,
      qrCodeUrl: data.result.qr_code
    }

    return {
      ...state,
      currentStep: 4, // Move to label step
      label,
      loadingLabel: false // Set loading to false when label is received
    }
  }

  // If we can't determine the type, just return the current state
  console.warn("Could not determine client tool result type:", data)
  return state
}

// Reducer function
export function shippingReducer(state: ShippingData, action: ShippingAction): ShippingData {
  switch (action.type) {
    case ActionType.SET_CURRENT_STEP:
      return {
        ...state,
        currentStep: action.payload
      }

    case ActionType.SET_SHIPPING_DETAILS:
      return {
        ...state,
        details: action.payload
      }

    case ActionType.SET_SHIPPING_QUOTES:
      return {
        ...state,
        quotes: action.payload
      }

    case "TOOL_RESULT_RECEIVED":
      return {
        ...state,
        quotes: action.payload.quotes || [],
        currentStep: 1 // or a string like "QuoteReady" if that's your convention
      }

    case ActionType.SET_SHIPPING_CONFIRMATION:
      return {
        ...state,
        confirmation: action.payload
      }

    case ActionType.SET_PAYMENT_DATA:
      return {
        ...state,
        payment: action.payload
      }

    case ActionType.SET_LABEL_DATA:
      return {
        ...state,
        label: action.payload
      }

    case "LABEL_CREATED":
      return {
        ...state,
        label: action.payload,
        currentStep: 4 // or a string like "LabelCreated" if that's your convention
      }

    case ActionType.SET_LOADING_QUOTES:
      return {
        ...state,
        loadingQuotes: action.payload
      }

    case ActionType.QUOTE_REQUEST_SENT:
      return {
        ...state,
        loadingQuotes: true
      }

    case ActionType.QUOTE_REQUEST_RECEIVED:
      return {
        ...state,
        loadingQuotes: false
      }

    case ActionType.SET_LOADING_LABEL:
      return {
        ...state,
        loadingLabel: action.payload
      }

    case ActionType.PROCESS_WEBSOCKET_MESSAGE:
      const message = action.payload

      try {
        // Parse the message if it's a string
        const data = typeof message.data === 'string' ? JSON.parse(message.data) : message.data

        // Process based on message type
        switch (data.type) {
          case MessageType.CONTEXTUAL_UPDATE:
            return processContextualUpdate(state, data)

          case MessageType.CLIENT_TOOL_CALL:
            console.log("Processing client tool call:", data)

            // Set loading state based on tool_name
            if (data.tool_name === ClientToolType.GET_SHIPPING_QUOTES) {
              return {
                ...state,
                loadingQuotes: true
              }
            } else if (data.tool_name === ClientToolType.CREATE_LABEL) {
              return {
                ...state,
                loadingLabel: true
              }
            }
            return state

          case MessageType.CLIENT_TOOL_RESULT:
            return processClientToolResult(state, data)

          case MessageType.QUOTE_READY:
            // Direct quote_ready message (not wrapped in contextual_update)
            const quotes = {
              quotes: data.payload.all_options?.map((option: any) => ({
                carrier: option.carrier,
                service: option.service_name,
                cost: option.cost,
                estimatedDelivery: `${option.transit_days} days`
              })) || [],
              selectedIndex: 0
            }

            return {
              ...state,
              currentStep: 1,
              quotes
            }

          case MessageType.LABEL_CREATED:
            // Direct label_created message
            const label = {
              labelPdfUrl: data.payload.label_url,
              trackingNumber: data.payload.tracking_number,
              qrCodeUrl: data.payload.qr_code
            }

            return {
              ...state,
              currentStep: 4,
              label
            }

          default:
            // If it's a message we don't recognize, just return the current state
            return state
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error)
        return state
      }

    default:
      return state
  }
}
