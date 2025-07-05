"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calculator, AlertTriangle, CheckCircle } from "lucide-react"
import { AttendanceCalculatorModal } from "./attendance-calculator-modal"
import { on } from "events"

interface AttendancePageProps {
  userName: string
  onBack: () => void
  onSubjectSelect: (subject: any) => void
  attendanceData?: SubjectAttendance[]// Optional prop to pass attendance data
}

interface DailyLogEntry {
  date: string
  status: string
}

interface SubjectAttendance {
  id: string
  name: string
  totalDays: number
  totalPresence: number
  totalAbsence: number
  attendancePercentage: number
  dailyLog: DailyLogEntry[] // ✅ Add this line
}


export function AttendancePage({ onSubjectSelect, onBack,attendanceData=[] }: AttendancePageProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectAttendance | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mock attendance data
  const subjects: SubjectAttendance[] = attendanceData
  if (subjects.length === 0) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center text-lg text-slate-600">
        No attendance data available.
      </div>
    )
  }


  const calculateRequiredDays = (subject: SubjectAttendance) => {
    const requiredPercentage = 75
    const currentPresence = subject.totalPresence
    const totalDays = subject.totalDays

    // Formula: (currentPresence + x) / (totalDays + x) = 0.75
    // Solving for x: x = (0.75 * totalDays - currentPresence) / 0.25
    const requiredDays = Math.ceil(
      ((requiredPercentage * totalDays) / 100 - currentPresence) / (1 - requiredPercentage / 100),
    )

    return Math.max(0, requiredDays)
  }

  const calculateSkippableDays = (subject: SubjectAttendance) => {
    const requiredPercentage = 75
    const currentPresence = subject.totalPresence
    const totalDays = subject.totalDays

    // Formula: currentPresence / (totalDays + x) = 0.75
    // Solving for x: x = (currentPresence / 0.75) - totalDays
    const maxTotalDays = currentPresence / (requiredPercentage / 100)
    const skippableDays = Math.floor(maxTotalDays - totalDays)

    return Math.max(0, skippableDays)
  }
  const handleSubjectClick = (subject: SubjectAttendance, event: React.MouseEvent) => {
    // Don't navigate if the click is on the calculate button
    const target = event.target as HTMLElement
    if (target.closest(".calculate-button")) return
    
    console.log("handleSubjectClick - original subject:", subject);
    console.log("handleSubjectClick - subject.dailyLog:", subject.dailyLog);
    
    const subjectForDetail = {
      name: subject.name,
      code: subject.id,
      present: subject.totalPresence,
      absent: subject.totalAbsence,
      total: subject.totalDays,
      attendance: subject.attendancePercentage,
      dailyLog: subject.dailyLog, // 👈 ADD THIS
    };
    
    console.log("handleSubjectClick - passing to detail:", subjectForDetail);
    
    onSubjectSelect(subjectForDetail)

    // router.push(`/attendanceDetail/${subject.id}`) // Navigate to the attendance detail page
  }



  const handleCalculateDays = (subject: SubjectAttendance) => {
    setSelectedSubject(subject)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 xl:p-8 2xl:p-12">
      <div className="w-full space-y-6 lg:space-y-8 xl:space-y-10 animate-in fade-in-50 duration-700">
        {/* Header */}
        <div className="flex items-start justify-between px-2">
          <div className="space-y-1 flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 tracking-tight">
              Attendance Summary
            </h1>
            <p className="text-base lg:text-lg xl:text-xl text-slate-600">Track your attendance across all subjects</p>
          </div>

          <Button
            onClick={onBack}
            variant="outline"
            className="ml-4 flex-shrink-0 border-slate-200 hover:bg-slate-50 text-slate-700 bg-transparent h-10 lg:h-11 xl:h-12 px-4 lg:px-6"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            Back
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 px-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-100">
            <div className="text-center">
              <p className="text-sm lg:text-base text-slate-600">Total Subjects</p>
              <p className="text-2xl lg:text-3xl font-bold text-slate-800">{subjects.length}</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-100">
            <div className="text-center">
              <p className="text-sm lg:text-base text-slate-600">Above 75%</p>
              <p className="text-2xl lg:text-3xl font-bold text-emerald-600">
                {subjects.filter((sub) => sub.attendancePercentage >= 75).length}
              </p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-100">
            <div className="text-center">
              <p className="text-sm lg:text-base text-slate-600">Below 75%</p>
              <p className="text-2xl lg:text-3xl font-bold text-red-600">
                {subjects.filter((sub) => sub.attendancePercentage < 75).length}
              </p>
            </div>
          </div>
        </div>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 px-2">
          {subjects.map((subject, index) => (
            <Card
              onClick={(e) => handleSubjectClick(subject, e)}
              key={subject.id}
              className="border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-in slide-in-from-bottom-4 h-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4 p-6 lg:p-8">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg lg:text-xl text-slate-800 leading-tight min-h-[3.5rem]">{subject.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {subject.attendancePercentage >= 75 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    <Badge
                      variant={subject.attendancePercentage >= 75 ? "default" : "destructive"}
                      className={`${
                        subject.attendancePercentage >= 75
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {subject.attendancePercentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 lg:px-8 pb-6 lg:pb-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs lg:text-sm text-slate-600">Total Days</p>
                    <p className="text-lg lg:text-xl font-semibold text-slate-800">{subject.totalDays}</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs lg:text-sm text-slate-600">Present</p>
                    <p className="text-lg lg:text-xl font-semibold text-emerald-600">{subject.totalPresence}</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-xs lg:text-sm text-slate-600">Absent</p>
                    <p className="text-lg lg:text-xl font-semibold text-red-600">{subject.totalAbsence}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs lg:text-sm text-slate-600">Attendance</p>
                    <p className="text-lg lg:text-xl font-semibold text-blue-600">
                      {subject.attendancePercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Fixed height container for message area */}
                <div className="h-12 flex items-center">
                  {subject.attendancePercentage < 75 ? (
                    <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs lg:text-sm text-amber-800">
                        <strong>Need {calculateRequiredDays(subject)} more days</strong> to reach 75% attendance
                      </p>
                    </div>
                  ) : (
                    <div className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-xs lg:text-sm text-emerald-800">
                        <strong>Great! You can skip {calculateSkippableDays(subject)} days</strong> and stay above 75%
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // 👈 prevents triggering the card's onClick
                    handleCalculateDays(subject)
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Days
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Attendance Calculator Modal */}
      {selectedSubject && (
        <AttendanceCalculatorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          subject={selectedSubject}
        />
      )}
    </div>
  )
}
