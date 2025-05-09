import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from '@/components/providers/toast-provider'
import { MockDataProvider } from '@/components/providers/mock-data-provider'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "AI Email Inbox Manager",
  description: "Manage your inbox with AI-powered responses and meeting scheduling",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <ToastProvider>
            <MockDataProvider />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
