# Shipping WebSocket Demo UI

This directory contains the UI component for the Shipanion WebSocket demo, which showcases real-time control of shipping UI components through WebSocket messages.

## Overview

The Shipping WebSocket Demo demonstrates how backend systems can control UI components in real-time through WebSocket messages. This creates a responsive and interactive shipping experience.

## Features

- Real-time UI updates via WebSockets
- Stepper accordion visualization of shipping workflow
- Multi-step shipping process demonstration:
  1. Shipping details (ZIP codes, weight)
  2. Shipping quotes from multiple carriers
  3. Confirmation
  4. Payment
  5. Label creation
- WebSocket message monitoring with throttling
- Performance optimized for resource efficiency

## Components

This demo uses several components:

- **ShippingWSDemo**: Main component orchestrating the demo UI
- **StepperAccordion**: Visualizes the shipping workflow as steps
- **ShippingFeedContainer**: Displays the actual shipping UI
- **ShippingProvider**: Context provider for shipping data

## WebSocket Messages

The demo responds to these WebSocket message types:

| Message Type | Description | UI Effect |
|--------------|-------------|-----------|
| `contextual_update` | Updates for ZIP codes or weight | Updates shipping details step |
| `quote_ready` | Shipping quotes from carriers | Displays carrier quotes |
| `notification` | Notifications for the user | Shows toast notifications |
| `label_created` | Shipping label generation | Displays label with tracking info |

## Usage

1. Start the WebSocket server (see main README in ShipanionWS directory)
2. Navigate to http://localhost:3000/shipping-ws-demo
3. Run the demo script from ShipanionWS directory: `python ws_ui_demo.py`

## Performance Optimizations

This demo implements several optimizations to prevent high CPU usage:

1. **Throttled WebSocket Messages**: Using custom throttle function that limits message processing to 10 updates per second
2. **Message Limiting**: Only keeping the 10 most recent messages in state
3. **Memoization**: Using React's `useMemo` and `useCallback` hooks to prevent unnecessary re-renders
4. **Debounced Processing**: Adding small delays to batch rapid message updates
5. **Proper Resource Cleanup**: Ensuring all event listeners and timers are cleaned up

## API Routes

- `/ws-demo`: Basic WebSocket demo with simpler UI
- `/shipping-ws-demo`: Full shipping workflow with stepper accordion

## Troubleshooting

If you experience high CPU usage or browser laginess:

1. Close the browser tab immediately
2. Restart the demo with the fixed version of the WebSocket hook
3. Run the fixed demo script: `python fixed_ws_ui_demo.py`

## Related Files

- `hooks/use-web-socket.ts`: Optimized WebSocket hook
- `contexts/shipping-context.tsx`: Shipping data context
- `components/shipping-ws-demo.tsx`: Main demo component
- `reducers/shipping-reducer.ts`: State management for shipping data 