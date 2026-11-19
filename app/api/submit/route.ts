import { NextResponse } from "next/server"
import config from "@/lib/config"
import { calculateLeadScore, leadQuality } from "@/lib/lead-score"
import { lookupProperty, simulatedLookup, withPriority, applyConditionRule, legacyAnswers, recordUsable, parseUsAddress, SCENARIOS, type LookupInput, type LookupResult } from "@/lib/dealmachine"
import { sellerAnswerRule, ownershipMortgageRule } from "@/lib/form-rules"

const FORM_SLUG =
  (config.companyName || "landing").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-survey"
const FORM_TITLE = `${config.companyName} Survey`

// Simple in-memory rate limiter (resets on deploy/restart)
const submissionLog = new Map<string, { count: number; firstSubmit: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const window = 60 * 60 * 1000 // 1 hour
  const maxSubmissions = 3

  const entry = submissionLog.get(ip)
  if (!entry) {
    submissionLog.set(ip, { count: 1, firstSubmit: now })
    return false
  }

  // Reset window if expired
  if (now - entry.firstSubmit > window) {
    submissionLog.set(ip, { count: 1, firstSubmit: now })
    return false
  }

  entry.count++
  return entry.count > maxSubmissions
}

// "123 Main St, Austin, TX 78701, USA" → "123 Main St"
const streetOf = (address: string) => (address || "").split(",")[0].trim()

// Low equity (20-29%) fires LeadLowIntent, an event GoFunnel already handles (William
// 2026-11-17: no separate LeadLowEquity). The "low equity" label stays in record_verdict,
// record_equity_band and property_summary for the CRM and tracker.
const META_EVENT_FOR: Record<string, string> = { lead: "Lead", low_equity: "LeadLowIntent", low_intent: "LeadLowIntent" }

