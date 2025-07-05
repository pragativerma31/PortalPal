"use client"

import { useState, useEffect } from "react"
import { SessionManager } from "@/lib/session-manager"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle } from "lucide-react"

interface SessionStatusProps {
  className?: string
}

export function SessionStatus({ className = "" }: SessionStatusProps) {
  const [remainingTime, setRemainingTime] = useState("")
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const remaining = SessionManager.getRemainingTime()
      const formatted = SessionManager.getFormattedRemainingTime()
      
      setRemainingTime(formatted)
      setIsWarning(remaining < 2 * 60 * 1000) // Warning when less than 2 minutes
    }

    // Update immediately
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!SessionManager.isLoggedIn() || !remainingTime) {
    return null
  }

  return (
    <Badge 
      variant={isWarning ? "destructive" : "secondary"}
      className={`flex items-center space-x-1 ${className}`}
    >
      {isWarning ? (
        <AlertTriangle className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      <span className="text-xs">Session: {remainingTime}</span>
    </Badge>
  )
}
