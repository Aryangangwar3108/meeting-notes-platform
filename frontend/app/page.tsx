'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { MeetingList } from '@/components/meetings/meeting-list';

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          <MeetingList />
        </div>
      </main>
    </div>
  );
}
