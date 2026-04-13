import * as cheerio from "cheerio";
import axios from "axios";
import { getCached, setCached } from "@/lib/utils/cache";

export interface YouTubeVideo {
  title: string;
  link: string;
  summary: string;
}

export async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  const cacheKey = `youtube:${query}`;
  const cached = getCached<YouTubeVideo[]>(cacheKey);
  if (cached) return cached;

  const videos: YouTubeVideo[] = [];

  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 6000,
      maxRedirects: 3,
    });

    const $ = cheerio.load(response.data);
    const scriptTags = $("script").toArray();
    let ytInitialData: Record<string, unknown> | null = null;

    for (const script of scriptTags) {
      const content = $(script).html();
      if (content?.includes("var ytInitialData")) {
        const match = content.match(/var ytInitialData = ({[\s\S]*?});/);
        if (match) {
          try {
            ytInitialData = JSON.parse(match[1]) as Record<string, unknown>;
            break;
          } catch {
            break;
          }
        }
      }
    }

    const contents = (
      ytInitialData as {
        contents?: {
          twoColumnSearchResultsRenderer?: {
            primaryContents?: {
              sectionListRenderer?: { contents?: unknown[] };
            };
          };
        };
      }
    )?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;

    if (Array.isArray(contents)) {
      for (const section of contents) {
        const itemSection = section as {
          itemSectionRenderer?: { contents?: unknown[] };
        };
        if (!itemSection.itemSectionRenderer?.contents) continue;
        for (const item of itemSection.itemSectionRenderer.contents) {
          const videoRenderer = (item as { videoRenderer?: Record<string, unknown> }).videoRenderer;
          if (videoRenderer?.videoId) {
            const videoId = videoRenderer.videoId as string;
            const titleRuns = (videoRenderer.title as { runs?: { text?: string }[] })?.runs;
            const title = titleRuns?.[0]?.text || "";
            const descRuns = (videoRenderer.descriptionSnippet as { runs?: { text?: string }[] })
              ?.runs;
            const description = descRuns?.[0]?.text || "";
            const channelRuns = (videoRenderer.ownerText as { runs?: { text?: string }[] })?.runs;
            const channelName = channelRuns?.[0]?.text || "";
            if (title && videoId) {
              videos.push({
                title,
                link: `https://www.youtube.com/watch?v=${videoId}`,
                summary: description || `Learn from ${channelName} — ${title}`,
              });
              if (videos.length >= 5) break;
            }
          }
        }
        if (videos.length >= 5) break;
      }
    }
  } catch (e) {
    console.error("YouTube search error:", e);
  }

  if (videos.length > 0) {
    setCached(cacheKey, videos);
  }
  return videos;
}
