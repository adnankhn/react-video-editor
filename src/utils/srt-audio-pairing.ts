/**
 * SRT-Audio Pairing Utility
 * Handles automatic pairing of SRT files with corresponding audio files
 */

import { SRTSubtitle, parseSRT } from './srt-parser';

export interface PairedMedia {
  audioFile: File;
  srtFile: File;
  srtSubtitles: SRTSubtitle[];
}

export interface UnpairedMedia {
  audioFile?: File;
  srtFile?: File;
}

/**
 * Extracts base name from filename (without extension)
 */
function getBaseName(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

/**
 * Pairs audio files with SRT files based on matching base names
 */
export function pairAudioWithSRT(files: File[]): {
  paired: PairedMedia[];
  unpaired: UnpairedMedia[];
} {
  const audioFiles: File[] = [];
  const srtFiles: File[] = [];
  
  // Separate audio and SRT files
  files.forEach(file => {
    if (file.type.startsWith('audio/') || file.name.toLowerCase().endsWith('.wav')) {
      audioFiles.push(file);
    } else if (file.name.toLowerCase().endsWith('.srt')) {
      srtFiles.push(file);
    }
  });
  
  const paired: PairedMedia[] = [];
  const unpairedAudio: File[] = [...audioFiles];
  const unpairedSrt: File[] = [...srtFiles];
  
  // Try to pair files with matching base names
  for (let i = audioFiles.length - 1; i >= 0; i--) {
    const audioFile = audioFiles[i];
    const audioBaseName = getBaseName(audioFile.name);
    
    const matchingSrtIndex = srtFiles.findIndex(srtFile => 
      getBaseName(srtFile.name) === audioBaseName
    );
    
    if (matchingSrtIndex !== -1) {
      const srtFile = srtFiles[matchingSrtIndex];
      
      // Parse SRT content
      const reader = new FileReader();
      reader.readAsText(srtFile);
      
      // Remove from unpaired arrays
      unpairedAudio.splice(unpairedAudio.indexOf(audioFile), 1);
      unpairedSrt.splice(matchingSrtIndex, 1);
      
      // Add to paired (will be populated with parsed subtitles asynchronously)
      paired.push({
        audioFile,
        srtFile,
        srtSubtitles: [] // Will be filled after parsing
      });
    }
  }
  
  const unpaired: UnpairedMedia[] = [
    ...unpairedAudio.map(audioFile => ({ audioFile })),
    ...unpairedSrt.map(srtFile => ({ srtFile }))
  ];
  
  return { paired, unpaired };
}

/**
 * Parses all SRT files and updates the paired media objects with subtitle data
 */
export async function parsePairedSRT(pairedMedia: PairedMedia[]): Promise<PairedMedia[]> {
  const parsedPaired = [...pairedMedia];
  
  for (let i = 0; i < parsedPaired.length; i++) {
    const reader = new FileReader();
    const srtContent = await new Promise<string>((resolve, reject) => {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(parsedPaired[i].srtFile);
    });
    
    parsedPaired[i].srtSubtitles = parseSRT(srtContent);
  }
  
  return parsedPaired;
}

/**
 * Creates a unique identifier for paired media based on filenames
 */
export function getPairId(audioFileName: string, srtFileName: string): string {
  return `pair_${getBaseName(audioFileName)}_${getBaseName(srtFileName)}`;
}