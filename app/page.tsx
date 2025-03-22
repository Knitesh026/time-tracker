"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, PauseCircle, PlayCircle, Save, RotateCcw, Moon, Sun, BarChart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

// Motivational quotes for call center employees
const motivationalQuotes = [
  "Every call is an opportunity to make someone's day better.",
  "Your patience and empathy make a difference in someone's life today.",
  "Behind every call is a person who needs your help. You're making a difference.",
  "Great customer service doesn't come from a script; it comes from you.",
  "The way we communicate with others and with ourselves ultimately determines the quality of our lives.",
  "Your positive attitude can turn a customer's day around.",
  "Excellence is not a skill. It's an attitude.",
  "The most important thing in communication is hearing what isn't said.",
  "You don't build a business. You build people, and people build the business.",
  "Customer service isn't a department; it's everyone's job.",
  "The goal as a company is to have customer service that is not just the best, but legendary.",
  "Every problem has a solution; you just need to be creative enough to find it.",
  "Your voice may be the only kind one they hear today. Make it count.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "The customer's perception is your reality.",
]

export default function TimeTracker() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [totalWorkTime, setTotalWorkTime] = useState(0)
  const [currentSession, setCurrentSession] = useState(0)
  const [showStopDialog, setShowStopDialog] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now())
  const [workPercentage, setWorkPercentage] = useState(100)
  const [showStats, setShowStats] = useState(false)
  const [currentQuote, setCurrentQuote] = useState("")
  const [showQuote, setShowQuote] = useState(false)
  const [quotePosition, setQuotePosition] = useState({ top: 0, left: 0 })

  // Break states
  const [breaks, setBreaks] = useState({
    bio: { active: false, total: 0, current: 0, color: "bg-blue-500" },
    lunch: { active: false, total: 0, current: 0, color: "bg-green-500" },
    session: { active: false, total: 0, current: 0, color: "bg-purple-500" },
    feedback: { active: false, total: 0, current: 0, color: "bg-yellow-500" },
    downtime: { active: false, total: 0, current: 0, color: "bg-red-500" },
  })

  // Calculate total break time
  const totalBreakTime = Object.values(breaks).reduce((sum, breakItem) => sum + breakItem.total, 0)

  // Calculate net working time
  const netWorkingTime = totalWorkTime - totalBreakTime

  // Refs for interval IDs
  const workIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const breakIntervalsRef = useRef<{ [key: string]: NodeJS.Timeout | null }>({})
  const quoteTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate random position for quote
  const generateRandomPosition = () => {
    if (!containerRef.current) return { top: 20, left: 20 }

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    // Ensure quote stays within visible area (80% of container dimensions)
    const maxWidth = containerWidth * 0.8
    const maxHeight = containerHeight * 0.8

    return {
      top: Math.floor(Math.random() * maxHeight),
      left: Math.floor(Math.random() * maxWidth),
    }
  }

  // Effect for theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("timeTrackerData")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setIsWorking(parsedData.isWorking)
        setStartTime(parsedData.isWorking ? Date.now() - parsedData.currentSession : null)
        setTotalWorkTime(parsedData.totalWorkTime)
        setCurrentSession(parsedData.currentSession)
        setBreaks(parsedData.breaks)
        setLastUpdated(parsedData.lastUpdated || Date.now())
      } catch (error) {
        console.error("Error loading saved data:", error)
      }
    }

    // Set a random quote
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
  }, [])

  // Handle visibility change and sleep mode
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now()
        const timeDiff = now - lastUpdated

        // Update times if app was working when hidden
        if (isWorking && timeDiff > 1000) {
          setTotalWorkTime((prev) => prev + timeDiff)
          setCurrentSession((prev) => prev + timeDiff)
        }

        // Update break times if any were active
        Object.entries(breaks).forEach(([breakType, breakData]) => {
          if (breakData.active && timeDiff > 1000) {
            setBreaks((prev) => ({
              ...prev,
              [breakType]: {
                ...prev[breakType as keyof typeof breaks],
                current: prev[breakType as keyof typeof breaks].current + timeDiff,
                total: prev[breakType as keyof typeof breaks].total + timeDiff,
              },
            }))
          }
        })

        setLastUpdated(now)

        // Show a motivational quote when tab becomes visible
        setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
        setQuotePosition(generateRandomPosition())
        setShowQuote(true)

        if (quoteTimeoutRef.current) {
          clearTimeout(quoteTimeoutRef.current)
        }

        quoteTimeoutRef.current = setTimeout(() => {
          setShowQuote(false)
        }, 5000)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Check for time drift every minute to handle sleep mode
    const driftCheckInterval = setInterval(() => {
      const now = Date.now()
      const timeDiff = now - lastUpdated

      // If more than 2 seconds have passed since the last update, assume the device was sleeping
      if (timeDiff > 2000) {
        handleVisibilityChange()
      }

      setLastUpdated(now)
    }, 60000)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearInterval(driftCheckInterval)
      if (quoteTimeoutRef.current) {
        clearTimeout(quoteTimeoutRef.current)
      }
    }
  }, [isWorking, breaks, lastUpdated])

  // Timer effect
  useEffect(() => {
    if (workIntervalRef.current) {
      clearInterval(workIntervalRef.current)
      workIntervalRef.current = null
    }

    if (isWorking) {
      workIntervalRef.current = setInterval(() => {
        const now = Date.now()
        setLastUpdated(now)
        if (startTime) {
          setCurrentSession((prev) => prev + 1000)
          setTotalWorkTime((prev) => prev + 1000)
        }
      }, 1000)
    }

    return () => {
      if (workIntervalRef.current) {
        clearInterval(workIntervalRef.current)
      }
    }
  }, [isWorking, startTime])

  // Break timers effect
  useEffect(() => {
    // Clear any existing break intervals
    Object.values(breakIntervalsRef.current).forEach((interval) => {
      if (interval) clearInterval(interval)
    })
    breakIntervalsRef.current = {}

    // Set up new intervals for active breaks
    Object.entries(breaks).forEach(([breakType, breakData]) => {
      if (breakData.active) {
        breakIntervalsRef.current[breakType] = setInterval(() => {
          setLastUpdated(Date.now())
          setBreaks((prev) => ({
            ...prev,
            [breakType]: {
              ...prev[breakType as keyof typeof breaks],
              current: prev[breakType as keyof typeof breaks].current + 1000,
              total: prev[breakType as keyof typeof breaks].total + 1000,
            },
          }))
        }, 1000)
      }
    })

    return () => {
      Object.values(breakIntervalsRef.current).forEach((interval) => {
        if (interval) clearInterval(interval)
      })
    }
  }, [breaks])

  // Save data to localStorage periodically
  useEffect(() => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current)
    }

    saveIntervalRef.current = setInterval(() => {
      saveDataToLocalStorage()
    }, 10000) // Save every 10 seconds

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current)
      }
    }
  }, [isWorking, totalWorkTime, currentSession, breaks, lastUpdated])

  // Calculate work percentage
  useEffect(() => {
    if (totalWorkTime > 0) {
      const effectiveWorkPercentage = Math.round((netWorkingTime / totalWorkTime) * 100)
      setWorkPercentage(effectiveWorkPercentage > 0 ? effectiveWorkPercentage : 0)
    } else {
      setWorkPercentage(100)
    }
  }, [totalWorkTime, netWorkingTime])

  // Save data to localStorage
  const saveDataToLocalStorage = () => {
    const dataToSave = {
      isWorking,
      totalWorkTime,
      currentSession,
      breaks,
      lastUpdated: Date.now(),
    }

    localStorage.setItem("timeTrackerData", JSON.stringify(dataToSave))
  }

  // Toggle work timer
  const toggleWork = () => {
    if (!isWorking) {
      setStartTime(Date.now())
      setIsWorking(true)
      toast({
        title: "Timer Started",
        description: "Your work timer has been started.",
      })
    } else {
      setShowStopDialog(true)
    }
  }

  // Confirm stop timer
  const confirmStopTimer = () => {
    setStartTime(null)
    setIsWorking(false)
    setCurrentSession(0)
    setShowStopDialog(false)
    toast({
      title: "Timer Stopped",
      description: "Your work timer has been stopped.",
    })
  }

  // Toggle break
  const toggleBreak = (breakType: keyof typeof breaks) => {
    setBreaks((prev) => ({
      ...prev,
      [breakType]: {
        ...prev[breakType],
        active: !prev[breakType].active,
        current: !prev[breakType].active ? 0 : prev[breakType].current,
      },
    }))

    toast({
      title: !breaks[breakType].active ? `${breakType} Break Started` : `${breakType} Break Ended`,
      description: !breaks[breakType].active
        ? `Your ${breakType} break timer is now running.`
        : `Your ${breakType} break has been recorded.`,
    })
  }

  // Format time (milliseconds to HH:MM:SS)
  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor(ms / (1000 * 60 * 60))

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Reset all timers with confirmation
  const resetAll = () => {
    if (confirm("Are you sure you want to reset all timers? This action cannot be undone.")) {
      setIsWorking(false)
      setStartTime(null)
      setTotalWorkTime(0)
      setCurrentSession(0)
      setBreaks({
        bio: { active: false, total: 0, current: 0, color: "bg-blue-500" },
        lunch: { active: false, total: 0, current: 0, color: "bg-green-500" },
        session: { active: false, total: 0, current: 0, color: "bg-purple-500" },
        feedback: { active: false, total: 0, current: 0, color: "bg-yellow-500" },
        downtime: { active: false, total: 0, current: 0, color: "bg-red-500" },
      })
      localStorage.removeItem("timeTrackerData")
      toast({
        title: "All Timers Reset",
        description: "All your time data has been reset.",
      })
    }
  }

  // Export time data
  const exportData = () => {
    const data = {
      date: new Date().toLocaleDateString(),
      totalWorkTime: formatTime(totalWorkTime),
      totalBreakTime: formatTime(totalBreakTime),
      netWorkingTime: formatTime(netWorkingTime),
      effectiveWorkPercentage: `${workPercentage}%`,
      breaks: Object.entries(breaks).map(([type, data]) => ({
        type,
        total: formatTime(data.total),
      })),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `time-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "Your time report has been downloaded.",
    })
  }

  // Calculate hours in decimal format
  const getDecimalHours = (ms: number) => {
    return (ms / (1000 * 60 * 60)).toFixed(2)
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 relative"
      ref={containerRef}
    >
      {/* Motivational Quote */}
      {showQuote && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            top: `${quotePosition.top}px`,
            left: `${quotePosition.left}px`,
            maxWidth: "250px",
          }}
        >
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md px-3 py-2 rounded-lg shadow-md animate-fade-in-out">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-100 italic">"{currentQuote}"</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100">Work Time Tracker</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowStats(!showStats)} className="rounded-full">
              <BarChart className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Timer Card */}
          <Card className="col-span-1 md:col-span-2 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-100">
                <Clock className="inline-block mr-2 h-5 w-5" />
                Time Tracker
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Track your work hours and breaks
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className="text-4xl md:text-5xl font-light text-gray-800 dark:text-gray-100 font-mono">
                {formatTime(currentSession)}
              </div>
              <Button
                onClick={toggleWork}
                size="lg"
                className={`rounded-full w-14 h-14 p-0 ${isWorking ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} transition-all duration-300 ease-in-out transform hover:scale-105`}
              >
                {isWorking ? <PauseCircle className="h-7 w-7" /> : <PlayCircle className="h-7 w-7" />}
              </Button>

              <div className="w-full max-w-md">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Break Time</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Work Time</span>
                </div>
                <Progress value={workPercentage} className="h-2" />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{workPercentage}% effective</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(netWorkingTime)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-md">
                <div className="text-right text-gray-600 dark:text-gray-300 text-sm">Total Staff Time:</div>
                <div className="font-mono text-gray-800 dark:text-gray-100 text-sm">{formatTime(totalWorkTime)}</div>

                <div className="text-right text-gray-600 dark:text-gray-300 text-sm">Total Break Time:</div>
                <div className="font-mono text-gray-800 dark:text-gray-100 text-sm">{formatTime(totalBreakTime)}</div>

                <div className="text-right font-medium text-gray-700 dark:text-gray-200 text-sm">Net Login Hours:</div>
                <div className="font-mono font-medium text-gray-800 dark:text-gray-100 text-sm">
                  {formatTime(netWorkingTime)}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4 pb-4">
              <Button variant="outline" size="sm" onClick={resetAll} className="flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={exportData} className="flex items-center gap-1">
                <Save className="h-3 w-3" />
                Export
              </Button>
            </CardFooter>
          </Card>

          {/* Break Toggles Card */}
          <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-100">Break Toggles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(breaks).map(([breakType, breakData]) => (
                <div key={breakType} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={`${breakType}-break`} className="text-sm capitalize">
                      {breakType} Break
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {breakData.active ? (
                        <span className="text-green-500 flex items-center">
                          <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></span>
                          Active: {formatTime(breakData.current)}
                        </span>
                      ) : (
                        "Inactive"
                      )}
                    </p>
                  </div>
                  <Switch
                    id={`${breakType}-break`}
                    checked={breakData.active}
                    onCheckedChange={() => toggleBreak(breakType as keyof typeof breaks)}
                    className={breakData.active ? breakData.color : ""}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Break Summary Card */}
          <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-100">Break Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(breaks).map(([breakType, breakData]) => (
                  <div key={breakType}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">{breakType} Break:</span>
                      <span className="text-xs font-mono text-gray-800 dark:text-gray-100">
                        {formatTime(breakData.total)}
                      </span>
                    </div>
                    <Progress
                      value={(breakData.total / (totalBreakTime || 1)) * 100}
                      className={`h-1.5 ${breakData.color}`}
                    />
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-2 text-sm font-medium">
                  <div className="text-gray-700 dark:text-gray-200">Total Break Time:</div>
                  <div className="font-mono text-gray-800 dark:text-gray-100 text-right">
                    {formatTime(totalBreakTime)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Panel (conditionally rendered) */}
        {showStats && (
          <Card className="mt-4 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-100">Work Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Time Summary</h3>
                  <p className="text-xs mb-1">Staff Hours: {getDecimalHours(totalWorkTime)} hrs</p>
                  <p className="text-xs mb-1">Break Time: {getDecimalHours(totalBreakTime)} hrs</p>
                  <p className="text-xs font-medium">Login Hours: {getDecimalHours(netWorkingTime)} hrs</p>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Efficiency</h3>
                  <p className="text-xs mb-1">Work Percentage: {workPercentage}%</p>
                  <p className="text-xs mb-1">Break Percentage: {100 - workPercentage}%</p>
                  <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${workPercentage}%` }}></div>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Break Distribution</h3>
                  {Object.entries(breaks).map(([breakType, breakData]) => (
                    <p key={breakType} className="text-xs mb-1 flex justify-between">
                      <span className="capitalize">{breakType}:</span>
                      <span>{((breakData.total / (totalBreakTime || 1)) * 100).toFixed(1)}%</span>
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer with credit */}
        <footer className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          <p className="flex items-center justify-center gap-1">
            This is initiative of pagecraft tech <Heart className="h-3 w-3 text-red-500 inline" /> by Nitesh kumar
          </p>
          <p className="text-[10px] mt-1">© {new Date().getFullYear()} Pagecraft Tech. All rights reserved.</p>
        </footer>
      </div>

      {/* Stop Timer Confirmation Dialog */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-0">
          <DialogHeader>
            <DialogTitle>Stop Timer?</DialogTitle>
            <DialogDescription>
              Are you sure you want to stop the current work session? This will reset your current session timer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setShowStopDialog(false)}>
              No, Continue Working
            </Button>
            <Button variant="destructive" onClick={confirmStopTimer}>
              Yes, Stop Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

