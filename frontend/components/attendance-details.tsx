"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock, Coffee } from "lucide-react"
import { LucideIcon } from "lucide-react"

interface Subject {
  name: string;
  code: string;
  attendance: number;
  present: number;
  absent: number;
  total: number;
  dailyLog?: {
    date: string;
    status: string;
  }[];
}


interface AttendanceDetailProps {
  subject: Subject;
  onBack: () => void
}

export function AttendanceDetail({ subject, onBack }: AttendanceDetailProps) {
  
  // Debug: Log the subject data to see what we're receiving
  console.log("AttendanceDetail - subject data:", subject);
  console.log("AttendanceDetail - dailyLog:", subject.dailyLog);

  interface DailyAttendanceRecord {
    date: Date;
    dayOfWeek: string;
    code: string;
    status: string;
    color: string;
    icon: LucideIcon;
  }

  // Generate attendance data with dynamic status handling
  const getStatusInfo = (status: string) => {
    // Handle empty status
    if (!status || status.trim() === "") {
      return { status: "Not Updated", color: "bg-gray-100 text-gray-600", icon: Clock };
    }

    // Handle special codes
    const specialCodes: { [key: string]: { status: string; color: string; icon: LucideIcon } } = {
      "CS": { status: "Class Suspended", color: "bg-orange-100 text-orange-800", icon: Coffee },
      "GH": { status: "Gazetted Holiday", color: "bg-purple-100 text-purple-800", icon: Coffee },
      "CR": { status: "Class Rescheduled", color: "bg-blue-100 text-blue-800", icon: Clock },
      "MS": { status: "Mid Sem", color: "bg-indigo-100 text-indigo-800", icon: Clock },
    };

    if (specialCodes[status]) {
      return specialCodes[status];
    }

    // Handle numeric combinations (1+0, 1+1, 1+0+1, etc.)
    if (status.includes('+')) {
      const parts = status.split('+');
      const presentCount = parts.filter(p => p === '1').length;
      const absentCount = parts.filter(p => p === '0').length;
      const totalSessions = parts.length;

      if (presentCount === totalSessions) {
        // All present (1+1, 1+1+1, etc.)
        return { status: "All Present", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle };
      } else if (absentCount === totalSessions) {
        // All absent (0+0, 0+0+0, etc.)
        return { status: "All Absent", color: "bg-red-100 text-red-800", icon: XCircle };
      } else {
        // Mixed attendance (1+0, 1+0+1, etc.)
        return { status: `Mixed (${presentCount}/${totalSessions})`, color: "bg-yellow-100 text-yellow-800", icon: Clock };
      }
    }

    // Handle single values
    if (status === "1") {
      return { status: "Present", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle };
    } else if (status === "0") {
      return { status: "Absent", color: "bg-red-100 text-red-800", icon: XCircle };
    }

    // Default for unknown status
    return { status: "Unknown", color: "bg-gray-100 text-gray-600", icon: Clock };
  }

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Add safety check for dailyLog and improved date parsing with year handling
  const attendanceData = (subject.dailyLog || []).map((entry: { date: string, status: string }, index: number) => {
    console.log("Processing entry:", entry); // Debug log
    
    // Handle different date formats that might come from backend
    let parsedDate: Date;
    try {
      if (entry.date.includes('-')) {
        const [month, day] = entry.date.split('-');
        const monthMap: { [key: string]: number } = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        const monthIndex = monthMap[month];
        
        // Smart year detection for academic year spanning 2024-2025
        let year = 2024; // Default starting year
        
        // If it's January onwards, it's likely 2025 in academic calendar
        if (month === 'Jan' || month === 'Feb' || month === 'Mar' || 
            month === 'Apr' || month === 'May' || month === 'Jun') {
          year = 2025;
        }
        // Check for year transition: if previous entry was December and current is January
        else if (index > 0 && subject.dailyLog) {
          const prevEntry = subject.dailyLog[index - 1];
          if (prevEntry && prevEntry.date.includes('-')) {
            const [prevMonth] = prevEntry.date.split('-');
            if (prevMonth === 'Dec' && month === 'Jan') {
              year = 2025;
            }
          }
        }
        
        parsedDate = new Date(year, monthIndex, parseInt(day));
      } else {
        // Fallback to direct parsing
        parsedDate = new Date(entry.date);
      }
    } catch (error) {
      console.error("Date parsing error:", error, "for entry:", entry);
      parsedDate = new Date(); // Fallback to current date
    }
    
    console.log("Parsed date:", parsedDate, "for entry:", entry.date); // Debug log
    
    const statusMeta = getStatusInfo(entry.status)

    return {
      date: parsedDate,
      dayOfWeek: dayNames[parsedDate.getDay()],
      ...statusMeta,
      code: entry.status || "-"
    }
  })



  const getStatusIcon = (IconComponent: LucideIcon, color: string) => {
    return (
      <IconComponent
        className={`h-4 w-4 ${
          color.includes("emerald")
            ? "text-emerald-600"
            : color.includes("red")
              ? "text-red-600"
              : color.includes("yellow")
                ? "text-yellow-600"
                : color.includes("blue")
                  ? "text-blue-600"
                  : color.includes("purple")
                    ? "text-purple-600"
                    : color.includes("orange")
                      ? "text-orange-600"
                      : color.includes("indigo")
                        ? "text-indigo-600"
                        : "text-gray-600"
        }`}
      />
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 animate-in fade-in-50 duration-500">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">{subject.name}</h1>
            <p className="text-slate-600">{subject.code}</p>
        </div>
        <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 bg-transparent self-end sm:self-auto"
        >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
        </Button>
        </div>



        {/* Subject Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in-50 duration-700 delay-200">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div
                className={`text-2xl font-bold ${subject.attendance >= 75 ? "text-emerald-600" : subject.attendance >= 75 ? "text-yellow-600" : "text-red-600"}`}
              >
                {subject.attendance}%
              </div>
              <div className="text-sm text-slate-600">Overall Attendance</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{subject.present}</div>
              <div className="text-sm text-slate-600">Total Present</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{subject.absent}</div>
              <div className="text-sm text-slate-600">Total Absent</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-600">{subject.total}</div>
              <div className="text-sm text-slate-600">Total Classes</div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Calendar */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-in fade-in-50 duration-700 delay-400">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Daily Attendance Record</span>
            </CardTitle>
            <p className="text-sm text-slate-600">
              {attendanceData.length > 0 
                ? `${attendanceData.length} attendance records found`
                : "No attendance records available"
              }
            </p>
          </CardHeader>
          <CardContent>
            {/* Legend */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Legend:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">1</Badge>
                  <span>Present</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">0</Badge>
                  <span>Absent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">1+1</Badge>
                  <span>All Present</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">1+0</Badge>
                  <span>Mixed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">CS</Badge>
                  <span>Class Suspended</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">GH</Badge>
                  <span>Gazetted Holiday</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">CR</Badge>
                  <span>Class Rescheduled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-brown-800 hover:bg-blue-100">MS</Badge>
                  <span>Mid Sem</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">-</Badge>
                  <span>Not Updated</span>
                </div>
              </div>
            </div>

            {/* Attendance Grid */}
            <div className="space-y-4">
              {attendanceData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-slate-500 mb-2">No attendance data available</div>
                  <div className="text-sm text-slate-400">Daily attendance records will appear here once available</div>
                </div>
              ) : (
                (() => {
                  // Group attendance data by year-month and sort in descending order (latest first)
                  const groupedByMonth = attendanceData.reduce((acc: { [key: string]: DailyAttendanceRecord[] }, item: DailyAttendanceRecord) => {
                    const year = item.date.getFullYear();
                    const month = item.date.getMonth();
                    const key = `${year}-${month}`;
                    
                    if (!acc[key]) {
                      acc[key] = [];
                    }
                    acc[key].push(item);
                    return acc;
                  }, {});
                  
                  // Sort the month keys in descending order (latest first)
                  const sortedMonthKeys = Object.keys(groupedByMonth).sort((a, b) => {
                    const [yearA, monthA] = a.split('-').map(Number);
                    const [yearB, monthB] = b.split('-').map(Number);
                    
                    if (yearA !== yearB) {
                      return yearB - yearA; // Latest year first
                    }
                    return monthB - monthA; // Latest month first
                  });
                  
                  const monthNames = ["January", "February", "March", "April", "May", "June", 
                                    "July", "August", "September", "October", "November", "December"];
                  
                  return sortedMonthKeys.map((monthKey) => {
                    const [year, monthIndex] = monthKey.split('-').map(Number);
                    const monthData = groupedByMonth[monthKey]
                      .sort((a: DailyAttendanceRecord, b: DailyAttendanceRecord) => b.date.getTime() - a.date.getTime()); // Sort days within month in descending order (latest first)
                    const monthName = monthNames[monthIndex];

                    if (monthData.length === 0) return null;

                    return (
                      <div key={monthKey} className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-700">{monthName} {year}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {monthData.map((record: DailyAttendanceRecord, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(record.icon, record.color)}
                                <div>
                                  <div className="text-sm font-medium text-slate-800">{formatDate(record.date)}</div>
                                  <div className="text-xs text-slate-500">{record.dayOfWeek}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={record.color}>{record.code || "-"}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                })()
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}