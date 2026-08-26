"use client"

import { useState, useRef, useEffect } from "react"
import { Home, ArrowRight, ArrowLeft, ArrowDown, Check, XCircle, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { captureTrackingData, getIPAddress } from "@/lib/tracking"
import { Input } from "@/components/ui/input"
import { AddressAutocomplete, type AddressDetails } from "./address-autocomplete"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SurveyData {
  address: string
  propertyType: string
  isLegalOwner: string
  listedOnMarket: string
  timeline: string
  condition: string
  reason: string
  name: string
  email: string
  phone: string
}

const PROPERTY_TYPE_OPTIONS = [
  { id: "single-family", label: "Single Family Home" },
  { id: "multi-family", label: "Multi-Family (Duplex, Triplex, etc.)" },
  { id: "condo-townhouse", label: "Condo / Townhouse" },
  { id: "mobile-home", label: "Mobile / Manufactured Home" },
  { id: "land", label: "Vacant Land / Lot" },
  { id: "other", label: "Other" },
]

const LEGAL_OWNER_OPTIONS = [
  { id: "yes-owner", label: "Yes, I am the legal homeowner" },
  { id: "yes-family", label: "Yes, I am a family member with the legal right to sell" },
  { id: "no", label: "No, I am not" },
]

const LISTED_OPTIONS = [
  { id: "not-listed", label: "No, it is not listed" },
  { id: "listed-realtor", label: "Yes, listed with a realtor" },
  { id: "listed-fsbo", label: "Yes, listed for sale by owner" },
]

const TIMELINE_OPTIONS = [
  { id: "asap", label: "ASAP (Within 7 days)" },
  { id: "2-weeks", label: "Within 2 weeks" },
  { id: "30-days", label: "Within 30 days" },
  { id: "60-days", label: "Within 60 days" },
  { id: "flexible", label: "I'm flexible" },
]

const CONDITION_OPTIONS = [
  { id: "excellent", label: "Excellent - Move-in ready" },
  { id: "good", label: "Good - Minor repairs needed" },
  { id: "fair", label: "Fair - Needs some work" },
  { id: "poor", label: "Poor - Major repairs needed" },
  { id: "distressed", label: "Distressed - Significant issues" },
]

const REASON_OPTIONS = [
  { id: "foreclosure", label: "Facing foreclosure" },
  { id: "behind-payments", label: "Behind on payments" },
  { id: "inherited", label: "Inherited property" },
  { id: "divorce", label: "Divorce or separation" },
  { id: "relocation", label: "Job relocation" },
  { id: "downsizing", label: "Downsizing" },
  { id: "repairs", label: "Can't afford repairs" },
  { id: "other", label: "Other" },
]

// ─── Lead scoring (browser-side, no n8n changes) ───────────────────────
const SCORE_TIMELINE: Record<string, number> = {
  'asap': 3, '2-weeks': 2, '30-days': 1, '60-days': 0, 'flexible': 0,
}
const SCORE_REASON: Record<string, number> = {
  'foreclosure': 3, 'behind-payments': 3,
  'inherited': 2, 'repairs': 2,
  'other': 1,
  'relocation': 0, 'divorce': 0, 'downsizing': 0,
}
const SCORE_CONDITION: Record<string, number> = {
  'poor': 1, 'distressed': 1,
  'fair': 0, 'good': 0, 'excellent': 0,
}
function calculateLeadScore(d: SurveyData): number {
  const t = SCORE_TIMELINE[d.timeline] ?? 0
  const r = SCORE_REASON[d.reason] ?? 0
  const c = SCORE_CONDITION[d.condition] ?? 0
  return Math.min(10, t + r + c)
}
function isQualifiedForMeta(d: SurveyData): boolean {
  const okType = d.propertyType === 'single-family' || d.propertyType === 'multi-family'
  const okListed = d.listedOnMarket === 'not-listed'
  const okOwner = d.isLegalOwner !== 'no'
  return okType && okListed && okOwner
}
function leadQuality(score: number): 'premium' | 'standard' | 'low' {
  if (score >= 6) return 'premium'
  if (score >= 2) return 'standard'
  return 'low'
}
function disqualifyReasonFor(d: SurveyData): string {
  if (d.propertyType !== 'single-family' && d.propertyType !== 'multi-family') return 'property_type'
  if (d.listedOnMarket !== 'not-listed') return 'listed'
  if (d.isLegalOwner === 'no') return 'not_owner'
  return 'unknown'
}
// ──────────────────────────────────────────────────────────────────────

// Service area states
const SERVICE_AREA_STATES = ["UT"]

// Check if address is in service area
const isInServiceArea = (state: string | undefined): boolean => {
  if (!state) return false
  SERVICE_AREA_STATES.includes(state.toUpperCase())
}

// Valid US area codes
const VALID_AREA_CODES = new Set(["201","202","203","205","206","207","208","209","210","212","213","214","215","216","217","218","219","220","223","224","225","228","229","231","234","239","240","248","251","252","253","254","256","260","262","267","269","270","272","276","279","281","301","302","303","304","305","307","308","309","310","312","313","314","315","316","317","318","319","320","321","323","325","326","327","330","331","332","334","336","337","339","340","341","346","347","351","352","360","361","364","380","385","386","401","402","404","405","406","407","408","409","410","412","413","414","415","417","419","423","424","425","430","432","434","435","440","442","443","445","447","448","458","463","469","470","475","478","479","480","484","501","502","503","504","505","507","508","509","510","512","513","515","516","517","518","520","530","531","534","539","540","541","551","559","561","562","563","564","567","570","571","573","574","575","580","585","586","601","602","603","605","606","607","608","609","610","612","614","615","616","617","618","619","620","623","626","628","629","630","631","636","641","646","650","651","657","659","660","661","662","667","669","678","680","681","682","689","701","702","703","704","706","707","708","712","713","714","715","716","717","718","719","720","724","725","726","727","728","731","732","734","737","740","743","747","754","757","760","762","763","765","769","770","772","773","774","775","779","781","785","786","801","802","803","804","805","806","808","810","812","813","814","815","816","817","818","820","828","830","831","832","838","843","845","847","848","850","854","856","857","858","859","860","862","863","864","865","870","872","878","901","903","904","906","907","908","909","910","912","913","914","915","916","917","918","919","920","925","928","929","930","931","934","936","937","938","940","941","943","947","949","951","952","954","956","959","970","971","972","973","978","979","980","984","985","989"])

// Disposable email domains
const DISPOSABLE_DOMAINS = new Set(["mailinator.com","guerrillamail.com","tempmail.com","throwaway.email","yopmail.com","sharklasers.com","guerrillamail.info","grr.la","guerrillamail.biz","guerrillamail.de","guerrillamail.net","guerrillamail.org","spam4.me","trashmail.com","trashmail.me","trashmail.net","mytemp.email","mohmal.com","tempail.com","dispostable.com","maildrop.cc","10minutemail.com","temp-mail.org","fakeinbox.com","mailnesia.com","getnada.com","emailondeck.com","33mail.com","harakirimail.com","jetable.org","meltmail.com","mailcatch.com","tempinbox.com","spamgourmet.com","mailexpire.com","incognitomail.org","getairmail.com","mailnull.com","safeemail.xyz","tempmailo.com","burnermail.io"])

// Profanity / spam word list
const BLOCKED_WORDS = new Set(["fuck","shit","ass","damn","bitch","bastard","dick","cock","pussy","cunt","whore","slut","fag","nigger","nigga","retard","penis","vagina","anus","dildo","porn","xxx","viagra","cialis","casino","bitcoin","crypto","forex","mlm","scam","spam","test123","asdf","qwerty","aaaaaa","zzzzzz","abcdef","123456"])

// Format phone as (XXX) XXX-XXXX
function formatPhoneNumber(value: string): string {
  let digits = value.replace(/\D/g, "")
  if (digits.startsWith("1")) digits = digits.slice(1)
  if (digits.length > 10) digits = digits.slice(0, 10)
  if (digits.length === 0) return ""
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

// Validate US phone number
function validatePhone(phone: string): { valid: boolean; msg: string } {
  const digits = phone.replace(/\D/g, "").replace(/^1/, "")
  if (digits.length !== 10) return { valid: false, msg: "Please enter a valid 10-digit US phone number." }
  const area = digits.slice(0, 3)
  if (!VALID_AREA_CODES.has(area)) return { valid: false, msg: `Area code (${area}) doesn't appear to be valid.` }
  if (/^(\d)\1{9}$/.test(digits)) return { valid: false, msg: "Please enter a real phone number." }
  if (["1234567890", "0123456789", "9876543210"].includes(digits)) return { valid: false, msg: "Please enter a real phone number." }
  const exchange = digits.slice(3, 6)
  if (exchange === "555") return { valid: false, msg: "Please enter a real phone number, not a 555 number." }
  if (exchange.startsWith("0") || exchange.startsWith("1")) return { valid: false, msg: "That doesn't look like a valid phone number." }
  return { valid: true, msg: "" }
}

// Validate email
function validateEmail(email: string): { valid: boolean; msg: string } {
  if (!email || email.trim() === "") return { valid: false, msg: "Email is required." }
  const e = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { valid: false, msg: "Please enter a valid email address." }
  const domain = e.split("@")[1]
  if (DISPOSABLE_DOMAINS.has(domain)) return { valid: false, msg: "Please use a real email address, not a temporary one." }
  const fakePatterns = ["test@test", "fake@fake", "asdf@asdf", "noemail@", "spam@", "junk@", "nobody@nobody", "aaa@aaa", "abc@abc", "example@example"]
  for (const pattern of fakePatterns) {
    if (e.startsWith(pattern)) return { valid: false, msg: "Please enter your real email address." }
  }
  // Check for profanity in email (local part and domain)
  const emailParts = e.replace("@", " ").replace(/\./g, " ").split(/\s+/)
  for (const part of emailParts) {
    if (BLOCKED_WORDS.has(part)) return { valid: false, msg: "Please enter a valid email address." }
  }
  // Also check if any blocked word appears as a substring in the local part or domain name
  const localPart = e.split("@")[0]
  const domainName = domain.split(".")[0]
  for (const word of BLOCKED_WORDS) {
    if (word.length >= 4 && (localPart.includes(word) || domainName.includes(word))) {
      return { valid: false, msg: "Please enter a valid email address." }
    }
  }
  return { valid: true, msg: "" }
}

// Validate name (no profanity, must look like a real name)
function validateName(name: string): { valid: boolean; msg: string } {
  const trimmed = name.trim()
  if (!trimmed) return { valid: false, msg: "Name is required." }
  if (trimmed.length < 2) return { valid: false, msg: "Please enter your full name." }
  const words = trimmed.toLowerCase().split(/\s+/)
  for (const word of words) {
    if (BLOCKED_WORDS.has(word)) return { valid: false, msg: "Please enter your real name." }
  }
  if (/(.)\1{4,}/.test(trimmed)) return { valid: false, msg: "Please enter your real name." }
  if (/^\d+$/.test(trimmed)) return { valid: false, msg: "Please enter your real name, not a number." }
  return { valid: true, msg: "" }
}

export function SurveyCard() {
  const [step, setStep] = useState(1)
  const [surveyData, setSurveyData] = useState<SurveyData>({
    address: "",
    propertyType: "",
    isLegalOwner: "",
    listedOnMarket: "",
    timeline: "",
    condition: "",
    reason: "",
    name: "",
    email: "",
    phone: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isDisqualified, setIsDisqualified] = useState(false)
  const [disqualifyReason, setDisqualifyReason] = useState("")
  // Track if address was selected from Google autocomplete (not just typed)
  const [addressVerified, setAddressVerified] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const formStartTime = useRef<number>(Date.now())
  // Tracking data (UTMs, click IDs, IP)
  const trackingRef = useRef(captureTrackingData())
  useEffect(() => {
    getIPAddress().then((ip) => { trackingRef.current.ip = ip })
  }, [])
  // Honeypot field for spam prevention
  const [honeypot, setHoneypot] = useState("")
  // Out of service area popup
  const [showOutOfAreaPopup, setShowOutOfAreaPopup] = useState(false)
  const [selectedState, setSelectedState] = useState("")

  const totalSteps = 8

  const handleNext = async () => {
    if (step === 8) {
      // Validate contact info before submitting
      const errors: {[key: string]: string} = {}

      const nameCheck = validateName(surveyData.name)
      if (!nameCheck.valid) errors.name = nameCheck.msg

      const emailCheck = validateEmail(surveyData.email)
      if (!emailCheck.valid) errors.email = emailCheck.msg

      const phoneCheck = validatePhone(surveyData.phone)
      if (!phoneCheck.valid) errors.phone = phoneCheck.msg
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        return
      }
      
      // Spam prevention: check if form was filled too quickly (less than 3 seconds)
      const timeSpent = Date.now() - formStartTime.current
      if (timeSpent < 3000) {
        // Silently reject likely bot submission
        setIsSubmitted(true)
        return
      }
      
      // Spam prevention: check honeypot field
      if (honeypot) {
        // Silently reject bot submission
        setIsSubmitted(true)
        return
      }
      
      setIsSubmitting(true)

      // Submit to webhook
      try {
        const nameParts = surveyData.name.trim().split(/\s+/)
        const score = calculateLeadScore(surveyData)
        const quality = leadQuality(score)
        const qualified = isQualifiedForMeta(surveyData)
        const dqReason = qualified ? null : disqualifyReasonFor(surveyData)
        const eventId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
        const payload = {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          name: surveyData.name,
          email: surveyData.email,
          phone: surveyData.phone,
          address: surveyData.address,
          propertyType: surveyData.propertyType,
          isLegalOwner: surveyData.isLegalOwner,
          condition: surveyData.condition,
          timeline: surveyData.timeline,
          reason: surveyData.reason,
          source: process.env.NEXT_PUBLIC_LEAD_SOURCE || '1-800 Buys Houses - Survey',
          submittedAt: new Date().toISOString(),
          qualified,
          lead_score: score,
          lead_quality: quality,
          disqualify_reason: dqReason,
          meta_event_id: eventId,
          meta_event_name: qualified ? 'Lead' : 'LeadLowIntent',
          meta_value: qualified ? score * 25 : 0,
          ...trackingRef.current,
        }
                // Fire weighted Meta Pixel event (browser-side; CAPI is a separate later phase)
        if (typeof window !== 'undefined' && (window as { fbq?: (...args: unknown[]) => void }).fbq) {
          const fbq = (window as { fbq: (...args: unknown[]) => void }).fbq
          if (qualified) {
            fbq('track', 'Lead', {
              value: score * 25, currency: 'USD',
              content_name: '1800 Buys Houses SLC Survey', content_category: 'real_estate',
              lead_score: score, lead_quality: quality,
            }, { eventID: eventId })
          } else {
            fbq('trackCustom', 'LeadLowIntent', {
              content_name: '1800 Buys Houses SLC Survey', content_category: 'real_estate',
              disqualify_reason: dqReason, lead_score: score,
            }, { eventID: eventId })
          }
        }
        await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (e) {
        // Continue to thank-you even if webhook fails
      }

      // Redirect to thank-you page
      window.location.href = '/thank-you'
    } else if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return surveyData.address.trim().length > 0 && addressVerified
      case 2:
        return surveyData.propertyType !== ""
      case 3:
        return surveyData.isLegalOwner !== ""
      case 4:
        return surveyData.listedOnMarket !== ""
      case 5:
        return surveyData.timeline !== ""
      case 6:
        return surveyData.condition !== ""
      case 7:
        return surveyData.reason !== ""
      case 8:
        return (
          surveyData.name.trim().length > 0 &&
          surveyData.email.trim().length > 0 &&
          surveyData.phone.trim().length > 0
        )
      default:
        return false
    }
  }

  const handleOptionSelect = (field: keyof SurveyData, value: string) => {
    setSurveyData({ ...surveyData, [field]: value })
    
    // Check for disqualification on property type
    if (field === "propertyType" && ["mobile-home", "land", "other"].includes(value)) {
      setTimeout(() => {
        setDisqualifyReason("propertyType")
        setIsDisqualified(true)
      }, 300)
      return
    }

    // Check for disqualification on listed on market
    if (field === "listedOnMarket" && ["listed-realtor", "listed-fsbo"].includes(value)) {
      setTimeout(() => {
        setDisqualifyReason("listed")
        setIsDisqualified(true)
      }, 300)
      return
    }

    // Check for disqualification on legal owner question
    if (field === "isLegalOwner" && value === "no") {
      setTimeout(() => {
        setDisqualifyReason("notOwner")
        setIsDisqualified(true)
      }, 300)
      return
    }
    
    // Auto-advance to next step after selection
    setTimeout(() => {
      if (step < totalSteps) {
        setStep(step + 1)
      }
    }, 300)
  }

  const handleAddressSelect = (address: string, details: AddressDetails) => {
    setSurveyData({ ...surveyData, address })
    setAddressVerified(true)
    
    // Check if address is in service area
    if (!isInServiceArea(details.state)) {
      setSelectedState(details.state || "Unknown")
      setShowOutOfAreaPopup(true)
      return
    }
    
    // Auto-advance to next step after address selection (only if in Salt Lake City, UT area)
    setTimeout(() => {
      setStep(2)
    }, 300)
  }

  const renderOptionButton = (
    option: { id: string; label: string },
    selectedValue: string,
    field: keyof SurveyData
  ) => (
    <button
      key={option.id}
      onClick={() => handleOptionSelect(field, option.id)}
      className={`w-full rounded-xl border px-4 py-3.5 text-left text-base font-medium transition-all ${
        selectedValue === option.id
          ? "border-[#0891b2] bg-[#0891b2]/10 text-gray-900"
          : "border-gray-200 bg-white text-gray-700 hover:border-[#0891b2]/50 hover:bg-gray-50"
      }`}
    >
      {option.label}
    </button>
  )

  // Disqualified state
  if (isDisqualified) {
    const disqualifyMessages: Record<string, { title: string; message: string; detail: string }> = {
      notOwner: {
        title: "We're Unable to Assist",
        message: "Unfortunately, we can only work with individuals who have the legal right to sell the property.",
        detail: "If you believe you have legal authority to sell (such as power of attorney, executor of estate, or court-appointed representative), please contact us directly.",
      },
      listed: {
        title: "We Can't Make an Offer Right Now",
        message: "We're unable to make an offer on properties that are currently listed on the market.",
        detail: "If your listing expires or you decide to take it off the market, we'd love to help. Feel free to reach out to us at that time.",
      },
      propertyType: {
        title: "We're Unable to Assist",
        message: "Unfortunately, we're not able to make an offer on this type of property at this time.",
        detail: "We primarily purchase single-family homes, multi-family properties, and condos/townhouses. If you have a different property you'd like to sell, feel free to reach out.",
      },
    }
    const msg = disqualifyMessages[disqualifyReason] || disqualifyMessages.notOwner

    return (
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{msg.title}</h2>
            <p className="mt-2 text-gray-600">{msg.message}</p>
            <p className="mt-4 text-sm text-gray-500">{msg.detail}</p>
          </div>
          <a
            href="tel:8882984807"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#0891b2] px-6 py-3 text-white hover:bg-[#0e7490] transition-colors"
          >
            Call Us: 1-800-BUY-HOUSES
          </a>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e]/10">
            <Check className="h-7 w-7 text-[#22c55e]" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Thank You, {surveyData.name}!</h2>
            <p className="mt-2 text-gray-600">
              We've received your information and will be in touch shortly with your cash offer.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              One of our team members will call you within 24 hours to discuss your property.
            </p>
          </div>
          <div className="mt-2 rounded-xl bg-gray-50 p-4 text-left w-full">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Your Submission Summary:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Property:</span> {surveyData.address}</p>
              <p><span className="font-medium">Email:</span> {surveyData.email}</p>
              <p><span className="font-medium">Phone:</span> {surveyData.phone}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="flex flex-col gap-5">
        {/* Progress indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-[#0891b2]" />
            <span className="text-sm text-gray-600">Step {step} of {totalSteps}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i < step ? "bg-[#0891b2]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">What's your property address?</h2>
              <p className="mt-1 text-sm text-gray-500">Start typing and select your address from the dropdown.</p>
            </div>
            <div className="flex justify-center -mb-2">
              <ArrowDown className="h-6 w-6 text-[#0891b2] animate-bounce" />
            </div>
            <AddressAutocomplete
              value={surveyData.address}
              onChange={(address) => { setSurveyData({ ...surveyData, address }); setAddressVerified(false) }}
              onSelect={handleAddressSelect}
              placeholder="Start typing your address..."
            />
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full h-14 bg-[#0891b2] text-white text-lg font-semibold rounded-xl hover:bg-[#0e7490] disabled:opacity-40 transition-all shadow-md hover:shadow-lg"
            >
              Get My Cash Offer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Property Type */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">What type of property is it?</h2>
              <p className="mt-1 text-sm text-gray-500">Select the option that best describes your property.</p>
            </div>
            <div className="flex flex-col gap-2">
              {PROPERTY_TYPE_OPTIONS.map((option) =>
                renderOptionButton(option, surveyData.propertyType, "propertyType")
              )}
            </div>
          </div>
        )}

        {/* Step 3: Legal Owner */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Are you the legal homeowner?</h2>
              <p className="mt-1 text-sm text-gray-500">This helps us understand who we'll be working with.</p>
            </div>
            <div className="flex flex-col gap-2">
              {LEGAL_OWNER_OPTIONS.map((option) =>
                renderOptionButton(option, surveyData.isLegalOwner, "isLegalOwner")
              )}
            </div>
          </div>
        )}

        {/* Step 4: Listed on Market */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Is the property currently listed on the market?</h2>
              <p className="mt-1 text-sm text-gray-500">Let us know if the property is currently for sale.</p>
            </div>
            <div className="flex flex-col gap-2">
              {LISTED_OPTIONS.map((option) =>
                renderOptionButton(option, surveyData.listedOnMarket, "listedOnMarket")
              )}
            </div>
          </div>
        )}

        {/* Step 5: Timeline */}
        {step === 5 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">How fast are you looking to sell?</h2>
              <p className="mt-1 text-sm text-gray-500">Select your ideal timeline for closing.</p>
            </div>
            <div className="flex flex-col gap-2">
              {TIMELINE_OPTIONS.map((option) =>
                renderOptionButton(option, surveyData.timeline, "timeline")
              )}
            </div>
          </div>
        )}

        {/* Step 6: Condition */}
        {step === 6 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">What condition is the property in?</h2>
              <p className="mt-1 text-sm text-gray-500">Be honest - we buy houses in any condition.</p>
            </div>
            <div className="flex flex-col gap-2">
              {CONDITION_OPTIONS.map((option) =>
                renderOptionButton(option, surveyData.condition, "condition")
              )}
            </div>
          </div>
        )}

        {/* Step 7: Reason */}
        {step === 7 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">What's your reason for selling?</h2>
              <p className="mt-1 text-sm text-gray-500">This helps us understand your situation better.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {REASON_OPTIONS.map((option) =>
                renderOptionButton(option, surveyData.reason, "reason")
              )}
            </div>
          </div>
        )}

        {/* Step 8: Contact Information */}
        {step === 8 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">How can we reach you?</h2>
              <p className="mt-1 text-sm text-gray-500">We'll use this to send you your cash offer.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <Input
                  placeholder="Your full name"
                  value={surveyData.name}
                  onChange={(e) => {
                    setSurveyData({ ...surveyData, name: e.target.value })
                    setValidationErrors({ ...validationErrors, name: "" })
                  }}
                  className={`h-14 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#0891b2] focus:ring-[#0891b2]/20 ${validationErrors.name ? "border-red-500" : ""}`}
                />
                {validationErrors.name && <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={surveyData.email}
                  onChange={(e) => {
                    setSurveyData({ ...surveyData, email: e.target.value })
                    setValidationErrors({ ...validationErrors, email: "" })
                  }}
                  className={`h-14 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#0891b2] focus:ring-[#0891b2]/20 ${validationErrors.email ? "border-red-500" : ""}`}
                />
                {validationErrors.email && <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>}
              </div>
              <div>
                <Input
                  type="tel"
                  placeholder="(301) 555-0000"
                  value={surveyData.phone}
                  onChange={(e) => {
                    setSurveyData({ ...surveyData, phone: formatPhoneNumber(e.target.value) })
                    setValidationErrors({ ...validationErrors, phone: "" })
                  }}
                  maxLength={14}
                  className={`h-14 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#0891b2] focus:ring-[#0891b2]/20 ${validationErrors.phone ? "border-red-500" : ""}`}
                />
                {validationErrors.phone && <p className="mt-1 text-xs text-red-500">{validationErrors.phone}</p>}
              </div>
              {/* Honeypot field - hidden from users, bots will fill it */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute -left-[9999px] opacity-0 pointer-events-none"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
          </div>
        )}

        {/* Navigation buttons — hidden on step 1 since the big CTA handles it */}
        {step !== 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="bg-[#0891b2] text-white hover:bg-[#0e7490] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Submitting...
              </span>
            ) : (
              <>
                {step === totalSteps ? "Get My Cash Offer" : "Continue"}
                {step !== totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
              </>
            )}
          </Button>
        </div>
        )}
      </div>

      {/* Out of Service Area Popup */}
      <Dialog open={showOutOfAreaPopup} onOpenChange={setShowOutOfAreaPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
              <MapPin className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center text-xl">Outside Our Service Area</DialogTitle>
            <DialogDescription className="text-center pt-2">
              We currently only buy houses in the <strong>DC, Maryland, and Virginia (Salt Lake City, UT)</strong> area and surrounding suburbs.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-600">
              The address you selected appears to be in <strong>{selectedState}</strong>, which is outside our service area.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <Button
              onClick={() => {
                setShowOutOfAreaPopup(false)
                setSurveyData({ ...surveyData, address: "" })
              }}
              className="w-full bg-[#0891b2] text-white hover:bg-[#0e7490]"
            >
              Enter a Different Address
            </Button>
            <p className="text-center text-xs text-gray-500">
              If you believe this is an error, please call us at{" "}
              <a href="tel:8882984807" className="font-medium text-[#0891b2] hover:underline">
                1-800-BUY-HOUSES
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
