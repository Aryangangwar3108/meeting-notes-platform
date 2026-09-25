'use client';

import { Sidebar } from '@/components/layout/sidebar';

export default function AllMeetingsPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">All Meetings</h1>
          
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Team Meeting View Coming Soon</h2>
            <p className="text-gray-500 mb-4">
              View all team meetings with advanced filtering and search capabilities.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              In Development
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
