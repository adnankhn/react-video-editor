/**
 * SRT Caption Renderer
 * Renders SRT captions with black background and white highlighted text
 */

import React from 'react';
import { useCurrentPlayerFrame } from '../../hooks/use-current-frame';
import useStore from '../../store/use-store';
import { SRTSubtitle } from '@/utils/srt-parser';

interface SRTParagraphCaptionProps {
  subtitles: SRTSubtitle[];
  offsetFrom: number;
  globalOpacity?: number;
  width?: number;
  height?: number;
  padding?: number;
}

export const SRTParagraphCaption: React.FC<SRTParagraphCaptionProps> = ({
  subtitles,
  offsetFrom,
  globalOpacity = 1,
  width = 800,
  height = 120,
  padding = 20
}) => {
  const fps = 30;
  const { playerRef } = useStore();
  const currentFrame = useCurrentPlayerFrame(playerRef!);
  
  // Convert current frame to milliseconds
  const currentTimeMs = (currentFrame / fps) * 1000;
  const adjustedTimeMs = currentTimeMs - offsetFrom;

  // Find active subtitle
  const activeSubtitle = subtitles.find(subtitle => 
    adjustedTimeMs >= subtitle.startTime && adjustedTimeMs <= subtitle.endTime
  );

  // Find upcoming subtitle (for smooth transitions)
  const upcomingSubtitle = subtitles.find(subtitle => 
    subtitle.startTime > adjustedTimeMs
  );

  return (
    <div 
      className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none"
      style={{
        width: `${width}px`,
        opacity: globalOpacity
      }}
    >
      <div 
        className="rounded-lg backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: `${padding}px`,
          minHeight: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {activeSubtitle ? (
          <div className="text-center w-full">
            <p 
              className="text-white text-xl font-medium leading-relaxed transition-all duration-200"
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                margin: 0
              }}
            >
              {activeSubtitle.text}
            </p>
            <div 
              className="h-1 bg-white rounded-full mt-3 transition-all duration-300"
              style={{
                width: `${((adjustedTimeMs - activeSubtitle.startTime) / (activeSubtitle.endTime - activeSubtitle.startTime)) * 100}%`,
                maxWidth: '100%'
              }}
            />
          </div>
        ) : upcomingSubtitle ? (
          <div className="text-center w-full">
            <p 
              className="text-gray-400 text-xl font-medium leading-relaxed transition-all duration-200"
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                margin: 0
              }}
            >
              {upcomingSubtitle.text}
            </p>
          </div>
        ) : (
          <div className="text-center w-full">
            <p 
              className="text-gray-600 text-lg leading-relaxed"
              style={{ margin: 0 }}
            >
              {/* Empty state - could show a placeholder or remain blank */}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface SRTWordLevelCaptionProps {
  subtitles: SRTSubtitle[];
  offsetFrom: number;
  globalOpacity?: number;
  width?: number;
  height?: number;
  padding?: number;
}

export const SRTWordLevelCaption: React.FC<SRTWordLevelCaptionProps> = ({
  subtitles,
  offsetFrom,
  globalOpacity = 1,
  width = 800,
  height = 120,
  padding = 20
}) => {
  const fps = 30;
  const { playerRef } = useStore();
  const currentFrame = useCurrentPlayerFrame(playerRef!);
  
  const currentTimeMs = (currentFrame / fps) * 1000;
  const adjustedTimeMs = currentTimeMs - offsetFrom;

  // Split subtitles into words for word-level highlighting
  const wordSegments = subtitles.flatMap(subtitle => {
    const words = subtitle.text.split(/\s+/);
    const durationPerWord = (subtitle.endTime - subtitle.startTime) / words.length;
    
    return words.map((word, index) => ({
      word,
      startTime: subtitle.startTime + (index * durationPerWord),
      endTime: subtitle.startTime + ((index + 1) * durationPerWord),
      subtitleId: subtitle.id
    }));
  });

  // Find active words
  const activeWords = wordSegments.filter(segment => 
    adjustedTimeMs >= segment.startTime && adjustedTimeMs <= segment.endTime
  );

  // Find current and upcoming words for smooth display
  const currentWords = wordSegments.filter(segment => 
    adjustedTimeMs >= segment.startTime && adjustedTimeMs <= segment.endTime
  );
  
  const upcomingWords = wordSegments.filter(segment => 
    segment.startTime > adjustedTimeMs
  ).slice(0, 5); // Show next 5 words

  return (
    <div 
      className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none"
      style={{
        width: `${width}px`,
        opacity: globalOpacity
      }}
    >
      <div 
        className="rounded-lg backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: `${padding}px`,
          minHeight: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="text-center w-full">
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {currentWords.map((wordSegment, index) => (
              <span
                key={`${wordSegment.subtitleId}-${index}`}
                className="text-white text-xl font-medium px-1 py-0.5 rounded transition-all duration-200"
                style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                {wordSegment.word}
              </span>
            ))}
            
            {upcomingWords.map((wordSegment, index) => (
              <span
                key={`${wordSegment.subtitleId}-${index}-upcoming`}
                className="text-gray-400 text-xl font-medium px-1 py-0.5 rounded transition-all duration-200"
                style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                }}
              >
                {wordSegment.word}
              </span>
            ))}
          </div>
          
          {activeWords.length > 0 && (
            <div 
              className="h-1 bg-white rounded-full transition-all duration-300 mx-auto"
              style={{
                width: '80%',
                maxWidth: '300px'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};