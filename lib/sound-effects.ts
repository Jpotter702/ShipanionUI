"use client"

// Sound effect options
export type SoundEffect = 'step-advance' | 'success' | 'error' | 'notification'

// Sound effect volume levels (0-1)
const DEFAULT_VOLUME = 0.2

// Cache for preloaded audio objects
const audioCache: Record<string, HTMLAudioElement> = {}

/**
 * Preload sound effects for better performance
 */
export function preloadSoundEffects() {
  if (typeof window === 'undefined') return
  
  // Preload common sound effects
  loadSound('step-advance', '/sounds/step-advance.mp3')
  loadSound('success', '/sounds/success.mp3')
  loadSound('error', '/sounds/error.mp3')
  loadSound('notification', '/sounds/notification.mp3')
}

/**
 * Load a sound into the cache
 */
function loadSound(name: string, path: string): void {
  if (typeof window === 'undefined') return
  
  if (!audioCache[name]) {
    const audio = new Audio(path)
    audio.preload = 'auto'
    audioCache[name] = audio
    
    // Start loading
    audio.load()
  }
}

/**
 * Play a sound effect
 */
export function playSound(effect: SoundEffect, volume = DEFAULT_VOLUME): void {
  if (typeof window === 'undefined') return
  
  // Check if sound effects are enabled
  const soundEnabled = localStorage.getItem('soundEffectsEnabled') !== 'false'
  if (!soundEnabled) return
  
  // Map effect name to file path
  const soundPaths: Record<SoundEffect, string> = {
    'step-advance': '/sounds/step-advance.mp3',
    'success': '/sounds/success.mp3',
    'error': '/sounds/error.mp3',
    'notification': '/sounds/notification.mp3'
  }
  
  const path = soundPaths[effect]
  
  // Use cached audio if available, otherwise create new
  let audio = audioCache[effect]
  if (!audio) {
    audio = new Audio(path)
    audioCache[effect] = audio
  } else {
    // Reset audio to beginning if it's already playing
    audio.currentTime = 0
  }
  
  // Set volume and play
  audio.volume = volume
  
  // Play the sound (with error handling)
  audio.play().catch(err => {
    console.log(`Failed to play sound effect: ${err.message}`)
  })
}

/**
 * Toggle sound effects on/off
 */
export function toggleSoundEffects(): boolean {
  if (typeof window === 'undefined') return false
  
  const currentSetting = localStorage.getItem('soundEffectsEnabled') !== 'false'
  const newSetting = !currentSetting
  
  localStorage.setItem('soundEffectsEnabled', newSetting.toString())
  return newSetting
}

/**
 * Check if sound effects are enabled
 */
export function areSoundEffectsEnabled(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem('soundEffectsEnabled') !== 'false'
}
