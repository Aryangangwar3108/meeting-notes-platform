'use client';

import { useState, useRef, useEffect } from 'react';
import { TranscriptSegment } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface TranscriptPlayerProps {
  segments: TranscriptSegment[];
  onSegmentClick: (segment: TranscriptSegment) => void;
  activeSegmentId?: number;
  seekToTime?: number | null;
  onTimeUpdate?: (time: number) => void;
}

export function TranscriptPlayer({ segments, onSegmentClick, activeSegmentId, seekToTime, onTimeUpdate }: TranscriptPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      setDuration(lastSegment.end_time);
    }
  }, [segments]);

  useEffect(() => {
    if (seekToTime !== null && seekToTime !== undefined && audioRef.current) {
      audioRef.current.currentTime = seekToTime;
      setCurrentTime(seekToTime);
    }
  }, [seekToTime]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skip = (seconds: number) => {
    const nextTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(nextTime);
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const nextTime = audioRef.current.currentTime;
      setCurrentTime(nextTime);
      onTimeUpdate?.(nextTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} className="hidden">
        <source src="/sample-audio.wav" type="audio/wav" />
      </audio>

      <div className="flex items-center gap-4 mb-4">
        <button aria-label={isPlaying ? 'Pause audio' : 'Play audio'} onClick={togglePlayPause} className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors">
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
        </button>

        <div className="flex-1">
          <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
        </div>

        <div className="text-sm font-medium text-gray-700 w-24 text-right">{formatTime(currentTime)} / {formatTime(duration)}</div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button aria-label="Rewind 10 seconds" onClick={() => skip(-10)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"><SkipBack className="w-4 h-4" />10s</button>
        <button aria-label="Skip forward 10 seconds" onClick={() => skip(10)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">10s<SkipForward className="w-4 h-4" /></button>
      </div>

      {segments.length > 0 && activeSegmentId && (
        <div className="mt-3 text-center text-xs text-gray-600">
          Active segment: {segments.find((segment) => segment.id === activeSegmentId)?.speaker || 'Live'}
        </div>
      )}
    </div>
  );
}
