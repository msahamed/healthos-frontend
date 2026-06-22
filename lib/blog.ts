import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// One folder per post, each with index.md plus its assets:
//   content/blog/<slug>/index.md
// Visibility is controlled by the `status` field in frontmatter:
//   status: "published"  -> shows on /blog and gets indexed
//   status: "draft"      -> hidden from /blog, noindex (still reachable by direct URL for review)

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface FaqItem {
  q: string;
  a: string;
}
export interface SourceItem {
  title: string;
  url: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  targetKeyword?: string;
  secondaryKeywords?: string[];
  intent?: string;
  icp?: string;
  status: "draft" | "published";
  heroImage?: string;
  ogImage?: string;
  heroImageAlt?: string;
  faq?: FaqItem[];
  sources?: SourceItem[];
}

export interface Post extends PostMeta {
  html: string;
}

/** All posts, newest first (drafts included — filter by status where needed). */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const posts: Post[] = [];

  for (const entry of fs.readdirSync(BLOG_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const mdPath = path.join(BLOG_DIR, entry.name, "index.md");
    if (!fs.existsSync(mdPath)) continue;

    const raw = fs.readFileSync(mdPath, "utf8");
    const { data, content } = matter(raw);
    const html = marked.parse(content, { async: false }) as string;

    posts.push({
      slug: (data.slug as string) || entry.name,
      title: data.title ?? entry.name,
      description: data.description ?? "",
      date: data.date ?? "",
      updated: data.updated,
      targetKeyword: data.targetKeyword,
      secondaryKeywords: data.secondaryKeywords,
      intent: data.intent,
      icp: data.icp,
      status: (data.status as "draft" | "published") || "published",
      heroImage: data.heroImage,
      ogImage: data.ogImage ?? data.heroImage,
      heroImageAlt: data.heroImageAlt,
      faq: data.faq,
      sources: data.sources,
      html,
    });
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Only published posts — for the public index listing. */
export function getPublishedPosts(): Post[] {
  return getAllPosts().filter((p) => p.status === "published");
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}
