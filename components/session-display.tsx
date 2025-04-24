"use client"

import { useState } from "react"
import { useShipping } from "@/contexts/shipping-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { QrCode, Copy, RefreshCw, Link } from "lucide-react"
import { motion } from "framer-motion"

export function SessionDisplay() {
  const { sessionId, isConnected } = useShipping()
  const [showDialog, setShowDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Function to copy session ID to clipboard
  const copyToClipboard = () => {
    if (sessionId && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(sessionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  // Function to generate a QR code URL for the session
  const getQrCodeUrl = () => {
    if (!sessionId) return ''
    
    // In a real app, you would generate a proper QR code
    // For now, we'll use a placeholder service
    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000/ws'
    const sessionUrl = `${websocketUrl}?session_id=${sessionId}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(sessionUrl)}`
  }
  
  // If no session ID, don't render anything
  if (!sessionId) return null
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={() => setShowDialog(true)}
      >
        <QrCode className="h-4 w-4" />
        <span className="hidden sm:inline">Session</span>
        <span className="font-mono text-xs">{sessionId.substring(0, 8)}...</span>
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Information</DialogTitle>
            <DialogDescription>
              Share this session ID to connect multiple devices to the same shipping session.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-4">
            <div className="bg-white p-2 rounded-lg mb-4 border">
              <img 
                src={getQrCodeUrl()} 
                alt="Session QR Code" 
                className="w-48 h-48"
              />
            </div>
            
            <div className="flex items-center space-x-2 w-full">
              <Input 
                value={sessionId} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={copyToClipboard}
                className="relative"
              >
                <Copy className="h-4 w-4" />
                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded"
                  >
                    Copied!
                  </motion.div>
                )}
              </Button>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                // In a real app, you would implement session refresh logic
                window.location.reload()
              }}
            >
              <RefreshCw className="h-4 w-4" />
              New Session
            </Button>
            
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                // Create a shareable link with the session ID
                const url = new URL(window.location.href)
                url.searchParams.set('session_id', sessionId)
                navigator.clipboard.writeText(url.toString())
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              <Link className="h-4 w-4" />
              Copy Shareable Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
