'use client';

import { Topic } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { CheckCircle, List, Clock } from 'lucide-react';

interface MeetingSummaryProps {
  summary?: string;
  topics: Topic[];
  onTopicClick?: (timestamp: number) => void;
}

export function MeetingSummary({ summary, topics, onTopicClick }: MeetingSummaryProps) {
  // Mock key decisions based on summary
  const keyDecisions = summary
    ? [
        'Agreed on Q4 launch timeline',
        'Prioritized core features over advanced analytics',
        'Allocated resources for marketing campaign',
      ]
    : [];

  return (
    <div className="space-y-6">
      {summary && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <List className="w-4 h-4" />
            Overview
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {keyDecisions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Key Decisions
          </h3>
          <ul className="space-y-2">
            {keyDecisions.map((decision, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                {decision}
              </li>
            ))}
          </ul>
        </div>
      )}

      {topics.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Chapters
          </h3>
          <div className="space-y-1">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onTopicClick?.(topic.timestamp)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <span className="font-mono text-xs text-gray-500">
                  {formatTime(topic.timestamp)}
                </span>
                <span>{topic.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!summary && keyDecisions.length === 0 && topics.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No summary available
        </div>
      )}
    </div>
  );
}
