import Link from "next/link";
import { blogArticles, readingMinutes } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/structuredData";

export const metadata = pageMetadata(
  "Sharda Study Guides: Library, PYQs & Syllabus",
  "Read practical Sharda library, e-library, PYQ and syllabus guides. Find official access links, choose the right PDFs and build a useful exam revision plan.",
  "/blogs",
);

export default function BlogsPage() {
  const categories = [...new Set(blogArticles.map((article) => article.category))];
  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <JsonLd data={[
      breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Study guides", path: "/blogs" }]),
      { ...collectionSchema({ name: "Sharda study guides", description: "Practical library and exam preparation guides for Sharda University students.", path: "/blogs" }), mainEntity: { "@type": "ItemList", itemListElement: blogArticles.map((article, index) => ({ "@type": "ListItem", position: index + 1, url: absoluteUrl(`/blogs/${article.slug}`), name: article.title })) } },
    ]} />
    <nav aria-label="Breadcrumb" className="mb-7 text-sm text-muted-foreground"><Link href="/" className="underline">Home</Link> / Study guides</nav>
    <header className="max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">The Sharda Social blog</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Sharda library, PYQ &amp; syllabus study guides</h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">Find the right Sharda library service, match a previous year question paper to your course, and turn your syllabus into a revision plan. These guides combine official source links with practical study workflows.</p>
      <p className="mt-4 leading-7 text-muted-foreground">Sharda Social is an independent student project. Official university policies, subscriptions and curriculum decisions remain with Sharda University.</p>
    </header>
    <nav aria-label="Study guide topics" className="my-8 flex flex-wrap gap-3">
      {categories.map((category, index) => <a key={category} href={`#topic-${index}`} className="inline-flex min-h-11 items-center rounded-full border border-border px-4 py-2 text-sm font-bold hover:border-primary">{category}</a>)}
    </nav>
    {categories.map((category, index) => <section id={`topic-${index}`} key={category} className="scroll-mt-24 py-7">
      <h2 className="mb-6 text-2xl font-black">{category}</h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {blogArticles.filter((article) => article.category === category).map((article) => <article key={article.slug} className="flex flex-col rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-bold text-muted-foreground">{readingMinutes(article)} min read</p>
          <h3 className="mt-3 text-xl font-bold leading-7"><Link href={`/blogs/${article.slug}`} className="hover:text-primary">{article.title}</Link></h3>
          <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{article.description}</p>
          <Link href={`/blogs/${article.slug}`} className="mt-4 inline-flex min-h-11 items-center font-bold text-primary underline">Read the guide<span className="sr-only">: {article.title}</span></Link>
        </article>)}
      </div>
    </section>)}
  </div>;
}
