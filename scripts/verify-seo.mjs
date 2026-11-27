import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { get as httpGet } from "node:http";

const base = (process.argv[2] || "http://localhost:3100").replace(/\/$/, "");
const canonicalOrigin = "https://www.sharda.social";
const articles = JSON.parse(await readFile(new URL("../content/blogs/articles.json", import.meta.url), "utf8"));
const publicPaths = ["/", "/library", "/library/pyqs", "/library/notes", "/library/syllabus", "/about-us", "/blogs", ...articles.map((article) => `/blogs/${article.slug}`)];
const results = [];
const pages = new Map();
const titles = new Set();
const descriptions = new Set();
const slugs = new Set(articles.map((article) => article.slug));
assert.equal(articles.length, 20, "Expected 20 researched articles");
assert.equal(slugs.size, articles.length, "Duplicate article slugs");

const text = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]*>/g, " ").replace(/&#x([\da-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value))).replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const metas = (html) => [...html.matchAll(/<meta\s+([^>]+)>/g)].map((match) => Object.fromEntries([...match[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map((attribute) => [attribute[1], attribute[2]])));
const canonical = (html) => html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
const schema = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((match) => JSON.parse(match[1]));
const get = (path, options = {}) => fetch(`${base}${path}`, { redirect: "manual", signal: AbortSignal.timeout(30000), ...options });

for (const article of articles) {
  assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const words = [article.intro, ...article.sections.flatMap((section) => [...section.paragraphs, ...(section.bullets || [])])].join(" ").split(/\s+/).length;
  assert.ok(words >= 600, `${article.slug}: insufficient substantive copy (${words})`);
  assert.ok(article.sources.length > 0);
  for (const source of article.sources) assert.ok(new URL(source.url).protocol === "https:");
  assert.equal(article.related.length, 3);
  for (const slug of article.related) assert.ok(slug !== article.slug && slugs.has(slug), `Invalid related article ${slug}`);
  assert.ok(publicPaths.includes(article.target));
}

for (const path of publicPaths) {
  const response = await get(path);
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  assert.doesNotMatch(response.headers.get("x-robots-tag") || "", /noindex|nofollow/i, `${path}: blocked response`);
  const html = await response.text();
  pages.set(path, html);
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const meta = metas(html);
  const description = meta.find((tag) => tag.name === "description")?.content;
  assert.ok(title && !titles.has(title), `${path}: missing or duplicate title`);
  assert.ok(description && !descriptions.has(description), `${path}: missing or duplicate description`);
  titles.add(title); descriptions.add(description);
  assert.equal(new URL(canonical(html)).href, `${canonicalOrigin}${path}`, `${path}: canonical mismatch`);
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, `${path}: expected one server-rendered H1`);
  for (const tag of meta.filter((tag) => /^(robots|googlebot)$/.test(tag.name || ""))) assert.doesNotMatch(tag.content, /noindex|nofollow/i, `${path}: ${tag.name}`);
  const ld = schema(html);
  assert.ok(ld.some((item) => item["@type"] === "Organization" && !item.parentOrganization));
  assert.ok(ld.some((item) => item["@type"] === "WebSite"));
  const article = articles.find((item) => path === `/blogs/${item.slug}`);
  if (article) {
    const body = text(html);
    assert.ok(body.includes(article.intro), `${path}: main copy missing before JS`);
    assert.ok(body.includes(article.sections.at(-1).paragraphs.at(-1)), `${path}: truncated main content`);
    const posting = ld.find((item) => item["@type"] === "BlogPosting");
    assert.ok(posting && posting.headline === article.title && posting.datePublished === article.published);
    assert.equal(posting.mainEntityOfPage["@id"], canonicalOrigin + path);
    assert.ok(html.includes(`href="${article.target}"`));
    for (const slug of article.related) assert.ok(html.includes(`href="/blogs/${slug}"`));
  }
  results.push({ path, status: response.status, title, description, canonical: canonical(html), schemaTypes: ld.map((item) => item["@type"]) });
}

assert.ok(pages.get("/").includes('href="/blogs"'), "Homepage footer must link to blogs");
for (const article of articles) assert.ok(pages.get("/blogs").includes(`href="/blogs/${article.slug}"`), `${article.slug}: orphan article`);
for (const path of ["/library", "/library/pyqs", "/library/syllabus", "/library/notes"]) assert.ok(pages.get(path).includes('href="/blogs/'), `${path}: no contextual guides`);

