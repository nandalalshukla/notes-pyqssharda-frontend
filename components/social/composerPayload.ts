import type { LostFoundDraft } from "./PostComposerForm";

/**
 * Writes a lost & found draft onto the multipart body the create/edit
 * endpoints expect.
 *
 * The fields go on flat and prefixed rather than as a nested object
 * because FormData can't carry nesting without a JSON round-trip — the
 * backend validator (social-zod/post.zod.ts) reads exactly these keys and
 * reassembles them into the Post's `lostFound` sub-document.
 *
 * Both modals share this so the two never disagree about a key name; a
 * typo in one would otherwise silently drop that field on the floor, since
 * the validator strips anything it doesn't recognise.
 */
export function appendLostFoundFields(
  formData: FormData,
  draft: LostFoundDraft,
) {
  formData.append("lostFoundKind", draft.kind);
  formData.append("lostFoundItemName", draft.itemName.trim());
  formData.append("lostFoundCategory", draft.category);
  formData.append("lostFoundLocation", draft.location.trim());
  formData.append("lostFoundDate", draft.date);
  formData.append("lostFoundContactInfo", draft.contactInfo.trim());
}
