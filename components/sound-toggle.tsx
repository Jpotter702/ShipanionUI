"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleSoundEffects, areSoundEffectsEnabled } from "@/lib/sound-effects"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SoundToggle() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Initialize state from localStorage on mount
  useEffect(() => {
    setSoundEnabled(areSoundEffectsEnabled())
  }, [])
  
  const handleToggle = () => {
    const newState = toggleSoundEffects()
    setSoundEnabled(newState)
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="h-8 w-8"
            aria-label={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{soundEnabled ? "Mute sound effects" : "Enable sound effects"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
