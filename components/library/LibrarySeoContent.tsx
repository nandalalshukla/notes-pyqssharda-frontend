import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo/structuredData";

export interface LibrarySeoContentProps {
  heading: string;
  paragraphs: string[];
  links: { href: string; label: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

export function LibrarySeoContent({
  heading,
  paragraphs,
  links,
  faqs,
}: LibrarySeoContentProps) {
  return (
    <section
      aria-labelledby="library-help"
      className="mt-20 border-t border-border pt-12"
    >
      <JsonLd data={faqSchema(faqs)} />
      <div className="mx-auto max-w-4xl">
        <h2 id="library-help" className="text-3xl font-black">
          {heading}
        </h2>
        <div className="mt-5 space-y-4 text-base leading-7 text-muted-foreground">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <nav aria-label="Related study material" className="mt-8">
          <h3 className="text-xl font-black text-foreground">
            Continue preparing with Sharda study material
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <span className="font-black text-foreground">{link.label}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  {link.description}
                </span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="mt-10">
          <h3 className="text-xl font-black text-foreground">
            Frequently asked questions
          </h3>
          <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
            {faqs.map((faq) => (
              <details key={faq.question} className="p-5">
                <summary className="cursor-pointer font-bold text-foreground">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
