"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { inboxService } from '@/lib/services/inbox-service'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Always redirect to dashboard when app is opened
    const redirectToDashboard = () => {
      try {
        router.push('/dashboard')
      } catch (error) {
        console.error('Error redirecting to dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    redirectToDashboard()
  }, [router])
  
  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-3xl px-4">
          <h1 className="text-4xl font-bold mb-6">Mail AI Inbox Manager</h1>
          <p className="text-xl mb-8">Loading your dashboard...</p>
          {isLoading && (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
