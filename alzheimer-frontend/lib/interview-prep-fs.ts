import "server-only";

import fs from "fs/promises";
import path from "path";

export function filenameToSlug(filename: string): string {
  return filename
    .replace(/^\d+_/, "")
    .replace(/\.md$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

export function contentRootFromDir(contentDir: string): string {
  return path.join(process.cwd(), "public", contentDir);
}

export async function slugToFilename(
  contentDir: string,
  slug: string,
): Promise<string | null> {
  try {
    const root = contentRootFromDir(contentDir);
    const files = await fs.readdir(root);
    const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    for (const file of files) {
      if (!file.toLowerCase().endsWith(".md")) continue;
      const fileSlug = filenameToSlug(file);
      if (fileSlug === normalizedSlug) {
        return file;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function readMarkdownBySlug(
  contentDir: string,
  slug: string,
): Promise<{ content: string; filename: string } | null> {
  try {
    const filename = await slugToFilename(contentDir, slug);
    if (!filename) return null;
    const filePath = path.join(contentRootFromDir(contentDir), filename);
    const content = await fs.readFile(filePath, "utf8");
    return { content, filename };
  } catch {
    return null;
  }
}

export type ChapterItem = { slug: string; title: string; order: number };

export async function getFlatChapters(contentDir: string): Promise<ChapterItem[]> {
  try {
    const root = contentRootFromDir(contentDir);
    const files = await fs.readdir(root);
    const mdFiles = files.filter((f) => f.toLowerCase().endsWith(".md"));
    const items: ChapterItem[] = [];

    for (const file of mdFiles) {
      try {
        const filePath = path.join(root, file);
        const fileContent = await fs.readFile(filePath, "utf8");
        const h1 = fileContent.match(/^#\s+(.+)$/m);
        const title =
          h1?.[1]?.trim() ||
          file.replace(/^\d+_/, "").replace(/\.md$/, "").replace(/_/g, " ");
        const orderMatch = file.match(/^(\d+)/);
        const order = orderMatch ? parseInt(orderMatch[1], 10) : 999;
        const fileSlug = filenameToSlug(file);
        items.push({ slug: fileSlug, title, order });
      } catch {
        continue;
      }
    }

    items.sort((a, b) => a.order - b.order);
    return items;
  } catch {
    return [];
  }
}
