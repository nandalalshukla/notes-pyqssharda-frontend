import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogArticles, getArticle, readingMinutes, articleWordCount } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/structuredData";

type Props = { params: Promise<{ slug: string }> };
// Unknown articles must be an HTTP 404 before the shared layout can stream.
export const dynamicParams = false;
export function generateStaticParams() { return blogArticles.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const meta = pageMetadata(article.title, article.description, `/blogs/${article.slug}`);
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: article.published, modifiedTime: article.updated, authors: [absoluteUrl("/about-us")] } };
}

const displayDate = (date: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" }).format(new Date(date));

export default async function BlogArticlePage({ params }: Props) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const path = `/blogs/${article.slug}`;
  const related = article.related.map(getArticle).filter((item) => item !== undefined);
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <JsonLd data={[
      breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Study guides", path: "/blogs" }, { name: article.title, path }]),
      { "@context": "https://schema.org", "@type": "BlogPosting", "@id": `${absoluteUrl(path)}#article`, headline: article.title, description: article.description, datePublished: article.published, dateModified: article.updated, author: { "@type": "Organization", "@id": `${absoluteUrl("/")}#organisation`, name: "Sharda Social", url: absoluteUrl("/about-us") }, publisher: { "@id": `${absoluteUrl("/")}#organisation` }, mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) }, image: absoluteUrl("/opengraph-image"), inLanguage: "en-IN", articleSection: article.category, wordCount: articleWordCount(article), citation: article.sources.map((source) => source.url), isAccessibleForFree: true },
    ]} />
    <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap gap-2 text-sm text-muted-foreground"><Link href="/" className="underline">Home</Link><span>/</span><Link href="/blogs" className="underline">Study guides</Link><span>/</span><span>{article.category}</span></nav>
    <article>
      <header className="max-w-4xl">
        <p className="font-bold text-primary">{article.category}</p>
        <h1 className="mt-3 text-3xl leading-tight font-black tracking-tight sm:text-5xl">{article.title}</h1>
        <p className="mt-5 text-sm leading-7 text-muted-foreground">By <Link href="/about-us" rel="author" className="font-bold underline">Sharda Social</Link> · Published <time dateTime={article.published}>{displayDate(article.published)}</time> · {readingMinutes(article)} min read</p>
        <p className="mt-6 text-lg leading-8">{article.intro}</p>
        <Link href={article.target} className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">{article.targetLabel}</Link>
      </header>
      <aside className="my-9 rounded-xl border border-border bg-card p-5 text-sm leading-7 text-muted-foreground">Independent student guidance. University facts are linked in the sources below, checked on {displayDate(article.updated)}. Study schedules and examples are editorial suggestions; confirm current course requirements with your department.</aside>
      <nav aria-label="On this page" className="mb-10 rounded-xl border border-border p-5">
        <h2 className="text-lg font-bold">On this page</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7">{article.sections.map((section, index) => <li key={section.heading}><a href={`#section-${index + 1}`} className="text-primary underline">{section.heading}</a></li>)}<li><a href="#sources" className="text-primary underline">Sources and further reading</a></li></ol>
      </nav>
      <div className="max-w-3xl">
        {article.sections.map((section, index) => <section key={section.heading} id={`section-${index + 1}`} className="mb-10 scroll-mt-24">
          <h2 className="mb-5 text-2xl font-black leading-8">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph} className="mb-5 text-base leading-8 text-muted-foreground">{paragraph}</p>)}
          {section.bullets && <ul className="my-5 list-disc space-y-3 pl-6 leading-8 text-muted-foreground">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
          {section.links && <ul className="my-5 space-y-2">{section.links.map((link) => <li key={link.href}><Link href={link.href} className="inline-flex min-h-11 items-center font-bold text-primary underline">{link.label}</Link></li>)}</ul>}
        </section>)}
        <section id="sources" className="scroll-mt-24 border-t border-border pt-8">
          <h2 className="text-2xl font-black">Sources and further reading</h2>
          <ul className="mt-5 space-y-5">{article.sources.map((source) => <li key={source.url}><a href={source.url} className="font-bold text-primary underline break-words">{source.title}</a><p className="mt-1 text-sm leading-7 text-muted-foreground">{source.note}</p></li>)}</ul>
        </section>
        <section className="my-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-black">Put this guide into practice</h2>
          <p className="mt-3 leading-7 text-muted-foreground">Browse and search Sharda Social&apos;s library freely. Sign in with your Sharda account when you open an individual paper, note or syllabus document. Resource availability varies by course.</p>
          <Link href={article.target} className="mt-4 inline-flex min-h-11 items-center font-bold text-primary underline">{article.targetLabel}</Link>
        </section>
      </div>
    </article>
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-2xl font-black">Continue reading</h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-3">{related.map((item) => <li key={item.slug}><Link href={`/blogs/${item.slug}`} className="block h-full rounded-xl border border-border p-5 font-bold leading-7 hover:border-primary">{item.title}</Link></li>)}</ul>
      <Link href="/blogs" className="mt-5 inline-flex min-h-11 items-center font-bold text-primary underline">All Sharda study guides</Link>
    </section>
  </div>;
}
