'use client';

import { useState, useEffect, useCallback } from 'react';
import { Meeting } from '@/lib/types';
import { getMeetings } from '@/lib/api';
import { MeetingCard } from './meeting-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { CreateMeetingForm } from './create-meeting-form';
import { Toast } from '@/components/ui/toast';

export function MeetingList() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [availableParticipants, setAvailableParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [participantFilter, setParticipantFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const data = await getMeetings({
        search: search || undefined,
        participant: participantFilter || undefined,
        date: dateFilter || undefined,
        sort: sortBy,
      });
      setMeetings(data);
      setAvailableParticipants(Array.from(new Set(data.flatMap((meeting) => meeting.participants))).sort());
    } catch (error) {
      console.error('Failed to load meetings:', error);
      setLoadError(true);
      setToast({ message: 'Failed to load meetings', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [search, participantFilter, dateFilter, sortBy]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const handleMeetingCreated = () => {
    setShowCreateModal(false);
    setToast({ message: 'Meeting created successfully', type: 'success' });
    loadMeetings();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Meetings</h2>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search meetings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={participantFilter}
              onChange={(e) => setParticipantFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All participants</option>
              {availableParticipants.map((participant) => (
                <option key={participant} value={participant}>{participant}</option>
              ))}
            </select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="max-w-[180px]"
            />

            {(participantFilter || dateFilter) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setParticipantFilter('');
                  setDateFilter('');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {loadError ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Unable to load meetings</h3>
          <p className="text-gray-500 mb-4">The backend is unavailable. Check the connection and try again.</p>
          <Button onClick={loadMeetings}>Retry</Button>
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
          <p className="text-gray-500 mb-4">
            Try changing your search or create a new meeting
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Meeting
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Meeting"
      >
        <CreateMeetingForm onSuccess={handleMeetingCreated} onCancel={() => setShowCreateModal(false)} />
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
