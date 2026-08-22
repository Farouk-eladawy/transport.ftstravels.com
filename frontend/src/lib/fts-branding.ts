/** FTS Transport — default branding (matches FTS CRM / ftstravels.com). */
export const FTS_BRAND_NAME = 'FTS Transport';
export const FTS_COMPANY_NAME = 'FTS Travels';

/** Same logo used by the FTS CRM dashboard. Override via NEXT_PUBLIC_FTS_LOGO_URL on Netlify. */
export const FTS_LOGO_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FTS_LOGO_URL?.trim()) ||
  'https://ftstravels.com/cropped-logo-2.png';

/** Local offline fallback if the CDN logo cannot load. */
export const FTS_LOGO_FALLBACK = '/fts-logo.svg';
