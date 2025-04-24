# Sound Effects

This directory contains sound effects used in the Shipanion UI.

## Files

- `step-advance.mp3`: Played when advancing to a new step in the shipping process
- `success.mp3`: Played when a shipping label is created successfully
- `error.mp3`: Played when an error occurs
- `notification.mp3`: Played when new data is received (quotes, details, etc.)

## Attribution

These sound effects are placeholders. In a production environment, you should:

1. Use properly licensed sound effects
2. Optimize audio files for web (small file size, appropriate format)
3. Consider accessibility (not too loud, not distracting)

## Usage

Sound effects are managed by the `sound-effects.ts` utility in the `lib` directory.
Users can toggle sound effects on/off using the sound toggle button in the UI.
