"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Inbox, 
  PlusCircle, 
  BarChart2, 
  Brain, 
  Settings,
  ChevronDown,
  ChevronRight,
  Mail
} from 'lucide-react'

interface Inbox {
  id: string
  email: string
  name?: string
}

export function SidebarNavigation({ inboxes = [] }: { inboxes?: Inbox[] }) {
  const pathname = usePathname()
  const [inboxesExpanded, setInboxesExpanded] = useState(true)
  
  // Default inboxes if none provided
  const displayInboxes = inboxes.length > 0 ? inboxes : [
    { id: '1', email: 'sales@company.com' },
    { id: '2', email: 'support@company.com' },
    { id: '3', email: 'info@company.com' }
  ]

  return (
    <div className="h-screen w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Mail className="h-5 w-5 text-primary" />
        <h1 className="font-bold text-lg">Mail AI Inbox Manager</h1>
      </div>
      
      <nav className="flex-1 p-2">
        <div className="mb-4">
          <button 
            onClick={() => setInboxesExpanded(!inboxesExpanded)}
            className="flex items-center gap-2 p-2 w-full text-left hover:bg-accent rounded-md"
          >
            {inboxesExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Inbox className="h-5 w-5" />
            <span>Inboxes</span>
          </button>
          
          {inboxesExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {displayInboxes.map(inbox => (
                <Link
                  key={inbox.id}
                  href={`/inbox/${inbox.id}`}
                  className={`block p-2 rounded-md text-sm ${
                    pathname === `/inbox/${inbox.id}` 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-accent'
                  }`}
                >
                  - {inbox.name || inbox.email}
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <Link 
          href="/connect-inbox" 
          className={`flex items-center gap-2 p-2 rounded-md ${
            pathname === '/connect-inbox' 
              ? 'bg-primary/10 text-primary' 
              : 'hover:bg-accent'
          }`}
        >
          <PlusCircle className="h-5 w-5" />
          <span>Connect New Inbox</span>
        </Link>
        
        <div className="h-4"></div>
        
        <Link 
          href="/analytics" 
          className={`flex items-center gap-2 p-2 rounded-md ${
            pathname === '/analytics' 
              ? 'bg-primary/10 text-primary' 
              : 'hover:bg-accent'
          }`}
        >
          <BarChart2 className="h-5 w-5" />
          <span>Analytics</span>
        </Link>
        
        <Link 
          href="/ai-settings" 
          className={`flex items-center gap-2 p-2 rounded-md ${
            pathname === '/ai-settings' 
              ? 'bg-primary/10 text-primary' 
              : 'hover:bg-accent'
          }`}
        >
          <Brain className="h-5 w-5" />
          <span>AI Settings</span>
        </Link>
        
        <Link 
          href="/account-settings" 
          className={`flex items-center gap-2 p-2 rounded-md ${
            pathname === '/account-settings' 
              ? 'bg-primary/10 text-primary' 
              : 'hover:bg-accent'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Account Settings</span>
        </Link>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p>Mail AI Inbox Manager</p>
          <p>© 2025 All rights reserved</p>
        </div>
      </div>
    </div>
  )
}
