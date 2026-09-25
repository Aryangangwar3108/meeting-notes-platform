'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { TranscriptPlayer } from '@/components/transcript/transcript-player';
import { TranscriptViewer } from '@/components/transcript/transcript-viewer';
import { MeetingSummary } from '@/components/summary/meeting-summary';
import { ActionItemsList } from '@/components/action-items/action-items-list';
import { EditMeetingForm } from '@/components/meetings/create-meeting-form';
import { MeetingDetail, TranscriptSegment } from '@/lib/types';
import { getMeeting, deleteMeeting } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Toast } from '@/components/ui/toast';
import { ArrowLeft, Trash2, Edit, Users, Clock, Calendar } from 'lucide-react';

function findActiveTranscriptSegment(time: number, segments: TranscriptSegment[]) {
  if (!segments.length) return undefined;
  return segments.find((segment) => time >= segment.start_time && time <= segment.end_time) ?? segments.reduce((closest, segment) => {
    const closestDistance = Math.abs(closest.start_time - time);
    const currentDistance = Math.abs(segment.start_time - time);
    return currentDistance < closestDistance ? segment : closest;
  });
}

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = parseInt(params.id as string);

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSegmentId, setActiveSegmentId] = useState<number | undefined>();
  const [seekToTime, setSeekToTime] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadMeeting = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMeeting(meetingId);
      setMeeting(data);
    } catch (err) {
      setError('Failed to load meeting');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

  const handleSegmentClick = (segment: TranscriptSegment) => {
    setActiveSegmentId(segment.id);
    setSeekToTime(segment.start_time);
  };

  const handleTopicClick = (timestamp: number) => {
    if (!meeting) return;
    const closestSegment = findActiveTranscriptSegment(timestamp, meeting.transcript_segments) ?? meeting.transcript_segments[0];
    if (closestSegment) {
      setActiveSegmentId(closestSegment.id);
      setSeekToTime(closestSegment.start_time);
    }
  };

  const handleAudioTimeUpdate = (time: number) => {
    if (!meeting) return;
    const active = findActiveTranscriptSegment(time, meeting.transcript_segments);
    if (active) {
      setActiveSegmentId(active.id);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteMeeting(meetingId);
      setToast({ message: 'Meeting deleted successfully', type: 'success' });
      router.push('/');
    } catch (err) {
      setToast({ message: 'Failed to delete meeting', type: 'error' });
      setDeleting(false);
    }
  };

  const handleMeetingUpdated = async () => {
    setShowEditModal(false);
    setToast({ message: 'Meeting updated successfully', type: 'success' });
    await loadMeeting();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <h2 className="text-lg font-semibold text-red-900 mb-2">{error || 'Meeting not found'}</h2>
              <Button onClick={() => router.push('/')}>Back to Meetings</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <button aria-label="Back to meetings" onClick={() => router.push('/')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 flex-1">{meeting.title}</h1>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowEditModal(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(true)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{formatDate(meeting.date)}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{meeting.duration} min</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4" />{meeting.participants.join(', ')}</div>
              </div>
            </div>

            <div className="mb-6">
              <TranscriptPlayer
                segments={meeting.transcript_segments}
                onSegmentClick={handleSegmentClick}
                activeSegmentId={activeSegmentId}
                seekToTime={seekToTime}
                onTimeUpdate={handleAudioTimeUpdate}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h2>
                <div className="h-[500px]">
                  <TranscriptViewer segments={meeting.transcript_segments} onSegmentClick={handleSegmentClick} activeSegmentId={activeSegmentId} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
                  <MeetingSummary summary={meeting.summary} topics={meeting.topics} onTopicClick={handleTopicClick} />
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h2>
                  <ActionItemsList meetingId={meeting.id} initialItems={meeting.action_items} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Meeting">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Are you sure you want to delete &quot;{meeting.title}&quot;? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Meeting">
        <EditMeetingForm meeting={meeting} onSuccess={handleMeetingUpdated} onCancel={() => setShowEditModal(false)} />
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
