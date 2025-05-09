"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Calendar, FileText, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const steps = [
  {
    id: "connect-gmail",
    title: "Connect Gmail",
    description: "Connect your Gmail account to start managing your inbox",
    icon: Mail,
  },
  {
    id: "connect-calendar",
    title: "Connect Calendar",
    description: "Connect your calendar to enable automatic meeting scheduling",
    icon: Calendar,
  },
  {
    id: "choose-templates",
    title: "Choose Templates",
    description: "Select email templates for different scenarios",
    icon: FileText,
  },
  {
    id: "success",
    title: "All Set!",
    description: "You're ready to start using InboxAI",
    icon: CheckCircle,
  },
]

export default function SetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsLoading(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsLoading(false)
      }, 800)
    } else {
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4">
        <Logo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Setup Your Account</h1>
            <Progress value={progress} className="h-2 bg-muted" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{steps[currentStep].title}</span>
            </div>
          </div>

          <AnimatePresence custom={currentStep} mode="wait">
            <motion.div
              key={currentStep}
              custom={currentStep}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && <ConnectGmailStep isLoading={isLoading} />}

              {currentStep === 1 && <ConnectCalendarStep isLoading={isLoading} />}

              {currentStep === 2 && <ChooseTemplatesStep isLoading={isLoading} />}

              {currentStep === 3 && <SuccessStep />}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <AnimatedButton variant="outline" onClick={handleBack} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </AnimatedButton>
            )}
            {currentStep === 0 && <div />}

            <AnimatedButton gradient onClick={handleNext} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {currentStep < steps.length - 1 ? "Continue" : "Go to Dashboard"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </AnimatedButton>
          </div>
        </div>
      </main>
    </div>
  )
}

function ConnectGmailStep({ isLoading }: { isLoading: boolean }) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/20">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Connect Gmail</CardTitle>
            <CardDescription>Connect your Gmail account to start managing your inbox</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">InboxAI needs access to your Gmail account to:</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Read and respond to emails on your behalf</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Create and manage drafts</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Send emails using your account</span>
          </li>
        </ul>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">We use secure OAuth2 authentication. InboxAI never stores your password.</p>
        </div>
      </CardContent>
      <CardFooter>
        <AnimatedButton className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
          Connect Gmail Account
        </AnimatedButton>
      </CardFooter>
    </Card>
  )
}

function ConnectCalendarStep({ isLoading }: { isLoading: boolean }) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/20">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Connect Calendar</CardTitle>
            <CardDescription>Connect your calendar to enable automatic meeting scheduling</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">InboxAI needs access to your calendar to:</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Check your availability</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Schedule meetings automatically</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Send calendar invites</span>
          </li>
        </ul>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">You can set your availability preferences after connecting your calendar.</p>
        </div>
      </CardContent>
      <CardFooter>
        <AnimatedButton className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
          Connect Google Calendar
        </AnimatedButton>
      </CardFooter>
    </Card>
  )
}

function ChooseTemplatesStep({ isLoading }: { isLoading: boolean }) {
  const [selectedTemplate, setSelectedTemplate] = useState("professional")

  const templates = [
    {
      id: "professional",
      name: "Professional",
      description: "Formal and business-like responses",
    },
    {
      id: "friendly",
      name: "Friendly",
      description: "Warm and approachable responses",
    },
    {
      id: "concise",
      name: "Concise",
      description: "Brief and to-the-point responses",
    },
  ]

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/20">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Choose Templates</CardTitle>
            <CardDescription>Select email templates for different scenarios</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">Choose a default template style for your auto-responses:</p>
        <div className="grid gap-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                {selectedTemplate === template.id && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">You can customize these templates or create new ones later.</p>
        </div>
      </CardContent>
    </Card>
  )
}

function SuccessStep() {
  return (
    <Card className="border-primary/20">
      <CardHeader className="text-center pb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="mx-auto p-3 rounded-full bg-primary/20 mb-4"
        >
          <CheckCircle className="h-10 w-10 text-primary" />
        </motion.div>
        <CardTitle className="text-2xl">All Set!</CardTitle>
        <CardDescription className="text-lg">You're ready to start using InboxAI</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4 pt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-muted-foreground">Your account has been successfully set up with:</p>
          <ul className="space-y-2 mt-4 inline-block text-left">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Gmail account connected</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Calendar connected</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Email templates selected</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-muted p-4 rounded-lg"
        >
          <p className="text-sm">Head to your dashboard to start managing your inbox with AI.</p>
        </motion.div>
      </CardContent>
    </Card>
  )
}
