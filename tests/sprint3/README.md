# Sprint 3 Tests

This directory contains tests for the features implemented in Sprint 3 of the Shipanion project.

## Test Components

### 1. Step Tracking Tests

#### `test-step-reducer.tsx`

Tests the `useStepReducer` hook that tracks the current step in the shipping process.

**Features Tested**:
- Step state management
- WebSocket message processing
- Step completion tracking

**How to Run**:
Navigate to `/tests/sprint3/test-step-reducer` in your browser.

#### `test-stepper-accordion.tsx`

Tests the enhanced `StepperAccordion` component that highlights the active step and shows check icons for completed steps.

**Features Tested**:
- Active step highlighting
- Completed step check icons
- Visual enhancements

**How to Run**:
Navigate to `/tests/sprint3/test-stepper-accordion` in your browser.

### 2. Client Tool Result Tests

#### `test-client-tool-result.tsx`

Tests the handling of `client_tool_result` messages with `tool_name: get_shipping_quotes`.

**Features Tested**:
- Message processing
- Quote rendering
- Error handling

**How to Run**:
Navigate to `/tests/sprint3/test-client-tool-result` in your browser.

#### `test-loading-quotes.tsx`

Tests the loading state while waiting for quotes.

**Features Tested**:
- Loading spinner display
- State management
- Transition from loading to loaded state

**How to Run**:
Navigate to `/tests/sprint3/test-loading-quotes` in your browser.

### 3. Session Continuity Tests

#### `test-session-continuity.tsx`

Tests session continuity features, including reconnection and state restoration.

**Features Tested**:
- Session ID storage
- Reconnection logic
- Session state restoration

**How to Run**:
Navigate to `/tests/sprint3/test-session-continuity` in your browser.

## Running All Tests

To run all tests, follow these steps:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to each test page in your browser:
   - http://localhost:3000/tests/sprint3/test-step-reducer
   - http://localhost:3000/tests/sprint3/test-stepper-accordion
   - http://localhost:3000/tests/sprint3/test-client-tool-result
   - http://localhost:3000/tests/sprint3/test-loading-quotes
   - http://localhost:3000/tests/sprint3/test-session-continuity

3. Follow the instructions on each test page to execute the tests.

## Test Results

Document your test results in a test report that includes:

1. Test name
2. Pass/Fail status
3. Any issues encountered
4. Screenshots if applicable
5. Recommendations for fixes or improvements

## Troubleshooting

If tests fail, consider the following troubleshooting steps:

1. **Component Rendering Issues**:
   - Check the browser console for errors
   - Verify that the component props are correct
   - Ensure that state updates are triggering re-renders

2. **WebSocket Connection Issues**:
   - Verify that the WebSocket server is running
   - Check that the WebSocket URL is correct
   - Ensure that authentication is working

3. **State Management Issues**:
   - Check that state is being updated correctly
   - Verify that state changes are propagating to child components
   - Ensure that useEffect dependencies are correct
