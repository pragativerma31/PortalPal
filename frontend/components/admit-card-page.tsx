"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, FileText, Calendar } from "lucide-react"

interface AdmitCardPageProps {
  userName: string
  onBack: () => void
}

export function AdmitCardPage({ userName, onBack }: AdmitCardPageProps) {
  return (
    <div className="min-h-screen p-4 lg:p-6 xl:p-8 2xl:p-12">
      <div className="w-full space-y-6 lg:space-y-8 xl:space-y-10 animate-in fade-in-50 duration-700">
        {/* Header */}
        <div className="flex items-start justify-between px-2">
          <div className="space-y-1 flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 tracking-tight">
              Admit Card
            </h1>
            <p className="text-base lg:text-lg xl:text-xl text-slate-600">Download your examination admit cards</p>
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

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[60vh] px-2">
          <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl border-0 shadow-2xl bg-white/80 backdrop-blur-sm animate-in slide-in-from-bottom-4">
            <CardContent className="p-8 lg:p-12 text-center space-y-6 lg:space-y-8">
              {/* Icon */}
              <div className="mx-auto w-20 h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-white" />
              </div>

              {/* Message */}
              <div className="space-y-4">
                <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-slate-800">Hello, {userName}!</h2>
                <p className="text-base lg:text-lg xl:text-xl text-slate-600 leading-relaxed">
                  Your admit card will be available during exam season.
                </p>
              </div>

              {/* Additional Info */}
              <div className="flex items-center justify-center space-x-2 text-sm lg:text-base text-slate-500">
                <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Check back during examination period</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
