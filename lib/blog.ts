import articles from "@/content/blogs/articles.json";

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  links?: { href: string; label: string }[];
};
export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  target: string;
  targetLabel: string;
  published: string;
  updated: string;
  intro: string;
  sections: BlogSection[];
  sources: { title: string; url: string; note: string }[];
  related: string[];
};

export const blogArticles: BlogArticle[] = articles;
export const getArticle = (slug: string) => blogArticles.find((article) => article.slug === slug);
export const articleWordCount = (article: BlogArticle) =>
  [article.intro, ...article.sections.flatMap((section) => [...section.paragraphs, ...(section.bullets ?? [])])].join(" ").trim().split(/\s+/).length;
export const readingMinutes = (article: BlogArticle) => Math.max(1, Math.ceil(articleWordCount(article) / 200));
