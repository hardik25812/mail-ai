"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Mail, Calendar, Settings, Info, AlertCircle, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Notification {
  id: number
  type: "email" | "meeting" | "system" | "alert"
  title: string
  description: string
  time: string
  read: boolean
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "email",
      title: "New email from Sarah Johnson",
      description: "Subject: Project Update - Q2 Results",
      time: "Just now",
      read: false
    },
    {
      id: 2,
      type: "meeting",
      title: "Meeting reminder",
      description: "Strategy Discussion with Alex Chen in 15 minutes",
      time: "15m",
      read: false
    },
    {
      id: 3,
      type: "system",
      title: "Email template updated",
      description: "Your 'Professional' template has been updated",
      time: "1h",
      read: true
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  // Close the notification center when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (open && !target.closest('[data-notification-center]')) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "system":
        return <Settings className="h-4 w-4" />
      case "alert":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getIconBackground = (type: string) => {
    switch (type) {
      case "email":
        return "bg-primary/20 text-primary"
      case "meeting":
        return "bg-blue-500/20 text-blue-500"
      case "system":
        return "bg-amber-500/20 text-amber-500"
      case "alert":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div data-notification-center className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 z-50"
          >
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <h3 className="font-medium">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                  <button
                    className="p-1 rounded-full hover:bg-muted transition-colors"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <Tabs defaultValue="all" className="w-full">
                <div className="border-b">
                  <TabsList className="w-full justify-start rounded-none border-b px-4">
                    <TabsTrigger value="all" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="email" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="meeting" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                      Meetings
                    </TabsTrigger>
                    <TabsTrigger value="system" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                      System
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="all" className="max-h-[400px] overflow-y-auto">
                  <div className="divide-y">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 ${notification.read ? '' : 'bg-muted/50'}`}
                        >
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-full ${getIconBackground(notification.type)}`}>
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm ${notification.read ? '' : 'font-medium'}`}>
                                  {notification.title}
                                </p>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {notification.time}
                                  </span>
                                  <button
                                    className="p-1 rounded-full hover:bg-muted transition-colors"
                                    onClick={() => removeNotification(notification.id)}
                                    aria-label="Remove notification"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.description}
                              </p>
                              {!notification.read && (
                                <button
                                  className="text-xs text-primary hover:underline mt-2"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <div className="mx-auto p-3 rounded-full bg-muted w-fit mb-3">
                          <CheckCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium">All caught up!</h3>
                        <p className="text-sm text-muted-foreground">You have no notifications.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
