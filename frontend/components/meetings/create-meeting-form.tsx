'use client';

import { useEffect, useState } from 'react';
import { createMeeting, updateMeeting } from '@/lib/api';
import { MeetingCreate, MeetingDetail, MeetingUpdate } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const normalizeParticipantEmails = (emails: string[]) => {
  const cleaned = emails.map((email) => email.trim()).filter(Boolean);
  const invalid = cleaned.find((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  if (invalid) {
    throw new Error(`Invalid email address: ${invalid}`);
  }
  return [...new Set(cleaned.map((email) => email.toLowerCase()))];
};

const normalizeParticipantValues = (values: string[]) => {
  const cleaned = values.map((value) => value.trim()).filter(Boolean);
  return [...new Set(cleaned)];
};

interface CreateMeetingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateMeetingForm({ onSuccess, onCancel }: CreateMeetingFormProps) {
  const [formData, setFormData] = useState<MeetingCreate>({
    title: '',
    summary: '',
    date: new Date().toISOString().split('T')[0],
    duration: 30,
    participant_emails: [],
    transcript: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const cleanedEmails = normalizeParticipantEmails(formData.participant_emails);
      const meetingData = {
        ...formData,
        participant_emails: cleanedEmails,
        date: new Date(formData.date).toISOString(),
      };
      await createMeeting(meetingData);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create meeting. Please try again.';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = () => {
    setFormData({ ...formData, participant_emails: [...formData.participant_emails, ''] });
  };

  const updateParticipant = (index: number, email: string) => {
    const newEmails = [...formData.participant_emails];
    newEmails[index] = email;
    setFormData({ ...formData, participant_emails: newEmails });
  };

  const removeParticipant = (index: number) => {
    setFormData({
      ...formData,
      participant_emails: formData.participant_emails.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Meeting title" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
          <Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Math.max(1, Number(e.target.value) || 1) })} min="1" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
        <textarea value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} placeholder="Brief meeting summary" rows={3} className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
        <div className="space-y-2">
          {formData.participant_emails.map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input type="email" value={email} onChange={(e) => updateParticipant(index, e.target.value)} placeholder="participant@email.com" />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeParticipant(index)}>Remove</Button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addParticipant}>Add Participant</Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Transcript (optional)</label>
        <textarea value={formData.transcript} onChange={(e) => setFormData({ ...formData, transcript: e.target.value })} placeholder="Paste transcript here (format: MM:SS Speaker&#10;Text)" rows={6} className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" />
        <p className="text-xs text-gray-500 mt-1">Format: Use &quot;MM:SS Speaker&quot; on a new line for each speaker change</p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Meeting'}</Button>
      </div>
    </form>
  );
}

interface EditMeetingFormProps {
  meeting: MeetingDetail;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditMeetingForm({ meeting, onSuccess, onCancel }: EditMeetingFormProps) {
  const [formData, setFormData] = useState<MeetingUpdate>({
    title: '',
    summary: '',
    date: '',
    duration: 30,
    participant_emails: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData({
      title: meeting.title,
      summary: meeting.summary || '',
      date: new Date(meeting.date).toISOString().split('T')[0],
      duration: meeting.duration,
      participant_emails: meeting.participants,
    });
  }, [meeting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const cleanedEmails = normalizeParticipantValues(formData.participant_emails || []);
      await updateMeeting(meeting.id, {
        ...formData,
        participant_emails: cleanedEmails,
        date: new Date(formData.date || meeting.date).toISOString(),
      });
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update meeting.';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = () => {
    setFormData({ ...formData, participant_emails: [...(formData.participant_emails || []), ''] });
  };

  const updateParticipant = (index: number, email: string) => {
    const list = [...(formData.participant_emails || [])];
    list[index] = email;
    setFormData({ ...formData, participant_emails: list });
  };

  const removeParticipant = (index: number) => {
    setFormData({
      ...formData,
      participant_emails: (formData.participant_emails || []).filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Meeting title" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <Input type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
          <Input type="number" value={formData.duration || 30} onChange={(e) => setFormData({ ...formData, duration: Math.max(1, Number(e.target.value) || 1) })} min="1" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
        <textarea value={formData.summary || ''} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} rows={3} className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
        <div className="space-y-2">
          {(formData.participant_emails || []).map((email, index) => (
            <div key={`${email}-${index}`} className="flex gap-2">
              <Input type="text" value={email} onChange={(e) => updateParticipant(index, e.target.value)} placeholder="participant@email.com" />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeParticipant(index)}>Remove</Button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addParticipant}>Add Participant</Button>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Save Changes'}</Button>
      </div>
    </form>
  );
}
