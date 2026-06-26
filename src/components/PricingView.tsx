import React from "react";
import { DollarSign, Cpu, Battery, Smartphone, ShieldCheck } from "lucide-react";

export function PricingView() {
  const PRICING_DATA = [
    {
      category: "DISPLAY REPLACEMENT (ELITE DISPLAY RENEWAL)",
      items: [
        { name: "iPhone 13 / 14 Series Elite Display", price: "$139", detail: "OEM-Spec high-gamut OLED panel restoration" },
        { name: "iPhone 11 / 12 Series Display Renewal", price: "$105", detail: "Anti-shatter glass + digitized array" },
        { name: "iPad Pro / Air Series Glass Reconstruction", price: "$169", detail: "Fused OCA vacuum chamber alignment" },
        { name: "Samsung Galaxy S22 / S23 Series AMOLED", price: "$210", detail: "Original active-digitizer module" },
        { name: "Google Pixel 7 / 8 Series OLED", price: "$185", detail: "Proximity sensor and fingerprint calibrated" }
      ]
    },
    {
      category: "POWER DELIVERY & PORT RECOVERY (TIER 1 & 2)",
      items: [
        { name: "High-Turnover Lithium Cell Replacement", price: "$69 - $89", detail: "High-capacity, safety-shielded cells" },
        { name: "USB-C / Lightning Port Assembly", price: "$75 - $95", detail: "Precision desoldered flex connector ribbon" },
        { name: "USB Power Delivery IC / Tristar Replacement", price: "$125", detail: "Micro-soldered power IC chip bypass" }
      ]
    },
    {
      category: "ADVANCED MICROSOLDERING (S2C TIER 3)",
      items: [
        { name: "VCC_MAIN Short Circuit Eradication", price: "$145 - $195", detail: "Thermal camera diagnostic + capacitor replacement" },
        { name: "Backlight Driver IC & Coil Reconstruction", price: "$135", detail: "Under-microscope micro-jumper wiring" },
        { name: "Liquid Damage Ultrasonic Decontamination & Audit", price: "$85", detail: "Pure isopropyl baths + schematic power-up tests" }
      ]
    }
  ];

  return (
    <div id="pricing-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300 text-left">
      {/* Page Header */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,128,128,0.08)_0%,_transparent_70%)] pointer-events-none"></div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-teal-400 uppercase tracking-widest mb-4 font-mono">
          <DollarSign className="w-3.5 h-3.5" /> Upfront, Formulaic S2C Pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-4">
          Repair & Forensic Pricing
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Transparent calculations based on active wholesale material costs plus professional bench labor. Zero guesswork.
        </p>
      </div>

      <div className="space-y-12">
        {PRICING_DATA.map((cat, idx) => (
          <div key={idx} className="bg-[#151718] border border-slate-850 rounded-2xl p-6 md:p-8">
            <h2 className="text-sm font-extrabold text-teal-400 tracking-wider uppercase mb-6 border-b border-slate-900 pb-3 font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400" /> {cat.category}
            </h2>
            <div className="divide-y divide-slate-900">
              {cat.items.map((item, i) => (
                <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-0 last:pb-0">
                  <div className="text-left">
                    <div className="text-sm font-bold text-white uppercase tracking-wide font-mono">{item.name}</div>
                    <div className="text-[11px] text-slate-450 mt-1">{item.detail}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-[#00BFFF] font-mono">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Promise */}
      <div className="mt-12 p-6 bg-slate-950/40 border border-slate-900 rounded-xl text-center flex flex-col items-center max-w-2xl mx-auto">
        <ShieldCheck className="w-8 h-8 text-teal-500 mb-3" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Our Material Pledge</h3>
        <p className="text-slate-400 text-xs leading-relaxed max-w-md">
          No upselling. No diagnostic blind spots. All material fees are presented openly prior to board level interventions, backed by a complete parts replacement guarantee.
        </p>
      </div>
    </div>
  );
}
