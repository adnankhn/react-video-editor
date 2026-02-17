import { useEffect } from "react";
import { ADD_AUDIO, ADD_IMAGE, ADD_VIDEO } from "@designcombo/state";
import { dispatch } from "@designcombo/events";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Music,
  Image as ImageIcon,
  Video as VideoIcon,
  Loader2,
  UploadIcon,
  Captions as CaptionsIcon
} from "lucide-react";
import { generateId } from "@designcombo/timeline";
import { Button } from "@/components/ui/button";
import useUploadStore from "../store/use-upload-store";
import ModalUpload from "@/components/modal-upload";

export const Uploads = () => {
  const { setShowUploadModal, uploads, pendingUploads, activeUploads, initialize, setUploads } =
    useUploadStore();

  // Clean up invalid uploads on component mount
  useEffect(() => {
    const cleanupInvalidUploads = async () => {
      // Immediate cleanup of obviously invalid uploads
      const validUploads = uploads.filter(upload => {
        // Remove uploads without any URL or file reference
        const hasUrl = upload.metadata?.uploadedUrl || upload.url;
        const hasFile = upload.file;
        const isActive = upload.status === "uploading" || upload.status === "pending";
        
        return hasUrl || hasFile || isActive;
      });
      
      if (validUploads.length !== uploads.length) {
        console.log(`Immediate cleanup: removed ${uploads.length - validUploads.length} invalid uploads`);
        setUploads(validUploads);
      }
      
      // Then run the full async validation
      await initialize();
    };
    
    cleanupInvalidUploads();
  }, []); // Remove initialize from dependencies to prevent infinite loop

  // Group completed uploads by type
  const videos = uploads.filter(
    (upload) => upload.type?.startsWith("video/") || upload.type === "video"
  );
  const images = uploads.filter(
    (upload) => upload.type?.startsWith("image/") || upload.type === "image"
  );
  const audios = uploads.filter(
    (upload) => upload.type?.startsWith("audio/") || upload.type === "audio"
  );
  const subtitles = uploads.filter(
    (upload) => upload.type === "subtitle" || upload.fileName?.toLowerCase().endsWith(".srt")
  );

  const handleAddVideo = (video: any) => {
    const srcVideo = video.metadata?.uploadedUrl || video.url;

    dispatch(ADD_VIDEO, {
      payload: {
        id: generateId(),
        details: {
          src: srcVideo,
          borderWidth: 0,
          borderColor: "transparent",
          borderEffect: "none"
        },
        metadata: {
          previewUrl:
            "https://cdn.designcombo.dev/caption_previews/static_preset1.webp"
        }
      },
      options: {
        resourceId: "main",
        scaleMode: "fit"
      }
    });
  };

  const handleAddImage = (image: any) => {
    const srcImage = image.metadata?.uploadedUrl || image.url;

    dispatch(ADD_IMAGE, {
      payload: {
        id: generateId(),
        type: "image",
        display: {
          from: 0,
          to: 5000
        },
        details: {
          src: srcImage,
          borderRadius: 0,
          borderEffect: "none"
        },
        metadata: {}
      },
      options: {}
    });
  };

  const handleAddAudio = (audio: any) => {
    const srcAudio = audio.metadata?.uploadedUrl || audio.url;
    dispatch(ADD_AUDIO, {
      payload: {
        id: generateId(),
        type: "audio",
        details: {
          src: srcAudio
        },
        metadata: {}
      },
      options: {}
    });
  };

  const handleAddSubtitle = async (subtitle: any) => {
    try {
      console.log("Subtitle file selected:", subtitle.fileName);
      
      // Get the SRT file content
      const srtUrl = subtitle.metadata?.uploadedUrl || subtitle.url;
      if (!srtUrl) {
        console.error('No URL found for subtitle file');
        return;
      }
      
      // Fetch the SRT content
      const response = await fetch(srtUrl);
      const srtContent = await response.text();
      
      // Parse SRT content
      const { parseSRT } = await import('@/utils/srt-parser');
      const subtitles = parseSRT(srtContent);
      
      if (subtitles.length === 0) {
        console.warn('No subtitles found in SRT file');
        return;
      }
      
      // Convert to caption format using phrase-level approach for better readability
      const { srtToCaptionPhrases } = await import('@/utils/srt-parser');
      const captionWords = srtToCaptionPhrases(subtitles, 3);
      
      // Get the total duration from the last subtitle
      const duration = subtitles.length > 0 
        ? subtitles[subtitles.length - 1].endTime 
        : 0;
      
      // Create a single caption item containing all the words
      const { generateId } = await import('@designcombo/timeline');
      const trackId = generateId();
      const captionId = generateId();
      
      // Combine all subtitle texts for the main text field
      const combinedText = subtitles.map(s => s.text).join(' ');
      
      const captionItem = {
        id: captionId,
        type: 'caption',
        name: `${subtitle.fileName} Captions`,
        display: {
          from: subtitles[0].startTime, // Start from first subtitle
          to: duration // End at the last subtitle
        },
        details: {
          text: combinedText, // Combined text of all subtitles
          words: captionWords, // Individual words with timing
          wordsPerLine: 'singleWord',
          linesPerCaption: 2,
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
          sourceUrl: subtitle.fileName,
          isSRTPaired: true
        }
      };
      
      // Create track
      const track = {
        id: trackId,
        items: [captionId],
        type: 'caption',
        name: `${subtitle.fileName} Captions`
      };
      
      // Add to timeline
      const { dispatch } = await import('@designcombo/events');
      const { ADD_ITEMS } = await import('@designcombo/state');
      
      dispatch(ADD_ITEMS, {
        payload: {
          trackItems: [captionItem],
          tracks: [track]
        }
      });
      
      console.log(`Added 1 caption item with ${captionWords.length} words to timeline from ${subtitle.fileName}`);
      
    } catch (error) {
      console.error('Error processing subtitle file:', error);
    }
  };

  const UploadPrompt = () => (
    <div className="flex items-center justify-center px-4">
      <Button
        className="w-full cursor-pointer"
        onClick={() => setShowUploadModal(true)}
      >
        <UploadIcon className="w-4 h-4" />
        <span className="ml-2">Upload</span>
      </Button>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Your uploads
      </div>
      <ModalUpload />
      <UploadPrompt />

      {/* Uploads in Progress Section */}
      {(pendingUploads.length > 0 || activeUploads.length > 0) && (
        <div className="p-4">
          <div className="font-medium text-sm mb-2 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            Uploads in Progress
          </div>
          <div className="flex flex-col gap-2">
            {pendingUploads.map((upload) => (
              <div key={upload.id} className="flex items-center gap-2">
                <span className="truncate text-xs flex-1">
                  {upload.file?.name || upload.url || "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>
            ))}
            {activeUploads.map((upload) => (
              <div key={upload.id} className="flex items-center gap-2">
                <span className="truncate text-xs flex-1">
                  {upload.file?.name || upload.url || "Unknown"}
                </span>
                <div className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  <span className="text-xs">{upload.progress ?? 0}%</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {upload.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-10 p-4">
        {/* Videos Section */}
        {videos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <VideoIcon className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">Videos</span>
            </div>
            <ScrollArea className="max-h-32">
              <div className="grid grid-cols-3 gap-2 max-w-full">
                {videos.map((video, idx) => (
                  <div
                    className="flex items-center gap-2 flex-col w-full"
                    key={video.id || idx}
                  >
                    <Card
                      className="w-16 h-16 flex items-center justify-center overflow-hidden relative cursor-pointer"
                      onClick={() => handleAddVideo(video)}
                    >
                      {video.metadata?.previewUrl ? (
                        <img 
                          src={video.metadata.previewUrl} 
                          alt={video.fileName || "Video thumbnail"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to video icon if thumbnail fails to load
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const fallbackIcon = document.createElement('div');
                              fallbackIcon.className = 'w-8 h-8 text-muted-foreground flex items-center justify-center';
                              fallbackIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>';
                              parent.appendChild(fallbackIcon);
                            }
                          }}
                        />
                      ) : (
                        <VideoIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                    </Card>
                    <div className="text-xs text-muted-foreground truncate w-full text-center" title={video.fileName || video.file?.name || video.url}>
                      {video.fileName || video.file?.name || video.url || "Video"}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Images Section */}
        {images.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">Images</span>
            </div>
            <ScrollArea className="max-h-32">
              <div className="grid grid-cols-3 gap-2 max-w-full">
                {images.map((image, idx) => (
                  <div
                    className="flex items-center gap-2 flex-col w-full"
                    key={image.id || idx}
                  >
                    <Card
                      className="w-16 h-16 flex items-center justify-center overflow-hidden relative cursor-pointer"
                      onClick={() => handleAddImage(image)}
                    >
                      {image.metadata?.uploadedUrl ? (
                        <img 
                          src={image.metadata.uploadedUrl} 
                          alt={image.fileName || "Image"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to image icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const fallbackIcon = document.createElement('div');
                              fallbackIcon.className = 'w-8 h-8 text-muted-foreground flex items-center justify-center';
                              fallbackIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                              parent.appendChild(fallbackIcon);
                            }
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                    </Card>
                    <div className="text-xs text-muted-foreground truncate w-full text-center" title={image.fileName || image.file?.name || image.url}>
                      {image.fileName || image.file?.name || image.url || "Image"}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Audios Section */}
        {audios.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">Audios</span>
            </div>
            <ScrollArea className="max-h-32">
              <div className="grid grid-cols-3 gap-2 max-w-full">
                {audios.map((audio, idx) => (
                  <div
                    className="flex items-center gap-2 flex-col w-full"
                    key={audio.id || idx}
                  >
                    <Card
                      className="w-16 h-16 flex items-center justify-center overflow-hidden relative cursor-pointer"
                      onClick={() => handleAddAudio(audio)}
                    >
                      <Music className="w-8 h-8 text-muted-foreground" />
                    </Card>
                    <div className="text-xs text-muted-foreground truncate w-full text-center" title={audio.fileName || audio.file?.name || audio.url}>
                      {audio.fileName || audio.file?.name || audio.url || "Audio"}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Subtitles Section */}
        {subtitles.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CaptionsIcon className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">Subtitles</span>
            </div>
            <ScrollArea className="max-h-32">
              <div className="grid grid-cols-3 gap-2 max-w-full">
                {subtitles.map((subtitle, idx) => (
                  <div
                    className="flex items-center gap-2 flex-col w-full"
                    key={subtitle.id || idx}
                  >
                    <Card
                      className="w-16 h-16 flex items-center justify-center overflow-hidden relative cursor-pointer"
                      onClick={() => handleAddSubtitle(subtitle)}
                    >
                      <CaptionsIcon className="w-8 h-8 text-muted-foreground" />
                    </Card>
                    <div className="text-xs text-muted-foreground truncate w-full text-center" title={subtitle.fileName || subtitle.file?.name || subtitle.url}>
                      {subtitle.fileName || subtitle.file?.name || subtitle.url || "Subtitle"}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};
