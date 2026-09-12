import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  ArrowRight,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Search,
  PlusCircle,
  FileQuestion
} from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getItems } from "../utils/storage.js";
import { parseNaturalLanguageQuery, filterItems } from "../utils/searchEngine.js";

const DEFAULT_QUICK_PROMPTS = [
  "I lost my black wallet in the library",
  "What should I do if I found a phone?",
  "How do I claim my lost item?",
  "Where is the campus security desk?"
];

export default function Assistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: "msg-welcome",
      sender: "bot",
      text: "Hello! I am your Smart Lost & Found AI Assistant. How can I help you recover or report an item across campus today?",
      suggestions: [
        { label: "Search Catalog", path: "/search" },
        { label: "Report Lost Item", path: "/report-lost" },
        { label: "Report Found Item", path: "/report-found" }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend = input) => {
    const cleanText = (textToSend || "").trim();
    if (!cleanText) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = cleanText.toLowerCase();
      let botResponse = "";
      let suggestions = [];

      if (lower.includes("lost") && (lower.includes("wallet") || lower.includes("phone") || lower.includes("id") || lower.includes("bottle") || lower.includes("key"))) {
        const parsed = parseNaturalLanguageQuery(cleanText);
        const allItems = getItems();
        const matches = filterItems(allItems, {
          query: parsed.searchTerm,
          type: "found",
          category: parsed.category !== "all" ? parsed.category : "all",
          location: parsed.location !== "all" ? parsed.location : "all"
        });

        if (matches.length > 0) {
          botResponse = `I searched the Found database and discovered ${matches.length} matching found item(s) on campus! Top match: "${matches[0].itemName || matches[0].title}" found at ${matches[0].locationFound || matches[0].location || "Campus"}.`;
          suggestions = [
            { label: `View Item #${matches[0].id}`, path: `/item/${matches[0].id}` },
            { label: "View All Search Results", path: `/search?q=${encodeURIComponent(cleanText)}` },
            { label: "File a Lost Report", path: "/report-lost" }
          ];
        } else {
          botResponse = `I couldn't locate an exact match currently turned in. I strongly recommend filing a formal Lost Report now so our automated AI matcher can immediately notify you the moment it is turned in!`;
          suggestions = [
            { label: "Report Lost Item", path: "/report-lost" },
            { label: "Search Catalog", path: "/search" }
          ];
        }
      } else if (lower.includes("found") || lower.includes("picked up") || lower.includes("turned in")) {
        botResponse = `Thank you for being a good campus citizen! If you found an item, please file a Found Report so the rightful owner can be identified. You can drop off physical items at the Central Campus Security Desk or department office.`;
        suggestions = [
          { label: "Report Found Item", path: "/report-found" },
          { label: "Security Drop-off Info", path: "/how-it-works" }
        ];
      } else if (lower.includes("claim") || lower.includes("verify") || lower.includes("ownership")) {
        botResponse = `To claim an item, navigate to the Found Item details page and click 'Verify Ownership & Claim'. You will need to enter the private verification password or answer secret questions only the true owner would know. Campus security reviews and approves claims within 24 hours.`;
        suggestions = [
          { label: "View Active Claims", path: "/claims" },
          { label: "Search Found Items", path: "/search?type=found" }
        ];
      } else if (lower.includes("where") || lower.includes("location") || lower.includes("security") || lower.includes("office") || lower.includes("desk")) {
        botResponse = `The Main Campus Security Desk is located at the Administration Building, Ground Floor (Room 102). Phone: (555) 019-2834 | Open 24/7 for lost & found custody.`;
        suggestions = [
          { label: "View Campus Guide", path: "/about" },
          { label: "How It Works", path: "/how-it-works" }
        ];
      } else {
        botResponse = `I understand! You can search our live database of lost and found campus belongings, submit a new report, or track your verification claims anytime.`;
        suggestions = [
          { label: "Search Catalog", path: "/search" },
          { label: "Report Lost Item", path: "/report-lost" },
          { label: "Report Found Item", path: "/report-found" }
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botResponse,
          suggestions,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, 700);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "msg-welcome-reset",
        sender: "bot",
        text: "Conversation reset. How can I assist your campus lost & found inquiry today?",
        suggestions: [
          { label: "Search Catalog", path: "/search" },
          { label: "Report Lost Item", path: "/report-lost" }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                SmartFind AI Assistant
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Online
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Natural language inquiries, smart matching assistance, and campus protocol guidance
              </p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 min-h-[420px] max-h-[560px] shadow-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"} space-y-1.5`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {m.sender === "bot" && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mb-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-xs shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs"
                  }`}
                >
                  {m.text}
                </div>
              </div>

              {/* Action Suggestions */}
              {m.suggestions && m.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-9 pt-1">
                  {m.suggestions.map((sug, i) => (
                    <Link
                      key={i}
                      to={sug.path}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 transition"
                    >
                      <span>{sug.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-400 px-1">
                {m.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
              <div className="flex items-center gap-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>Searching campus database...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Prompts:
          </span>
          {DEFAULT_QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or lost item details (e.g., 'Lost blue water bottle in Computer Lab')..."
            className="w-full text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 pl-4 pr-12 py-3.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </main>
    </div>
  );
}
