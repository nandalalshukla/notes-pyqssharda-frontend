import {
  FiMessageSquare,
  FiBell,
  FiCalendar,
  FiSearch,
  FiSmartphone,
  FiFileText,
  FiEdit3,
  FiShoppingBag,
  FiWatch,
  FiKey,
  FiCreditCard,
  FiUser,
  FiPackage,
} from "react-icons/fi";
import type {
  LostFoundCategory,
  LostFoundKind,
  PostType,
} from "@/lib/api/social/social.api";
import type { BadgeVariant } from "@/components/ui";

type IconComponent = React.ComponentType<{
  size?: number;
  className?: string;
}>;

/**
 * One description of each post type, shared by the feed's section tabs,
 * the composer's type picker and the card's badge — so a type can't end up
 * labelled "Lost & Found" in one place and "Lost/Found" in another, and
 * adding the next type is a single edit here.
 */
export interface PostTypeMeta {
  value: PostType;
  /** Singular, for the composer's picker and the card's badge. */
  label: string;
  /** Plural / section wording, for the feed tabs. */
  tabLabel: string;
  /** Shown by the feed when a section has nothing in it. */
  emptyTitle: string;
  Icon: IconComponent;
  badgeVariant: BadgeVariant;
}

export const postTypeMeta: Record<PostType, PostTypeMeta> = {
  general: {
    value: "general",
    label: "General",
    tabLabel: "General",
    emptyTitle: "No posts yet",
    Icon: FiMessageSquare,
    badgeVariant: "default",
  },
  announcement: {
    value: "announcement",
    label: "Announcement",
    tabLabel: "Announcements",
    emptyTitle: "No announcements yet",
    Icon: FiBell,
    badgeVariant: "coral",
  },
  event: {
    value: "event",
    label: "Event",
    tabLabel: "Events",
    emptyTitle: "No events yet",
    Icon: FiCalendar,
    badgeVariant: "mint",
  },
  lost_found: {
    value: "lost_found",
    label: "Lost & Found",
    tabLabel: "Lost & Found",
    emptyTitle: "Nothing on the lost & found board",
    Icon: FiSearch,
    badgeVariant: "purple",
  },
};

/** Display order for the feed tabs and the composer's type picker. */
export const postTypeOrder: PostType[] = [
  "general",
  "announcement",
  "event",
  "lost_found",
];

export const postTypeOptions = postTypeOrder.map((type) => postTypeMeta[type]);

/**
 * Resolves any type string off the wire to a known entry — an older or
 * newer document must never crash the card on an undefined lookup.
 */
export const resolvePostTypeMeta = (type?: string | null): PostTypeMeta =>
  postTypeMeta[type as PostType] ?? postTypeMeta.general;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LOST & FOUND
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface LostFoundKindMeta {
  value: LostFoundKind;
  /** How the badge reads on a card. */
  label: string;
  /** How the option reads in the composer, from the author's point of view. */
  composerLabel: string;
  composerHint: string;
  badgeVariant: BadgeVariant;
}

export const lostFoundKindMeta: Record<LostFoundKind, LostFoundKindMeta> = {
  lost: {
    value: "lost",
    label: "Lost",
    composerLabel: "I lost something",
    composerHint: "Ask the campus to keep an eye out for it",
    badgeVariant: "warning",
  },
  found: {
    value: "found",
    label: "Found",
    composerLabel: "I found something",
    composerHint: "Help it get back to whoever owns it",
    badgeVariant: "success",
  },
};

export const lostFoundKindOptions = [
  lostFoundKindMeta.lost,
  lostFoundKindMeta.found,
];

export const lostFoundCategoryMeta: Record<
  LostFoundCategory,
  { value: LostFoundCategory; label: string; Icon: IconComponent }
> = {
  electronics: {
    value: "electronics",
    label: "Electronics",
    Icon: FiSmartphone,
  },
  documents: { value: "documents", label: "Documents", Icon: FiFileText },
  stationery: { value: "stationery", label: "Stationery", Icon: FiEdit3 },
  clothing: { value: "clothing", label: "Clothing", Icon: FiShoppingBag },
  accessories: { value: "accessories", label: "Accessories", Icon: FiWatch },
  keys: { value: "keys", label: "Keys", Icon: FiKey },
  wallet: { value: "wallet", label: "Wallet / Purse", Icon: FiCreditCard },
  id_card: { value: "id_card", label: "ID Card", Icon: FiUser },
  other: { value: "other", label: "Other", Icon: FiPackage },
};

export const lostFoundCategoryOptions = [
  lostFoundCategoryMeta.electronics,
  lostFoundCategoryMeta.documents,
  lostFoundCategoryMeta.stationery,
  lostFoundCategoryMeta.clothing,
  lostFoundCategoryMeta.accessories,
  lostFoundCategoryMeta.keys,
  lostFoundCategoryMeta.wallet,
  lostFoundCategoryMeta.id_card,
  lostFoundCategoryMeta.other,
];

export const resolveLostFoundCategory = (category?: string | null) =>
  lostFoundCategoryMeta[category as LostFoundCategory] ??
  lostFoundCategoryMeta.other;
