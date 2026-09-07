import React from "react";

/**
 * Emits a JSON-LD block for search engines.
 *
 * A server component with no client JavaScript: structured data has to be
 * in the HTML a crawler receives, not injected after hydration.
 *
 * `JSON.stringify` output is escaped before it reaches the DOM. The data
 * here is authored in the codebase rather than user-supplied, but the
 * escape costs nothing and means a future caller passing a database value
 * (a course name containing "</script>") can't break out of the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      // The content is serialised JSON, not markup, and React would
      // otherwise escape the quotes into entities and make it unparseable.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export default JsonLd;
