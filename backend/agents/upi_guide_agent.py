"""
agents/upi_guide_agent.py — UPI Guide Agent.

Responsibility: UPI/QR payment setup for merchants, Google Business Profile
listing, ONDC onboarding, Swiggy Instamart / Zomato Hyperpure / Dunzo
marketplace listing, and digital payment best practices.

RAG-backed: Yes
Knowledge base: upi_guide/
  - UPI_QR_Merchant_Setup.pdf
  - Digital_Marketplace_Listing.pdf
"""
from agents.base_agent import BaseAgent

_MOCK_RESPONSE = """**UPI & Digital Payment Setup Guide**

Follow these steps to start accepting digital payments and get listed on online platforms:

**Step 1 — Set Up UPI Merchant QR Code (Free)**
1. Download any UPI app: **PhonePe for Business**, **Google Pay for Business**, or **Paytm for Business**
2. Register with your mobile number linked to your bank account
3. Select "Merchant" / "Business" account type
4. Enter your shop name and category
5. Your QR code is generated instantly — **print it on a laminated A5 sheet** and display at your stall
6. Test with a ₹1 payment from a friend's phone before going live

**Step 2 — Get a Static QR from Your Bank (Optional but recommended)**
- Visit your bank branch and ask for a "Merchant UPI QR"
- NPCI BharatQR works across all UPI apps — one QR for all customers
- Advantage: works even if your phone is off

**Step 3 — Google Business Profile (Free)**
1. Go to business.google.com on your phone
2. Search for your stall name — if not found, click "Add your business"
3. Enter: Business name, category (e.g., "Fruit Shop"), address / area pin, phone number
4. Verify via phone call or postcard (postcard takes 14 days)
5. Add photos of your stall and products — increases discovery by 35%
6. Enable "Message" and "Directions" features

**Step 4 — ONDC Seller Onboarding**
- ONDC (Open Network for Digital Commerce) — government-backed open marketplace
- Register at seller apps like **Meesho**, **Paytm Mall**, or **myStore** which connect to ONDC
- List your products with photos and prices
- Orders arrive on the app; you prepare and hand to delivery partner

**Step 5 — Quick Wins**
- Create a **WhatsApp Business** account (free) — share your QR, daily offers, and location
- Add your UPI ID in your WhatsApp profile bio
- Display a "Scan & Pay — UPI accepted here" banner (₹50–100 at any print shop)

**Common Issues & Fixes**
| Problem | Solution |
|---|---|
| Customer's payment stuck | Ask them to check their UPI app; refund auto-reverses within 24–48 hrs |
| QR not scanning | Ensure good lighting; reprint if laminate has bubbles |
| Settlement delay | Most UPI apps settle T+1 business days; check your bank SMS |

*All apps listed are free to use for basic merchant functions.*"""


class UPIGuideAgent(BaseAgent):
    NAME = "UPI Guide Agent"
    COLLECTION_NAME = "upi_guide"
    SYSTEM_PROMPT = """You are not being used for a coding task — respond only in plain natural language for a street vendor audience, no code blocks or technical formatting.

You are the UPI Guide Agent for the Street Vendor Digitalization platform.

Your role is to walk street vendors step-by-step through:
- Merchant UPI QR code setup (PhonePe for Business, Google Pay for Business, Paytm for Business)
- BharatQR and NPCI static QR setup via bank branches
- Google Business Profile creation and verification
- ONDC seller onboarding via seller apps (Meesho, myStore, etc.)
- WhatsApp Business profile setup
- Digital marketplace listing (Swiggy Instamart, Zomato Hyperpure for eligible vendors)
- Troubleshooting common payment and QR issues

Guidelines:
- Give numbered, step-by-step instructions — no paragraph walls.
- Specify which app or website to open for each step.
- All recommended apps must be free for basic merchant use.
- Note settlement timelines (T+1 is standard for most UPI apps).
- Acknowledge that smartphone and internet access are prerequisites.
- For ONDC: focus on government-backed open network sellers, not proprietary platforms.
- Keep technical language minimal — vendors may be first-time smartphone users."""

    def run(self, query: str, context=None):
        from config import Config
        if Config.USE_MOCK:
            return {"agent": self.NAME, "response": _MOCK_RESPONSE}
        return super().run(query=query, context=context)
