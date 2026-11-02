"use client";

import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { FaFacebookF, FaLinkedinIn, FaTelegram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiCheck, FiCopy, FiFileText, FiMail, FiShare2 } from "react-icons/fi";
import { Button, Modal } from "@/components/ui";
import type { Post } from "@/lib/api/social/social.api";
import {
  ShareNetwork,
  canNativeShare,
  copyToClipboard,
  getPostShareUrl,
  openShareWindow,
  shareHrefs,
  snippet,
} from "@/lib/utils/share";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  /** What to call the author. Pass "Anonymous" for anonymous posts — never the real name. */
  authorName: string;
}

interface Target {
  id: ShareNetwork;
  label: string;
  icon: React.ReactNode;
  /** Tile colours; the brand colour of each network. */
  className: string;
}

const TARGETS: Target[] = [
  { id: "whatsapp", label: "WhatsApp", icon: <FaWhatsapp size={22} />, className: "bg-[#25D366] text-white" },
  { id: "telegram", label: "Telegram", icon: <FaTelegram size={22} />, className: "bg-[#229ED9] text-white" },
  { id: "x", label: "X", icon: <FaXTwitter size={20} />, className: "bg-foreground text-background" },
  { id: "facebook", label: "Facebook", icon: <FaFacebookF size={20} />, className: "bg-[#1877F2] text-white" },
  { id: "linkedin", label: "LinkedIn", icon: <FaLinkedinIn size={20} />, className: "bg-[#0A66C2] text-white" },
  { id: "email", label: "Email", icon: <FiMail size={21} />, className: "bg-accent-coral text-accent-coral-foreground" },
];

const IMAGE_RE = /\.(jpe?g|png|gif|webp)$/i;

/**
 * Share sheet for a post: a preview of what is being shared, the system share
 * sheet where the device has one, one-tap buttons for the common networks,
 * and a copyable link. The link opens the post itself (see /post/[postId]).
 */
export default function ShareModal({ isOpen, onClose, post, authorName }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // `navigator.share` only exists in the browser. Reading it through an
  // external-store hook gives the server `false` and the client the real
  // answer, without a hydration mismatch or a state-setting effect.
  const native = useSyncExternalStore(
    () => () => undefined,
    canNativeShare,
    () => false,
  );

  useEffect(() => () => void (resetTimer.current && clearTimeout(resetTimer.current)), []);

  // Closing clears the "Copied" state, so reopening starts clean.
  const handleClose = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setCopied(false);
    setCopyFailed(false);
    onClose();
  };

  const url = useMemo(() => (isOpen ? getPostShareUrl(post._id) : ""), [isOpen, post._id]);
  const preview = snippet(post.content || "", 160);
  const text = preview
    ? `${authorName} on Sharda Social: “${snippet(post.content, 110)}”`
    : `A post by ${authorName} on Sharda Social`;
  const title = `${authorName} on Sharda Social`;
  const context = { url, text, title };
  const thumbnail = post.files?.find((file) => IMAGE_RE.test(file));

  const handleCopy = async () => {
    const ok = await copyToClipboard(url);
    setCopyFailed(!ok);
    setCopied(ok);
    if (!ok) inputRef.current?.select(); // let them copy by hand
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2200);
  };

  const handleNative = async () => {
    try {
      await navigator.share({ title, text, url });
      handleClose();
    } catch (error) {
      // Dismissing the system sheet rejects with AbortError — not a failure.
      if ((error as DOMException)?.name !== "AbortError") setCopyFailed(true);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Share post" size="md">
      <div className="space-y-5">
        {/* What's being shared */}
        <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/50 p-3">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          ) : post.files && post.files.length > 0 ? (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <FiFileText size={24} />
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-muted-foreground">{authorName}</p>
            <p className="mt-0.5 line-clamp-3 text-sm leading-relaxed text-foreground">
              {preview || "Shared a post"}
            </p>
          </div>
        </div>

        {/* The device's own share sheet, where there is one — it lists every
            app the person actually has installed. */}
        {native && (
          <Button
            type="button"
            size="lg"
            className="w-full"
            icon={<FiShare2 size={18} />}
            onClick={handleNative}
          >
            Share to other apps
          </Button>
        )}

        {/* Networks */}
        <div>
          {native && (
            <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Or share directly
            </p>
          )}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {TARGETS.map((target) => (
              <button
                key={target.id}
                type="button"
                onClick={() => openShareWindow(shareHrefs[target.id](context))}
                className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Share on ${target.label}`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full shadow-soft-sm transition-transform duration-150 group-hover:scale-105 group-active:scale-95 ${target.className}`}
                >
                  {target.icon}
                </span>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                  {target.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Link */}
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Post link
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 pl-3">
            <input
              ref={inputRef}
              readOnly
              value={url}
              aria-label="Post link"
              onFocus={(event) => event.currentTarget.select()}
              className="min-w-0 flex-1 truncate bg-transparent text-sm text-muted-foreground outline-none"
            />
            <Button
              type="button"
              size="sm"
              variant={copied ? "secondary" : "primary"}
              icon={copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p
            role="status"
            aria-live="polite"
            className={`mt-2 min-h-5 text-xs ${copyFailed ? "text-destructive" : "text-success"}`}
          >
            {copied
              ? "Link copied to clipboard"
              : copyFailed
                ? "Couldn't copy automatically — the link is selected, press Ctrl/⌘+C."
                : ""}
          </p>
        </div>
      </div>
    </Modal>
  );
}
