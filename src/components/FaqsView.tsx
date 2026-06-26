import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Cpu, ShieldAlert, Sparkles } from "lucide-react";

export function FaqsView() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [faqCategory, setFaqCategory] = useState<string>("All");

  const FAQS = [
    {
      q: "How long do repairs take?",
      a: "Most common diagnostics and sub-micron board operations (such as screens, charging port logic chips, or batteries) are completed the same day—typically in 30 to 60 minutes in our active drive-up vehicle laboratories.",
      category: "Repairs"
    },
    {
      q: "Do you offer diagnostics?",
      a: "Yes. We run full, systematic, diode-mode measurements and telemetry evaluations using our S2C Forensics Engine to precisely isolate motherboard faults before any physical work is conducted.",
      category: "S2C Mapping"
    },
    {
      q: "Is there a warranty?",
      a: "Yes. Every single custom micro-solder joint, battery cell swap, or display renewal comes with our premium physical board warranty.",
      category: "Repairs"
    },
    {
      q: "Do I need an appointment?",
      a: "We welcome direct on-site walk-ins at our Spokane station, but booking a dedicated driveway appointment locks in your technician’s arrival window, travel-overhead credits, and parts staging.",
      category: "Repairs"
    },
    {
      q: "What devices do you repair?",
      a: "We perform microelectronic repairs on iPhones, iPads, Samsung Galaxy phones, Google Pixel phones, laptops, and selected commercial B2B fleets.",
      category: "B2B Fleet"
    },
    {
      q: "What is NIST SP 800-88 R1 storage clearing?",
      a: "It is the federal and enterprise standard for physical media sanitization. We overwrite user disk blocks and flash arrays, verify erasure, and issue an authentic, cryptographically signed Certificate of Erasure (COE).",
      category: "NIST Compliance"
    },
    {
      q: "How does the mobile laboratory power its solder stations?",
      a: "Our diagnostic truck runs on standalone, eco-friendly solar-charged lithium power banks. We do not hook into your home utilities or cause noise pollution—providing silent, self-contained laboratory power.",
      category: "Repairs"
    },
    {
      q: "Do you offer bulk billing for corporate device fleets?",
      a: "Yes, we support Net-30 bulk invoicing for enterprise clients. B2B requests get priority dispatch queue routing across Washington state.",
      category: "B2B Fleet"
    }
  ];

  const categories = ["All", "Repairs", "S2C Mapping", "NIST Compliance", "B2B Fleet"];

  const filteredFaqs = FAQS.filter(
    (faq) => faqCategory === "All" || faq.category === faqCategory
  );

  return (
    <div id="faq-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300 text-left">
      {/* Page Header */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,128,128,0.08)_0%,_transparent_70%)] pointer-events-none"></div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-teal-400 uppercase tracking-widest mb-4 font-mono">
          <HelpCircle className="w-3.5 h-3.5" /> Silicon Forensics Q&A
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-4">
          Frequently Answered Questions
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Exhaustive responses on silicon diagnostics, Spokane WA field dispatch zones, and corporate fleet audits.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setFaqCategory(cat);
              setExpandedFaq(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider font-extrabold transition-all border cursor-pointer ${
              faqCategory === cat
                ? "bg-[#008080] border-[#009a9a] text-white"
                : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, idx) => {
          const isExpanded = expandedFaq === idx;
          return (
            <div
              key={idx}
              className={`border border-slate-900 rounded-xl transition-all overflow-hidden ${
                isExpanded ? "bg-[#151718]" : "bg-slate-950 hover:border-slate-850"
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-slate-900 border border-slate-850 flex items-center justify-center shrink-0">
                    <span className="text-[9px] text-[#00BFFF] font-mono font-bold">Q{idx + 1}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-200 uppercase tracking-wide font-mono">
                    {faq.q}
                  </span>
                </div>
                <div className="text-slate-500 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 pt-1 border-t border-slate-900/40 text-xs leading-relaxed text-slate-300 font-sans">
                  <p className="mb-4">{faq.a}</p>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                    <Cpu className="w-3.5 h-3.5 text-teal-400" /> CATEGORY INDEXED: {faq.category}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
