export interface Meeting {
  id: number;
  title: string;
  summary?: string;
  date: string;
  duration: number;
  created_at: string;
  updated_at?: string;
  participants: string[];
}

export interface MeetingDetail extends Meeting {
  transcript_segments: TranscriptSegment[];
  action_items: ActionItem[];
  topics: Topic[];
}

export interface TranscriptSegment {
  id: number;
  meeting_id: number;
  speaker: string;
  text: string;
  start_time: number;
  end_time: number;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  title: string;
  description?: string;
  assignee?: string;
  due_date?: string;
  completed: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Topic {
  id: number;
  meeting_id: number;
  title: string;
  timestamp: number;
}

export interface MeetingCreate {
  title: string;
  summary?: string;
  date: string;
  duration: number;
  participant_emails: string[];
  transcript?: string;
}

export interface MeetingUpdate {
  title?: string;
  summary?: string;
  date?: string;
  duration?: number;
  participant_emails?: string[];
}

export interface ActionItemCreate {
  title: string;
  description?: string;
  assignee?: string;
  due_date?: string;
  completed?: boolean;
}

export interface ActionItemUpdate {
  title?: string;
  description?: string;
  assignee?: string;
  due_date?: string;
  completed?: boolean;
}
