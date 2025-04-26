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
    case "client_tool_call":
      if (message.payload?.tool_name === "get_shipping_quotes") {
        dispatch({ type: "QUOTE_REQUEST_SENT" });
      }
      break;
    case "client_tool_result":
      dispatch({ type: "TOOL_RESULT_RECEIVED", payload: message.payload });
      dispatch({ type: "QUOTE_REQUEST_RECEIVED" });
      break;
    case "contextual_update":
      console.info("Contextual update received:", message.payload);
      if (typeof window !== "undefined") {
        // Dynamically import toast to avoid circular deps
        import("./hooks/use-toast").then(({ toast }) => {
          toast({
            title: "Update",
            description: typeof message.payload === "string" ? message.payload : JSON.stringify(message.payload),
            duration: 4000,
            variant: "info",
          });
        });
      }
      break;
    // Add additional known types as needed
    default:
      console.warn("Unhandled message type:", message.type);
  }
}
