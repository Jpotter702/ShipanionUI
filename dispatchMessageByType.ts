// Centralized dispatcher for WebSocket message types
// Usage: dispatchMessageByType(message, dispatch)

export function dispatchMessageByType(message, dispatch) {
  switch (message.type) {
    case "quote_ready":
      dispatch({ type: "ADD_QUOTE", payload: message.payload });
      break;
    case "label_created":
      dispatch({ type: "LABEL_CREATED", payload: message.payload });
      break;
    case "client_tool_result":
      dispatch({ type: "TOOL_RESULT_RECEIVED", payload: message.payload });
      break;
    // Add additional known types as needed
    default:
      console.warn("Unhandled message type:", message.type);
  }
}
