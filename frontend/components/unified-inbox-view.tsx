"use client"

import { useState } from 'react'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { InboxView } from '@/components/inbox-view'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart2, 
  Clock, 
  Mail, 
  MessageSquare, 
  Calendar,
  Settings,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { inboxService } from '@/lib/services/inbox-service'
import { toast } from '@/components/ui/use-toast'

interface UnifiedInboxViewProps {
  inboxId: string
  inboxEmail: string
}

export function UnifiedInboxView({ inboxId, inboxEmail }: UnifiedInboxViewProps) {
  const [activeTab, setActiveTab] = useState('emails')
  const [isImporting, setIsImporting] = useState(false)
  
  const handleImportFromEmailBison = async () => {
    setIsImporting(true)
    try {
      await inboxService.importFromEmailBison()
      toast({
        title: 'Import successful',
        description: 'New emails have been imported from Email Bison',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Failed to import emails from Email Bison',
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
    }
  }
  
  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Inbox: {inboxEmail}</h1>
          <p className="text-muted-foreground">Manage your emails and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleImportFromEmailBison}
            disabled={isImporting}
          >
            {isImporting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Import from Email Bison
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Inbox Settings
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Emails</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="ai-settings" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>AI Settings</span>
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Meetings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="emails" className="space-y-4">
          <InboxView inboxEmail={inboxEmail} />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
                <CardDescription>This month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">+22% from last month</p>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <CardDescription>AI replies sent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
                <Progress value={98} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                <CardDescription>Time to reply</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3 min</div>
                <p className="text-xs text-muted-foreground">-30% from last month</p>
                <Progress value={40} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Meetings Scheduled</CardTitle>
                <CardDescription>This month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
                <Progress value={60} className="mt-2" />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Email Activity</CardTitle>
              <CardDescription>Email volume and response metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Email activity chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Reply Settings</CardTitle>
              <CardDescription>Configure how AI responds to emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-medium">Auto-Reply</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Enable automatic replies</span>
                    <Badge variant="success">Enabled</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium">Reply Tone</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Professional</span>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium">Email Signature</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Configured</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium">Response Length</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Medium (150-300 words)</span>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="font-medium mb-2">Email Categories</div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Sales Inquiries</Badge>
                  <Badge>Support Requests</Badge>
                  <Badge>Partnership Opportunities</Badge>
                  <Badge>General Inquiries</Badge>
                  <Button variant="outline" size="sm" className="h-6">+ Add Category</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Meetings scheduled through AI replies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">Product Demo with John Smith</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Tomorrow, 2:00 PM - 3:00 PM</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    Join
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">Sales Call with Emily Johnson</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>May 2, 10:00 AM - 10:30 AM</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    Join
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">Partnership Discussion with David Brown</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>May 5, 3:30 PM - 4:30 PM</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    Join
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
