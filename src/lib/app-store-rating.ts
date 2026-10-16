/**
 * An app's current App Store rating, looked up at build time so the landing
 * page shows today's numbers. Returns null when the lookup fails or the app
 * has no ratings yet, and the page then leaves the line out.
 */
export interface AppStoreRating {
  average: number;
  count: number;
}

export async function appStoreRating(appId: string): Promise<AppStoreRating | null> {
  try {
    const response = await fetch(`https://itunes.apple.com/lookup?id=${appId}&country=us`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const result = (await response.json()).results?.[0];
    if (!result?.userRatingCount) return null;
    return { average: result.averageUserRating, count: result.userRatingCount };
  } catch {
    return null;
  }
}
