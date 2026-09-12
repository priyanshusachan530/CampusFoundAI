import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Search,
  PlusCircle
} from "lucide-react";
import { getItems, getNotifications } from "../utils/storage.js";
import { calculateMatchScore } from "../utils/aiMatcher.js";
import { parseNaturalLanguageQuery } from "../utils/searchEngine.js";
import { useAuth } from "../context/AuthContext.jsx";

export function processChatbotQuery(rawInput, currentUser) {
  const input = rawInput.trim();
  const lower = input.toLowerCase();
  const items = getItems();

  // Command: Help
  if (lower === "help" || lower.includes("what can you do") || lower.includes("how to use")) {
    return {
      text: "I am your CampusLinkAI Assistant! Here is how I can assist you right now:",
      suggestions: [
        "Search lost items",
        "Search found items",
        "I lost my wallet near the library",
        "Show high confidence matches",
        "Report lost item",
        "Show my reports"
      ]
    };
  }

  // Command: Report Lost
  if (lower.includes("report lost") || lower.includes("i want to report a lost") || lower.includes("lost something")) {
    return {
      text: "I can help you log your lost item report right away. Our AI will automatically begin scanning all found item logs across campus as soon as you submit.",
      actionLink: { label: "Open Lost Item Form", url: "/report-lost" },
      suggestions: ["Search lost items", "Check recent found items"]
    };
  }

  // Command: Report Found
  if (lower.includes("report found") || lower.includes("i found an item") || lower.includes("turn in")) {
    return {
      text: "Thank you for being a responsible campus member! Please report the found item details so our AI can notify the rightful owner.",
      actionLink: { label: "Open Found Item Form", url: "/report-found" },
      suggestions: ["Check matching lost items", "Search all items"]
    };
  }

  // Command: Show my reports
  if (lower.includes("my report") || lower.includes("items i reported")) {
    const userReports = items.filter((i) => i.userId === currentUser?.id);
    return {
      text: currentUser
        ? `You have reported ${userReports.length} item(s) so far. You can view, manage, or mark them resolved in My Reports.`
        : "Please sign in to view your personalized reports.",
      actionLink: { label: "View My Reports", url: "/my-reports" },
      suggestions: ["Check AI matches", "Search found items"]
    };
  }

  // Command: Show matches
  if (lower.includes("match") || lower.includes("high confidence")) {
    return {
      text: "I've cross-referenced campus reports! We have high-confidence matches waiting for review, including wallets, water bottles, and campus ID cards.",
      actionLink: { label: "View Suggested Matches", url: "/matches" },
      suggestions: ["Show notifications", "Search library items"]
    };
  }

  // Command: Show notifications
  if (lower.includes("notification") || lower.includes("alerts")) {
    return {
      text: "You can track real-time match alerts, claim approvals, and security updates in your notification center.",
      actionLink: { label: "View Notifications", url: "/notifications" },
      suggestions: ["Search items", "Show matches"]
    };
  }

  // Natural Language Search / Loss Inquiry (e.g., "I lost my black wallet near the library")
  const parsed = parseNaturalLanguageQuery(input);
  if (parsed.category || parsed.location || parsed.color || lower.includes("lost") || lower.includes("found")) {
    // Filter matching found items
    const candidates = items.filter((item) => {
      if (item.type !== "found") return false;
      let score = 0;
      if (parsed.category && item.category.toLowerCase().includes(parsed.category.toLowerCase())) score += 3;
      if (parsed.location && item.location.toLowerCase().includes(parsed.location.toLowerCase())) score += 3;
      if (parsed.color && item.color.toLowerCase().includes(parsed.color.toLowerCase())) score += 2;
      return score >= 2;
    });

    if (candidates.length > 0) {
      return {
        text: `I analyzed your query: detected Category: ${parsed.category || "Item"}, Location: ${parsed.location || "Campus"}, Color: ${parsed.color || "Any"}. I found ${candidates.length} possible matching found item(s) in the database!`,
        matchedItems: candidates.slice(0, 3),
        actionLink: {
          label: `Search Catalog for "${input}"`,
          url: `/search?q=${encodeURIComponent(input)}`
        },
        suggestions: ["Show high confidence matches", "Report this as lost item", "Submit claim"]
      };
    } else {
      return {
        text: `I searched for found items matching "${input}" across campus locations, but didn't detect an exact match yet. I strongly recommend logging a Lost Item report so you get an instant notification when someone hands it in!`,
        actionLink: { label: "Report Lost Item Now", url: "/report-lost" },
        suggestions: ["Search all items", "Contact security desk"]
      };
    }
  }

  // General fallback
  return {
    text: `I'm processing "${input}". You can ask me to search lost/found items, report an item, or check high confidence AI matches across campus.`,
    suggestions: [
      "I lost my wallet near the library",
      "Search found water bottles",
      "Show matches",
      "Report lost item"
    ]
  };
}

export default function Chatbot({ isStandalone = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: `Hello ${user ? user.name.split(" ")[0] : "there"}! 👋 I'm your campus Lost & Found AI Assistant. How can I help you today?`,
      suggestions: [
        "I lost my black wallet near library",
        "Search found items",
        "Show AI matches",
        "Report lost item"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen || isStandalone) {
      scrollToBottom();
    }
  }, [messages, isOpen, isStandalone]);

  const handleSend = (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg = {
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI inference latency
    setTimeout(() => {
      const response = processChatbotQuery(text, user);
      const botMsg = {
        sender: "bot",
        text: response.text,
        matchedItems: response.matchedItems,
        actionLink: response.actionLink,
        suggestions: response.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const chatContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>CampusLinkAI Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h4>
            <p className="text-[10px] text-indigo-100 font-medium">NLP Campus Item Matching</p>
          </div>
        </div>

        {!isStandalone && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

              {/* Matched item cards inside chat */}
              {msg.matchedItems && msg.matchedItems.length > 0 && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Detected Matches in Database:
                  </p>
                  {msg.matchedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/item/${item.id}`)}
                      className="cursor-pointer p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 flex items-center justify-between gap-2 transition"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.location} • {item.date}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Action link button */}
              {msg.actionLink && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <Link
                    to={msg.actionLink.url}
                    onClick={() => !isStandalone && setIsOpen(false)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>{msg.actionLink.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

            {/* Suggested quick response chips */}
            {msg.suggestions && msg.suggestions.length > 0 && idx === messages.length - 1 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {msg.suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSend(sug)}
                    className="text-[11px] px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800 transition"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs px-2">
            <Bot className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            <span>Analyzing campus catalog...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="chatbot-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message or loss inquiry..."
            className="flex-1 py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            id="chatbot-send-btn"
            disabled={!inputValue.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );

  if (isStandalone) {
    return <div className="h-[650px] w-full max-w-4xl mx-auto">{chatContent}</div>;
  }

  return (
    <div id="floating-chatbot-container" className="fixed bottom-5 right-5 z-40">
      {isOpen ? (
        <div className="w-80 sm:w-96 h-[480px] animate-in zoom-in-95 duration-150">
          {chatContent}
        </div>
      ) : (
        <button
          id="open-chatbot-btn"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 transition duration-200 group"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-5 h-5 group-hover:rotate-12 transition duration-200" />
          <span className="text-xs font-bold">AI Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </button>
      )}
    </div>
  );
}
