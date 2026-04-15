/**
 * Neural Slug Generator
 * Generates unique, memorable identifiers for public intelligence broadcasting.
 */
export function generateShareSlug(title: string): string {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 30);
    
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${cleanTitle || 'intel'}-${randomSuffix}`;
}

/**
 * Constructs the canonical public URL for a shared node.
 */
export function buildShareUrl(slug: string): string {
  // Use environment variable or current origin in browser
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/s/${slug}`;
  }
  return `https://notes.biz.id/s/${slug}`;
}
