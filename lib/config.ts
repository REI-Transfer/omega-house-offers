/**
 * lib/config.ts — single server-side env read point. Import ONLY in server
 * components (layout.tsx, page.tsx, API routes). Never import in "use client"
 * components — pass values as props. Superset of the rei-survey-template contract
 * plus the onboarding-emitted extras (BRAND_ACCENT, FOUNDERS_CAPTION,
 * FOUNDERS_PHOTO_URL, DEAL_ORACLE_*).
 */
const config = {
  companyName:     process.env.COMPANY_NAME     ?? "Your Home Buyers",
  phoneDisplay:    process.env.PHONE_DISPLAY    ?? "(800) 000-0000",
  phoneHref:       process.env.PHONE_HREF       ?? "8000000000",
  callinDisplay:   process.env.NEXT_PUBLIC_CALLIN_DISPLAY ?? "",
  callinHref:      process.env.NEXT_PUBLIC_CALLIN_HREF    ?? "",
  // Accent: onboarding sends BRAND_ACCENT; ACCENT_COLOR is an override. Prefer ACCENT_COLOR, else BRAND_ACCENT, else default.
  accentColor:     process.env.ACCENT_COLOR ?? process.env.BRAND_ACCENT ?? "#ff6900",
  headerBgColor:   process.env.HEADER_BG_COLOR  ?? "#ffffff",
  logoUrl:         process.env.LOGO_URL         ?? "",
  // Owner: OWNER_NAME + HEADSHOT_URL (small headshot). Hero cut-out photo = FOUNDERS_PHOTO_URL (fallback HEADSHOT_URL). Caption = FOUNDERS_CAPTION.
  ownerName:       process.env.OWNER_NAME       ?? "",
  headshotUrl:     process.env.HEADSHOT_URL     ?? "",
  foundersPhotoUrl: process.env.FOUNDERS_PHOTO_URL ?? process.env.HEADSHOT_URL ?? "",
  foundersCaption:  process.env.FOUNDERS_CAPTION  ?? "",
  headline:        process.env.HEADLINE         ?? "Sell Your House Fast For Cash",
  headlineAccent:  process.env.HEADLINE_ACCENT  ?? "",
  subheadline:     process.env.SUBHEADLINE      ?? "No repairs. No fees. A fair cash offer in 24 hours — you pick the closing date.",
  marketName:      process.env.MARKET_NAME      ?? "",
  smsKeyword:      process.env.SMS_KEYWORD      ?? "OFFER",
  serviceAreas:    process.env.SERVICE_AREAS    ?? "[]",
  stat1Value:      process.env.STAT_1_VALUE     ?? "1,000+",
  stat1Label:      process.env.STAT_1_LABEL     ?? "Homes Purchased",
  stat2Value:      process.env.STAT_2_VALUE     ?? "10+",
  stat2Label:      process.env.STAT_2_LABEL     ?? "Years in Business",
  stat3Value:      process.env.STAT_3_VALUE     ?? "5-Star",
  stat3Label:      process.env.STAT_3_LABEL     ?? "Google Rating",
  metaTitle:       process.env.META_TITLE       ?? "",
  metaDescription: process.env.META_DESCRIPTION ?? "",
  privacyPolicyUrl: process.env.PRIVACY_POLICY_URL ?? "/privacy",
  termsUrl:         process.env.TERMS_URL          ?? "/terms",
  disqualifiedPropertyTypes:    process.env.DISQUALIFIED_PROPERTY_TYPES    ?? "mobile-home,land,other",
  disqualifiedOwnershipLengths: process.env.DISQUALIFIED_OWNERSHIP_LENGTHS ?? "",
  allowedStates:   process.env.ALLOWED_STATES   ?? "",
  webhookUrl:      process.env.WEBHOOK_URL      ?? "",
} as const
export default config
export type Config = typeof config
