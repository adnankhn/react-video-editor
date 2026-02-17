import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";
import path from "path";

export const maxDuration = 300; // 5 minutes max rendering time
export const runtime = 'nodejs'; // Force Node.js runtime

export async function POST(request: NextRequest) {
  try {
    // Dynamic import to avoid bundling for client
    const { bundle } = await import("@remotion/bundler");
    const { renderMedia } = await import("@remotion/renderer");
    
    const body = await request.json();
    const { design, composition } = body;

    console.log("RAW body received:", JSON.stringify(body).substring(0, 500));
    
    // Log a sample trackItem from the received data
    if (design?.trackItemIds && design.trackItemIds.length > 0) {
      const firstId = design.trackItemIds[0];
      const firstItem = design.trackItemsMap?.[firstId];
      console.log("First trackItem as received by API:");
      console.log("- Has display?", !!firstItem?.display);
      console.log("- Has trim?", !!firstItem?.trim);
      console.log("- Full item:", JSON.stringify(firstItem, null, 2));
    }

    console.log("Render request received:", {
      hasDesign: !!design,
      duration: design?.duration,
      fps: design?.fps,
      size: design?.size,
      trackItemIds: design?.trackItemIds?.length,
      structure: design?.structure?.length,
    });

    if (!design) {
      return NextResponse.json(
        { error: "Design data is required" },
        { status: 400 }
      );
    }

    // Get the base URL from the request
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    console.log("Using base URL:", baseUrl);

    // Log trackItemsMap structure for debugging
    if (design.trackItemsMap) {
      console.log("trackItemsMap keys:", Object.keys(design.trackItemsMap));
      for (const key in design.trackItemsMap) {
        const item = design.trackItemsMap[key];
        console.log(`trackItem ${key}:`, {
          type: item.type,
          hasMetadata: !!item.metadata,
          metadata: item.metadata,
          details: item.details,
          properties: item.properties,
        });
      }
    }

    // Convert relative URLs to absolute file paths for rendering
    if (design.trackItemsMap) {
      for (const key in design.trackItemsMap) {
        const item = design.trackItemsMap[key];
        // Check details.src for video/audio sources
        if (item.details?.src && item.details.src.startsWith('/uploads/')) {
          // Convert /uploads/filename.mp4 to absolute HTTP URL
          // Remotion's headless browser needs an HTTP URL, not file://
          const absoluteUrl = `${baseUrl}${item.details.src}`;
          console.log(`Converting URL for ${key}:`, item.details.src, '->', absoluteUrl);
          item.details.src = absoluteUrl;
        }
        // Also check metadata.uploadedUrl if present
        if (item.metadata?.uploadedUrl && item.metadata.uploadedUrl.startsWith('/uploads/')) {
          const absoluteUrl = `${baseUrl}${item.metadata.uploadedUrl}`;
          console.log(`Converting metadata URL for ${key}:`, item.metadata.uploadedUrl, '->', absoluteUrl);
          item.metadata.uploadedUrl = absoluteUrl;
        }
      }
    }

    // Create renders directory if it doesn't exist
    const rendersDir = join(process.cwd(), "public", "renders");
    await mkdir(rendersDir, { recursive: true });

    // Generate unique filename
    const filename = `render-${nanoid()}.mp4`;
    const outputPath = join(rendersDir, filename);

    // Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.resolve("./src/features/editor/remotion/Root.tsx"),
      webpackOverride: (config) => config,
    });

    // Get composition details
    const compositionId = composition?.id || "MainComposition";
    const fps = composition?.fps || 30;
    const width = composition?.width || design.size?.width || 1080;
    const height = composition?.height || design.size?.height || 1920;
    
    // Calculate duration in frames from milliseconds
    let durationInFrames = composition?.durationInFrames;
    if (!durationInFrames && design.duration) {
      // design.duration is in milliseconds, convert to frames
      durationInFrames = Math.ceil((design.duration / 1000) * fps);
    }
    if (!durationInFrames) {
      durationInFrames = 300; // Default 10 seconds at 30fps
    }

    console.log("About to render with design:", {
      hasDesign: !!design,
      trackItemIds: design?.trackItemIds,
      firstItemSrc: design?.trackItemIds?.[0] ? design.trackItemsMap[design.trackItemIds[0]]?.details?.src : null,
    });

    // Render the video
    await renderMedia({
      composition: {
        id: compositionId,
        fps,
        durationInFrames,
        width,
        height,
      },
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: {
        design: design,
      },
    });

    // Return the local URL
    return NextResponse.json({
      success: true,
      url: `/renders/${filename}`,
      filename,
      status: "completed",
    });
  } catch (error) {
    console.error("Error in local render route:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      {
        error: "Render failed",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { error: "filename parameter is required" },
        { status: 400 }
      );
    }

    // Check if file exists
    const filePath = join(process.cwd(), "public", "renders", filename);
    
    return NextResponse.json({
      success: true,
      url: `/renders/${filename}`,
      status: "completed",
    });
  } catch (error) {
    console.error("Error checking render status:", error);
    return NextResponse.json(
      {
        error: "Status check failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
