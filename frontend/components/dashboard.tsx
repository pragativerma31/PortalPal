"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, GraduationCap, FileText, LogOut, User } from "lucide-react"
import { SessionStatus } from "@/components/session-status"

interface DashboardProps {
  userName: string
  semester:string
  onLogout: () => void
  onNavigateToAttendance: () => void
  onNavigateToCgpa: () => void
  onNavigateToAdmitCard: () => void
}

export function Dashboard({
  userName,
  semester,
  onLogout,
  onNavigateToAttendance,
  onNavigateToCgpa,
  onNavigateToAdmitCard,
}: DashboardProps) {
  const cards = [
    {
      title: "Attendance Summary",
      description: "View your attendance records",
      icon: BarChart3,
      color: "from-emerald-500 to-teal-600",
      hoverColor: "hover:from-emerald-600 hover:to-teal-700",
      onClick: onNavigateToAttendance,
    },
    {
      title: "CGPA Summary",
      description: "Check your academic performance",
      icon: GraduationCap,
      color: "from-blue-500 to-indigo-600",
      hoverColor: "hover:from-blue-600 hover:to-indigo-700",
      onClick: onNavigateToCgpa,
    },
    {
      title: "Admit Card",
      description: "Download your admit cards",
      icon: FileText,
      color: "from-purple-500 to-pink-600",
      hoverColor: "hover:from-purple-600 hover:to-pink-700",
      onClick: onNavigateToAdmitCard,
    },
  ]

  return (
    <div className="min-h-screen p-4 lg:p-6 xl:p-8 2xl:p-12">
      <div className="w-full space-y-6 lg:space-y-8 xl:space-y-10 animate-in fade-in-50 duration-700">
        {/* Header */}
        <div className="flex items-start justify-between px-2">
          <div className="space-y-2 lg:space-y-3 flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-slate-800 tracking-tight">
              Welcome, {userName}
            </h1>
            <p className="text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600">
              What do you want to know today?
            </p>
          </div>

          <div className="ml-4 flex-shrink-0 flex flex-col items-end space-y-2">
            <SessionStatus />
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-slate-200 hover:bg-slate-50 text-slate-700 bg-transparent h-10 lg:h-11 xl:h-12 px-4 lg:px-6 text-sm lg:text-base"
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Stats - Above the main cards */}

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 xl:p-8 border border-slate-100 mb-4">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12  xl:w-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm lg:text-base xl:text-lg text-slate-600">Semester</p>
                <p className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-semibold text-slate-800">{semester}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 px-2">
          {cards.map((card, index) => (
            <Card
              key={card.title}
              className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] bg-white/80 backdrop-blur-sm animate-in slide-in-from-bottom-4 h-full"
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={card.onClick}
            >
              <CardHeader className="pb-4 lg:pb-6 p-6 lg:p-8 xl:p-10">
                <div
                  className={`w-12 h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-xl bg-gradient-to-br ${card.color} ${card.hoverColor} flex items-center justify-center mb-4 lg:mb-6 transition-all duration-300 group-hover:scale-110`}
                >
                  <card.icon className="w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-white" />
                </div>
                <CardTitle className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-slate-800 group-hover:text-slate-900 transition-colors">
                  {card.title}
                </CardTitle>
                <CardDescription className="text-slate-600 text-sm lg:text-base xl:text-lg">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 lg:px-8 xl:px-10 pb-6 lg:pb-8 xl:pb-10">
                <div className="flex items-center text-sm lg:text-base text-slate-500 group-hover:text-slate-600 transition-colors">
                  <span>Click to view details</span>
                  <div className="ml-auto w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-slate-400 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
  )
}
