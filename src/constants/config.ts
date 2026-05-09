/** Daily click budget per device (enforced locally now; mirror in Firebase Functions later). */
export const MAX_CLICKS_PER_DAY = 67;

export const RATE_LIMIT_MESSAGE =
  'To prevent silly bots that could disrupt the app, clicks are limited to 67 per day. gg.';

export const LOADING_MS = 2000;

export const ADMIN_LONG_PRESS_MS = 5000;
