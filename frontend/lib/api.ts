import { Meeting, MeetingDetail, MeetingCreate, MeetingUpdate, TranscriptSegment, ActionItem, ActionItemCreate, ActionItemUpdate, Topic } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Meetings
export async function getMeetings(params?: {
  search?: string;
  participant?: string;
  date?: string;
  sort?: string;
}): Promise<Meeting[]> {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.participant) queryParams.append('participant', params.participant);
  if (params?.date) queryParams.append('date', params.date);
  if (params?.sort) queryParams.append('sort', params.sort);
  
  const queryString = queryParams.toString();
  return fetchAPI(`/api/meetings${queryString ? `?${queryString}` : ''}`);
}

export async function getMeeting(id: number): Promise<MeetingDetail> {
  return fetchAPI(`/api/meetings/${id}`);
}

export async function createMeeting(data: MeetingCreate): Promise<Meeting> {
  return fetchAPI('/api/meetings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMeeting(id: number, data: MeetingUpdate): Promise<Meeting> {
  return fetchAPI(`/api/meetings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMeeting(id: number): Promise<void> {
  return fetchAPI(`/api/meetings/${id}`, {
    method: 'DELETE',
  });
}

// Transcripts
export async function getTranscript(meetingId: number): Promise<TranscriptSegment[]> {
  return fetchAPI(`/api/meetings/${meetingId}/transcript`);
}

export async function createTranscript(meetingId: number, transcriptText: string): Promise<TranscriptSegment[]> {
  return fetchAPI(`/api/meetings/${meetingId}/transcript`, {
    method: 'POST',
    body: JSON.stringify(transcriptText),
  });
}

// Action Items
export async function getActionItems(meetingId: number): Promise<ActionItem[]> {
  return fetchAPI(`/api/meetings/${meetingId}/action-items`);
}

export async function createActionItem(meetingId: number, data: ActionItemCreate): Promise<ActionItem> {
  return fetchAPI(`/api/meetings/${meetingId}/action-items`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateActionItem(id: number, data: ActionItemUpdate): Promise<ActionItem> {
  return fetchAPI(`/api/action-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteActionItem(id: number): Promise<void> {
  return fetchAPI(`/api/action-items/${id}`, {
    method: 'DELETE',
  });
}

// Topics
export async function getTopics(meetingId: number): Promise<Topic[]> {
  return fetchAPI(`/api/meetings/${meetingId}/topics`);
}
