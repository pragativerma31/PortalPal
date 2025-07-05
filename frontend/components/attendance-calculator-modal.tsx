"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, AlertTriangle, CheckCircle } from "lucide-react"

interface AttendanceCalculatorModalProps {
  isOpen: boolean
  onClose: () => void
  subject: {
    id: string
    name: string
    totalDays: number
    totalPresence: number
    totalAbsence: number
    attendancePercentage: number
  }
}

export function AttendanceCalculatorModal({ isOpen, onClose, subject }: AttendanceCalculatorModalProps) {
  const [incomingClasses, setIncomingClasses] = useState("")
  const [classesToBunk, setClassesToBunk] = useState("")
  const [result, setResult] = useState<{
    finalAttendance: number
    willMaintain75: boolean
    attendedClasses: number
    totalClasses: number
  } | null>(null)

  const calculateAttendance = () => {
    const incoming = Number.parseInt(incomingClasses) || 0
    const toBunk = Number.parseInt(classesToBunk) || 0

    if (incoming < 0 || toBunk < 0 || toBunk > incoming) {
      return
    }

    const currentPresence = subject.totalPresence
    const currentTotal = subject.totalDays
    const attendedFromIncoming = incoming - toBunk

    const finalPresence = currentPresence + attendedFromIncoming
    const finalTotal = currentTotal + incoming
    const finalAttendance = (finalPresence / finalTotal) * 100

    setResult({
      finalAttendance,
      willMaintain75: finalAttendance >= 75,
      attendedClasses: finalPresence,
      totalClasses: finalTotal,
    })
  }

  const resetCalculator = () => {
    setIncomingClasses("")
    setClassesToBunk("")
    setResult(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl lg:text-2xl text-slate-800">Attendance Calculator</DialogTitle>
          <DialogDescription className="text-slate-600 mt-1">{subject.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Stats */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-600">Current Days</p>
                  <p className="text-lg font-semibold text-slate-800">{subject.totalDays}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Present</p>
                  <p className="text-lg font-semibold text-emerald-600">{subject.totalPresence}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Attendance</p>
                  <p className="text-lg font-semibold text-blue-600">{subject.attendancePercentage.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Input Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="incoming" className="text-slate-700 font-medium">
                Total Incoming Classes
              </Label>
              <Input
                id="incoming"
                type="number"
                placeholder="Enter number of upcoming classes"
                value={incomingClasses}
                onChange={(e) => setIncomingClasses(e.target.value)}
                className="h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bunk" className="text-slate-700 font-medium">
                Classes to Bunk
              </Label>
              <Input
                id="bunk"
                type="number"
                placeholder="Enter number of classes to skip"
                value={classesToBunk}
                onChange={(e) => setClassesToBunk(e.target.value)}
                className="h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                min="0"
                max={incomingClasses || undefined}
              />
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex space-x-3">
            <Button
              onClick={calculateAttendance}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-11"
              disabled={!incomingClasses || !classesToBunk}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculate
            </Button>
            <Button
              onClick={resetCalculator}
              variant="outline"
              className="px-6 h-11 border-slate-200 hover:bg-slate-50 bg-transparent"
            >
              Reset
            </Button>
          </div>

          {/* Results */}
          {result && (
            <Card
              className={`border-2 ${result.willMaintain75 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  {result.willMaintain75 ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <h3 className={`font-semibold ${result.willMaintain75 ? "text-emerald-800" : "text-red-800"}`}>
                      {result.willMaintain75 ? "Attendance Maintained!" : "Attendance Below 75%!"}
                    </h3>
                    <p className={`text-sm ${result.willMaintain75 ? "text-emerald-700" : "text-red-700"}`}>
                      Final attendance: {result.finalAttendance.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-slate-600">Total Classes</p>
                    <p className="text-lg font-semibold text-slate-800">{result.totalClasses}</p>
                  </div>
                  <div className="p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-slate-600">Classes Attended</p>
                    <p className="text-lg font-semibold text-emerald-600">{result.attendedClasses}</p>
                  </div>
                </div>

                {!result.willMaintain75 && (
                  <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      <strong>Warning:</strong> Your attendance will drop below the required 75% minimum. Consider
                      attending more classes to maintain eligibility.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
