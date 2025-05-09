"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4">
            AI Email Inbox Manager
          </h1>
          <p className="text-xl mb-8">
            Connect your inbox, auto-reply with smart responses, and book meetings automatically.
          </p>
          <Link href="/dashboard" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg">
            Go to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
