// ---------------------------------------------------------------------------
// Application Constants — galaxy-of-beauty
//
// All business‑meaningful numbers, limits, URLs, and configuration values that
// are reused across packages go here.  Environment‑specific values still belong
// in env vars; this file holds *invariant* application constants and sensible
// defaults for optional env vars.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Pagination & query limits
// ---------------------------------------------------------------------------

/** Default page size for list endpoints (customer‑facing). */
export const DEFAULT_PAGE_SIZE = 10;

/** Small page / "top N" display (dashboards, sidebars). */
export const SMALL_PAGE_SIZE = 5;

/** Medium page (search results, galleries). */
export const MEDIUM_PAGE_SIZE = 12;

/** Maximum items returned in admin export / bulk queries. */
export const MAX_EXPORT_SIZE = 10_000;

// ---------------------------------------------------------------------------
// Feature‑specific limits
// ---------------------------------------------------------------------------

/** Beauty Discovery — popular / recent services. */
export const DISCOVERY_POPULAR_COUNT = 6;
/** Beauty Discovery — upcoming events. */
export const DISCOVERY_EVENTS_COUNT = 4;
/** Beauty Discovery — flash deals. */
export const DISCOVERY_DEALS_COUNT = 4;
/** Beauty Discovery — personal recommendations. */
export const DISCOVERY_RECOMMEND_COUNT = 8;

/** AI Features — recent bookings for analysis. */
export const AI_RECENT_BOOKINGS = 5;
/** AI Features — wishlist items for analysis. */
export const AI_WISHLIST_ITEMS = 10;
/** AI Features — personalized recommendation count. */
export const AI_RECOMMEND_COUNT = 8;
/** AI Features — routine steps. */
export const AI_ROUTINE_STEPS = 10;

/** Community — trending posts (last 7 days). */
export const COMMUNITY_TRENDING_COUNT = 5;

/** Chat — recent conversations. */
export const CHAT_RECENT_COUNT = 20;

/** Cycle Tracker — days to fetch. */
export const CYCLE_TRACKER_DAYS = 45;

/** Customer Achievements — recent bookings to analyze. */
export const ACHIEVEMENT_BOOKING_SAMPLE = 20;

// ---------------------------------------------------------------------------
// Security & auth
// ---------------------------------------------------------------------------

/** Max failed login / verification attempts before lockout. */
export const MAX_AUTH_ATTEMPTS = 5;

// ---------------------------------------------------------------------------
// Time (milliseconds)
// ---------------------------------------------------------------------------

/** Brief redirect delay (login, verification). */
export const REDIRECT_DELAY_MS = 2_000;
/** Email verification redirect delay. */
export const VERIFY_REDIRECT_MS = 3_000;
/** Copy‑to‑clipboard feedback duration. */
export const COPY_FEEDBACK_MS = 2_000;

/** Polling intervals for live-updating UI elements. */
export const COUNTDOWN_INTERVAL_MS = 1_000; // per-second tick (flash deals)
export const CAMPAIGN_POLL_INTERVAL_MS = 60_000; // 1 minute
export const EVENT_POLL_INTERVAL_MS = 30_000; // 30 seconds
export const FORTUNE_ANIMATION_MS = 1_000; // fortune cookie reveal

// ---------------------------------------------------------------------------
// External URLs (CDN, third‑party)
// ---------------------------------------------------------------------------

/** Google Fonts — Tajawal + Inter. */
export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Inter:wght@400;500;600;700&display=swap';

/** Leaflet (OpenStreetMap) tile layer. */
export const LEAFLET_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
/** Leaflet CSS CDN. */
export const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
/** Leaflet JS CDN. */
export const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

/** Swagger UI CDN. */
export const SWAGGER_CSS_URL = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css';
export const SWAGGER_JS_URL = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js';

/** Google OAuth 2.0 authorization endpoint. */
export const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

// ---------------------------------------------------------------------------
// Social share URL templates
// ---------------------------------------------------------------------------

export const SHARE_URLS = {
  whatsapp: 'https://wa.me/?text=',
  twitter: 'https://twitter.com/intent/tweet?text=',
  facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
} as const;

/** Google Calendar event link base. */
export const GOOGLE_CALENDAR_URL = 'https://calendar.google.com/calendar/render';

// ---------------------------------------------------------------------------
// Default application URL (fallback for env vars)
// ---------------------------------------------------------------------------

export const DEFAULT_APP_URL = 'https://galaxyofbeauty.sa';
export const DEFAULT_LOCAL_URL = 'http://localhost:3000';

// ---------------------------------------------------------------------------
// Financial / business rules
// ---------------------------------------------------------------------------

/** Cashback percentage per booking (5 = 5%). */
export const CASHBACK_RATE_PCT = 5;
/** Cashback decimal multiplier (rate / 100). */
export const CASHBACK_RATE = CASHBACK_RATE_PCT / 100;
/** Bonus cashback (SAR) on customer's first booking. */
export const FIRST_BOOKING_BONUS_SAR = 50;

/** Platform fee in SAR per booking — overridable via PLATFORM_FEE_SAR env. */
export const DEFAULT_PLATFORM_FEE_SAR = 11;

/** VAT rate in Saudi Arabia. */
export const VAT_RATE = 0.15;

/** Loyalty tier thresholds and multipliers — single source of truth for API + UI. */
export const LOYALTY_TIERS = {
  SILVER:   { minPoints: 0,    pointMultiplier: 1,   nameAr: 'فضية',     nameEn: 'Silver',   emoji: '🥈', color: 'from-gray-300 to-gray-400' },
  GOLD:     { minPoints: 500,  pointMultiplier: 1.5, nameAr: 'ذهبية',   nameEn: 'Gold',     emoji: '🥇', color: 'from-yellow-400 to-amber-500' },
  PLATINUM: { minPoints: 2000, pointMultiplier: 2,   nameAr: 'بلاتينية', nameEn: 'Platinum', emoji: '💎', color: 'from-purple-400 to-indigo-500' },
} as const;

/** Wallet minimum withdrawal balance (SAR). */
export const MIN_WITHDRAWAL_BALANCE = 200;
/** Wallet withdrawal fee rate. */
export const WITHDRAWAL_FEE_RATE = 0.05;

/** Emergency booking surcharge (SAR). */
export const EMERGENCY_SURCHARGE_SAR = 50;

/** Default VAT number (ZATCA test — must be overridden in production). */
export const ZATCA_TEST_VAT = '300000000000003';
/** ZATCA API base URL. */
export const ZATCA_API_URL = 'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal';
