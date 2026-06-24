import React, { useState, useEffect } from "react";
import { ShieldCheck, Scale, FileText, Lock, CheckCircle2, ShieldAlert, Cpu } from "lucide-react";

interface LegalViewProps {
  initialTab?: "tos" | "warranty" | "privacy" | "compliance" | "eula";
}

export function LegalView({ initialTab = "compliance" }: LegalViewProps) {
  const [activeTab, setActiveTab] = useState<"tos" | "warranty" | "privacy" | "compliance" | "eula">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Scale className="text-teal-500 h-8 w-8" />
          General Compliance, Forensic Safety & Legal
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Standard Operating Procedures, Liability Waivers, Privacy framework, and AI EULA guidelines for Display Cell Pros.
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
              <CheckCircle2 size={18} className={activeTab === "compliance" ? "text-teal-400" : ""} />
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

            <button
              onClick={() => setActiveTab("eula")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === "eula"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Cpu size={18} className={activeTab === "eula" ? "text-amber-400" : ""} />
              <span>AI Triage EULA</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10 bg-slate-900/50">
          {activeTab === "compliance" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-teal-400 w-6 h-6" />
                Compliance Standards & Forensic Clears
              </h2>
              <div className="space-y-6 text-slate-300 leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">NIST SP 800-88 R1 Erasure & Compliance</h3>
                  <p>All enterprise destruction and fleet clearing protocols executed via our diagnostic interface utilize NIST SP 800-88 R1 compliant sector-wipes to guarantee that multi-device asset liquidation retains zero readable traces. Digital certificates of erasure are populated on the client hub upon successful clears.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">Washington State DOR Regulations</h3>
                  <p>Our on-site driveway services are bound by Washington State Destination Sales Tax rules. We compute local tax boundaries per the service location within Spokane county limits to ensure complete standard compliance. Online scheduling and quotes initiated via the platform are strictly estimated subject to final on-site physical hardware inspection.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">Federal Communications Commission (FCC) Compliance</h3>
                  <p>Display & Cell Pros LLC utilizes replacement parts adhering to strict safety and radio-frequency emission limits. We ensure no unauthorized internal structural modifications are performed that would breach device safety conformity on mobile radio modems.</p>
                </section>
              </div>
            </div>
          )}

          {activeTab === "tos" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="text-blue-400 w-6 h-6" />
                Service Agreement & Liability Disclaimer
              </h2>
              <div className="space-y-6 text-slate-300 leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Consent to Specialized Operations</h3>
                  <p>By scheduling service, the customer assumes full responsibility for allowing Display & Cell Pros master technicians to open devices that possess water-resistance seals. Reapplying adhesive seals minimizes water intrusion, but original factory hydrostatic guarantees are irretrievably voided upon the initial open.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Diagnostic Base Fees</h3>
                  <p>For extensive motherboard damage or liquid spills where component-level IC restoration is required and evaluated at the driveway, non-refundable diagnostic/bench fees apply. The company limits maximum liability for any collateral damage strictly to the depreciated physical value of the hardware alone prior to the repair.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Abandoned Hardware Clause</h3>
                  <p>Physical devices untended or unpaid past sixty (60) days from completion notification via the email address registered on the system forfeit their ownership to Display & Cell Pros LLC for recycling or parts harvesting to recoup cost loss.</p>
                </section>
              </div>
            </div>
          )}

          {activeTab === "warranty" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="text-blue-400 w-6 h-6" />
                120-Day Limited Hardware Warranty
              </h2>
              <div className="space-y-6 text-slate-300 leading-relaxed">
                <section>
                  <p className="bg-blue-900/20 border border-blue-900 p-4 rounded-lg text-blue-200">
                    Display & Cell Pros LLC warranties standard replacement components (batteries, OLEDs, Charge Ports) against manufacturing defects under normal operating usage for 120 days post-repair completion.
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
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Lock className="text-purple-400 w-6 h-6" />
                Device Privacy & Data Security Architecture
              </h2>
              <div className="space-y-6 text-slate-300 leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Zero Data Harvesting Policy</h3>
                  <p>Display & Cell Pros LLC maintains a zero-tolerance data-exfiltration operation. We strictly collect PII merely to identify, schedule, and route technicians safely to our clientele in Spokane and Seattle. Client passcodes gathered securely are leveraged exclusively to enact native post-repair software parameter verifications and deleted permanently from standard logs following sign-offs.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Backup Disavowals</h3>
                  <p>We are a hardware surgical team, not a cloud data depository. You must secure cryptographic keys, local photos, and digital assets independently before authorizing motherboard IC repairs. Display & Cell Pros LLC rejects any culpability regarding unrecoverable NAND memory clusters during hard-restarts or short-circuit desoldering.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Remote Analytics</h3>
                  <p>Our diagnostic console employs anonymous telemetry to profile device hardware errors against widespread hardware fault libraries. Your private OS content remains entirely obfuscated from our signal routing relays.</p>
                </section>
              </div>
            </div>
          )}

          {activeTab === "eula" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Cpu className="text-amber-400 w-6 h-6" />
                End User License Agreement (EULA) for AI Triage
              </h2>
              <div className="space-y-6 text-slate-300 leading-relaxed">
                <section>
                  <p className="bg-amber-950/20 border border-amber-900/60 p-4 rounded-lg text-amber-200/90 text-sm flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>IMPORTANT NOTICE:</strong> Please read this End User License Agreement ("Agreement" or "EULA") carefully before utilizing the AI Triage Assistant or Forensic S2C Engine. By utilizing these tools, you agree to be bound by the terms outlined below.
                    </span>
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">1. Scope of AI Heuristics</h3>
                  <p>
                    The AI Triage Assistant uses a Forensic S2C (Symptom-to-Circuit) Mapping model to identify hypothetical circuit faults (e.g., Tristar IC anomalies, shorted VCC_MAIN decoupling capacitors) based on telemetry and customer reports. These recommendations are strictly computational estimates. They do not substitute for physical, electrical probing or standard multi-meter troubleshooting.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">2. Liability and Safety Thresholds</h3>
                  <p>
                    You agree that Display & Cell Pros is not liable for hardware decisions, desoldering, or logic board rework performed based on automated AI output. Rework profiles and micro-soldering instructions (such as SAC305 lead-free alloy temperatures) must always be validated by certified professional technicians.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">3. Telemetry and Data Protection</h3>
                  <p>
                    Diagnostic logs, ammeter current readings, and board-level signals analyzed by the AI Triage Assistant are fully anonymized. No raw user data, personal identity files, or private files on the device under test are uploaded, cataloged, or processed by our model servers.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">4. Term and Termination</h3>
                  <p>
                    Display & Cell Pros reserves the right to suspend or restrict access to the AI Triage interface and telemetry feeds if safety limits are violated (e.g., continuous drawing of anomalous current or high temperatures indicating thermal runaway risk).
                  </p>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
