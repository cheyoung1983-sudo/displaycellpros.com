import React from "react";
import { Shield, Cpu, Activity, Award } from "lucide-react";

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
          Display & Cell Pros Diagnostic
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Spokane’s premier laboratory for advanced silicon diagnostics, telemetry-guided board repair, and certified NIST-compliant hardware sanitization.
        </p>
      </div>

      {/* Main Grid: Mission & Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        <div className="bg-[#151718] border border-slate-850 rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none"></div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
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
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
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
