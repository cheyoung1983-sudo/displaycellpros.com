import React from "react";
import { MessageSquare, Star, Award, Shield } from "lucide-react";

export function TestimonialsView() {
  const TESTIMONIALS = [
    {
      author: "Sarah Jenkins",
      role: "Operations Manager, Spokane Transit Fleet",
      body: "Our logistics depot had 14 tablet units suffer from charging circuit failures. Display & Cell Pros dispatched their mobile trailer lab directly to our driveway, isolated the broken logic board filters on-site, and recovered every device in a single afternoon. Pure class.",
      metric: "14/14 FLEET DEVICES RECOVERED"
    },
    {
      author: "Dr. Marcus Vance",
      role: "Bio-Tech Lab Lead",
      body: "My phone suffered catastrophic physical impact. Other shops refused to work on it due to motherboard trace damage. Display & Cell Pros traced the broken board rails under a microscope, bypassed the blown filters, and backed up my entire research file database in line with NIST standards.",
      metric: "100% DATA SECURITY AUDIT PASS"
    },
    {
      author: "Robert Chen",
      role: "Commercial Real Estate Broker",
      body: "I watched the engineer replace my iPad OLED right from my driveway. No sketchy off-site storage, no waiting for shipping, and absolute privacy. Highest recommendation for anyone who values time and absolute security.",
      metric: "ONSITE IN 45 MINUTES"
    }
  ];

  return (
    <div id="testimonials-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300 text-left">
      {/* Page Header */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,128,128,0.08)_0%,_transparent_70%)] pointer-events-none"></div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-teal-400 uppercase tracking-widest mb-4 font-mono">
          <MessageSquare className="w-3.5 h-3.5" /> Silicon Forensics Case Studies
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-4">
          Client Endorsements & Audits
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Read how commercial enterprises, laboratories, and local Spokane WA organizations utilize our telemetry-driven logic board operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((test, idx) => (
          <div key={idx} className="bg-[#151718] border border-slate-850 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden group hover:border-teal-500/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none"></div>
            
            <div>
              <div className="flex gap-1 text-amber-400 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              
              <p className="text-slate-300 text-xs italic leading-relaxed mb-6">
                "{test.body}"
              </p>
            </div>

            <div>
              <div className="border-t border-slate-900 pt-4 mb-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">{test.author}</div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">{test.role}</div>
              </div>
              
              <div className="bg-slate-950 px-2.5 py-1 rounded text-[9px] font-mono font-bold text-teal-400 border border-slate-900 inline-block">
                {test.metric}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
