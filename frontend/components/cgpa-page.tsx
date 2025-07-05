"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ChevronDown, ChevronUp, GraduationCap, BookOpen, Award } from "lucide-react"

interface CgpaPageProps {
  userName: string
  onBack: () => void
  transcriptData?: any[]
}

interface Subject {
  paper_name: string
  credit: string
  grade_letter: string
  grade_point: string
  credit_points: string
}

interface SemesterData {
  semester: string
  SGPA: string
  subjects: Subject[]
}

export function CgpaPage({ userName, onBack, transcriptData = [] }: CgpaPageProps) {
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null)

  // Calculate CGPA from all semesters
  const calculateCGPA = (semesters: SemesterData[]) => {
    if (semesters.length === 0) return "N/A";
    
    const validSemesters = semesters.filter(sem => sem.SGPA && !isNaN(parseFloat(sem.SGPA)));
    if (validSemesters.length === 0) return "N/A";
    
    const totalSGPA = validSemesters.reduce((acc, sem) => {
      return acc + parseFloat(sem.SGPA || "0");
    }, 0);
    
    return (totalSGPA / validSemesters.length).toFixed(2);
  };
  
  // Calculate total credits
  const calculateTotalCredits = (semesters: SemesterData[]) => {
    return semesters.reduce((acc: number, sem: SemesterData) => {
      const semCredits = sem.subjects.reduce((subAcc: number, subject: Subject) => {
        return subAcc + parseInt(subject.credit || "0", 10);
      }, 0);
      return acc + semCredits;
    }, 0);
  };

  // Get the most recent semester number
  const getCurrentSemester = (semesters: SemesterData[]) => {
    if (semesters.length === 0) return "N/A";
    return semesters[semesters.length - 1].semester;
  };
  
  const overallCgpa = calculateCGPA(transcriptData);
  const totalCredits = calculateTotalCredits(transcriptData);
  const currentSemester = getCurrentSemester(transcriptData);

  const toggleSemester = (semester: string) => {
    setExpandedSemester(expandedSemester === semester ? null : semester)
  }

  const getGradeColor = (gradePoint: string) => {
    const grade = parseFloat(gradePoint || "0");
    if (isNaN(grade)) return "text-gray-600 bg-gray-50";
    if (grade >= 9.0) return "text-emerald-600 bg-emerald-50"
    if (grade >= 8.0) return "text-blue-600 bg-blue-50"
    if (grade >= 7.0) return "text-amber-600 bg-amber-50"
    if (grade >= 6.0) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  // If no transcript data, show a message
  if (transcriptData.length === 0) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center flex-col text-lg text-slate-600">
        <div className="text-xl font-medium mb-4">No transcript data available.</div>
        <Button onClick={onBack} variant="outline">
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 xl:p-8 2xl:p-12">
      <div className="w-full space-y-6 lg:space-y-8 xl:space-y-10 animate-in fade-in-50 duration-700">
        {/* Header */}
        <div className="flex items-start justify-between px-2">
          <div className="space-y-1 flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 tracking-tight">
              CGPA Summary
            </h1>
            <p className="text-base lg:text-lg xl:text-xl text-slate-600">
              Track your academic performance across all semesters
            </p>
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
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm lg:text-base text-slate-600">Current Semester</p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-800">{currentSemester}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-100">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm lg:text-base text-slate-600">Overall CGPA</p>
                <p className="text-2xl lg:text-3xl font-bold text-emerald-600">{overallCgpa}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-100">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm lg:text-base text-slate-600">Total Credits</p>
                <p className="text-2xl lg:text-3xl font-bold text-purple-600">{totalCredits}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Semester Cards */}
        <div className="space-y-4 lg:space-y-6 px-2">
          {transcriptData.map((semester: SemesterData, index: number) => {
            // Calculate total credits for this semester
            const semTotalCredits = semester.subjects.reduce((total: number, subject: Subject) => {
              return total + parseInt(subject.credit || "0", 10);
            }, 0);
            
            return (
              <Card
                key={semester.semester}
                className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-4 ${
                  expandedSemester === semester.semester ? "shadow-2xl" : "hover:shadow-xl"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => toggleSemester(semester.semester)}
              >
                <CardHeader className="pb-4 p-6 lg:p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg lg:text-xl">{semester.semester}</span>
                      </div>
                      <div>
                        <CardTitle className="text-xl lg:text-2xl text-slate-800">Semester {semester.semester}</CardTitle>
                        <p className="text-slate-600 text-sm lg:text-base">
                          {semester.subjects.length} subjects • {semTotalCredits} credits
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm lg:text-base text-slate-600">SGPA</p>
                        <Badge className={`text-lg lg:text-xl font-bold ${getGradeColor(semester.SGPA)}`}>
                          {semester.SGPA}
                        </Badge>
                      </div>
                      {expandedSemester === semester.semester ? (
                        <ChevronUp className="w-6 h-6 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedSemester === semester.semester && (
                  <CardContent className="px-6 lg:px-8 pb-6 lg:pb-8 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {semester.subjects.map((subject: Subject, subIndex: number) => (
                          <div
                            key={subIndex}
                            className="p-4 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in-50"
                            style={{ animationDelay: `${subIndex * 50}ms` }}
                          >
                            <div className="space-y-2">
                              <h4 className="font-semibold text-slate-800 text-sm lg:text-base leading-tight">
                                {subject.paper_name}
                              </h4>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-xs text-slate-600">Grade</p>
                                  <Badge className={`text-sm font-semibold ${getGradeColor(subject.grade_point)}`}>
                                    {subject.grade_letter}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-600">Points</p>
                                  <p className="text-sm font-semibold text-slate-800">{subject.grade_point}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-600">Credits</p>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {parseInt(subject.credit) === 0 ? 
                                      <span className="text-gray-400">N/A</span> : 
                                      subject.credit
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <div className="text-slate-600">
                          <span className="text-sm lg:text-base">Semester Summary:</span>
                        </div>
                        <div className="flex space-x-6">
                          <div className="text-center">
                            <p className="text-xs text-slate-600">Total Credits</p>
                            <p className="text-lg font-bold text-slate-800">{semTotalCredits}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-600">SGPA</p>
                            <p className="text-lg font-bold text-blue-600">{semester.SGPA}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
