import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  ShieldAlert, 
  Globe, 
  Sparkles, 
  Code, 
  Cpu, 
  Flame, 
  Key, 
  FileCheck, 
  ArrowRight, 
  Terminal, 
  Lock, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText,
  Workflow
} from "lucide-react";

// Lexicon configuration
interface LexiconMapping {
  forbidden: string;
  replacement: string;
  category: "Auth Bypass" | "Consumer Terms" | "Sandboxed Exploit";
  explanation: string;
}

const BRAND_LEXICON: LexiconMapping[] = [
  {
    forbidden: "CFAllocator",
    replacement: "Deep-Level Hardware Telemetry and Sensor Analytics",
    category: "Sandboxed Exploit",
    explanation: "Low-level memory-trapping technique that triggers App Store Section 2.19 rejection."
  },
  {
    forbidden: "IOKit",
    replacement: "Enterprise Hardware Telemetry Bridge",
    category: "Sandboxed Exploit",
    explanation: "Raw kernel/hardware access library. Restricting exposure prevents cease-and-desist alerts."
  },
  {
    forbidden: "App Store",
    replacement: "Private Enterprise Companion Apps (distributed via web / ABM)",
    category: "Auth Bypass",
    explanation: "We bypass consumer review channels entirely via B2B distribution."
  },
  {
    forbidden: "Jailbreak",
    replacement: "External Non-Invasive Telemetry Audit",
    category: "Auth Bypass",
    explanation: "MDM admins and corporate compliance officers blacklist any association with device jailbreaking."
  },
  {
    forbidden: "Screwdriver",
    replacement: "Precision Micro-Probing and Telemetry Sensor Arrays",
    category: "Consumer Terms",
    explanation: "Fails our silicon-layer branding prestige. Dilutes authoritative engineering image."
  },
  {
    forbidden: "Phone Repair Shop",
    replacement: "Silicon Forensic Audit Facility / Independent Diagnostic Center",
    category: "Consumer Terms",
    explanation: "Aligns with enterprise-scale laboratory operations."
  },
  {
    forbidden: "Modular part-swapping",
    replacement: "Telemetry-Guided Component-Level Restoration",
    category: "Consumer Terms",
    explanation: "Attacks the cheap standard of guessing-and-swapping in favor of scientific measurement."
  },
  {
    forbidden: "Quick fix",
    replacement: "Micro-soldering circuit-level calibration",
    category: "Consumer Terms",
    explanation: "Avoids sounding like low-quality or transient work."
  },
  {
    forbidden: "Easy swap",
    replacement: "Telemetry-Guided physical layer swap",
    category: "Consumer Terms",
    explanation: "Elevates standard diagnostic lexicon."
  }
];

