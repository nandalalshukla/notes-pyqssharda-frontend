"use client";

import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui";
import api from "@/lib/api/axios";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export interface MentionReference {
  userId: string;
  username: string;
}

interface Suggestion {
  id: string;
  username: string;
  name: string;
  profilePicture: string | null;
}

interface MentionTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  value: string;
  onChange: (value: string, mentions: MentionReference[]) => void;
  mentions: MentionReference[];
  inputClassName?: string;
}

export default function MentionTextarea({
  value,
  onChange,
  mentions,
  className,
  ...props
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerQuery, setTriggerQuery] = useState("");
  const debouncedQuery = useDebouncedValue(triggerQuery, 280);

  const detectTrigger = (text: string, cursor: number) => {
    const before = text.slice(0, cursor);
    const match = before.match(/(?:^|[^a-zA-Z0-9._])@([a-zA-Z0-9._]*)$/);
    return match ? match[1].toLowerCase() : null;
  };

  useEffect(() => {
    if (triggerQuery === "") {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    api
      .get<{ success: boolean; users: Suggestion[] }>("/social/users/mention-search", {
        params: { q: debouncedQuery },
        signal: controller.signal,
      })
      .then((response) => {
        setSuggestions(response.data.users);
        setActiveIndex(0);
        setIsOpen(true);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSuggestions([]);
          setIsOpen(true);
        }
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [debouncedQuery, triggerQuery]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    const cursor = event.target.selectionStart;
    const trigger = detectTrigger(next, cursor);
    setTriggerQuery(trigger ?? "");
    onChange(next, removeStaleMentions(next));
  };

  const removeStaleMentions = (next: string) =>
    mentions.filter((mention) =>
      new RegExp(`(^|[^a-zA-Z0-9._])@${mention.username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-zA-Z0-9._])`, "i").test(next),
    );

  const selectSuggestion = (suggestion: Suggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart;
    const before = value.slice(0, cursor);
    const startMatch = before.match(/(?:^|[^a-zA-Z0-9._])@[a-zA-Z0-9._]*$/);
    if (!startMatch) return;
    const start = before.lastIndexOf("@");
    const next = `${value.slice(0, start)}@${suggestion.username} ${value.slice(cursor)}`;
    const nextCursor = start + suggestion.username.length + 2;
    const current = removeStaleMentions(next);
    const nextMentions = current.some((mention) => mention.userId === suggestion.id)
      ? current
      : [...current, { userId: suggestion.id, username: suggestion.username }];
    onChange(next, nextMentions);
    setIsOpen(false);
    setTriggerQuery("");
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && suggestions[activeIndex]) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <textarea
        {...props}
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {isOpen && (
        <div className="absolute bottom-full z-[80] mb-2 max-h-72 w-full max-w-sm overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-soft-lg">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">Searching users...</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No users found</div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left ${index === activeIndex ? "bg-secondary" : "hover:bg-secondary/70"}`}
              >
                <Avatar src={suggestion.profilePicture || undefined} alt={suggestion.name} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{suggestion.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">@{suggestion.username}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
