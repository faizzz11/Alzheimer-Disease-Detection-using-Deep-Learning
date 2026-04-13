import * as cheerio from "cheerio";
import axios from "axios";
import { getCached, setCached } from "@/lib/utils/cache";

export interface ArticleResult {
  title: string;
  link: string;
  summary: string;
  image?: string;
}

export async function fetchArticleMeta(url: string): Promise<ArticleResult | null> {
  const cacheKey = `article:${url}`;
  const cached = getCached<ArticleResult>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 1500,
      maxRedirects: 3,
      validateStatus: (status) => status < 400,
    });

    const $ = cheerio.load(response.data);
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text() ||
      $("h1").first().text() ||
      "Untitled";
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      $("p").first().text().substring(0, 150) ||
      "Learn more about this article";
    const image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $("img").first().attr("src");

    const result: ArticleResult = {
      title: title.trim(),
      link: url,
      summary: description.trim().substring(0, 200),
      image: image
        ? image.startsWith("http")
          ? image
          : new URL(image, url).href
        : undefined,
    };
    setCached(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}
