/**
 * SRT Parser Utility
 * Parses .srt subtitle files into usable caption data structures
 */

export interface SRTSubtitle {
  id: number;
  startTime: number; // in milliseconds
  endTime: number;   // in milliseconds
  text: string;
}

/**
 * Converts SRT time format (HH:MM:SS,mmm) to milliseconds
 */
function srtTimeToMilliseconds(timeString: string): number {
  const [timePart, millisecondsPart] = timeString.split(',');
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  const milliseconds = parseInt(millisecondsPart, 10);
  
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
}

/**
 * Parses an SRT file content into subtitle objects
 */
export function parseSRT(content: string): SRTSubtitle[] {
  const subtitles: SRTSubtitle[] = [];
  const lines = content.trim().split('\n');
  
  let i = 0;
  while (i < lines.length) {
    // Skip empty lines
    if (lines[i].trim() === '') {
      i++;
      continue;
    }
    
    // Parse subtitle ID
    const id = parseInt(lines[i].trim(), 10);
    i++;
    
    if (i >= lines.length) break;
    
    // Parse time range
    const timeLine = lines[i].trim();
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    
    if (!timeMatch) {
      i++;
      continue;
    }
    
    const startTime = srtTimeToMilliseconds(timeMatch[1]);
    const endTime = srtTimeToMilliseconds(timeMatch[2]);
    i++;
    
    // Parse text content (can span multiple lines)
    let text = '';
    while (i < lines.length && lines[i].trim() !== '') {
      if (text !== '') text += ' ';
      text += lines[i].trim();
      i++;
    }
    
    if (text) {
      subtitles.push({
        id,
        startTime,
        endTime,
        text
      });
    }
  }
  
  return subtitles;
}

/**
 * Converts SRT subtitles to the caption format used by the editor
 */
/**
 * Groups SRT subtitles into caption lines based on timing gaps
 */
export function groupSRTIntoCaptionLines(
  subtitles: SRTSubtitle[], 
  maxGapMs: number = 1000
): SRTSubtitle[][] {
  if (subtitles.length === 0) return [];
  
  const lines: SRTSubtitle[][] = [];
  let currentLine: SRTSubtitle[] = [subtitles[0]];
  
  for (let i = 1; i < subtitles.length; i++) {
    const currentSubtitle = subtitles[i];
    const previousSubtitle = subtitles[i - 1];
    const gap = currentSubtitle.startTime - previousSubtitle.endTime;
    
    if (gap > maxGapMs) {
      // Start new line
      lines.push(currentLine);
      currentLine = [currentSubtitle];
    } else {
      // Continue current line
      currentLine.push(currentSubtitle);
    }
  }
  
  // Don't forget the last line
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  
  return lines;
}

export interface CaptionWord {
  word: string;
  start: number;  // milliseconds
  end: number;    // milliseconds
  confidence?: number;
  is_keyword?: boolean;
}

/**
 * Converts SRT subtitles to word-level caption format
 * Splits subtitle text into words and distributes timing
 */
export function srtToCaptionWords(subtitles: SRTSubtitle[]): CaptionWord[] {
  const words: CaptionWord[] = [];
  
  subtitles.forEach((subtitle) => {
    const text = subtitle.text.trim();
    const wordList = text.split(/\s+/).filter(w => w.length > 0);
    
    if (wordList.length === 0) return;
    
    const totalDuration = subtitle.endTime - subtitle.startTime;
    
    // Distribute time evenly but ensure no gaps
    wordList.forEach((rawWord, index) => {
      const cleanWord = rawWord.replace(/[.,!?;:]$/, '');
      const wordStart = subtitle.startTime + (index * (totalDuration / wordList.length));
      const wordEnd = subtitle.startTime + ((index + 1) * (totalDuration / wordList.length));
      
      words.push({
        word: cleanWord,
        start: Math.round(wordStart),
        end: Math.round(wordEnd),
        confidence: 1.0,
        is_keyword: false // Could be enhanced to detect keywords
      });
    });
  });
  
  return words;
}

/**
 * Alternative: Keep multi-word grouping for better readability
 * Groups words into phrases based on natural pauses
 */
export function srtToCaptionPhrases(subtitles: SRTSubtitle[], wordsPerPhrase: number = 3): CaptionWord[] {
  const words: CaptionWord[] = [];
  
  subtitles.forEach((subtitle) => {
    const text = subtitle.text.trim();
    const wordList = text.split(/\s+/).filter(w => w.length > 0);
    
    if (wordList.length === 0) return;
    
    const totalDuration = subtitle.endTime - subtitle.startTime;
    const durationPerWord = totalDuration / wordList.length;
    
    // Group words into phrases
    for (let i = 0; i < wordList.length; i += wordsPerPhrase) {
      const phraseWords = wordList.slice(i, i + wordsPerPhrase);
      const phrase = phraseWords.join(' ');
      
      // Calculate timing for the phrase
      const phraseStartIndex = i;
      const phraseEndIndex = Math.min(i + wordsPerPhrase, wordList.length) - 1;
      const phraseStart = subtitle.startTime + (phraseStartIndex * durationPerWord);
      const phraseEnd = subtitle.startTime + ((phraseEndIndex + 1) * durationPerWord);
      
      words.push({
        word: phrase,
        start: phraseStart,
        end: phraseEnd,
        confidence: 1.0,
        is_keyword: false
      });
    }
  });
  
  return words;
}