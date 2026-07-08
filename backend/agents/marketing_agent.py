"""
agents/marketing_agent.py — Marketing Agent.

Responsibility: Business profile generation (digital visiting card copy),
WhatsApp/social media promotional captions and poster text, local SEO copy,
customer engagement and retention strategies.

RAG-backed: Yes
Knowledge base: marketing/
  - Business_Profile_Writing_Guide.pdf
  - Promotional_Content_Local_SEO.pdf
  - Customer_Engagement_Retention.pdf
"""
from agents.base_agent import BaseAgent

_MOCK_RESPONSE = """**Marketing & Promotional Content**

Here is a complete marketing starter kit for your fruit vending business:

---

**📇 Digital Business Profile (for WhatsApp / Google Business)**

> **Fresh Fruit Corner — Camp, Pune**
> 🍎 Farm-fresh fruits daily | Seasonal & exotic varieties
> 📍 Near [your landmark], Camp Area, Pune – 411001
> ⏰ Open: 7 AM – 9 PM | Mon–Sun
> 📞 [Your phone number]
> 💳 UPI / Cash accepted
> *"We bring the farm to your doorstep — freshness guaranteed or we replace it."*

---

**📢 WhatsApp Promo Caption (Gujarati/Marathi tone — adapt as needed)**

> 🥭 आज का खास ऑफर! 🥭
> ताज़े अल्फांसो आम — ₹80/kg (मंडी से सीधे)
> आज शाम 6 बजे तक स्टॉक सीमित है।
> Camp area, Pune में ₹50 से ऊपर की खरीद पर FREE home delivery! 🛵
> Call/WhatsApp: [your number]

*(English version below)*
> 🥭 Fresh Alphonso Mangoes — ₹80/kg today only!
> Direct from Ratnagiri. Limited stock till 6 PM.
> Free delivery in Camp area on orders above ₹50.

---

**🔍 Local SEO Tips**

1. **Google Business keywords** to add in your description:
   - "fresh fruit shop camp pune"
   - "fruit vendor near cantonment pune"
   - "buy mangoes online pune delivery"

2. **Post weekly on Google Business** — even a phone photo of today's fruits ranks you higher.

3. **Get 5 reviews quickly**: Ask 5 regular customers to search your business on Google Maps and leave a star rating. Even 5 reviews puts you in the local pack.

4. **Add your stall to Justdial & IndiaMART** (free basic listing) — both rank well in Google searches.

---

**💬 Customer Engagement & Retention**

| Strategy | How to do it | Cost |
|---|---|---|
| WhatsApp Broadcast List | Add regular customers; send daily offers at 7 AM | Free |
| Loyalty punch card | Paper card: Buy 10 kg, get 1 kg free | ₹5/card |
| Referral offer | "Refer a friend → both get ₹10 off" | Zero cost |
| Morning freshness guarantee | "Bought this morning — guarantee freshness or full refund" | Zero cost |
| Seasonal bundles | Fruit basket for ₹199 — photogenic, WhatsApp-shareable | Low cost |

---

*All content is AI-generated. Customise names, prices, and timings before using.*"""


class MarketingAgent(BaseAgent):
    NAME = "Marketing Agent"
    COLLECTION_NAME = "marketing"
    SYSTEM_PROMPT = """You are not being used for a coding task — respond only in plain natural language for a street vendor audience, no code blocks or technical formatting.

You are the Marketing Agent for the Street Vendor Digitalization platform.

Your role is to help street vendors build digital visibility and customer engagement by generating:
- A short, shareable digital business profile (name, tagline, location, UPI/contact)
- WhatsApp promotional captions and broadcast messages (localised tone)
- Google Business Profile description copy optimised for local SEO
- Promotional poster text (short, punchy, high-contrast for phone printing)
- Customer engagement strategies: loyalty cards, referral offers, WhatsApp broadcasts
- Local SEO checklist: keywords, Google Business posting cadence, review acquisition

Guidelines:
- Generate READY-TO-USE copy — not templates with [placeholder] blocks.
  Use generic but realistic placeholder values that the vendor can easily edit.
- Tailor tone to the vendor's category and city where given.
- WhatsApp captions should be short (max 5 lines), emoji-appropriate, and shareable.
- Business profile: include name, tagline, location, hours, accepted payments.
- Local SEO: focus on free channels (Google Business, Justdial, IndiaMART).
- Do NOT recommend paid advertising unless the vendor explicitly asks.
- Keep suggested prices, offers, and claims realistic and conservative."""

    def run(self, query: str, context=None):
        from config import Config
        if Config.USE_MOCK:
            return {"agent": self.NAME, "response": _MOCK_RESPONSE}
        return super().run(query=query, context=context)
