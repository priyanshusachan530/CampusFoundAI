import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Sparkles,
  ShieldCheck,
  PackageCheck,
  ArrowRight,
  HelpCircle,
  Clock,
  ShieldAlert,
  ChevronDown
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Submit a Campus Report",
      desc: "Report a lost belonging or turn in a found item. Provide details including category, location, date, photos, and a Private Verification Password.",
      icon: FileText,
      color: "from-blue-500 to-indigo-600",
      accent: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
    },
    {
      step: "02",
      title: "Automated AI Similarity Matching",
      desc: "Our engine evaluates category, keywords, color, brand, location, and description across 6 weighted attributes (0-100% score) in real time.",
      icon: Sparkles,
      color: "from-amber-500 to-orange-600",
      accent: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
    },
    {
      step: "03",
      title: "Anti-Fraud Verification",
      desc: "Claimants must verify their identity by answering unique identifying questions and matching the private verification password created during reporting.",
      icon: ShieldCheck,
      color: "from-purple-500 to-indigo-600",
      accent: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
    },
    {
      step: "04",
      title: "Security Handover & Item Reunited",
      desc: "Campus security reviews the claim, verifies physical Student ID at the Security Desk, and formally marks the item as Successfully Received.",
      icon: PackageCheck,
      color: "from-emerald-500 to-teal-600",
      accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
    }
  ];

  const faqs = [
    {
      q: "How long are lost items kept at the Campus Security Desk?",
      a: "Unclaimed items are securely stored in the Central Campus Security Locker for up to 90 days. High-value electronics, wallets, and government IDs are kept in high-security lockboxes. After 90 days, unclaimed non-sensitive items are donated to campus community drives."
    },
    {
      q: "How does the Private Verification Password prevent theft or false claims?",
      a: "When reporting a lost item, you create a private verification password. When an AI match is found, only a user who knows this password (or exact hidden details like phone wallpaper, wallet card contents, or unique serial markings) can submit a claim. Plaintext answers are never shown to the finder."
    },
    {
      q: "What should I bring when picking up an approved item?",
      a: "Bring your official University Student or Employee ID card, along with the digital Claim Approval notification on your phone. Campus security staff will verify your identity before signing off on the handover."
    },
    {
      q: "Where is the physical Lost & Found office located?",
      a: "The Central Campus Security Desk is on the Ground Floor of the Main Administration Building (Room 102), open 24 hours a day, 7 days a week for report inquiries and drop-offs."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            Intelligent Recovery Protocol
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How Smart Lost & Found Works
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Our 4-step automated pipeline connects lost campus belongings with their rightful owners using AI similarity matching and secure anti-fraud verification.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${item.accent}`}>
                    STEP {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Security & Anti-Fraud Guarantee Banner */}
        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-200" />
              Verified Handover Guarantee
            </h3>
            <p className="text-xs text-indigo-100 max-w-xl leading-relaxed">
              Every claimed item undergoes strict identity validation. No item is handed over without physical student ID matching and administrator sign-off.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/report-lost"
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 transition shadow-xs"
            >
              Report Lost Item
            </Link>
            <Link
              to="/report-found"
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-700 text-white hover:bg-indigo-800 border border-indigo-500 transition"
            >
              Report Found Item
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Common questions from students, faculty, and campus staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2"
              >
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {faq.q}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