const robotsResponse = await get("/robots.txt");
assert.equal(robotsResponse.status, 200);
const robots = await robotsResponse.text();
assert.match(robots, /Allow: \/\n/);
assert.match(robots, /Disallow: \/api\//);
assert.ok(!robots.includes("Disallow: /library") && !robots.includes("Disallow: /blogs"));
assert.ok(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
const sitemapResponse = await get("/sitemap.xml");
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
assert.deepEqual(new Set(locations), new Set(publicPaths.map((path) => canonicalOrigin + path)), "Sitemap must match public canonical pages exactly");
assert.equal(locations.length, new Set(locations).size);
assert.doesNotMatch(locations.join("\n"), /\/explore|\/dashboard|\/resource|\?/);

for (const path of ["/library/pyqs?q=networks", "/library/notes?semester=2", "/library/syllabus?code=CSE251"]) {
  const response = await get(path);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("x-robots-tag") || "", /noindex/);
  assert.equal(canonical(await response.text()), canonicalOrigin + path.split("?")[0]);
}
const trackedPage = await get("/library/pyqs?utm_source=seo-check");
assert.doesNotMatch(trackedPage.headers.get("x-robots-tag") || "", /noindex/);
const search = await get("/library/explore?q=test");
assert.equal(search.status, 200);
assert.ok(metas(await search.text()).some((tag) => tag.name === "robots" && tag.content.includes("noindex")));
for (const path of ["/auth/login", "/auth/register"]) {
  const response = await get(path);
  assert.equal(response.status, 200);
  assert.ok(metas(await response.text()).some((tag) => tag.name === "robots" && tag.content.includes("noindex")), `${path}: auth page indexable`);
}
for (const path of ["/library/dashboard", "/library/resource?type=syllabus&src=%2FSyllabus%2Ftest.pdf", "/library/pyqs/000000000000000000000000", "/library/notes/000000000000000000000000", "/library/syllabus/000000000000000000000000"]) {
  const response = await get(path);
  // App Router can stream the shell before auth resolves. In that case Next
  // emits its documented refresh redirect in a 200 response instead of 307.
  if (response.status === 307) {
    assert.match(response.headers.get("location") || "", /\/auth\/login\?next=/);
  } else {
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<meta[^>]*http-equiv="refresh"[^>]*content="[^\"]*url=\/auth\/login\?next=/);
    assert.doesNotMatch(html, /<object\b|<iframe\b/, `${path}: private document must not render for guests`);
  }
  assert.match(response.headers.get("x-robots-tag") || "", /noindex/);
}
for (const path of ["/blogs/does-not-exist", "/does-not-exist"]) {
  const response = await get(path);
  assert.equal(response.status, 404, `${path}: soft 404`);
  assert.ok(metas(await response.text()).some((tag) => tag.name === "robots" && tag.content.includes("noindex")));
}
const image = await get("/opengraph-image");
assert.equal(image.status, 200);
assert.match(image.headers.get("content-type") || "", /image\/png/);
if (base.includes("localhost") || base.includes("127.0.0.1")) {
  for (const host of ["sharda.social", "notes-pyqssharda.vercel.app"]) {
    // Node fetch normalises Host; use an explicit HTTP request for host rules.
    const redirect = await new Promise((resolve, reject) => {
      httpGet(`${base}/library/pyqs?q=networks`, { headers: { host } }, (response) => {
        response.resume();
        resolve({ status: response.statusCode, location: response.headers.location });
      }).on("error", reject);
    });
    assert.equal(redirect.status, 308);
    assert.equal(redirect.location, "https://www.sharda.social/library/pyqs?q=networks");
  }
}
const report = { checkedAt: new Date().toISOString(), base, publicRoutes: results.length, articleCount: articles.length, checks: "metadata, SSR copy, JSON-LD, internal links, sitemap, robots, filters, auth, 404, image, host redirect", routes: results };
await writeFile(new URL("../docs/seo/route-verification.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
console.log(`Passed SEO verification: ${results.length} public routes, ${articles.length} articles, crawl directives and redirects.`);
