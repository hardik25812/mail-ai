"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Download, Mail, MessageSquare, Clock, Users, Filter } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEmailStats, useResponseTimeStats, useEmailTimeSeries, useEmailTypeDistribution, useAnalyticsExport } from "@/lib/hooks/useAnalytics"
import { toast } from "sonner"

export default function AnalyticsPage() {
  // State for filters
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "365d">("30d")
  const [currentWorkspace, setCurrentWorkspace] = useState<string>("workspace-1")
  
  // Use our enhanced analytics hooks
  const { stats: emailStats, loading: emailStatsLoading, error: emailStatsError, refetch: refetchEmailStats } 
    = useEmailStats(timeRange, currentWorkspace)
  
  const { stats: responseTimeStats, loading: responseTimeLoading } 
    = useResponseTimeStats(timeRange, currentWorkspace)
  
  const { data: timeSeriesData, loading: timeSeriesLoading } 
    = useEmailTimeSeries(timeRange, "day", currentWorkspace)
  
  const { data: emailTypeData, loading: typeDistLoading } 
    = useEmailTypeDistribution(timeRange, currentWorkspace)
    
  const { exportData, loading: exportLoading } = useAnalyticsExport()
  
  // Fallback data for charts when API returns no data
  const emailData = timeSeriesData && timeSeriesData.length > 0 
    ? timeSeriesData 
    : [
        { name: "Mon", received: 45, replied: 32, autoReplied: 28 },
        { name: "Tue", received: 52, replied: 41, autoReplied: 35 },
        { name: "Wed", received: 48, replied: 37, autoReplied: 30 },
        { name: "Thu", received: 61, replied: 43, autoReplied: 38 },
        { name: "Fri", received: 55, replied: 40, autoReplied: 36 },
        { name: "Sat", received: 28, replied: 19, autoReplied: 15 },
        { name: "Sun", received: 22, replied: 14, autoReplied: 12 },
      ]

  const meetingData = [
    { name: "Week 1", scheduled: 12, completed: 10, cancelled: 2 },
    { name: "Week 2", scheduled: 15, completed: 13, cancelled: 2 },
    { name: "Week 3", scheduled: 18, completed: 15, cancelled: 3 },
    { name: "Week 4", scheduled: 14, completed: 12, cancelled: 2 },
  ]
  
  const responseTimeData = responseTimeStats
    ? Array(7).fill(0).map((_, i) => ({
        name: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        time: responseTimeStats.average_minutes || 0
      }))
    : [
        { name: "Mon", time: 45 },
        { name: "Tue", time: 38 },
        { name: "Wed", time: 42 },
        { name: "Thu", time: 35 },
        { name: "Fri", time: 40 },
        { name: "Sat", time: 52 },
        { name: "Sun", time: 58 },
      ]

  // Use API data if available, otherwise use fallback
  const emailTypeChartData = emailTypeData && emailTypeData.length > 0
    ? emailTypeData
    : [
        { name: "Business", value: 45 },
        { name: "Personal", value: 25 },
        { name: "Marketing", value: 20 },
        { name: "Other", value: 10 },
      ]
      
  // Function to handle data export
  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    try {
      toast.info(`Exporting analytics data as ${format.toUpperCase()}...`);
      await exportData(timeRange, format, currentWorkspace);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics data');
    }
  };

  const COLORS = ["#7B68EE", "#4ECDC4", "#FF6B6B", "#FFE66D"]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your email and meeting performance.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <AnimatedButton variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </AnimatedButton>
          <AnimatedButton 
            variant="outline" 
            onClick={() => handleExport('csv')}
            disabled={exportLoading}
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </AnimatedButton>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard delay={0.1}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle>Total Emails</CardTitle>
                <CardDescription>All emails in this period</CardDescription>
              </div>
              <Mail className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {emailStatsLoading ? (
                <div className="text-3xl font-bold animate-pulse">Loading...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{emailStats?.total || 0}</div>
                  <div className={`text-xs ${(emailStats?.growth_percentage || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(emailStats?.growth_percentage || 0) >= 0 ? '+' : ''}
                    {emailStats?.growth_percentage || 0}% from last period
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle>Received</CardTitle>
                <CardDescription>Inbound emails</CardDescription>
              </div>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {emailStatsLoading ? (
                <div className="text-3xl font-bold animate-pulse">Loading...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{emailStats?.received || 0}</div>
                  <div className="text-xs text-muted-foreground">
                    {((emailStats?.received || 0) / (emailStats?.total || 1) * 100).toFixed(0)}% of total
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle>Avg Response Time</CardTitle>
                <CardDescription>Minutes to first reply</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {responseTimeLoading ? (
                <div className="text-3xl font-bold animate-pulse">Loading...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{responseTimeStats?.average_minutes || 0}</div>
                  <div className={`text-xs ${(responseTimeStats?.improvement_percentage || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(responseTimeStats?.improvement_percentage || 0) >= 0 ? '+' : ''}
                    {responseTimeStats?.improvement_percentage || 0}% from last period
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle>Meetings Booked</CardTitle>
                <CardDescription>Scheduled meetings</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{meetingData.reduce((acc, curr) => acc + curr.scheduled, 0)}</div>
              <div className="text-xs text-muted-foreground">
                {meetingData.reduce((acc, curr) => acc + curr.completed, 0)} completed
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="emails" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="emails" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Email Activity</CardTitle>
                    <CardDescription>Email volume over time</CardDescription>
                  </div>
                  <Select defaultValue="weekly">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    received: {
                      label: "Received",
                      color: "hsl(var(--chart-1))",
                    },
                    replied: {
                      label: "Replied",
                      color: "hsl(var(--chart-2))",
                    },
                    autoReplied: {
                      label: "Auto-Replied",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={emailData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-received)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--color-received)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorReplied" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-replied)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--color-replied)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAutoReplied" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-autoReplied)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--color-autoReplied)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="received"
                        stroke="var(--color-received)"
                        fillOpacity={1}
                        fill="url(#colorReceived)"
                      />
                      <Area
                        type="monotone"
                        dataKey="replied"
                        stroke="var(--color-replied)"
                        fillOpacity={1}
                        fill="url(#colorReplied)"
                      />
                      <Area
                        type="monotone"
                        dataKey="autoReplied"
                        stroke="var(--color-autoReplied)"
                        fillOpacity={1}
                        fill="url(#colorAutoReplied)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Types</CardTitle>
                  <CardDescription>Distribution by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {typeDistLoading ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Loading chart data...
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={emailTypeChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {emailTypeChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend layout="vertical" verticalAlign="middle" align="right" />
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Time</CardTitle>
                  <CardDescription>Average time to respond (minutes)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      time: {
                        label: "Response Time (min)",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={responseTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="time" stroke="var(--color-time)" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Meeting Statistics</CardTitle>
                    <CardDescription>Scheduled vs. completed meetings</CardDescription>
                  </div>
                  <Select defaultValue="weekly">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    scheduled: {
                      label: "Scheduled",
                      color: "hsl(var(--chart-1))",
                    },
                    completed: {
                      label: "Completed",
                      color: "hsl(var(--chart-2))",
                    },
                    cancelled: {
                      label: "Cancelled",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={meetingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="scheduled" fill="var(--color-scheduled)" />
                      <Bar dataKey="completed" fill="var(--color-completed)" />
                      <Bar dataKey="cancelled" fill="var(--color-cancelled)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Meeting Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[200px]">
                    <div className="relative h-32 w-32">
                      <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle
                          className="text-muted stroke-current"
                          strokeWidth="10"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className="text-primary stroke-current"
                          strokeWidth="10"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                          strokeDasharray="251.2"
                          strokeDashoffset="50.24"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-2xl font-bold">80%</span>
                          <span className="text-xs block text-muted-foreground">Success</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">4 out of 5 meetings completed successfully</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[200px]">
                    <div className="text-center">
                      <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                      <span className="text-3xl font-bold">45m</span>
                      <span className="text-sm block text-muted-foreground">per meeting</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">5 minutes shorter than last period</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[200px]">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                      <span className="text-3xl font-bold">3.2</span>
                      <span className="text-sm block text-muted-foreground">avg. participants</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">+0.5 from last period</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Response Rate</CardTitle>
                  <CardDescription>Percentage of emails that received a response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={[
                          { name: "Jan", rate: 78 },
                          { name: "Feb", rate: 82 },
                          { name: "Mar", rate: 85 },
                          { name: "Apr", rate: 89 },
                          { name: "May", rate: 92 },
                          { name: "Jun", rate: 94 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[70, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="rate" stroke="#7B68EE" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Score</CardTitle>
                  <CardDescription>Combined performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Response Time", score: 85 },
                          { name: "Meeting Rate", score: 78 },
                          { name: "Template Usage", score: 92 },
                          { name: "Follow-ups", score: 68 },
                          { name: "Overall", score: 82 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#7B68EE">
                          {[
                            { name: "Response Time", score: 85 },
                            { name: "Meeting Rate", score: 78 },
                            { name: "Template Usage", score: 92 },
                            { name: "Follow-ups", score: 68 },
                            { name: "Overall", score: 82 },
                          ].map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.name === "Overall" ? "#7B68EE" : `rgba(123, 104, 238, ${0.6 + entry.score / 200})`
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Key metrics over time</CardDescription>
                  </div>
                  <Select defaultValue="6m">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 month</SelectItem>
                      <SelectItem value="3m">3 months</SelectItem>
                      <SelectItem value="6m">6 months</SelectItem>
                      <SelectItem value="1y">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={[
                        { name: "Jan", responseTime: 45, meetingRate: 68, autoReplyRate: 72 },
                        { name: "Feb", responseTime: 42, meetingRate: 70, autoReplyRate: 75 },
                        { name: "Mar", responseTime: 40, meetingRate: 72, autoReplyRate: 78 },
                        { name: "Apr", responseTime: 38, meetingRate: 75, autoReplyRate: 80 },
                        { name: "May", responseTime: 35, meetingRate: 78, autoReplyRate: 82 },
                        { name: "Jun", responseTime: 30, meetingRate: 82, autoReplyRate: 85 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        name="Response Time (min)"
                        stroke="#7B68EE"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="meetingRate"
                        name="Meeting Rate (%)"
                        stroke="#4ECDC4"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="autoReplyRate"
                        name="Auto-Reply Rate (%)"
                        stroke="#FF6B6B"
                        strokeWidth={2}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
