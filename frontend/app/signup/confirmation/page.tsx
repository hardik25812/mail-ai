"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"
import { Logo } from "@/components/logo"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || "your email"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We've sent a verification link to <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <p className="text-center text-sm text-muted-foreground mb-4">
            Click the link in the email to verify your account and complete the sign-up process.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            If you don't see the email, check your spam folder or try again.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <AnimatedButton gradient className="w-full" asChild>
            <Link href="/login">
              Continue to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </AnimatedButton>
          <Link href="/signup" className="text-sm text-center text-primary hover:underline">
            Try signing up again
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
