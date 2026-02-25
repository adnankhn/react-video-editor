import React, { use, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import { FileIcon, UploadIcon, X, CaptionsIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import useUploadStore from "@/features/editor/store/use-upload-store";
import axios from "axios";
import { Input } from "./ui/input";
import { pairAudioWithSRT, parsePairedSRT, PairedMedia } from "@/utils/srt-audio-pairing";
import { useSRTCaptionIntegration } from "@/features/editor/hooks/use-srt-integration";
type ModalUploadProps = {
  type?: string;
};

export const extractVideoThumbnail = (file: File) => {
  return new Promise<string>((resolve) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.currentTime = 1;
    video.muted = true;
    video.playsInline = true;
    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    video.onerror = () => resolve("");
  });
};
// Helper function to format file sizes
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const ModalUpload: React.FC<ModalUploadProps> = ({ type = "all" }) => {
  const {
    setShowUploadModal,
    showUploadModal,
    setFiles,
    files,
    addPendingUploads,
    processUploads
  } = useUploadStore();
  const [videoThumbnails, setVideoThumbnails] = useState<{
    [name: string]: string;
  }>({});
  const [videoUrl, setVideoUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pairedMedia, setPairedMedia] = useState<PairedMedia[]>([]);
  const [processingPairs, setProcessingPairs] = useState(false);
  const { addSRTCaptionsToTimeline, isProcessing: isAddingCaptions } = useSRTCaptionIntegration();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const selectedFiles = Array.from(e.target.files);

    const newFiles = selectedFiles
      .filter((f) => !files.some((fileObj) => fileObj.file?.name === f.name))
      .map((f) => ({ id: crypto.randomUUID(), file: f }));

    if (newFiles.length === 0) return;

    setFiles((prev) => [...newFiles, ...prev]);

    // Process SRT pairing
    setProcessingPairs(true);
    const { paired } = pairAudioWithSRT(selectedFiles);
    if (paired.length > 0) {
      const parsedPaired = await parsePairedSRT(paired);
      setPairedMedia(prev => [...prev, ...parsedPaired]);
    }
    setProcessingPairs(false);

    const videoThumbnailsData = await Promise.all(
      newFiles
        .filter((f) => f.file?.type.startsWith("video/"))
        .map(async (f) => ({
          name: f.file?.name ?? "",
          thumb: f.file ? await extractVideoThumbnail(f.file) : ""
        }))
    );
    setVideoThumbnails((prev) => ({
      ...prev,
      ...Object.fromEntries(videoThumbnailsData.map((v) => [v.name, v.thumb]))
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
        .filter((f) => !files.some((fileObj) => fileObj.file?.name === f.name))
        .map((f) => ({ id: crypto.randomUUID(), file: f }));
      if (newFiles.length === 0) return;

      setFiles((prev) => [...newFiles, ...prev]);
      
      // Process SRT pairing
      setProcessingPairs(true);
      const { paired } = pairAudioWithSRT(Array.from(e.dataTransfer.files));
      if (paired.length > 0) {
        const parsedPaired = await parsePairedSRT(paired);
        setPairedMedia(prev => [...prev, ...parsedPaired]);
      }
      setProcessingPairs(false);

      const videoThumbnailsData = await Promise.all(
        newFiles
          .filter((f) => f.file?.type.startsWith("video/"))
          .map(async (f) => ({
            name: f.file?.name ?? "",
            thumb: f.file ? await extractVideoThumbnail(f.file) : ""
          }))
      );
      setVideoThumbnails((prev) => ({
        ...prev,
        ...Object.fromEntries(videoThumbnailsData.map((v) => [v.name, v.thumb]))
      }));
    }
  };

  const handleRemoveFile = (id: string, file: File) => {
    setFiles(files.filter((f) => f.id !== id));
    
    // Remove from paired media if it's part of a pair
    setPairedMedia(prev => prev.filter(pair => 
      pair.audioFile.name !== file.name && pair.srtFile.name !== file.name
    ));
  };
  function getTypeFromContentType(contentType: string): string {
    if (contentType.startsWith("video/")) return "video";
    if (contentType.startsWith("image/")) return "image";
    if (contentType.startsWith("audio/")) return "audio";
    if (contentType === "application/x-subrip" || contentType === "text/plain" || contentType.endsWith(".srt")) return "subtitle";
    if (contentType === "application/pdf") return "document";
    return "other";
  }

  async function createUpload(uploadData: {
    fileName: string;
    filePath: string;
    fileSize: number;
    contentType: string;
    metadata?: any;
    folder?: string;
    type: string;
    method: string;
    origin: string;
    status: string;
    isPreview?: boolean;
  }) {
    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(uploadData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to create upload");
    }

    return result.upload;
  }
  const handleUpload = async () => {
    console.log('Starting upload process with files:', files);
    
    // Prepare UploadFile objects for files
    const fileUploads = files
      .filter((f) => {
        const isValid = f.file?.type || f.file?.name?.toLowerCase().endsWith('.srt');
        console.log(`File ${f.file?.name}: type=${f.file?.type}, isSRT=${f.file?.name?.toLowerCase().endsWith('.srt')}, isValid=${isValid}`);
        return isValid;
      })
      .map((f) => ({
        id: f.id,
        file: f.file,
        type: f.file?.type || (f.file?.name?.toLowerCase().endsWith('.srt') ? 'text/plain' : ''),
        status: "pending" as const,
        progress: 0
      }));
    
    console.log('Filtered file uploads:', fileUploads);

    // Prepare UploadFile object for URL if present
    const urlUploads = videoUrl.trim()
      ? [
          {
            id: crypto.randomUUID(),
            url: videoUrl.trim(),
            type: "url",
            status: "pending" as const,
            progress: 0
          }
        ]
      : [];

    console.log('Adding to pending uploads:', [...fileUploads, ...urlUploads]);
    // Add to pending uploads
    addPendingUploads([...fileUploads, ...urlUploads]);

    // Automatically add SRT captions for paired media
    if (pairedMedia.length > 0) {
      console.log('Adding SRT captions to timeline:', pairedMedia);
      await addSRTCaptionsToTimeline(pairedMedia);
    }

    setTimeout(() => {
      console.log('Calling processUploads');
      processUploads();
      // Clear modal state and close
      setFiles([]);
      setPairedMedia([]);
      setShowUploadModal(false);
      setVideoUrl("");
    }, 0);
  };
  const getAcceptType = () => {
    switch (type) {
      case "audio":
        return "audio/*";
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      default:
        return "audio/*,image/*,video/*,.srt";
    }
  };
  useEffect(() => {
    setFiles([]);
    setPairedMedia([]);
  }, [showUploadModal]);

  return (
    <div>
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-md">Upload media</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 flex-1 overflow-y-auto pr-1">
            <label className="flex flex-col gap-2">
              <input
                type="file"
                accept={getAcceptType()}
                onChange={handleFileChange}
                multiple
                ref={fileInputRef}
                style={{ display: "none" }}
              />

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver
                    ? "border-primary bg-primary/10"
                    : "border border-border hover:border-muted-foreground/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop files here, or
                </p>
                <Button onClick={triggerFileInput} variant="outline" size="sm">
                  browse files
                </Button>
              </div>
            </label>

            {files.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Selected files:
                  </span>
                  {(processingPairs || isAddingCaptions) && (
                    <span className="text-xs text-blue-500 flex items-center gap-1">
                      <div className="w-2 h-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      {processingPairs ? 'Processing SRT pairs...' : 'Adding captions to timeline...'}
                    </span>
                  )}
                </div>
                <ScrollArea className="max-h-48">
                  <AnimatePresence initial={false}>
                    <div className="flex flex-col gap-2">
                      {files.map((file) => (
                        <motion.div
                          key={file.id}
                          className="relative flex flex-col items-center p-1.5 sm:p-2 border rounded shadow-sm w-full"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                          }}
                          layout
                        >
                          <div className="w-full flex justify-between items-center">
                            <div className="flex flex-1 gap-1 sm:gap-1.5 md:gap-2  items-center">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center relative">
                                {/* SRT Pairing Indicator */}
                                {file.file && pairedMedia.some(pair => pair.audioFile.name === file.file?.name) && (
                                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                    <CaptionsIcon className="h-2 w-2 text-white" />
                                  </div>
                                )}
                                
                                {file.file?.type.startsWith("image/") ? (
                                  <img
                                    src={URL.createObjectURL(file.file)}
                                    alt={file.file.name}
                                    className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 object-cover rounded border"
                                  />
                                ) : file.file?.type.startsWith("video/") &&
                                  videoThumbnails[file.file.name] ? (
                                  <img
                                    src={videoThumbnails[file.file.name]}
                                    alt={`${file.file.name} thumbnail`}
                                    className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 object-cover rounded border"
                                  />
                                ) : file.file?.name.toLowerCase().endsWith('.srt') ? (
                                  <div className="h-5 w-5 sm:h-6 md:h-8 md:w-8 flex items-center justify-center rounded border bg-blue-100 dark:bg-blue-900/30">
                                    <CaptionsIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                ) : (
                                  <div className="h-5 w-5 sm:h-6 md:h-8 md:w-8 flex items-center justify-center rounded border bg-muted">
                                    <FileIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-foreground" />
                                  </div>
                                )}
                              </div>

                              <div>
                                <div
                                  className="w-full truncate text-xs text-muted-foreground max-w-80"
                                  title={file.file?.name ?? ""}
                                >
                                  {file.file?.name ?? ""}
                                </div>
                                <div
                                  className={clsx(
                                    "text-[9px] sm:text-[10px] text-gray-400"
                                  )}
                                >
                                  {file.file
                                    ? formatFileSize(file.file.size)
                                    : ""}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant={"outline"}
                              onClick={() =>
                                file.file &&
                                handleRemoveFile(file.id, file.file)
                              }
                              size={"icon"}
                              className="cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                </ScrollArea>
              </div>
            )}

            <Input
              type="text"
              placeholder="Paste media link https://..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={(files.length === 0 && !videoUrl) || isUploading || processingPairs || isAddingCaptions}
            >
              {processingPairs || isAddingCaptions ? 'Processing...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModalUpload;
