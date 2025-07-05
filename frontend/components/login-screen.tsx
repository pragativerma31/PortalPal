"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

interface LoginScreenProps {
  onLogin: (rollNumber: string, password: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [rollNumber, setRollNumber] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rollNumber && password) {
      onLogin(rollNumber, password)
    }
  }
  // This function handles the login process

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl space-y-6 lg:space-y-8 animate-in fade-in-50 duration-500">
        {/* Logo and Branding */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome to PortalPal</h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Your gateway to academic information. Access your attendance, grades, and important documents all in one
              place.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4 px-6 lg:px-8 pt-6 lg:pt-8">
            <CardTitle className="text-xl lg:text-2xl text-center text-slate-700">Sign In</CardTitle>
            <CardDescription className="text-center text-slate-500 text-sm lg:text-base">
              Enter your credentials to access your portal
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 lg:px-8 pb-6 lg:pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rollNumber" className="text-slate-700 font-medium">
                  Roll Number
                </Label>
                <Input
                  id="rollNumber"
                  type="text"
                  placeholder="Enter your roll number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="h-11 lg:h-12 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 lg:h-12 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 lg:h-12 text-base lg:text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                Sign In to Portal
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">Secure access to NSUT Portal services</p>
      </div>
    </div>
  )
}
