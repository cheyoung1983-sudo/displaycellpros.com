import React, { useState } from "react";
import { BookOpen, Cpu, Calendar, ChevronRight } from "lucide-react";

export function BlogView() {
  const [activeArticle, setActiveArticle] = useState<number | null>(null);

  const ARTICLES = [
    {
      title: "How to Know When Your Battery Needs Replacing",
      slug: "battery-replacement-signals",
      date: "June 15, 2026",
      readTime: "4 MIN READ",
      summary: "Modern lithium cells degrade over voltage cycles. Learn the chemical, telemetry, and physical markers of a failing power cell before safety risks occur.",
      body: `Lithium-ion cells are finite chemical power systems. As cycles accumulate, the cathode material experiences microscopic lattice breakdown, reducing active lithium ion storage capability. 

Here are the four core telemetry indicators we analyze:
1. Nominal Voltage Sag under load (VCC_MAIN drop-off under high CPU cycles)
2. Chemical Gas Swelling (causing pressure-induced display lifting)
3. Direct I2C/SMBus battery cycle counter telemetry > 500 charge cycles
4. Active Board Temp exceedances (>45°C during standard charge phases)

Bypassing these alerts can lead to thermal runaway or motherboard power rail shorts. Regular inspections protect surrounding logic chips.`
    },
    {
      title: "Why Cheap Screens Cost More in the Long Run",
      slug: "cheap-screens-hidden-costs",
      date: "May 28, 2026",
      readTime: "5 MIN READ",
      summary: "Third-party display copies often degrade digitization grids, spike power rail currents, and can cause catastrophic backlight IC blowouts.",
      body: `When replacing displays, quality matters on a circuit-layer level. Low-cost counterfeit panels typically utilize inferior driver microchips that operate on high-resistance lines.

Key engineering failures in counterfeit displays include:
1. Digitzer current spikes that overload the onboard display controller PMU.
2. Poorly insulated flexible ribbon cables prone to shorting adjacent backlight anode lines.
3. Lack of embedded capacitive noise shielding, which causes touch latency and static drawing.
4. Mismatched glass thermal expansion coefficients leading to spontaneous cracking.

Investing in premium OEM-spec displays ensures absolute safety, calibrated color fidelity, and structural longevity.`
    }
  ];

  return (
    <div id="blog-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300 text-left">
      {/* Page Header */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,128,128,0.08)_0%,_transparent_70%)] pointer-events-none"></div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-teal-400 uppercase tracking-widest mb-4 font-mono">
          <BookOpen className="w-3.5 h-3.5" /> Silicon-Layer Forensic Digest
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-4">
          Engineering Logs & Tips
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Deep-dives into microelectronics, battery chemistry telemetry, and display glass thermal coefficients.
        </p>
      </div>

      <div className="space-y-8">
        {ARTICLES.map((art, idx) => {
          const isOpened = activeArticle === idx;
          return (
            <div
              key={idx}
              className="bg-[#151718] border border-slate-850 rounded-2xl p-6 md:p-8 transition-all hover:border-slate-800"
            >
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3">
                <Calendar className="w-3.5 h-3.5" />
                <span>{art.date}</span>
                <span>•</span>
                <span>{art.readTime}</span>
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide mb-3 font-mono">
                {art.title}
              </h2>
              
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                {art.summary}
              </p>

              {isOpened ? (
                <div className="border-t border-slate-900 pt-6 mt-6 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {art.body}
                  <button
                    onClick={() => setActiveArticle(null)}
                    className="block text-[#00BFFF] font-bold font-mono text-[10px] uppercase tracking-wider mt-6 hover:underline cursor-pointer"
                  >
                    Close Log
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveArticle(idx)}
                  className="inline-flex items-center gap-1.5 text-teal-400 font-bold font-mono text-[10px] uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
                >
                  Read Full Engineering Log <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
