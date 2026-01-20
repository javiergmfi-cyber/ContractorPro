# ContractorPro Hybrid Specification
**Version:** 1.0
**Date:** January 19, 2026
**Status:** Approved for Implementation

---

## Core Philosophy: "Cash Flow Engine"

The app's identity pivots from "Voice-First Tool" to "Cash Flow Engine."
**North Star Metric:** Time to Payment

### The Three Rules
1. **Scoreboard Rule:** Home screen ALWAYS shows "Cash Collected This Month" in big green numbers (dopamine hit)
2. **Action Stream Rule:** Home screen NEVER shows generic history. Only actionable items (drafts, overdue, deposits)
3. **Living Document Rule:** One Invoice object morphs through payment states (not separate Estimates/Invoices)

---

## Navigation Architecture

| Tab | Name | Icon | Color | Notes |
|-----|------|------|-------|-------|
| 1 | Home | Home | Active: #00D632 | Header: "Business Health" |
| 2 | Invoices | FileText | Inactive: Slate 400 | Filters: All \| Unpaid \| Drafts |
| 3 | Clients | Users | | Sort: Owes Most Money (desc) |
| 4 | Business | User | | Settings, Stripe, Branding |

### Tab Bar Style
- **Background:** Glassmorphism (BlurView)
- **Active Color:** Green (#00D632)
- **Inactive Color:** Slate 400

### Create Button
- **Location:** Big orb centered on Home screen
- **Interaction:** "Hold to Speak • Tap to Type"
- **Style:** Pulsing animation to invite interaction

---

## Screen Specifications

### Home Screen (`index.tsx`)

#### Layout (Top to Bottom)
1. **Header**
   - Subtitle: "Business Health"
   - Title: "Overview" (or date-based: "January 2026")

2. **Hero Scoreboard**
   - **Primary:** "Cash Collected This Month" - Large green number (#00D632)
   - **Secondary:** "Outstanding" - Smaller, orange (#FF9500), below primary

3. **Action Stream**
   - Filter: `status IN ['draft', 'overdue', 'deposit_pending']`
   - Sort: `updated_at` DESC (newest first)
   - Card UI: Client Name + Status Badge + Primary CTA ("Finish", "Chase", "Send")
   - Empty State: "All caught up! Go make money."

4. **Revenue Hook** (if outstanding > 0)
   - Dark card: "Recover this money faster? Enable Auto-Chase."

5. **Create Orb**
   - Centered, pulsing
   - "Hold to Speak • Tap to Type"

#### Celebration Animation
- On payment received: Subtle green glow pulse on the Collected number
- Duration: ~1.5 seconds

---

### Invoices Screen (`invoices.tsx`)

#### Layout
1. **Segmented Control:** `[ All | Unpaid | Drafts ]`
2. **Invoice Cards** (Wallet Pass style)
   - White background
   - `shadow-sm`, `rounded-xl`
   - Client Name + Amount + Status Badge
   - **Viewed Indicator:** Eye icon if `viewed_at` exists
     - Pro users: Full visibility
     - Free users: Eye icon is blurred (upsell trigger)

---

### Clients Screen (`clients.tsx`)
- **Default Sort:** Outstanding Balance (descending) - "Owes Most Money"
- Already implemented, no changes needed

---

### Business Screen (`profile.tsx`)
- **Rename:** "Profile" → "Business"
- **Sections:**
  1. Look Professional (Logo, Branding)
  2. Get Paid (Stripe Connect, Payment Methods)
  3. Automations (Auto-Chase settings) - Pro Only
  4. Taxes (Export)
  5. Support

---

## Living Document Model

### The Concept
One `Invoice` object morphs through states via `payment_state`:

| State | UI Label | Primary Button | Description |
|-------|----------|----------------|-------------|
| `draft` | DRAFT | "Send" | Not yet sent to client |
| `deposit_pending` | ESTIMATE | "Pay Deposit" | Sent, awaiting deposit |
| `deposit_paid` | INVOICE | "Pay Balance" | Deposit received, work in progress |
| `fully_paid` | RECEIPT | "Download" | Fully paid |

### Auto-Convert Logic
On `payment_intent.succeeded` webhook:
```
IF amount_received < total_amount:
  - Keep same Invoice ID (don't create new)
  - Update: payment_state = 'deposit_paid'
  - Send "Work Starting" email to both parties

IF amount_received >= total_amount:
  - Update: payment_state = 'fully_paid'
  - Trigger Instant Reputation Loop
```

### Signature Capture
- **Location:** Above "Pay Deposit" button on client payment page
- **Component:** Signature box (canvas)
- **Legal Text:** "By paying this deposit, I agree to the terms above."
- **Why:** The deposit = binding contract

### Draft Protection
- Add `published_at` timestamp to Invoice model
- If client accesses link before `published_at` is set:
  - Show: "Document is being prepared" screen
  - Prevents accidental early payments

**Mantra:** "The Deposit is the Contract."

---

## Fee Model: "Smart Fee Passing"

### The Math
- **Card Rate:** 3.5% (labeled "Card Processing")
- **Breakdown:** ~2.9% Stripe + 0.5% Platform
- **Never call it:** "App Fee" or "Service Fee"

### Pro Gate Logic

| User Type | Client Pays | Contractor Gets | Who Eats Fee |
|-----------|-------------|-----------------|--------------|
| FREE | $1,000 | ~$965 | Contractor |
| PRO | $1,035 | $1,000 | Client |

**Upsell Trigger (Free users):**
"Stop losing $35 on this job. Upgrade to Pro to pass fees to the client."

### ACH Strategy

| Invoice Amount | ACH Visible? | ACH Fee |
|----------------|--------------|---------|
| < $2,500 | **Hidden** | N/A |
| >= $2,500 | Small link | $10 flat |

### Client Payment UI

```
┌─────────────────────────────────────┐
│          INVOICE TOTAL              │
│            $1,000.00                │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  💳 Pay Now with Card       │    │  ← Big green button
│  │     Instant • Earn Points   │    │
│  │     3.5% processing fee     │    │
│  └─────────────────────────────┘    │
│                                     │
│   Need to pay via bank transfer?    │  ← Small grey text link
│                                     │
└─────────────────────────────────────┘
```

### ACH Warning Modal
When client clicks bank transfer link:
```
⚠️ Bank Transfers take 5-7 Business Days

Your project start date may be delayed until funds clear.

[ Go Back & Pay with Card (Instant) ]
[ Continue to Bank Transfer ]
```

### Stripe Implementation
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalCharge, // $1,035.00 (includes 3.5%)
  currency: 'usd',
  application_fee_amount: totalCharge - invoiceAmount, // Platform takes $35
  transfer_data: {
    destination: contractorStripeAccountId, // Contractor gets exactly $1,000
  },
});
```

---

## Instant Reputation Loop

### Trigger
Immediately after final balance payment success animation.

### Flow
```
┌─────────────────────────────────────┐
│                                     │
│   "Happy with Javier's work?"       │
│                                     │
│        ⭐ ⭐ ⭐ ⭐ ⭐               │
│                                     │
└─────────────────────────────────────┘
```

### Logic
| Stars | Action |
|-------|--------|
| 5 | Deep link to contractor's Google My Business → public review |
| 4 | Ask "Would you recommend?" → If yes, GMB. If no, private form |
| 1-3 | Private feedback form (protects from public bad review) |

### Why This Wins
- Contractors never ask for reviews
- 5-star reviews happen at peak satisfaction (just paid)
- Bad experiences stay private
- **Value prop:** "We're not just billing—we're your marketing agency."

---

## Features Summary

### Pro Features
- **Auto-Chase:** Automated payment reminders
- **Read Receipts:** See when clients view invoices
- **Smart Fee Passing:** Pass processing fees to client
- **Instant Payouts:** 24-hour payouts (vs 3-day)
- **Custom Branding:** Logo on invoices
- **Export:** QuickBooks/CSV export

### Free Features
- Voice invoice creation
- Basic invoicing
- Stripe payments (contractor absorbs fees)
- Client management

---

## Build Order

### Phase 1: Navigation + Home Screen
1. Refactor `_layout.tsx` - tab names, icons, glassmorphism
2. Rewrite `index.tsx` - Scoreboard + Action Stream
3. Add celebration animation

### Phase 2: Fee Logic
1. Update Stripe Edge Functions
2. Implement Smart Fee Passing
3. ACH threshold logic
4. Client payment UI redesign

### Phase 3: Living Document
1. Add `payment_state` to Invoice model
2. Add `published_at`, `signature_url` fields
3. Update webhooks for auto-convert
4. Build signature capture component

### Phase 4: Reputation Loop
1. Post-payment review prompt
2. GMB deep link integration
3. Private feedback form

---

## Database Schema Changes

```sql
-- Add to invoices table
ALTER TABLE invoices ADD COLUMN payment_state TEXT DEFAULT 'draft';
-- Values: 'draft', 'deposit_pending', 'deposit_paid', 'fully_paid'

ALTER TABLE invoices ADD COLUMN published_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN signature_url TEXT;
ALTER TABLE invoices ADD COLUMN deposit_amount INTEGER; -- cents
ALTER TABLE invoices ADD COLUMN deposit_paid_at TIMESTAMPTZ;
```

---

## Success Metrics

1. **Time to First Invoice:** < 60 seconds
2. **Payment Collection Rate:** > 85% within 7 days
3. **Pro Conversion:** > 5% of active users
4. **Review Generation:** > 20% of completed jobs get 5-star prompt
5. **ACH Usage:** < 10% of transactions (card preferred)

---

*Spec approved for implementation. Start with Phase 1.*
