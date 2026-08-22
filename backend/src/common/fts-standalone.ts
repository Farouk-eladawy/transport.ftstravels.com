import type { LicenseStatus } from './license.util.js';

/** FTS Transport fork — no third-party ilicense.tech subscription. */
export function isFtsStandalone(): boolean {
  const flag = String(process.env.FTS_STANDALONE ?? 'true').trim().toLowerCase();
  return flag !== 'false' && flag !== '0';
}

export function ftsStandaloneLicenseStatus(): LicenseStatus {
  return {
    valid: true,
    expiresAt: null,
    daysRemaining: null,
    message: 'FTS Transport — internal deployment',
    status: 'active',
    checkedOnline: false,
    lastCheckedAt: null,
  };
}
