import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const uploads = [];
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const ext = file.name.split(".").pop()?.toLowerCase();
      const baseFilename = nanoid();
      const tempFilename = `${baseFilename}-temp.${ext}`;
      const tempFilepath = join(uploadsDir, tempFilename);

      // Write original file temporarily
      await writeFile(tempFilepath, buffer);

      let finalFilename = tempFilename;
      let finalUrl = `/uploads/${tempFilename}`;

      // Convert video formats to browser-compatible MP4
      if (file.type.startsWith("video/") && ext !== "mp4") {
        try {
          const convertedFilename = `${baseFilename}.mp4`;
          const convertedFilepath = join(uploadsDir, convertedFilename);

          // Use ffmpeg to convert to H.264 MP4
          await execAsync(
            `ffmpeg -i "${tempFilepath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "${convertedFilepath}"`
          );

          // Delete temp file and use converted file
          const fs = await import("fs/promises");
          await fs.unlink(tempFilepath);

          finalFilename = convertedFilename;
          finalUrl = `/uploads/${convertedFilename}`;
        } catch (conversionError) {
          console.warn("Video conversion failed, using original:", conversionError);
          // If conversion fails, use original file
        }
      }

      // Return local URL
      uploads.push({
        fileName: file.name,
        filePath: finalFilename,
        contentType: ext !== "mp4" && file.type.startsWith("video/") ? "video/mp4" : file.type,
        url: finalUrl,
        originalName: file.name,
      });
    }

    return NextResponse.json({
      success: true,
      uploads: uploads,
    });
  } catch (error) {
    console.error("Error in local upload route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
