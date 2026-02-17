/**
 * SRT Caption Integration Hook
 * Manages the integration of SRT captions with the editor's timeline system
 */

import { useState, useEffect, useCallback } from 'react';
import { generateId } from '@designcombo/timeline';
import { dispatch } from '@designcombo/events';
import { ADD_ITEMS } from '@designcombo/state';
import { PairedMedia } from '@/utils/srt-audio-pairing';
import { srtToCaptionWords } from '@/utils/srt-parser';
import useStore from '../store/use-store';

interface SRTCationIntegration {
  pairedMedia: PairedMedia[];
  addSRTCaptionsToTimeline: (pairedMedia: PairedMedia[]) => Promise<void>;
  isProcessing: boolean;
}

export const useSRTCaptionIntegration = (): SRTCationIntegration => {
  const [pairedMedia, setPairedMedia] = useState<PairedMedia[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { trackItemsMap } = useStore();

  /**
   * Adds SRT captions to the timeline as caption track items
   */
  const addSRTCaptionsToTimeline = useCallback(async (mediaPairs: PairedMedia[]) => {
    setIsProcessing(true);
    
    try {
      for (const pair of mediaPairs) {
        // Create a unique track for this SRT caption
        const trackId = generateId();
        const captionTrackItemId = generateId();
        
        // Convert SRT subtitles to phrase-level caption format for better readability
        // Use srtToCaptionPhrases with 3-4 words per phrase for better readability
        const { srtToCaptionPhrases } = await import('@/utils/srt-parser');
        const captionWords = srtToCaptionPhrases(pair.srtSubtitles, 3);
        
        // Get the duration from the last subtitle
        const duration = pair.srtSubtitles.length > 0 
          ? pair.srtSubtitles[pair.srtSubtitles.length - 1].endTime 
          : 0;
        
        // Create ONE caption item with all words (like a regular caption)
        const captionItem = {
          id: captionTrackItemId,
          type: 'caption',
          name: `${pair.audioFile.name} Captions`,
          display: {
            from: 0, // Start at beginning of timeline
            to: duration
          },
          details: {
            // CRITICAL: Word-level array for highlighting
            words: captionWords,
            
            // Combine all subtitle texts for the main text field
            text: pair.srtSubtitles.map(s => s.text).join(' '),
            
            // Styling - matches your existing caption system
            fontFamily: 'theboldfont',
            fontUrl: 'https://cdn.designcombo.dev/fonts/the-bold-font.ttf',
            fontSize: 32,
            color: '#ffffff',
            textColor: '#ffffff',
            backgroundColor: '#000000',
            backgroundOpacity: 80, // 0-100 scale for calculateUpdatedDetails
            padding: 8,
            width: 800,
            height: 120,
            top: 814, // Position from your existing system
            left: 560, // Center in 1920px width: (1920-800)/2
            showObject: 'word', // 'word' enables word-by-word highlighting
            linesPerCaption: 2, // Allow 2 lines per caption display
            wordsPerLine: 'singleWord', // Enable word-level highlighting
            
            // Animation settings
            animation: 'none',
            textAlign: 'center',
            fontWeight: 'normal',
            opacity: 100,
            
            // Word state colors
            appearedColor: '#9ca3af', // Gray for spoken words
            activeColor: '#ffffff',   // White for current word
            activeFillColor: 'rgba(255, 255, 255, 0.2)', // Highlight background
            isKeywordColor: 'transparent',
            preservedColorKeyWord: false,
            
            // Border and shadow
            borderWidth: 0,
            borderColor: '#000000',
            boxShadow: {
              color: '#000000',
              x: 0,
              y: 0,
              blur: 0
            },
            // Mark as SRT-paired for proper styling
            isSRTPaired: true
          },
          metadata: {
            sourceUrl: pair.audioFile.name,
            srtSource: pair.srtFile.name,
            isSRTPaired: true
          }
        };
        
        // Create track for the caption
        const track = {
          id: trackId,
          items: [captionTrackItemId],
          type: 'caption',
          name: `${pair.audioFile.name} Captions`
        };

        // Add the caption item and the track using ADD_ITEMS
        dispatch(ADD_ITEMS, {
          payload: {
            trackItems: [captionItem],
            tracks: [track]
          }
        });
      }
      
      // Update paired media state
      setPairedMedia(prev => [...prev, ...mediaPairs]);
      
    } catch (error) {
      console.error('Error adding SRT captions to timeline:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Process uploaded files and automatically add SRT captions for paired media
   */
  const processUploadedFiles = useCallback((files: File[]) => {
    // This would be called from the upload modal after files are processed
    // For now, we'll expose the addSRTCaptionsToTimeline function
  }, []);

  return {
    pairedMedia,
    addSRTCaptionsToTimeline,
    isProcessing
  };
};