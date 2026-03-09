/**
 * Hackathon Context Utilities
 *
 * Manages hackathon slug during OAuth flow using cookies.
 * This allows us to track which hackathon a user is registering for
 * during the GitHub OAuth redirect.
 */

const HACKATHON_SLUG_COOKIE = 'hackathonSlug';
const COOKIE_MAX_AGE = 3600; // 1 hour

/**
 * Store the hackathon slug in a cookie before OAuth redirect
 */
export function setHackathonSlug(slug: string): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${HACKATHON_SLUG_COOKIE}=${slug}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Get the hackathon slug from cookie after OAuth callback
 */
export function getHackathonSlug(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === HACKATHON_SLUG_COOKIE) {
      return value;
    }
  }
  return null;
}

/**
 * Clear the hackathon slug cookie after registration
 */
export function clearHackathonSlug(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${HACKATHON_SLUG_COOKIE}=; path=/; max-age=0`;
}

/**
 * Parse slug from URL path (for use in w/[slug]/... routes)
 */
export function extractSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/\/w\/([^/]+)/);
  return match ? match[1] : null;
}