import { useState } from "react";
import LandingPage from "./components/LandingPage";
import ChatPanel from "./components/ChatPanel";
import { Sparkles, MessageSquare, ArrowRight } from "lucide-react";

export default function App() {
  const [screen, setScreen] = useState("home"); // "home" or "chat"
  const [initialQuery, setInitialQuery] = useState("");

  const handleStartChat = (query = "") => {
    setInitialQuery(query);
    setScreen("chat");
  };

  return (
    <div className="min-h-screen bg-[#f8faff] font-sans text-slate-900 selection:bg-brand-200 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setScreen("home")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-sky-500 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">VyaparSetu</span>
          </div>
          <div className="flex items-center gap-6">
            <button
               onClick={() => setScreen("home")}
               className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors hidden sm:block"
            >
              Home
            </button>
            <button 
              onClick={() => handleStartChat()}
              className="flex items-center gap-2 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <MessageSquare size={16} />
              Talk to AI
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full h-full relative">
        {screen === "home" ? (
          <LandingPage onStartChat={handleStartChat} />
        ) : (
          <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 flex flex-col h-[calc(100vh-4rem)]">
            <ChatPanel initialMessage={initialQuery} onBack={() => setScreen("home")} />
          </div>
        )}
      </main>
    </div>
  );
}
