/**
 * Helper utilities for Instagram URL and username parsing
 */

/**
 * Extract clean Instagram username/handle from any input:
 * - Full URL: https://www.instagram.com/myusername/
 * - Short URL: instagram.com/myusername?igsh=123
 * - Handle with @: @myusername
 * - Plain username: myusername
 */
export function extractInstagramUsername(urlOrHandle?: string): string {
  if (!urlOrHandle || typeof urlOrHandle !== 'string') {
    return 'laser.nk';
  }

  let clean = urlOrHandle.trim();
  if (!clean) return 'laser.nk';

  // Strip query parameters, search parameters, or hashes
  clean = clean.split('?')[0].split('#')[0];

  // Strip protocol (http:// or https://)
  clean = clean.replace(/^https?:\/\//i, '');

  // Strip domain (www.instagram.com/ or instagram.com/ or m.instagram.com/)
  clean = clean.replace(/^(www\.|m\.)?instagram\.com\/?/i, '');

  // Strip leading '@' or slashes
  clean = clean.replace(/^[@\/]+/, '');

  // Strip trailing slashes or spaces
  clean = clean.replace(/[\/\s]+$/, '');

  return clean || 'laser.nk';
}

/**
 * Get properly formatted Instagram link (always returns a valid https://www.instagram.com/... URL)
 */
export function getInstagramUrl(urlOrHandle?: string): string {
  if (!urlOrHandle || typeof urlOrHandle !== 'string') {
    return 'https://www.instagram.com/laser.nk';
  }

  const clean = urlOrHandle.trim();
  if (!clean) return 'https://www.instagram.com/laser.nk';

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  const username = extractInstagramUsername(clean);
  return `https://www.instagram.com/${username}`;
}
