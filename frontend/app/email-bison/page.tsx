"use client"

import React from 'react';
import InboxList from '../../components/InboxList';
import WorkspaceList from '../../components/WorkspaceList';

export default function EmailBisonDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4">
          <header className="bg-white shadow-md rounded-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Email Bison Dashboard</h1>
            <p className="mt-1 text-gray-600">View and manage your Email Bison integration</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section>
              <WorkspaceList />
            </section>
            
            <section>
              <InboxList />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