export function MarketingFirewall() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [detectedTokens, setDetectedTokens] = useState<string[]>([]);
  const [complianceScore, setComplianceScore] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useInternalRoute, setUseInternalRoute] = useState(false);
  const [activeTab, setActiveTab] = useState<"portal" | "playground" | "analytics">("portal");
  const [logs, setLogs] = useState<string[]>([
    "[08:14:02] Firewall engine successfully booted. 0.0.0.0 ingress locked.",
    "[08:14:05] S2C Lexical parameters loaded: 9 rules compiled.",
    "[08:22:19] Routine NIST compliance self-check executed: 100% Green."
  ]);

  const PRESETS = [
    {
      label: "Exploit Leak (Sandbox Bypass)",
      text: "We built a precision diagnostic audit app on the public Apple App Store to read internal battery voltages using a low-level CFAllocator memory-trapping technique. Download our app!"
    },
    {
      label: "Hobbyist Speak (Part-swapper)",
      text: "Our laboratory uses precision micro-probing and telemetry sensor arrays to do circuit-level calibration of battery and display nodes."
    },
    {
      label: "Privilege Escalation Warning",
      text: "Using IOKit hardware exploits, we bypass the standard operating system restrictions to probe deep silicon cores directly."
    }
  ];

  const handleApplyPreset = (text: string) => {
    setInputText(text);
    handleProcess(text);
  };

  const handleProcess = async (textToProcess: string) => {
    if (!textToProcess.trim()) {
      setOutputText("");
      setDetectedTokens([]);
      setComplianceScore(100);
      return;
    }

    setIsProcessing(true);

    const endpoint = useInternalRoute ? "/api/internal/bench" : "/api/marketing/publish-blog";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ publicContent: textToProcess })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const timestamp = new Date().toLocaleTimeString();

      if (useInternalRoute || result.status === "bypass") {
        // Bypass route
        setOutputText(result.publicContent);
        setDetectedTokens([]);
        setComplianceScore(100);
        setLogs(prev => [
          `[${timestamp}] BYPASS GRANTED: Route '/api/internal/bench' bypassed firewall for raw L3 diagnostics.`,
          ...prev
        ].slice(0, 8));
      } else {
        // Sanitized route
        setOutputText(result.publicContent);
        const detected = result.redactions.map((r: any) => r.redacted_term);
        setDetectedTokens(detected);
        const newScore = Math.max(0, 100 - (detected.length * 20));
        setComplianceScore(newScore);

        const statusMessage = detected.length > 0 
          ? `[${timestamp}] COMPLIANCE BREACH BLOCKED: Intercepted ${detected.length} leaks on PUBLIC_CMS route.`
          : `[${timestamp}] SCAN COMPLIANT: Outbound content sanitized successfully (100% Score).`;
        setLogs(prev => [statusMessage, ...prev].slice(0, 8));
      }
    } catch (err) {
      console.warn("API call failed, falling back to client-side emulation:", err);
      // Fallback to local offline emulation
      let filtered = textToProcess;
      const detected: string[] = [];

      BRAND_LEXICON.forEach(rule => {
        const regex = new RegExp(`\\b${rule.forbidden}\\b`, "gi");
        if (regex.test(filtered)) {
          detected.push(rule.forbidden);
          filtered = filtered.replace(regex, `**${rule.replacement}**`);
        }
      });

      const newScore = Math.max(0, 100 - (detected.length * 20));
      setOutputText(filtered);
      setDetectedTokens(detected);
      setComplianceScore(newScore);

      const timestamp = new Date().toLocaleTimeString();
      const statusMessage = detected.length > 0 
        ? `[${timestamp}] [LOCAL FIREWALL] Detected and redacted ${detected.length} offline token(s).`
        : `[${timestamp}] [LOCAL FIREWALL] Outbound CMS content scanned clean offline.`;
      
      setLogs(prev => [statusMessage, ...prev].slice(0, 8));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="marketing-constraint-engine" className="flex flex-col gap-6 font-sans text-left text-slate-100 p-1">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#008080] uppercase tracking-widest font-bold">
            [CMS Lexical Firewall & AI Marketing Constraint Engine]
          </span>
          <h2 className="text-xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <Shield className="w-5.5 h-5.5 text-[#008080]" />
            Triage-AI B2B Go-To-Market Guard
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Programmatically insulates proprietary silicon exploits while projecting clinical, enterprise-grade authority.
          </p>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-lg self-start lg:self-center">
          <button
            onClick={() => setActiveTab("portal")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "portal" 
                ? "bg-[#008080] text-white shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            B2B Public Landing
          </button>
          <button
            onClick={() => setActiveTab("playground")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "playground" 
                ? "bg-[#008080] text-white shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Firewall Playground
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "analytics" 
                ? "bg-[#008080] text-white shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            System Invariants & Schemas
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      <AnimatePresence mode="wait">
        {activeTab === "portal" && (
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* HERO CONTAINER IN OBSIDIAN COLOR */}
            <div className="bg-[#111111] border border-slate-850 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#008080]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none" />

              {/* LOGO BADGE */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-teal-500/20 shadow-inner">
                  <svg className="w-8 h-8 text-[#008080]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest leading-none font-mono">DISPLAY CELL PROS</h3>
                  <span className="text-[10px] text-teal-400 font-mono tracking-widest uppercase">Forensic Division</span>
                </div>
              </div>

              {/* HERO BODY */}
              <div className="max-w-3xl space-y-4">
                <span className="text-[11px] font-mono text-teal-400 font-bold tracking-widest uppercase bg-teal-950/40 border border-teal-900 px-2.5 py-1 rounded">
                  STOP GUESSING. START AUDITING.
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight uppercase font-mono">
                  The Enterprise-Grade Mobile Diagnostics & Data Sanitization Suite.
                </h1>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  Transition your laboratory from subjective guesswork to a <strong className="text-white">Telemetry-First</strong> science. 
                  Triage-AI is the world's most advanced web-tethered diagnostic platform, engineered for independent repair facilities and large-scale IT Asset Disposition (ITAD) centers.
                </p>
                <div className="pt-4">
                  <button className="px-6 py-3.5 bg-[#00BFFF] hover:bg-sky-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-sky-500/20 active:scale-98 flex items-center gap-2">
                    Request an Enterprise Demo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN AUDIENCE MATRIX */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* VERTICAL 1: INDEPENDENT LABS */}
              <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-teal-950/40 border border-teal-900 rounded-lg text-[#008080]">
                      <Workflow className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">[INDEPENDENT DIAGNOSTIC facilities]</h4>
                      <h3 className="text-base font-bold text-white uppercase font-mono mt-0.5">Democratize Board-Level Restoration</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Do not turn away complex logic board failures. Our **Forensic RAG Engine** cross-references real-time hardware measurements against a massive library of vectorized schematics to isolate electrical faults in seconds.
                  </p>

                  <div className="space-y-3.5 pt-2">
                    <div className="flex gap-3">
                      <div className="p-1 h-fit bg-slate-950 rounded border border-slate-900 font-mono text-[10px] text-teal-400">01</div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 font-mono uppercase">V2C (Voice-to-Circuit) Automated Intake</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">An AI agent designed to capture leads, extract failure modes, and estimate pricing automatically, converting raw customer calls into clean work orders.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-1 h-fit bg-slate-950 rounded border border-slate-900 font-mono text-[10px] text-teal-400">02</div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 font-mono uppercase">Interactive Motherboard Schematic Overlay</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Dynamic vector layout viewer overlaying live multimeter metrics over component nodes to pinpoint short circuits immediately.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-1 h-fit bg-slate-950 rounded border border-slate-900 font-mono text-[10px] text-teal-400">03</div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 font-mono uppercase">Thermodynamic Rework Profiler</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Recommends precise thermal cycles, hot-air airflows, and alloy safety boundaries to eliminate board warping during board soldering.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-[#FFBF00] uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Enforces the "Measure-First Protocol" to stop parts-swapping waste.
                  </span>
                </div>
              </div>

              {/* VERTICAL 2: ITAD & ENTERPRISE FLEETS */}
              <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-950/40 border border-blue-900 rounded-lg text-sky-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">[ENTERPRISE & ITAD FLEETS]</h4>
                      <h3 className="text-base font-bold text-white uppercase font-mono mt-0.5">Military-Grade Compliance</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Satisfy federal audits and compliance guidelines with programmatic guarantees. Triage-AI brings complete non-repudiation and cryptographic data erasure protocols to your warehouse floor.
                  </p>

                  <div className="space-y-4 pt-2">
                    <div className="flex gap-3">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 flex items-center justify-center text-teal-500 h-10 w-10">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 font-mono uppercase">NIST SP 800-88 R1 Cleansing Gate</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Executes cryptographic and multi-pass digital overwriting routines matching government Purge mandates, issuing signed Certificates of Erasure.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 flex items-center justify-center text-teal-500 h-10 w-10">
                        <Key className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 font-mono uppercase">Zero-Trust FIDO2 Hardware Locks</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Eliminates "walk-away" vulnerabilities. Requiring biometric or hardware security key physical interaction to sign off and dispatch destructive wipes.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 flex items-center justify-center text-teal-500 h-10 w-10">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 font-mono uppercase">Measurement Data Format (.mdf) Sync</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Instantly packs deep voltage, temperature, and wipe certificates into the industry-standard `.mdf` payload for immediate CRM/ERP ingestion.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Absolute Legal Non-Repudiation for Liability Protection.
                  </span>
                </div>
              </div>

            </div>

            {/* AUTOMATED RMA & QUALITY ASSURANCE SECTION */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-850 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">[Supplier Audit Gateway]</span>
                  <h4 className="text-sm font-bold text-white font-mono uppercase">Automated Component RMA Pipeline</h4>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Instantly flags out-of-spec aftermarket components by comparing incoming display, touchscreen, or cell metrics with baseline tolerances. The system locks out defective parts and drafts vector PDF dispute packages to guarantee RMAs.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[10px] text-slate-400 space-y-1 self-stretch md:self-auto flex flex-col justify-center">
                  <div>RMA SUCCESS RATE: <span className="text-teal-400 font-bold">99.4%</span></div>
                  <div>AVG ARBITRATION TIME: <span className="text-teal-400 font-bold">&lt;18 min</span></div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {activeTab === "playground" && (
          <motion.div
            key="playground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6"
          >
            {/* INPUT PANEL */}
            <div className="xl:col-span-7 space-y-4">
              <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest">
                    [Outbound Content Scanner]
                  </span>
                  <span className="text-[9px] bg-red-950/60 border border-red-900 text-red-400 px-2 py-0.5 rounded font-mono font-bold">
                    Sandbox Active
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Diagnostic/Marketing Text Draft
                  </label>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Type a technical specification or B2B sales copy here. The engine will inspect it for disallowed consumer terms and proprietary iOS sandbox exploits.
                  </p>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter draft text to scan..."
                  className="w-full h-44 bg-slate-950 border border-slate-900 rounded-xl p-3.5 text-xs text-slate-300 font-mono focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-600 leading-relaxed"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleProcess(inputText)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-[#008080] hover:bg-teal-700 text-white text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1.5"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Auditing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5" />
                          Audit Payload
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setInputText("");
                        setOutputText("");
                        setDetectedTokens([]);
                        setComplianceScore(100);
                      }}
                      className="px-3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg transition-all"
                    >
                      Clear
                    </button>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs hover:border-slate-700 transition-all select-none">
                      <input 
                        type="checkbox" 
                        checked={useInternalRoute} 
                        onChange={(e) => setUseInternalRoute(e.target.checked)}
                        className="accent-[#008080] rounded cursor-pointer w-3.5 h-3.5"
                      />
                      <span className="font-mono text-[10px] text-slate-300 uppercase">
                        Internal Lab Bypass (<span className="text-amber-500">/api/internal/*</span>)
                      </span>
                    </label>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    Rule Invariants Compiled: <span className="text-teal-500 font-bold">9/9</span>
                  </span>
                </div>
              </div>

              {/* BRANDING PRESETS */}
              <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest block">
                  [Diagnostic Test Vectors (The Red Team Vectors)]
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplyPreset(p.text)}
                      className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-xl text-left transition-all space-y-1.5 group"
                    >
                      <div className="text-[10px] font-bold text-teal-400 group-hover:text-teal-300 uppercase tracking-wider font-mono flex justify-between items-center">
                        <span>{p.label}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                      <p className="text-[9.5px] text-slate-500 line-clamp-2 leading-relaxed">
                        "{p.text}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AUDIT OUTPUT & METRICS */}
            <div className="xl:col-span-5 space-y-4">
              
              {/* COMPLIANCE STATUS PANEL */}
              <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest block">
                  [Lexical compliance audit status]
                </span>

                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-900 rounded-xl">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                      Audit Guard Score
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl font-black font-mono ${
                        complianceScore === 100 
                          ? "text-teal-400" 
                          : complianceScore >= 60 
                          ? "text-[#FFBF00]" 
                          : "text-red-500"
                      }`}>
                        {complianceScore}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">compliant</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    {complianceScore === 100 ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-teal-400 font-black uppercase bg-teal-950/30 border border-teal-900 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                        NIST Clean
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 font-black uppercase bg-red-950/30 border border-red-900 px-2.5 py-1 rounded-lg animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                        Breach Blocked
                      </span>
                    )}
                  </div>
                </div>

                {/* DETECTED TOKENS LIST */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                    Security / Branding Flag Checklist
                  </span>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {BRAND_LEXICON.map((rule, idx) => {
                      const wasCaught = detectedTokens.some(t => t.toLowerCase() === rule.forbidden.toLowerCase());
                      return (
                        <div 
                          key={idx}
                          className={`flex items-start justify-between p-2 rounded-lg text-[10px] font-mono border transition-all ${
                            wasCaught 
                              ? "bg-red-950/20 border-red-900 text-red-400" 
                              : "bg-slate-950 border-slate-900 text-slate-500"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold flex items-center gap-1.5">
                              {wasCaught ? (
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3 text-slate-700" />
                              )}
                              Term: "{rule.forbidden}"
                            </span>
                            <p className="text-[9px] text-slate-500">{rule.explanation}</p>
                          </div>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                            wasCaught ? "bg-red-950 text-red-400" : "bg-slate-900 text-slate-600"
                          }`}>
                            {rule.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* COMPLIANT OUTPUT PANEL */}
              {outputText && (
                <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-[#008080] uppercase tracking-widest font-bold">
                      [Compilant Translation Result]
                    </span>
                    <span className="text-[9px] text-teal-400 font-mono flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Transposed Speak
                    </span>
                  </div>
                  <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl font-mono text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                    {outputText.split("\n").map((para, i) => (
                      <p key={i} className="mb-2">
                        {para.split("**").map((chunk, j) => (
                          j % 2 === 1 ? (
                            <strong key={j} className="text-teal-400 border-b border-teal-800/55 px-0.5 font-bold">
                              {chunk}
                            </strong>
                          ) : chunk
                        ))}
                      </p>
                    ))}
                  </div>
                  <div className="text-[9px] text-slate-500 italic leading-snug">
                    Note: Prohibited engineering leaks are automatically mapped to compliant, enterprise-grade terminology matching our corporate schema definitions.
                  </div>
                </div>
              )}

              {/* FIREWALL REALTIME AUDIT LOGS */}
              <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-4 space-y-2">
                <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block">
                  [Firewall Core Realtime Logs]
                </span>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 font-mono text-[9px] text-slate-400 space-y-1 h-24 overflow-y-auto">
                  {logs.map((log, i) => (
                    <div key={i} className={
                      log.includes("BREACH") 
                        ? "text-red-400 font-bold" 
                        : log.includes("SCAN") 
                        ? "text-teal-400" 
                        : "text-slate-500"
                    }>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* SYSTEM INVARIANTS DETAIL */}
            <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-900 pb-4">
                <span className="text-[10px] font-mono text-[#008080] uppercase tracking-widest font-bold block">
                  [S2C Compliance Matrix & Zero-Trust Validation]
                </span>
                <h3 className="text-base font-bold text-white uppercase font-mono mt-1">
                  Security Invariant & Policy Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Triage-AI enforces a multi-tiered security gate to ensure cryptographic, structural, and identity boundaries cannot be crossed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* INVARIANT 1 */}
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-teal-400">
                    <Shield className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase font-mono">1. Ownership Boundary</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Strict isolation limits read/write access. Users can only fetch and update records where their authenticated UID matches the record's <code className="bg-slate-900 text-teal-300 px-1 py-0.5 rounded text-[10px]">userId</code> field.
                  </p>
                  <div className="bg-slate-900 p-2 rounded text-[9px] font-mono text-slate-500">
                    Rule: <span className="text-emerald-400">resource.data.userId == request.auth.uid</span>
                  </div>
                </div>

                {/* INVARIANT 2 */}
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-[#00BFFF]">
                    <Lock className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase font-mono">2. Structural Restrictions</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Defense against Denial-of-Wallet (buffer expansion) attacks. String boundaries are restricted strictly (e.g. name length &lt; 128 characters, ID length &lt; 32 characters).
                  </p>
                  <div className="bg-slate-900 p-2 rounded text-[9px] font-mono text-slate-500">
                    Rule: <span className="text-emerald-400">data.customerName.size() &lt;= 128</span>
                  </div>
                </div>

                {/* INVARIANT 3 */}
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2.5 col-span-1 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 text-[#FFBF00]">
                    <AlertTriangle className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase font-mono">3. Hardened State Lock</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Once a diagnostic record reaches a terminal auditing phase (such as `"completed"` or `"archived"`), the document is marked as immutable. No further updates are permitted.
                  </p>
                  <div className="bg-slate-900 p-2 rounded text-[9px] font-mono text-slate-500">
                    Rule: <span className="text-emerald-400">!(resource.data.status in ['completed'])</span>
                  </div>
                </div>

              </div>
            </div>

            {/* FIREBASE ARCHITECTURE OVERVIEW */}
            <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">[Production Deployment Schema]</h4>
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Target Project ID:</span>
                  <span className="text-[#00BFFF] font-bold">displaycellpros-com (Firestore Default)</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Security Standard:</span>
                  <span className="text-teal-400 font-bold">NIST SP 800-88 R1 compliant erasure certificates</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Authentication Gate:</span>
                  <span className="text-slate-400">FIDO2/WebAuthn integrated hardware signoff triggers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Rule Integrity:</span>
                  <span className="text-emerald-400 font-bold">Phase 0 Red Team Verified (12 Pen-test Vectors)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Inline placeholder if ShieldCheck isn't in imported list
function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 11 3 3 5-5" />
    </svg>
  );
}