// Property record fields for n8n. Booleans/numbers as-is, empty = "". Neutral names:
// a client webhook that receives the whole payload must not learn the data vendor.
function dmFields(dm: LookupResult, priority: string, reasonDetails: string) {
  return {
    record_found: dm.matched,
    record_equity_pct: dm.equity_pct ?? "",
    record_equity_band: dm.equity_band,
    record_value: dm.value ?? "",
    record_owed: dm.owed ?? "",
    record_verdict: dm.verdict,
    record_dq_reason: dm.dq_reason ?? "",
    record_listed_now: dm.listed_now,
    record_owner_match: dm.owner_match ?? "",
    record_distress: dm.distress.join("; "),
    record_excellent_bypass: dm.excellent_bypass === true,
    property_summary: withPriority(dm.summary, priority, reasonDetails),
    lookup_credits: dm.credits_used,
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown"

    // Rate limit: max 3 submissions per IP per hour
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many submissions. Please try again later." },
        { status: 429 }
      )
    }

    const data = await request.json()

    // Server-side validation
    const phone = (data.phone || "").replace(/\D/g, "").replace(/^1/, "")
    if (phone.length !== 10) {
      return NextResponse.json({ success: false, error: "Invalid phone" }, { status: 400 })
    }

    const email = (data.email || "").trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 })
    }

    // Support both firstName/lastName (new) and name (legacy)
    if (!(data.firstName || data.name || "").trim()) {
      return NextResponse.json({ success: false, error: "Name required" }, { status: 400 })
    }

    if (!(data.address || "").trim()) {
      return NextResponse.json({ success: false, error: "Address required" }, { status: 400 })
    }

    // Add server IP to payload
    const payload: Record<string, unknown> = { ...data, server_ip: ip }

    // Property-record form (components/v2/record-survey-card.tsx, one-step on this site) only:
    // record_check marks its single post at the end (its first check ran on /api/lookup; same
    // house = no new credit). Every other post goes out exactly as before and is never looked up.
    const recordCheck = data.record_check === true
    delete payload.record_check
    delete payload.record_mode
    let dm: LookupResult | null = null
    if (recordCheck) {
      // City / state / ZIP come from the address picker; when the address was typed in
      // the hero box they are blank, so read them from the address text instead.
      const parsed = parseUsAddress(typeof data.address === "string" ? data.address : "")
      const input: LookupInput = {
        street: streetOf(data.address), city: data.city || parsed.city, state: data.state || parsed.state,
        zip: data.zip || parsed.zip, lastName: data.lastName || "",
      }
      // Fill the same blanks in what n8n / the CRM receives (only where empty).
      for (const k of ["city", "state", "zip"] as const) {
        if (!(typeof data[k] === "string" && data[k].trim()) && parsed[k]) payload[k] = parsed[k]
      }
      const landOwned = typeof data.landOwned === "string" ? data.landOwned : ""
      // Prototype scenarios: showroom only, ignored on every client site.
      const scenario = config.showroom && typeof data.dm_scenario === "string" && data.dm_scenario in SCENARIOS
        ? data.dm_scenario : ""
      dm = scenario ? await simulatedLookup(scenario, input, landOwned) : await lookupProperty(input, { landOwned })
      dm = applyConditionRule(dm, typeof data.condition === "string" ? data.condition : "")
      // The seller's own answers, by this client's rules (lib/form-rules.ts): an answer the
      // client takes only as low intent turns a record Lead into a low intent lead.
      if (dm.verdict === "lead" || dm.verdict === "low_equity") {
        const own = sellerAnswerRule(data, recordUsable(dm))
        if (own.rule === "low_intent") dm = { ...dm, verdict: "low_intent" }
        else if (own.rule === "dq") dm = { ...dm, verdict: "dq", dq_reason: null }
      }
      Object.assign(payload, dmFields(dm, typeof data.priority === "string" ? data.priority : "",
        typeof data.reasonDetails === "string" ? data.reasonDetails : ""))
      // Same fields, same format: fill the old answer fields the seller wasn't asked,
      // from the record, so the CRM mapping keeps working untouched.
      if (dm.matched) {
        for (const [k, v] of Object.entries(legacyAnswers(dm))) {
          const answered = typeof data[k] === "string" && data[k].trim() !== ""
          if (v && !answered) payload[k] = v
        }
        // Omega: today an under-5 years-owned answer always comes with mortgageStatus. When the
        // record answered years owned, the loan balance on record answers the mortgage question.
        const own = typeof payload.ownershipLength === "string" ? payload.ownershipLength : ""
        const mortgageAnswered = typeof data.mortgageStatus === "string" && data.mortgageStatus.trim() !== ""
        if (!mortgageAnswered && dm.owed != null && ownershipMortgageRule(own, "") === "ask") {
          payload.mortgageStatus = dm.owed > 0 ? "has-mortgage" : "no-mortgage"
        }
      }
      delete payload.dm_scenario

      if (dm.verdict === "dq") {
        Object.assign(payload, {
          qualified: false, disqualify_reason: dm.dq_reason, meta_event_name: "", meta_value: 0,
        })
      } else if (META_EVENT_FOR[dm.verdict]) {
        Object.assign(payload, {
          qualified: dm.verdict === "lead",
          meta_event_name: META_EVENT_FOR[dm.verdict],
          meta_value: dm.verdict === "lead" ? payload.meta_value : 0,
        })
      }
      // Re-score after the record filled the answers the seller was not asked, so
      // lead_score / lead_quality / the Lead value match the old form for the same house.
      const str = (k: string) => (typeof payload[k] === "string" ? (payload[k] as string) : "")
      const score = calculateLeadScore({ timeline: str("timeline"), ownershipLength: str("ownershipLength"), reason: str("reason"), condition: str("condition") })
      payload.lead_score = score
      payload.lead_quality = leadQuality(score)
      if (dm.verdict === "lead") payload.meta_value = score * 25
      else if (dm.verdict === "fallback" && Number(payload.meta_value) > 0) payload.meta_value = score * 25
      else payload.meta_value = 0
    }
    // One-step form: a seller screened out at the very end is not sent anywhere, the same as
    // today's form (its screen-outs happen before the contact step, so nothing is ever sent).
    const dmDq = dm?.verdict === "dq"
    const dmResponse = dm ? { verdict: dm.verdict, dq_reason: dm.dq_reason, lead_score: payload.lead_score } : {}

    // Showroom (SHOWROOM=1): demo site only, never set here. Send nothing anywhere.
    if (config.showroom) {
      return NextResponse.json({ success: true, showroom: true, ...dmResponse, demo: null })
    }

    const webhookUrl = process.env.WEBHOOK_URL
    if (webhookUrl && !dmDq) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    // --- GoFunnel external webhook: forward the lead for gf_sid attribution ---
    try {
      const GF_CREDENTIAL_ID = process.env.GOFUNNEL_WEBHOOK_CREDENTIAL_ID || ""
      const GF_BEARER = process.env.GOFUNNEL_WEBHOOK_SECRET || ""
      // Screened out by the property record: no GoFunnel.
      if (!dmDq && GF_CREDENTIAL_ID && GF_BEARER) {
        const gfCookie = request.headers.get("cookie") || ""
        const gfMatch = gfCookie.match(/(?:^|; )gf_sid=([^;]*)/)
        const gfSid = (data.gf_sid || (gfMatch ? decodeURIComponent(gfMatch[1]) : "") || "").toString().trim()
        const gfStr = (v: unknown) => (typeof v === "string" && v ? v : undefined)
        const gfName = ((data.name || "") as string).trim().split(/\s+/).filter(Boolean)
        const gfPayload = {
          type: "survey_submitted",
          email: email || undefined,
          phone: phone || undefined,
          firstName: gfStr(data.firstName) || gfName[0] || undefined,
          lastName: gfStr(data.lastName) || (gfName.length > 1 ? gfName.slice(1).join(" ") : undefined),
          sid: gfSid || undefined,
          formId: FORM_SLUG,
          formTitle: FORM_TITLE,
          idempotencyKey: gfStr(data.meta_event_id),
          leadQuestions: {
            is_legal_owner: gfStr(data.isLegalOwner),
            listed_on_market: gfStr(data.listedOnMarket),
            property_type: gfStr(data.propertyType),
            timeline: gfStr(data.timeline),
            asking_price: gfStr(data.askingPrice),
            condition: gfStr(data.condition),
            reason: gfStr(data.reason),
          },
          data: {
            qualified: payload.qualified === true,
            lead_score: payload.lead_score,
            lead_quality: payload.lead_quality,
            meta_event_id: data.meta_event_id,
            meta_event_name: payload.meta_event_name,
            meta_value: payload.meta_value,
            address: data.address,
            state: data.state,
            city: data.city,
            county: data.county,
            utm_source: data.utm_source,
            utm_medium: data.utm_medium,
            utm_campaign: data.utm_campaign,
            utm_content: data.utm_content,
            utm_term: data.utm_term,
            fbclid: data.fbclid,
            gclid: data.gclid,
            msclkid: data.msclkid,
            ttclid: data.ttclid,
            referrer: data.referrer,
            landing_page: data.landing_page,
          },
        }
        await fetch(`https://app.gofunnel.ai/api/v2/webhooks/external?credential_id=${GF_CREDENTIAL_ID}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${GF_BEARER}` },
          body: JSON.stringify(gfPayload),
        }).catch(() => {})
      }
    } catch {}

    return NextResponse.json({ success: true, ...dmResponse })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}