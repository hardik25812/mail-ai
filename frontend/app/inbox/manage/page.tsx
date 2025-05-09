"use client"

import { useState } from "react"
import { Check, Edit, Mail, Calendar, Building, Zap, Target, MoreHorizontal, Globe } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

export default function ManageInboxPage() {
  const [inboxName, setInboxName] = useState("Inbox Manager 1 - A33T")
  const [selectedObjective, setSelectedObjective] = useState("meeting")
  const [selectedLanguage, setSelectedLanguage] = useState("english")
  const [isEditing, setIsEditing] = useState(false)
  const [progress, setProgress] = useState(25)

  const objectives = [
    {
      id: "meeting",
      title: "Set up a meeting",
      description: "Create an AI agent that helps schedule meetings with your clients",
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
    {
      id: "customer-support",
      title: "Customer Support",
      description: "Create an AI agent that handles common customer inquiries",
      icon: <Mail className="h-5 w-5 text-primary" />,
    },
    {
      id: "lead-qualification",
      title: "Lead Qualification",
      description: "Create an AI agent that qualifies leads from your inbox",
      icon: <Target className="h-5 w-5 text-primary" />,
    },
    {
      id: "other",
      title: "Other Objective",
      description: "Create a custom AI agent for other email automation needs",
      icon: <MoreHorizontal className="h-5 w-5 text-primary" />,
    },
  ]

  const languages = [
    { id: "english", name: "English" },
    { id: "spanish", name: "Spanish" },
    { id: "french", name: "French" },
    { id: "german", name: "German" },
    { id: "chinese", name: "Chinese" },
    { id: "japanese", name: "Japanese" },
  ]

  const setupSteps = [
    {
      id: "objective",
      title: "Select Objective",
      description: "Define your agent's purpose",
      icon: <Target className="h-6 w-6" />,
      completed: true,
    },
    {
      id: "email",
      title: "Email Integration",
      description: "Connect your email service",
      icon: <Mail className="h-6 w-6" />,
      completed: false,
    },
    {
      id: "calendar",
      title: "Calendar Integration",
      description: "Connect your calendar",
      icon: <Calendar className="h-6 w-6" />,
      completed: false,
    },
    {
      id: "company",
      title: "Company Info",
      description: "Personalize responses",
      icon: <Building className="h-6 w-6" />,
      completed: false,
    },
    {
      id: "response",
      title: "Response Configuration",
      description: "Configure auto-responses",
      icon: <Zap className="h-6 w-6" />,
      completed: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Manage</h1>
            <AnimatedButton gradient>Create New Inbox</AnimatedButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold mr-2">{inboxName}</h1>
          <button onClick={() => setIsEditing(!isEditing)} className="text-muted-foreground hover:text-foreground">
            <Edit className="h-5 w-5" />
          </button>
        </div>

        {/* Setup Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Setup Progress</h2>
            <span className="text-sm text-muted-foreground">{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Setup Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {setupSteps.map((step) => (
            <AnimatedCard key={step.id} className="cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className={`p-3 rounded-full mb-3 ${step.completed ? "bg-primary/20" : "bg-muted"}`}>
                  {step.icon}
                </div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.completed && (
                  <Badge variant="outline" className="mt-2">
                    <Check className="h-3 w-3 mr-1" /> Completed
                  </Badge>
                )}
              </CardContent>
            </AnimatedCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div>
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Inbox Manager Setup</h2>
                <div className="space-y-6">
                  {/* Inbox Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Inbox Manager Name{" "}
                      <span className="text-xs text-muted-foreground">
                        (This will be the name of your AI inbox manager)
                      </span>
                    </label>
                    {isEditing ? (
                      <div className="flex items-center">
                        <Input value={inboxName} onChange={(e) => setInboxName(e.target.value)} className="max-w-md" />
                        <div className="ml-2 text-xs text-muted-foreground">22/50</div>
                      </div>
                    ) : (
                      <div className="p-2 border rounded-md max-w-md">{inboxName}</div>
                    )}
                  </div>

                  {/* Select Objective */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Select Objective</h3>
                    <div className="space-y-3">
                      {objectives.map((objective) => (
                        <div
                          key={objective.id}
                          className={`p-4 border rounded-md cursor-pointer transition-colors ${
                            selectedObjective === objective.id
                              ? "border-primary bg-primary/5"
                              : "hover:border-muted-foreground"
                          }`}
                          onClick={() => setSelectedObjective(objective.id)}
                        >
                          <div className="flex items-start">
                            <div className="p-2 rounded-full bg-primary/10 mr-3">{objective.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-medium">{objective.title}</h4>
                              <p className="text-sm text-muted-foreground">{objective.description}</p>
                            </div>
                            {selectedObjective === objective.id && (
                              <div className="text-primary">
                                <Check className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Select Language */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Select Language</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {languages.map((language) => (
                        <div
                          key={language.id}
                          className={`p-3 border rounded-md cursor-pointer flex items-center ${
                            selectedLanguage === language.id
                              ? "border-primary bg-primary/5"
                              : "hover:border-muted-foreground"
                          }`}
                          onClick={() => setSelectedLanguage(language.id)}
                        >
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{language.name}</span>
                          {selectedLanguage === language.id && <Check className="h-4 w-4 ml-auto text-primary" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <AnimatedButton variant="outline" className="mr-3">
                Save as Draft
              </AnimatedButton>
              <AnimatedButton gradient>Continue</AnimatedButton>
            </div>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Example Email</h2>
                <div className="border rounded-md p-4">
                  <div className="flex items-center mb-4">
                    <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">Email Preview</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">From:</span> &lt;@company.com&gt;
                    </p>
                    <p>
                      <span className="text-muted-foreground">Subject:</span> Re: Meeting Scheduling
                    </p>
                    <p>
                      <span className="text-muted-foreground">To:</span> Customer &lt;customer@example.com&gt;
                    </p>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3 text-sm">
                    <p>Hi John,</p>
                    <p>
                      Thank you for your interest in scheduling a meeting. I'd be happy to connect and discuss further.
                    </p>
                    <p>Here are some available time slots to meet:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Monday, Jan 15 at 9:00 AM (PST)</li>
                      <li>Monday, Jan 15 at 2:00 PM (PST)</li>
                    </ol>
                    <p>Looking forward to our conversation.</p>
                    <p>Best regards,</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
