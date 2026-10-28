/**
 * E4 — social links on the phone (Wave E): pure diff helper for the
 * updateSocialLinks mutation. Node-testable — no react-native imports.
 */

export const SOCIAL_NETWORKS = ['snapchat', 'tiktok', 'x', 'instagram', 'facebook'] as const;

/**
 * Diff the edit form against the stored links. Returns the
 * updateSocialLinks payload — changed networks only, an empty string
 * removes one (the B6 partial-merge contract) — or null when nothing
 * changed, which keeps the Save button disabled.
 */
export function socialLinksPatch(
  existing: Record<string, string> | null | undefined,
  form: Record<string, string>,
): Record<string, string> | null {
  const patch: Record<string, string> = {};
  for (const network of SOCIAL_NETWORKS) {
    const current = (existing?.[network] ?? '').trim();
    const next = (form[network] ?? '').trim();
    if (next !== current) patch[network] = next;
  }
  return Object.keys(patch).length > 0 ? patch : null;
}
