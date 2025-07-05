"use client"

import { useState, useEffect } from "react"
import { LoginScreen } from "@/components/login-screen"
import { LoadingScreen } from "@/components/loading-screen"
import { Dashboard } from "@/components/dashboard"
import { AttendancePage } from "@/components/attendance-page"
import { CgpaPage } from "@/components/cgpa-page"
import { AdmitCardPage } from "@/components/admit-card-page"
import { AttendanceDetail } from "@/components/attendance-details"


export default function PortalPal() {
  const [currentScreen, setCurrentScreen] = useState<
    "login" | "loading" | "dashboard" | "attendance" | "cgpa" | "admitcard" | "attendanceDetail"
  >("login")
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [transcriptData, setTranscriptData] = useState<any[]>([])

  const [loadingMessage, setLoadingMessage] = useState("")
  const [userData, setUserData] = useState<{ rollNumber: string; name: string ; sem:string } | null>(null)

  interface DailyLogEntry {
    date: string; // "Jan-01"
    status: string; // "1", "0", "CS", etc.
  }

  interface RawAttendance {
    subject_code: string
    subject_name: string
    total_classes: number
    absents: number
    presents: number
    percentage: string
    dailyLog: DailyLogEntry[];
  }


  const handleSubjectSelect = (subject: any) => {
    setSelectedSubject(subject)
    setCurrentScreen("attendanceDetail")
  }


  const handleLogout = async () => {
    setLoadingMessage("Signing out...")
    setCurrentScreen("loading")
    
    try {
      const sessionId = localStorage.getItem("session_id")
      if (sessionId) {
        // Call backend logout API to clean up session and close driver
        await fetch(`http://localhost:8000/logout?session_id=${sessionId}`, {
          method: "POST",
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      // Continue with logout even if API call fails
    } finally {
      // Clear frontend session data
      localStorage.removeItem("session_id")
      setCurrentScreen("login")
      setUserData(null)
      setAttendanceData([])
      setTranscriptData([])
    }
  }

  // Helper function to handle session expiry
  const handleSessionExpiry = () => {
    localStorage.removeItem("session_id")
    setCurrentScreen("login")
    setUserData(null)
    setAttendanceData([])
    setTranscriptData([])
    alert("Your session has expired. Please login again.")
  }

  // Check session validity periodically
  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout | null = null

    const checkSessionValidity = async () => {
      const sessionId = localStorage.getItem("session_id")
      
      // Only check if we have a session and are not on login screen
      if (!sessionId || currentScreen === "login" || currentScreen === "loading") {
        return
      }

      try {
        // Make a lightweight API call to check session validity
        const res = await fetch(`http://localhost:8000/debug?session_id=${sessionId}`, {
          method: "GET",
        })

        if (res.status === 401) {
          // Session expired
          console.log("Session expired detected during periodic check")
          handleSessionExpiry()
        }
      } catch (error) {
        console.error("Session check failed:", error)
        // Don't logout on network errors, only on 401
      }
    }

    // Start periodic session checking when user is logged in
    if (currentScreen !== "login" && localStorage.getItem("session_id")) {
      sessionCheckInterval = setInterval(checkSessionValidity, 60000) // Check every 60 seconds
    }

    // Cleanup interval on component unmount or screen change
    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval)
      }
    }
  }, [currentScreen]) // Re-run when screen changes

  const handleNavigateToAttendance = async () => {
    setLoadingMessage("Kindly wait. We are extracting your attendance.")
    setCurrentScreen("loading")

    try {
      const sessionId = localStorage.getItem("session_id")
      const res = await fetch(`http://localhost:8000/attendance?session_id=${sessionId}`, {
        method: "GET",
      })

      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          // Session expired
          handleSessionExpiry()
          return
        }
        throw new Error(data.detail || "Failed to fetch attendance")
      }

      const rawAttendance: RawAttendance[] = data.data

      const transformed = rawAttendance.map((sub) => ({
        id: sub.subject_code,
        name: sub.subject_name,
        totalDays: sub.total_classes,
        totalPresence: sub.presents,
        totalAbsence: sub.absents,
        attendancePercentage: parseFloat(sub.percentage.replace("%", "")),
        dailyLog:sub.dailyLog,
      }))

      setAttendanceData(transformed)
      // ⬅️ backend returns attendance as 'data'
      setCurrentScreen("attendance")
    } catch (error: any) {
      alert("Attendance fetch failed: " + error.message)
      setCurrentScreen("dashboard")
    }
  }


  const handleNavigateToCgpa = async () => {
    setLoadingMessage("Kindly wait. We are extracting your transcript.")
    setCurrentScreen("loading")

    try {
      const sessionId = localStorage.getItem("session_id")
      const res = await fetch(`http://localhost:8000/transcript?session_id=${sessionId}`, {
        method: "GET",
      })

      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          // Session expired
          handleSessionExpiry()
          return
        }
        throw new Error(data.detail || "Failed to fetch transcript")
      }

      // Store transcript data for the CGPA component
      setTranscriptData(data.data)
      console.log("Transcript data:", data.data)
      setCurrentScreen("cgpa")
    } catch (error: any) {
      alert("Transcript fetch failed: " + error.message)
      setCurrentScreen("dashboard")
    }
  }

  const handleNavigateToAdmitCard = () => {
    setCurrentScreen("admitcard")
  }

  const handleBackToDashboard = () => {
    setCurrentScreen("dashboard")
  }
  const handleLogin = async (rollNumber: string, password: string) => {
    try {
      setLoadingMessage("Logging in to the NSUT Portal…")
      setCurrentScreen("loading")

      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rollno: rollNumber,
          password: password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Login failed")
      }

      localStorage.setItem("session_id", data.session_id)

      setUserData({ rollNumber, name: data.name , sem:data.sem }) // ← Now using the real name from backend
      setCurrentScreen("dashboard")
    } catch (error: any) {
      alert("Login failed: " + error.message)
      setCurrentScreen("login")
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="transition-all duration-500 ease-in-out">
        {currentScreen === "login" && <LoginScreen onLogin={handleLogin} />}
        {currentScreen === "loading" && <LoadingScreen message={loadingMessage} />}
        {currentScreen === "dashboard" && userData &&  (
          <Dashboard
            userName={userData.name}
            semester={userData.sem}
            onLogout={handleLogout}
            onNavigateToAttendance={handleNavigateToAttendance}
            onNavigateToCgpa={handleNavigateToCgpa}
            onNavigateToAdmitCard={handleNavigateToAdmitCard}
          />
        )}
        {currentScreen === "attendance" && userData && (
          <AttendancePage userName={userData.name} onBack={handleBackToDashboard} onSubjectSelect={handleSubjectSelect} attendanceData ={attendanceData}/>

        )}
        {currentScreen === "cgpa" && userData && (
          <CgpaPage 
            userName={userData.name} 
            onBack={handleBackToDashboard} 
            transcriptData={transcriptData}
          />
        )}
        {currentScreen === "admitcard" && userData && (
          <AdmitCardPage userName={userData.name} onBack={handleBackToDashboard} />
        )}
        {currentScreen === "attendanceDetail" && selectedSubject && (
          <AttendanceDetail
            subject={selectedSubject}
            onBack={() => setCurrentScreen("attendance")}
          />
        )}

      </div>
    </div>
  )
}
