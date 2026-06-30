import React from "react";
import { Shield, Cpu, Activity, Award, User, Server, Globe, CheckCircle, Terminal, FileText } from "lucide-react";

export function AboutView() {
  return (
    <div id="about-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300 text-left">
      {/* Hero Header */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,128,128,0.08)_0%,_transparent_70%)] pointer-events-none"></div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-teal-400 uppercase tracking-widest mb-4 font-mono">
          <Shield className="w-3.5 h-3.5" /> Silicon-Layer Forensic Authority
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-4">
          Display & Cell Pros LLC
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Spokane’s premier laboratory for advanced silicon diagnostics, telemetry-guided board repair, and certified NIST-compliant hardware sanitization.
        </p>
      </div>

      {/* Corporate Structure & Founder Card */}
      <div className="bg-[#121415] border border-teal-950/40 rounded-2xl p-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-tr-full pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-850 pb-6 mb-6">
          <div>
            <div className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold mb-1">FOUNDER & EXECUTIVE PRINCIPAL</div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-teal-400" /> Ryan Young
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">Lead Hardware Reverse Engineer & Principal Software Architect</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-right md:text-left self-start md:self-auto">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">STATE OF WASHINGTON UBI</span>
            <span className="text-sm font-black text-slate-200 font-mono">605 985 265</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider mb-2 text-xs flex items-center gap-1.5 font-mono">
              <FileText className="w-3.5 h-3.5 text-teal-400" /> Corporate Entity Profile
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Display & Cell Pros LLC is a registered Washington Limited Liability Company operating specialized engineering-grade mobile hardware labs in Spokane. Under the direction of founder Ryan Young, we serve regional municipal, enterprise, and retail fleets with physical circuit forensics and hardware triage automation.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider mb-2 text-xs flex items-center gap-1.5 font-mono">
              <Shield className="w-3.5 h-3.5 text-blue-400" /> Program Compliance Statement
            </h3>
            <p className="text-slate-300 leading-relaxed">
              As part of our commitment to transparency, this application features real-time diagnostic systems, tax compliance routines, and quote routing engines built specifically to fulfill Google Cloud and Google for Startups operational guidelines. We guarantee fully operational features with verifiable organizational ownership.
            </p>
          </div>
        </div>
      </div>

      {/* Custom Technology Architecture (The "Proof of Life" Section) */}
      <div className="mb-16">
        <h2 className="text-xs uppercase tracking-[0.25em] text-slate-500 text-center font-bold font-mono mb-10">
          [CLOUD ARCHITECTURE & ACTIVE ENGINE DEPLOYMENT]
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Engine 1 */}
          <div className="bg-[#151718] border border-slate-850 hover:border-slate-800 transition-colors rounded-xl p-6 relative">
            <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg w-11 h-11 flex items-center justify-center mb-4">
              <Cpu className="text-teal-400 w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-200 uppercase tracking-wide mb-2">Interactive Diagnostics</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Allows customers and technicians to perform virtual hardware scans, verifying motherboard sensors, micro-soldering thermal paths, battery state of health, and device controller channels.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-mono">
              <CheckCircle className="w-3.5 h-3.5" /> Live & Fully Operational
            </div>
          </div>

          {/* Engine 2 */}
          <div className="bg-[#151718] border border-slate-850 hover:border-slate-800 transition-colors rounded-xl p-6 relative">
            <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg w-11 h-11 flex items-center justify-center mb-4">
              <Globe className="text-blue-400 w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-200 uppercase tracking-wide mb-2">Tax Compliance Routing</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              A dynamic routing engine that calculates accurate localized sales tax rates in real-time based on Washington State delivery coordinates (Latitude/Longitude), fully compliant with municipal tax laws.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-mono">
              <CheckCircle className="w-3.5 h-3.5" /> Active Coordinate Resolution
            </div>
          </div>

          {/* Engine 3 */}
          <div className="bg-[#151718] border border-slate-850 hover:border-slate-800 transition-colors rounded-xl p-6 relative">
            <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg w-11 h-11 flex items-center justify-center mb-4">
              <Server className="text-amber-400 w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-200 uppercase tracking-wide mb-2">POS Sync Ledger & Quotes</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Integrated sync ledger using secure webhooks to connect diagnostics with registers (Square/CellSmart), alongside the dynamic V2C Quote Engine mapping Firestore parts, labor, and B2B discounts.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono">
              <CheckCircle className="w-3.5 h-3.5" /> Full-Stack Google Cloud Run
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Mission & Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        <div className="bg-[#151718] border border-slate-850 rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none"></div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="text-teal-400 w-6 h-6" /> Our Forensic Mission
          </h2>
          <p className="text-slate-300 leading-relaxed text-sm mb-4">
            To provide precise silicon-layer diagnostics and microscopic logic board restoration with absolute transparency and unmatched technical accuracy.
          </p>
          <p className="text-slate-400 leading-relaxed text-sm">
            We bypass consumer-grade guesswork. By relying on real-time voltage rail measurements, diode-mode drop validations, and structural schematics, we provide a definitive forensic audit of every failure pathway before any rework begins.
          </p>
        </div>

        <div className="bg-[#151718] border border-slate-850 rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="text-blue-400 w-6 h-6" /> What Makes Us Different
          </h2>
          <p className="text-slate-300 leading-relaxed text-sm mb-4">
            At Display & Cell Pros, we do not engage in simple modular part-swapping. We examine hardware at the micro-component level—troubleshooting individual capacitors, filters, and integrated circuits.
          </p>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              <strong>S2C Symptom-to-Circuit Mapping:</strong> Linking physical faults programmatically.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              <strong>Chain-of-Verification (CoV):</strong> Strict schematic validation matches for absolute grounding.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              <strong>NIST SP 800-88 R1 Compliance:</strong> Cryptographically signed storage purges for commercial enterprise.
            </li>
          </ul>
        </div>
      </div>

      {/* Core Values / Pillar Layout */}
      <div className="border-t border-slate-900 pt-16 mb-8">
        <h2 className="text-xs uppercase tracking-[0.25em] text-slate-500 text-center font-bold font-mono mb-12">
          [Our Core Engineering Standards]
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-xl">
            <div className="text-teal-400 font-bold font-mono text-xs uppercase tracking-wider mb-2">01 / INTEGRITY</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              We never recommend desoldering or board rework before exhaustive electrical measurement and diagnostic verification is logged.
            </p>
          </div>
          <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-xl">
            <div className="text-teal-400 font-bold font-mono text-xs uppercase tracking-wider mb-2">02 / EXPERTISE</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Equipped with elite diagnostic equipment, we work at the sub-millimeter level under microscope magnification.
            </p>
          </div>
          <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-xl">
            <div className="text-teal-400 font-bold font-mono text-xs uppercase tracking-wider mb-2">03 / TRANSPARENCY</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              No hidden fees or hand-waving statements. You receive detailed diode mode readings, telemetry logs, and component identifiers.
            </p>
          </div>
          <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-xl">
            <div className="text-teal-400 font-bold font-mono text-xs uppercase tracking-wider mb-2">04 / RELIABILITY</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Spokane-local onsite driveway response or workbench dispatch. We stand behind every micro-solder joint with a lifetime physical warranty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
