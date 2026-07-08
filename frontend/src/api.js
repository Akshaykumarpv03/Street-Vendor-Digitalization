/**
 * src/api.js — fetch wrapper for the Flask backend.
 *
 * Set VITE_USE_MOCK=true in frontend/.env (or .env.local) to return
 * mock data without hitting the backend — lets the UI run standalone.
 *
 * Set VITE_API_BASE_URL to override the default backend URL.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ── Mock response ─────────────────────────────────────────────────────────────
const MOCK_RESPONSE = {
  category: "fruit vendor",
  location: "Pune, Camp area",
  language: "en",
  translated: false,
  sections: {
    policy_scheme: `**Policy & Scheme Recommendations**

**1. PM SVANidhi Scheme**
- Working capital loan of ₹10,000 (extendable to ₹20,000 and ₹50,000)
- 7% interest subsidy credited to your bank account
- Apply at pmsvanidhi.mohua.gov.in or your nearest ULB office
- Required: Vending Certificate or Town Vending Committee recommendation letter

**2. Udyam Registration (MSME)**
- Free online registration at udyamregistration.gov.in
- Documents: Aadhaar + PAN card
- Benefits: priority lending, subsidy access, government contract eligibility

**3. Vending Licence**
- Mandatory under the Street Vendors Act 2014
- Apply at your Municipal Corporation — protects you from eviction`,

    market_insights: `**Market Insights & Pricing**

**Pricing Strategy**
- Cost-plus: mandi price + transport + 25–35% margin
- Example: Mangoes at ₹40/kg wholesale → sell at ₹52–54/kg

**Camp Area Demand Patterns**
- Morning (7–10 AM): office commuters — stock bananas, apples, oranges
- Evening (5–8 PM): families — offer bulk deals (₹100 / 1 kg mixed fruit)
- Weekend demand spikes 30–40% — stock up on Thursdays

**Seasonal Tips**
- Apr–Jun: Alphonso mangoes — peak season, highest footfall
- Jul–Sep: pomegranates and papayas — lower spoilage in monsoon
- Nov–Feb: Strawberries from Mahabaleshwar fetch premium prices`,

    upi_guide: `**UPI & Digital Payments Setup**

**Step 1 — Merchant UPI QR (Free)**
1. Download PhonePe for Business / Google Pay for Business
2. Register with your bank-linked mobile number
3. Select "Merchant" account type and enter your shop name
4. Print the generated QR on a laminated A5 sheet

**Step 2 — Google Business Profile**
1. Visit business.google.com
2. Add your business: name, category (Fruit Shop), Camp area address
3. Verify via phone call
4. Add stall photos — boosts discovery by 35%

**Step 3 — ONDC Seller**
- Register on Meesho or myStore — connected to the government's ONDC network
- List products with photos and pricing
- Orders arrive in-app; hand to delivery partner`,

    marketing: `**Marketing & Promotional Content**

**Digital Business Profile**
> Fresh Fruit Corner — Camp, Pune
> 🍎 Farm-fresh fruits daily | Seasonal & exotic varieties
> 📍 Near MG Road, Camp Area, Pune 411001
> ⏰ 7 AM – 9 PM | Mon–Sun | UPI / Cash accepted

**WhatsApp Caption**
> 🥭 Fresh Alphonso Mangoes — ₹80/kg today only!
> Direct from Ratnagiri. Limited stock till 6 PM.
> Free delivery in Camp area on orders above ₹50.

**Local SEO Tips**
1. Add keywords to Google Business: "fresh fruit shop camp pune"
2. Post a phone photo of today's fruits weekly
3. Ask 5 regulars to leave a Google Maps review`,
  },
};

// ── API calls ─────────────────────────────────────────────────────────────────

/**
 * POST /api/query — main orchestrator call.
 * @param {string} message  vendor's free-text input
 * @param {string} language ISO 639-1 language code (default "en")
 * @returns {Promise<object>} structured response from the orchestrator
 */
export async function queryOrchestrator(message, language = "en") {
  if (USE_MOCK) {
    // Simulate a short network delay for a realistic demo feel
    await new Promise((r) => setTimeout(r, 900));
    return { ...MOCK_RESPONSE, language };
  }

  const resp = await fetch(`${API_BASE}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${resp.status}`);
  }

  return resp.json();
}

/**
 * GET /api/health — liveness probe.
 */
export async function checkHealth() {
  if (USE_MOCK) return { status: "ok", mock_mode: true };

  const resp = await fetch(`${API_BASE}/api/health`);
  return resp.json();
}
