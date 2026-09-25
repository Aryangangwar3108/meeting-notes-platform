'use client';

import { useState, useRef, useEffect } from 'react';
import { TranscriptSegment } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  onSegmentClick: (segment: TranscriptSegment) => void;
  activeSegmentId?: number;
}

export function TranscriptViewer({ segments, onSegmentClick, activeSegmentId }: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matches, setMatches] = useState<{ segmentId: number; indices: number[] }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      const newMatches: { segmentId: number; indices: number[] }[] = [];
      segments.forEach(segment => {
        const indices: number[] = [];
        let index = segment.text.toLowerCase().indexOf(searchQuery.toLowerCase());
        while (index !== -1) {
          indices.push(index);
          index = segment.text.toLowerCase().indexOf(searchQuery.toLowerCase(), index + 1);
        }
        if (indices.length > 0) {
          newMatches.push({ segmentId: segment.id, indices });
        }
      });
      setMatches(newMatches);
      setCurrentMatchIndex(0);
    } else {
      setMatches([]);
      setCurrentMatchIndex(0);
    }
  }, [searchQuery, segments]);

  useEffect(() => {
    if (matches.length > 0 && currentMatchIndex < matches.length) {
      const matchSegment = segments.find(s => s.id === matches[currentMatchIndex].segmentId);
      if (matchSegment && containerRef.current) {
        const element = containerRef.current.querySelector(`[data-segment-id="${matchSegment.id}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentMatchIndex, matches, segments]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const filteredSegments = searchQuery.trim() 
    ? segments.filter(s => matches.some(m => m.segmentId === s.id))
    : segments;

  const nextMatch = () => {
    if (matches.length > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
    }
  };

  const prevMatch = () => {
    if (matches.length > 0) {
      setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentMatchIndex(0);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              aria-label="Clear transcript search"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {matches.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous transcript match"
              onClick={prevMatch}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous match"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 px-2">
              {currentMatchIndex + 1} / {matches.length}
            </span>
            <button
              aria-label="Next transcript match"
              onClick={nextMatch}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next match"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2"
      >
        {filteredSegments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No matches found' : 'No transcript available'}
          </div>
        ) : (
          filteredSegments.map((segment) => (
            <div
              key={segment.id}
              data-segment-id={segment.id}
              onClick={() => onSegmentClick(segment)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                activeSegmentId === segment.id
                  ? 'bg-blue-100 border-2 border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-500">
                  {formatTime(segment.start_time)}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {segment.speaker}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {highlightText(segment.text, searchQuery)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
