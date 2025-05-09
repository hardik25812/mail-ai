import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [inboxes, setInboxes] = useState([]);
  const [stats, setStats] = useState({
    totalEmails: 0,
    autoReplies: 0,
    meetingsBooked: 0,
    avgResponseTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Sample data - in a real app, this would come from your API
      setInboxes([
        { id: '1', name: 'Main Inbox', email: 'contact@example.com', unreadCount: 5 },
        { id: '2', name: 'Support', email: 'support@example.com', unreadCount: 2 },
        { id: '3', name: 'Sales', email: 'sales@example.com', unreadCount: 0 }
      ]);
      
      setStats({
        totalEmails: 1248,
        autoReplies: 856,
        meetingsBooked: 42,
        avgResponseTime: 28
      });
      
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard - Mail AI</title>
        <meta name="description" content="Mail AI Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Mail AI Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, User</span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Total Emails</h2>
                  <span className="p-2 bg-blue-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold">{stats.totalEmails}</p>
                <p className="mt-1 text-sm text-green-600">+24% from last period</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Auto-Replies</h2>
                  <span className="p-2 bg-purple-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold">{stats.autoReplies}</p>
                <p className="mt-1 text-sm text-green-600">+18% from last period</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Meetings Booked</h2>
                  <span className="p-2 bg-green-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold">{stats.meetingsBooked}</p>
                <p className="mt-1 text-sm text-green-600">+12% from last period</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Avg. Response Time</h2>
                  <span className="p-2 bg-yellow-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold">{stats.avgResponseTime}m</p>
                <p className="mt-1 text-sm text-green-600">-15% from last period</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Conversations</h2>
                  <div className="space-y-4">
                    <Link href="/conversation" className="block p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Project Update - Q2 Results</h3>
                          <p className="text-sm text-gray-500">Sarah Johnson - 10:23 AM</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">New</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 truncate">Hi John, I wanted to share the latest results from our Q2 analysis. The numbers are looking promising and...</p>
                    </Link>
                    
                    <Link href="/conversation" className="block p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Meeting Confirmation: Strategy Discussion</h3>
                          <p className="text-sm text-gray-500">Alex Chen - Yesterday</p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 truncate">This is a confirmation for our meeting tomorrow at 2:00 PM. I've attached the agenda and some preliminary...</p>
                    </Link>
                    
                    <Link href="/conversation" className="block p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Inquiry about pricing plans</h3>
                          <p className="text-sm text-gray-500">David Miller - Yesterday</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">New</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 truncate">Hello, I'm interested in your premium plan but I have a few questions about the features included. Could you...</p>
                    </Link>
                  </div>
                  <div className="mt-4 text-center">
                    <Link href="/conversations" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View All Conversations →
                    </Link>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Your Inboxes</h2>
                  <div className="space-y-3">
                    {inboxes.map((inbox) => (
                      <Link key={inbox.id} href={`/inbox/${inbox.id}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                        <div>
                          <h3 className="font-medium">{inbox.name}</h3>
                          <p className="text-xs text-gray-500">{inbox.email}</p>
                        </div>
                        {inbox.unreadCount > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {inbox.unreadCount} new
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Add New Inbox
                    </button>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/analytics" className="p-3 border rounded-lg hover:bg-gray-50 transition text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="block mt-1 text-sm">Analytics</span>
                    </Link>
                    
                    <Link href="/settings" className="p-3 border rounded-lg hover:bg-gray-50 transition text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="block mt-1 text-sm">Settings</span>
                    </Link>
                    
                    <Link href="/compose" className="p-3 border rounded-lg hover:bg-gray-50 transition text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="block mt-1 text-sm">Compose</span>
                    </Link>
                    
                    <Link href="/help" className="p-3 border rounded-lg hover:bg-gray-50 transition text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="block mt-1 text-sm">Help</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
