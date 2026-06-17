import React, { useState } from "react";
import { ShieldCheck, Scale, FileText, Lock, CheckCircle2 } from "lucide-react";

export function LegalView() {
  const [activeTab, setActiveTab] = useState<"tos" | "warranty" | "privacy" | "compliance">("compliance");

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Scale className="text-emerald-500 h-8 w-8" />
          General Compliance & Legal
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Standard Operating Procedures, Liability Waivers, and Privacy framework for www.displaycellpros.com
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* Side Navigation */}
        <div className="md:w-72 bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-800 p-6 shrink-0">
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("compliance")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === "compliance"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`}
            >
              <CheckCircle2 size={18} className={activeTab === "compliance" ? "text-emerald-400" : ""} />
              <span>Compliance Guidelines</span>
            </button>

            <button
              onClick={() => setActiveTab("tos")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === "tos"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`}
            >
              <FileText size={18} className={activeTab === "tos" ? "text-blue-400" : ""} />
              <span>Terms of Service & Liability</span>
            </button>

            <button
              onClick={() => setActiveTab("warranty")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === "warranty"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`}
            >
              <ShieldCheck size={18} className={activeTab === "warranty" ? "text-blue-400" : ""} />
              <span>Hardware Warranty</span>
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === "privacy"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Lock size={18} className={activeTab === "privacy" ? "text-purple-400" : ""} />
              <span>Data Privacy Policy</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10 bg-slate-900/50">
          {activeTab === "compliance" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-white mb-6">www.displaycellpros.com Compliance Standards</h2>
              <div className="space-y-6 text-slate-300 leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">Washington State DOR Regulations</h3>
                  <p>Our on-site driveway services are bound by Washington State Destination Sales Tax rules. We compute local tax boundaries per the service location within Spokane county limits to ensure complete standard compliance. Online scheduling and quotes initiated via www.displaycellpros.com are strictly estimated subject to final on-site physical hardware inspection.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">Federal Communications Commission (FCC) Compliance</h3>
                  <p>Display & Cell Pros LLC utilizes replacement parts adhering to strict safety and radio-frequency emission limits. We ensure no unauthorized internal structural modifications are performed that would breach device safety conformity on mobile radio modems.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">NIST SP 800-88 R1 Erasure</h3>
                  <p>All enterprise destruction and fleet clearing protocols executed via our diagnostic interface utilize NIST conformant sector-wipes to guarantee that multi-device asset liquidation retains zero readable traces. Digital certificates of erasure are populated on the www.displaycellpros.com client hub upon successful clears.</p>
                </section>
              </div>
            </div>
          )}

          {activeTab === "tos" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-white mb-6">Service Agreement & Liability Disclaimer</h2>
              <div className="space-y-6 text-slate-300 leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Consent to Specialized Operations</h3>
                  <p>By scheduling via www.displaycellpros.com, the customer assumes full responsibility for allowing Display & Cell Pros master technicians to open devices that possess water-resistance seals. Reapplying adhesive seals minimizes water intrusion, but original factory hydrostatic guarantees are irretrievably voided upon the initial open.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Diagnostic Base Fees</h3>
                  <p>For extensive motherboard damage or liquid spills where component-level IC restoration is required and evaluated at the driveway, non-refundable diagnostic/bench fees apply. The company limits maximum liability for any collateral damage strictly to the depreciated physical value of the hardware alone prior to the repair.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Abandoned Hardware Clause</h3>
                  <p>Physical devices untended or unpaid past sixty (60) days from completion notification via the email address registered on www.displaycellpros.com forfeit their ownership to Display & Cell Pros LLC for recycling or parts harvesting to recoup cost loss.</p>
                </section>
              </div>
            </div>
          )}

          {activeTab === "warranty" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-white mb-6">120-Day Limited Hardware Warranty</h2>
              <div className="space-y-6 text-slate-300 leading-relaxed">
                <section>
                  <p className="bg-blue-900/20 border border-blue-900 p-4 rounded-lg text-blue-200">
                    Display & Cell Pros LLC (via www.displaycellpros.com) warranties standard replacement components (batteries, OLEDs, Charge Ports) against manufacturing defects under normal operating usage for 120 days post-repair completion.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Coverage Stipulations</h3>
                  <ul className="list-disc pl-5 space-y-2 text-slate-400">
                    <li>Replacement displays suffering from touch ghosting, localized dead zones, or controller malfunctioning without a valid physical or thermal cause.</li>
                    <li>Batteries demonstrating rapid cycle exhaustion natively monitored via internal iOS/Android settings menus without signs of prolonged extreme thermal storage.</li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Exemptions to Coverage</h3>
                  <p>To retain warranty protection, the product cannot exhibit newly introduced kinetic fractures, liquid exposure incidents, or physical chassis contortion. Any third-party intrusion or re-opening of the device by non-certified technicians immediately voids the Display & Cell Pros LLC service warranty.</p>
                </section>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-white mb-6">Device Privacy & Data Security Architecture</h2>
              <div className="space-y-6 text-slate-300 leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Zero Data Harvesting Policy</h3>
                  <p>Display & Cell Pros LLC maintains a zero-tolerance data-exfiltration operation. The website www.displaycellpros.com strictly collects PII merely to identify, schedule, and route technicians safely to our clientele in Spokane and Seattle. Client passcodes gathered securely are leveraged exclusively to enact native post-repair software parameter verifications and deleted permanently from standard logs following sign-offs.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Backup Disavowals</h3>
                  <p>We are a hardware surgical team, not a cloud data depository. You must secure cryptographic keys, local photos, and digital assets independently before authorizing motherboard IC repairs. Display & Cell Pros LLC rejects any culpability regarding unrecoverable NAND memory clusters during hard-restarts or short-circuit desoldering.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Remote Analytics</h3>
                  <p>The www.displaycellpros.com diagnostic console employs anonymous telemetry to profile device hardware errors against widespread hardware fault libraries. Your private OS content remains entirely obfuscated from our signal routing relays.</p>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
