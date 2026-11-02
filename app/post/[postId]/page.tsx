import type { Metadata } from "next";
import HomeFeedPage from "@/components/social/HomeFeedPage";
import PostPermalinkModal from "@/components/social/PostPermalinkModal";
import { SITE_NAME, absoluteUrl } from "@/lib/seo/site";
import { postPath, snippet } from "@/lib/utils/share";

/**
 * A shared post: /post/<id>.
 *
 * The page is the normal feed with the post opened in a modal on top, so
 * whoever follows the link can read it, react to it, and carry on into the
 * community. Its <head> is what makes the link look right when pasted into
 * WhatsApp, X, Telegram and the rest — a title, the start of the post, and
 * its first picture.
 */

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const IMAGE_RE = /\.(jpe?g|png|gif|webp)$/i;

interface PublicPost {
  content?: string;
  isAnonymous?: boolean;
  author?: { username?: string } | null;
  files?: string[];
}

async function fetchPost(postId: string): Promise<PublicPost | null> {
  if (!OBJECT_ID.test(postId)) return null;
  const origin = process.env.BACKEND_ORIGIN ?? "http://localhost:5000";
  try {
    const res = await fetch(`${origin}/api/v1/social/posts/${postId}`, {
      // A burst of link previews shouldn't each hit the database, and a
      // post's text rarely changes — a couple of minutes of caching is plenty.
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { post?: PublicPost } };
    return body.data?.post ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  const post = await fetchPost(postId);

  if (!post) {
    return {
      title: "Post not available",
      robots: { index: false, follow: false },
    };
  }

  // The API already masks the author of an anonymous post for a signed-out
  // reader (which is what this request is), but never rely on that alone for
  // something that gets stamped into a public page.
  const author = post.isAnonymous
    ? "Anonymous"
    : post.author?.username
      ? `@${post.author.username}`
      : "A student";
  const description = snippet(post.content ?? "", 200) || `A post shared on ${SITE_NAME}.`;
  const title = `${author}: “${snippet(post.content ?? "A post", 60)}”`;
  const url = absoluteUrl(postPath(postId));
  const image = post.files?.find((file) => IMAGE_RE.test(file));
  const previewImage = image ?? absoluteUrl("/shardasocial.png");

  return {
    title,
    description,
    alternates: { canonical: url },
    // Member-written, individually thin pages: worth sharing, not worth ranking.
    robots: { index: false, follow: true },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: SITE_NAME,
      images: [{ url: previewImage, alt: `${author} on ${SITE_NAME}` }],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: [previewImage],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return (
    <>
      <HomeFeedPage />
      <PostPermalinkModal key={postId} postId={postId} closeHref="/" />
    </>
  );
}
