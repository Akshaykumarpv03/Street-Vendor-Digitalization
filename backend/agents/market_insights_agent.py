"""
agents/market_insights_agent.py — Market Insights Agent.

Responsibility: Pricing strategy, hyperlocal demand patterns, seasonal and
location-specific demand, mandi (wholesale market) price references, and
consumer behaviour insights for street vendors.

RAG-backed: Yes
Knowledge base: market_insights/
  - Pricing_Strategy_Framework.pdf
  - Hyperlocal_Demand_Patterns.pdf
  - Live_Market_Price_Data_Agmarknet.pdf

Roadmap note: Wiring the Agmarknet data.gov.in API for same-day produce
prices is the documented next step — for now the agent uses the PDF corpus.
"""
from agents.base_agent import BaseAgent

_MOCK_RESPONSE = """**Market Insights & Pricing Guidance**

Here are evidence-based strategies for your fruit vending business in Pune's Camp area:

**1. Pricing Strategy**
- **Cost-plus pricing**: Calculate your procurement cost (mandi price + transport) and add a 25–35% margin for fruits. Example: If mangoes cost ₹40/kg at Gultekdi market, price at ₹52–54/kg.
- **Competitive pricing**: Walk the 100m radius twice a week — match or undercut nearby vendors by ₹2–3/kg on fast-moving items.
- **Loss-leader pricing**: Price bananas at near-cost to attract foot traffic, then upsell seasonal fruits with higher margins.

**2. Hyperlocal Demand Patterns — Camp Area, Pune**
- **Morning rush (7–10 AM)**: Office commuters buy quick items — bananas, apples, oranges. Stock these in front.
- **Evening rush (5–8 PM)**: Families shopping for dinner. Highlight deals on bulk fruit (₹100 for 1 kg mixed).
- **Weekend premium**: Demand spikes 30–40% on Saturdays in Cantonment / Camp markets — stock up Thursday.

**3. Seasonal Planning**
- **Mango season (Apr–Jun)**: Highest footfall season for fruit vendors. Offer Alphonso, Kesar, and Dasheri at different price points.
- **Monsoon (Jul–Sep)**: Shift to pomegranates, papayas, and apples — low spoilage risk.
- **Winter (Nov–Feb)**: Strawberries from Mahabaleshwar sell at a premium — source direct from Panchgani/Mahabaleshwar cooperatives.

**4. Agmarknet Price Reference (manual check)**
- Visit: agmarknet.gov.in → Maharashtra → Pune Market Yard (Gultekdi)
- Check daily commodity prices before your morning purchase to optimise buying.

**5. Waste Reduction Tips**
- Use a cooler box with ice packs — reduces spoilage by ~40% in summer.
- Sell near-ripe fruit in a "Quick Sale" basket at 20% discount in the last hour.

*Note: Live Agmarknet API integration is a planned upgrade. Verify current mandi prices directly at agmarknet.gov.in.*"""


class MarketInsightsAgent(BaseAgent):
    NAME = "Market Insights Agent"
    COLLECTION_NAME = "market_insights"
    SYSTEM_PROMPT = """You are not being used for a coding task — respond only in plain natural language for a street vendor audience, no code blocks or technical formatting.

You are the Market Insights Agent for the Street Vendor Digitalization platform.

Your role is to help street vendors make data-informed decisions about:
- Pricing strategy (cost-plus, competitive, dynamic/seasonal pricing)
- Hyperlocal demand patterns — peak hours, peak days, seasonal shifts
- Wholesale (mandi) sourcing — which markets to buy from, timing, negotiation tips
- Consumer behaviour in the vendor's specific location and category
- Spoilage reduction and inventory management for perishable goods
- Competitor awareness and differentiation

Guidelines:
- Ground advice in the vendor's specific category and location when provided.
- Give concrete numbers where possible (e.g., margin percentages, timing windows).
- Reference Agmarknet (agmarknet.gov.in) for live mandi prices but note this is a manual check.
- Be actionable — vendors need "what to do tomorrow morning" level advice.
- Acknowledge seasonal and geographic variation; don't over-generalise.
- Do NOT fabricate specific current prices — provide methodology and reference sources instead."""

    def run(self, query: str, context=None):
        from config import Config
        if Config.USE_MOCK:
            return {"agent": self.NAME, "response": _MOCK_RESPONSE}
        return super().run(query=query, context=context)
