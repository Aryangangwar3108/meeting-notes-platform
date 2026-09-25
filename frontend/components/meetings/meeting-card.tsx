'use client';

import Link from 'next/link';
import { Meeting } from '@/lib/types';
import { formatDate, getInitials, getAvatarColor, cn } from '@/lib/utils';
import { Clock, Users } from 'lucide-react';

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  return (
    <Link href={`/meetings/${meeting.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{meeting.title}</h3>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {meeting.duration} min
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(meeting.date)}
          </div>
        </div>

        {meeting.participants.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div className="flex -space-x-2">
              {meeting.participants.slice(0, 4).map((participant, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white',
                    getAvatarColor(participant)
                  )}
                  title={participant}
                >
                  {getInitials(participant)}
                </div>
              ))}
              {meeting.participants.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                  +{meeting.participants.length - 4}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {meeting.participants.join(' • ')}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
