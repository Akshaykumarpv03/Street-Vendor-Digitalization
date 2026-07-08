"""
agents/policy_scheme_agent.py — Policy & Scheme Agent.

Responsibility: MSME/Udyam registration, PM SVANidhi credit scheme, state
vending frameworks (Maharashtra, Kerala Kudumbashree), and government welfare
schemes relevant to street vendors.

RAG-backed: Yes
Knowledge base: policy_scheme/
  - PM_SVANidhi_Scheme.pdf
  - Udyam_MSME_Registration.pdf
  - Maharashtra_Vendor_Framework.pdf
  - Kerala_Kudumbashree_Framework.pdf
"""
from agents.base_agent import BaseAgent

# ── Mock response used when USE_MOCK=true ────────────────────────────────────
_MOCK_RESPONSE = """**Policy & Scheme Recommendations**

Based on your profile as a street vendor, here are the key government schemes and registrations you should be aware of:

**1. PM SVANidhi Scheme (PM Street Vendor's AtmaNirbhar Nidhi)**
- Working capital loan of ₹10,000 (first loan), extendable to ₹20,000 and ₹50,000
- Interest subsidy of 7% per annum credited to your bank account
- Apply at your nearest Urban Local Body (ULB) office or online at pmsvanidhi.mohua.gov.in
- Requirements: Vending Certificate or Letter of Recommendation from Town Vending Committee

**2. Udyam Registration (MSME)**
- Free online registration at udyamregistration.gov.in
- Benefits: Priority lending, government contract eligibility, subsidy access
- Documents needed: Aadhaar card + PAN card

**3. Vending Licence / Certificate of Vending**
- Mandatory under Street Vendors (Protection of Livelihood) Act 2014
- Apply at your Municipal Corporation / Urban Local Body
- Protects you from arbitrary eviction

**Eligibility Check:**
You likely qualify for PM SVANidhi if you have been vending before March 24, 2020 and have a Vending Certificate or recommendation letter.

*Note: This is an AI-generated guide. Verify current scheme terms at official government portals.*"""


class PolicySchemeAgent(BaseAgent):
    NAME = "Policy & Scheme Agent"
    COLLECTION_NAME = "policy_scheme"
    SYSTEM_PROMPT = """You are not being used for a coding task — respond only in plain natural language for a street vendor audience, no code blocks or technical formatting.

You are the Policy & Scheme Agent for the Street Vendor Digitalization platform.

Your role is to help street vendors and micro-entrepreneurs understand and access:
- Government schemes (PM SVANidhi working capital loan, MUDRA loans)
- MSME/Udyam registration process and benefits
- Street Vendors (Protection of Livelihood and Regulation of Street Vending) Act 2014
- State-level vending frameworks (Maharashtra Vendor Policy, Kerala Kudumbashree)
- Credit access pathways and eligibility criteria
- Vending licences, Certificates of Vending, and Town Vending Committee processes

Guidelines:
- Be practical and step-by-step. Vendors are often first-time users of government services.
- Cite the scheme name, eligibility criteria, and application channel (online URL or office).
- Mention required documents concisely.
- Note when information may need verification at official portals.
- Do NOT give legal advice — direct complex queries to legal aid or ULB officers.
- Keep language simple, clear, and encouraging."""

    def run(self, query: str, context=None):
        from config import Config
        if Config.USE_MOCK:
            return {"agent": self.NAME, "response": _MOCK_RESPONSE}
        return super().run(query=query, context=context)
