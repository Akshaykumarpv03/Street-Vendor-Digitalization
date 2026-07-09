import { useState } from "react";
import { ArrowRight, TrendingUp, ShieldCheck, Globe, Sparkles } from "lucide-react";

export default function LandingPage({ onStartChat }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartChat(query);
  };

  return (
    <div className="flex flex-col w-full h-full relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] max-w-7xl pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-brand-300/20 rounded-full blur-3xl mix-blend-multiply opacity-70" />
        <div className="absolute top-[20%] right-[-5%] w-[35rem] h-[35rem] bg-sky-300/20 rounded-full blur-3xl mix-blend-multiply opacity-70" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center w-full fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-semibold mb-8 shadow-sm">
          <Sparkles size={14} className="text-brand-500" />
          Powered by IBM watsonx
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.15]">
          Empowering your business with <br className="hidden md:block" />
          <span className="gradient-text">Intelligent AI</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          VyaparSetu connects street vendors and small businesses to government schemes, market insights, and digital tools instantly.
        </p>

        {/* Quick Query Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative group z-10">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-500 to-sky-400 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-700 group-hover:duration-200"></div>
          <div className="relative flex flex-col sm:flex-row items-center bg-white p-2 rounded-2xl sm:rounded-full shadow-xl border border-slate-200/60 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 transition-all">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about PM SVANidhi, mandi rates, or UPI..."
              className="w-full px-6 py-4 bg-transparent outline-none text-slate-800 text-lg md:text-xl placeholder:text-slate-400 rounded-full"
            />
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-8 rounded-xl sm:rounded-full transition-all shrink-0 mt-2 sm:mt-0 shadow-md hover:shadow-lg"
            >
              Ask AI <ArrowRight size={18} />
            </button>
          </div>
        </form>

        {/* Suggestion Chips */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 fade-up-200">
          {[
            "How do I apply for PM SVANidhi?",
            "What are today's tomato prices in Pune?",
            "Help me set up a UPI QR code",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onStartChat(suggestion)}
              className="text-sm px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/80 text-slate-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 hover:shadow-md transition-all font-medium"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-t border-slate-100 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-up-400">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to grow</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Smart insights and digital tools tailored specifically for small merchants and street vendors.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 fade-up-600">
            <FeatureCard 
              icon={<ShieldCheck size={28} className="text-brand-600" />}
              title="Government Schemes"
              desc="Discover and apply for micro-credit loans like PM SVANidhi and MUDRA instantly without the hassle."
            />
            <FeatureCard 
              icon={<TrendingUp size={28} className="text-brand-600" />}
              title="Market Pricing"
              desc="Get real-time mandi rates and pricing trends so you never under-sell your daily produce."
            />
            <FeatureCard 
              icon={<Globe size={28} className="text-brand-600" />}
              title="Digital Presence"
              desc="Create a digital storefront and start accepting UPI payments seamlessly with zero transaction fees."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-8 rounded-2xl bg-[#f8faff] border border-slate-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 group cursor-default">
      <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}
