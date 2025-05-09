"use client"

import { useState, useEffect } from 'react'
import { useEmailBisonImport } from '@/hooks/useEmailBisonImport'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertCircle, RefreshCw, Inbox, BarChart } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/providers/toast-provider'

export function EmailBisonImport() {
  const { status, importInboxes, importAnalytics, importAll } = useEmailBisonImport()
  const [expanded, setExpanded] = useState(false)
  const [isRealTimeUpdating, setIsRealTimeUpdating] = useState(false)
  const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const handleImportAll = async () => {
    try {
      await importAll()
      toast({
        title: "Import successful",
        description: "All data has been imported from Email Bison",
        variant: "default",
      })
      router.refresh()
    } catch (error) {
      console.error('Import failed:', error)
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      })
    }
  }
  
  const handleImportAnalytics = async () => {
    try {
      setIsRealTimeUpdating(true)
      await importAnalytics()
      toast({
        title: "Analytics imported",
        description: "Analytics data has been imported from Email Bison",
        variant: "default",
      })
      router.refresh()
      
      // Set up real-time updates
      if (updateInterval) {
        clearInterval(updateInterval)
      }
      
      const interval = setInterval(async () => {
        try {
          await importAnalytics()
          router.refresh()
          console.log('Real-time analytics updated')
        } catch (error) {
          console.error('Real-time update failed:', error)
        }
      }, 30000) // Update every 30 seconds
      
      setUpdateInterval(interval)
    } catch (error) {
      setIsRealTimeUpdating(false)
      console.error('Analytics import failed:', error)
      toast({
        title: "Analytics import failed",
        description: error instanceof Error ? error.message : "Failed to import analytics",
        variant: "destructive",
      })
    }
  }
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    }
  }, [updateInterval])

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-purple-500" />
          Email Bison Import
        </CardTitle>
        <CardDescription>
          Import your inboxes and analytics data from Email Bison
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inboxes Status */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Inbox className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Inboxes</h3>
                <p className="text-sm text-muted-foreground">
                  {status.inboxes.loading ? (
                    'Importing inboxes...'
                  ) : status.inboxes.success ? (
                    `Successfully imported ${status.inboxes.data?.length || 0} inboxes`
                  ) : status.inboxes.error ? (
                    `Error: ${status.inboxes.error}`
                  ) : (
                    'Import your connected inboxes'
                  )}
                </p>
                {status.inboxes.success && status.inboxes.data && expanded && (
                  <div className="mt-2 text-xs">
                    <ul className="space-y-1">
                      {status.inboxes.data.map((inbox: any, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{inbox.name} ({inbox.email})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {status.inboxes.loading ? (
                <LoadingSpinner size="sm" />
              ) : status.inboxes.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : status.inboxes.error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : null}
            </div>

            {/* Analytics Status */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  {status.analytics.loading ? (
                    'Importing analytics...'
                  ) : status.analytics.success ? (
                    'Successfully imported analytics data'
                  ) : status.analytics.error ? (
                    `Error: ${status.analytics.error}`
                  ) : (
                    'Import your analytics data'
                  )}
                </p>
                {status.analytics.success && status.analytics.data && expanded && (
                  <div className="mt-2 text-xs">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div>
                        <span className="text-muted-foreground">Total Emails:</span>{' '}
                        <span className="font-medium">{status.analytics.data.emailStats.total}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Response Time:</span>{' '}
                        <span className="font-medium">{status.analytics.data.responseTimeStats.average_minutes} min</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Meetings Booked:</span>{' '}
                        <span className="font-medium">{status.analytics.data.meetingStats.booked}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Auto-Replies:</span>{' '}
                        <span className="font-medium">{status.analytics.data.emailStats.auto_replied}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {status.analytics.loading ? (
                <LoadingSpinner size="sm" />
              ) : status.analytics.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : status.analytics.error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : null}
            </div>
          </div>

          {(status.inboxes.success || status.analytics.success) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show Less' : 'Show Details'}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => importInboxes()}
            disabled={status.inboxes.loading}
          >
            {status.inboxes.loading && <LoadingSpinner size="sm" className="mr-2" />}
            Import Inboxes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportAnalytics}
            disabled={status.analytics.loading}
            data-component-name="_c"
          >
            {status.analytics.loading && <LoadingSpinner size="sm" className="mr-2" />}
            {isRealTimeUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Real-time Updates On
              </>
            ) : (
              'Import Analytics'
            )}
          </Button>
        </div>
        <Button
          onClick={handleImportAll}
          disabled={status.inboxes.loading || status.analytics.loading}
        >
          {(status.inboxes.loading || status.analytics.loading) && (
            <LoadingSpinner size="sm" className="mr-2" />
          )}
          Import All
        </Button>
      </CardFooter>
    </Card>
  )
}
