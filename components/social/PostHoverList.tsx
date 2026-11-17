"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type HoverHandler = (element: HTMLDivElement) => void;

const PostHoverContext = createContext<HoverHandler | null>(null);

export const usePostHoverHighlight = () => useContext(PostHoverContext);

export default function PostHoverList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [hoverRect, setHoverRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const handlePostHover = useCallback<HoverHandler>((element) => {
    const list = listRef.current;
    if (!list) return;

    const listRect = list.getBoundingClientRect();
    const postRect = element.getBoundingClientRect();
    setHoverRect({
      x: postRect.left - listRect.left + list.scrollLeft,
      y: postRect.top - listRect.top + list.scrollTop,
      width: postRect.width,
      height: postRect.height,
    });
  }, []);

  return (
    <PostHoverContext.Provider value={handlePostHover}>
      <div
        ref={listRef}
        onMouseLeave={() => setHoverRect(null)}
        className={`relative ${className}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-0 rounded-xl bg-neutral-100/75 shadow-[0_4px_14px_-10px_rgba(82,82,82,0.24)] transition-[transform,width,height,opacity] duration-300 ease-out dark:bg-neutral-800/45 dark:shadow-[0_4px_14px_-10px_rgba(210,210,210,0.12)]"
          style={
            hoverRect
              ? {
                  width: hoverRect.width,
                  height: hoverRect.height,
                  transform: `translate3d(${hoverRect.x}px, ${hoverRect.y}px, 0)`,
                  opacity: 1,
                }
              : { opacity: 0 }
          }
        />
        {children}
      </div>
    </PostHoverContext.Provider>
  );
}
