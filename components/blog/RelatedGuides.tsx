import Link from "next/link";
import { blogArticles } from "@/lib/blog";

export function RelatedGuides({ target }: { target: string }) {
  const articles = blogArticles.filter((article) => article.target === target).slice(0, 3);
  return <section aria-label="Related study guides" className="mt-12 border-t border-border pt-8">
    <h2 className="text-2xl font-black">Guides to help you use these resources</h2>
    <div className="mt-5 grid gap-4 sm:grid-cols-3">
      {articles.map((article) => <Link key={article.slug} href={`/blogs/${article.slug}`} className="rounded-xl border border-border bg-card p-5 hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
        <span className="font-bold">{article.title}</span>
        <span className="mt-2 block text-sm leading-6 text-muted-foreground">{article.description}</span>
      </Link>)}
    </div>
    <Link href="/blogs" className="mt-5 inline-flex min-h-11 items-center font-bold text-primary underline">Read all study guides</Link>
  </section>;
}
