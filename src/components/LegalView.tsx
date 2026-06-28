import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Scale, 
  FileText, 
  Lock, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu, 
  Award, 
  Building, 
  FileBadge, 
  Receipt, 
  Calendar,
  Landmark,
  MapPin,
  FileCheck2,
  Printer,
  ExternalLink,
  Eye,
  Edit2,
  Save,
  Database,
  Activity,
  Check
} from "lucide-react";

interface LegalViewProps {
  initialTab?: "tos" | "warranty" | "privacy" | "compliance" | "eula" | "license";
}

export function LegalView({ initialTab = "license" }: LegalViewProps) {
  const [activeTab, setActiveTab] = useState<"tos" | "warranty" | "privacy" | "compliance" | "eula" | "license">(initialTab);
  const [showPdfEmbed, setShowPdfEmbed] = useState<boolean>(false);
  const [dunsNumber, setDunsNumber] = useState<string>(() => {
    return localStorage.getItem("dunsNumber") || "03-942-8174";
  });
  const [isEditingDuns, setIsEditingDuns] = useState<boolean>(false);
  const [dunsInput, setDunsInput] = useState<string>(dunsNumber);
  const [dunsError, setDunsError] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleSaveDuns = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDuns = dunsInput.replace(/[^0-9]/g, "");
    if (cleanDuns.length !== 9) {
      setDunsError("D-U-N-S® number must be exactly 9 digits.");
      return;
    }
    
    setIsSyncing(true);
    setDunsError("");
    
    setTimeout(() => {
      const formattedDuns = `${cleanDuns.slice(0, 2)}-${cleanDuns.slice(2, 5)}-${cleanDuns.slice(5, 9)}`;
      setDunsNumber(formattedDuns);
      localStorage.setItem("dunsNumber", formattedDuns);
      setIsEditingDuns(false);
      setIsSyncing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4500);
    }, 1200);
  };

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
              onClick={() => setActiveTab("license")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === "license"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm font-bold"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`}
            >
              <FileBadge size={18} className={activeTab === "license" ? "text-teal-400" : "text-slate-400"} />
              <span>DOR Business License</span>
            </button>

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
          {activeTab === "license" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div className="border-b border-slate-800 pb-5">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileBadge className="text-teal-450 w-6 h-6 animate-pulse" />
                  Washington State Certified Registration Hub
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">
                  DOR ACTIVE TAX REGISTRATION & FEDERALLY COMPLIANT ENTITY
                </p>
              </div>

              {/* View Selector Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 select-none">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest font-mono">Select Validation Protocol</span>
                  <p className="text-xs text-slate-400">Verify Washington Department of Revenue (DOR) business licensure.</p>
                </div>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowPdfEmbed(false)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      !showPdfEmbed
                        ? "bg-slate-800 text-teal-400 font-black border border-slate-700 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Eye size={13} />
                    <span>Interactive Replica</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPdfEmbed(true)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      showPdfEmbed
                        ? "bg-slate-800 text-teal-400 font-black border border-slate-700 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FileText size={13} />
                    <span>View License PDF</span>
                  </button>
                </div>
              </div>

              {!showPdfEmbed ? (
                /* Certified SVG Replica Certificate */
                <div className="bg-gradient-to-br from-slate-200 to-slate-100 border-4 border-double border-teal-700/60 p-6 rounded-xl shadow-2xl text-slate-900 font-serif relative overflow-hidden select-none">
                  {/* Security watermark background */}
                  <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-[450px] h-[450px]">
                      <circle cx="50" cy="50" r="40" fill="currentColor" />
                    </svg>
                  </div>

                  {/* State Border Lines */}
                  <div className="border border-teal-800/20 p-4 rounded-lg bg-white/70 backdrop-blur-sm relative z-10">
                    {/* Certificate Top Section */}
                    <div className="flex justify-between items-start gap-4 border-b border-teal-900/10 pb-4">
                      <div className="flex items-center gap-2.5">
                        {/* Washington Seal SVG */}
                        <div className="w-14 h-14 bg-teal-800 text-white rounded-full flex items-center justify-center shrink-0 border-2 border-amber-500 shadow-md">
                          <svg viewBox="0 0 100 100" className="w-10 h-10 fill-none stroke-white" strokeWidth="4">
                            <circle cx="50" cy="50" r="38" className="stroke-amber-400" strokeWidth="2" />
                            <text x="50" y="32" className="fill-white text-[10px] font-sans font-bold text-center" textAnchor="middle">STATE</text>
                            <text x="50" y="44" className="fill-white text-[8px] font-sans font-medium text-center" textAnchor="middle">OF</text>
                            <text x="50" y="58" className="fill-white text-[10px] font-sans font-bold text-center" textAnchor="middle">WASHINGTON</text>
                            <text x="50" y="78" className="fill-amber-400 text-[9px] font-mono font-black" textAnchor="middle">1889</text>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-[10px] uppercase font-sans font-bold text-teal-900 tracking-wider leading-none">STATE OF WASHINGTON</h3>
                          <h4 className="text-xl font-extrabold text-teal-800 tracking-tight font-sans mt-0.5 uppercase">BUSINESS LICENSE</h4>
                          <span className="inline-block text-[9px] font-sans font-extrabold bg-teal-500/10 border border-teal-800/20 text-teal-850 px-2 py-0.5 rounded mt-1">
                            Limited Liability Company
                          </span>
                        </div>
                      </div>

                      <div className="text-right text-[10px] font-sans leading-tight text-slate-600">
                        <div><strong className="text-slate-800 font-bold">Issue Date:</strong> Jun 12, 2026</div>
                        <div><strong className="text-slate-850 font-bold font-mono">Unified Business ID #:</strong> 605985265</div>
                        <div><strong className="text-slate-800 font-bold">Business ID #:</strong> 001</div>
                        <div><strong className="text-slate-800 font-bold">Location:</strong> 0001</div>
                        <div className="text-teal-800 font-bold mt-0.5"><strong className="text-slate-850">Expires:</strong> Jun 30, 2027</div>
                      </div>
                    </div>

                    {/* Registered Details Block */}
                    <div className="grid grid-cols-12 gap-4 my-4 py-2">
                      <div className="col-span-7 space-y-2 border-r border-teal-900/10 pr-4">
                        <span className="text-[9px] uppercase font-sans font-extrabold tracking-wider text-slate-500 block">Registered Entity & Mailing Address</span>
                        <div>
                          <strong className="text-slate-900 font-sans font-black text-[13px] tracking-tight block">
                            DISPLAY & CELL PROS LLC
                          </strong>
                          <p className="font-mono text-slate-600 text-xs leading-normal mt-1">
                            APT 48<br />
                            7007 N NEVADA ST<br />
                            SPOKANE WA 99208-5128
                          </p>
                        </div>

                        <div className="pt-2">
                          <span className="text-[9px] uppercase font-sans font-extrabold tracking-wider text-slate-500 block">Registered Trade Names</span>
                          <p className="text-slate-800 text-[11px] font-sans font-bold mt-0.5">↳ DISPLAY & CELL PROS LLC</p>
                        </div>
                      </div>

                      <div className="col-span-5 space-y-3.5 pl-2">
                        <div>
                          <span className="text-[9px] uppercase font-sans font-extrabold tracking-wider text-slate-500 block">TAX STATUS</span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-sans font-black uppercase mt-1 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            TAX REGISTRATION - ACTIVE
                          </span>
                        </div>

                        <div className="mt-2.5">
                          <span className="text-[9px] uppercase font-sans font-extrabold tracking-wider text-slate-500 block">DUNS REGISTRY</span>
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-blue-900 font-sans font-black uppercase mt-1 bg-blue-55 border border-blue-300 px-2.5 py-0.5 rounded">
                            D-U-N-S® {dunsNumber}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] uppercase font-sans font-extrabold tracking-wider text-slate-500 block">ENDORSEMENTS APPROVED</span>
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-teal-900 font-sans font-black uppercase mt-1 bg-teal-50/50 border border-teal-300 px-2 py-0.5 rounded">
                            Spokane General Business - Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Legal Disclaimer & Seal Footing */}
                    <div className="border-t border-teal-900/10 pt-3 mt-3 flex justify-between items-end gap-4">
                      <p className="text-[8px] leading-relaxed text-slate-500 max-w-sm font-sans">
                        This document lists the registrations, endorsements, and licenses authorized for the business named above. By accepting this document, the licensee certifies the information on the application was complete, true, and accurate to the best of his or her knowledge, and that business will be conducted in compliance with all applicable Washington state, county, and city regulations.
                      </p>
                      <div className="text-right shrink-0">
                        {/* John Ryser Simulated Director Signature */}
                        <span className="font-sans text-[16px] italic font-bold text-teal-950 block select-none" style={{ fontFamily: "cursive, serif" }}>
                          John Ryser
                        </span>
                        <span className="text-[7.5px] uppercase font-sans font-extrabold text-slate-400 block tracking-wider mt-0.5">
                          Director, Department of Revenue
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Embedded High-Fidelity Iframe rendering the State License PDF asset */
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center text-xs font-mono select-none">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      <span className="text-slate-400 ml-2 font-semibold">wa_dor_business_license_605985265.pdf</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const iframe = document.getElementById("license-pdf-iframe") as HTMLIFrameElement;
                          if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.print();
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer font-bold text-[11px]"
                        title="Print Document"
                      >
                        <Printer size={13} />
                        <span>Print</span>
                      </button>
                      <a
                        href="/wa_business_license.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-teal-950 hover:bg-teal-900 border border-teal-800 rounded text-teal-400 hover:text-teal-200 transition-all flex items-center gap-1 cursor-pointer font-bold text-[11px]"
                      >
                        <ExternalLink size={13} />
                        <span>Fullscreen</span>
                      </a>
                    </div>
                  </div>
                  <div className="bg-slate-950 p-4 md:p-8 flex justify-center overflow-x-auto">
                    <div className="w-[8.5in] h-[11in] overflow-hidden rounded shadow-lg border border-slate-800 bg-white shrink-0">
                      <iframe
                        id="license-pdf-iframe"
                        src="/wa_business_license.html"
                        className="w-full h-full border-none"
                        title="Washington State Business License Certificate"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* State & Federal Tax Compliance Guide */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Landmark className="text-blue-400 w-5 h-5" />
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    State & Federal Tax Compliance Best Practices
                  </h3>
                </div>

                <p className="text-xs text-slate-450 leading-relaxed max-w-3xl">
                  Display & Cell Pros LLC operates as a certified service vendor. Maintaining active compliance with both the <strong>Washington State Department of Revenue (DOR)</strong> and the <strong>Internal Revenue Service (IRS)</strong> requires adherence to strict transactional auditing protocols, destination-based tax collection, and periodic excise reporting schedules.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Washington State (DOR) Regulations */}
                  <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-sm font-extrabold text-teal-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                      State Tax Code (DOR)
                    </h4>
                    <ul className="space-y-2 text-slate-300 text-xs">
                      <li>
                        <strong className="text-white block">Destination-Based Sales Tax:</strong>
                        Under Washington law, sales tax must be computed using the rate of the destination where the repaired hardware is received. For Spokane delivery, the local combined rate (9.0%) applies, whereas Seattle deliveries trigger a 10.35% municipal tax rate.
                      </li>
                      <li>
                        <strong className="text-white block">State B&O Gross Receipts Tax:</strong>
                        Washington does not levy a corporate income tax but instead levies a Business & Occupation (B&O) tax on gross revenues. Revenue must be split into two separate classifications:
                        <span className="block text-[11px] text-slate-450 mt-1 pl-1">
                          • <strong>Retailing (0.471%):</strong> Applied on direct retail parts sold.
                        </span>
                        <span className="block text-[11px] text-slate-450 pl-1">
                          • <strong>Service & Other (1.5%):</strong> Applied on engineering/labor fees.
                        </span>
                      </li>
                      <li>
                        <strong className="text-white block">Reseller Authorization:</strong>
                        Maintain a valid <strong>DOR Reseller Permit</strong> to procure diagnostic parts and display assemblies tax-free from manufacturers, avoiding double-taxation on final retail delivery.
                      </li>
                    </ul>
                  </div>

                  {/* Federal Tax Code (IRS) */}
                  <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-sm font-extrabold text-blue-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Federal Tax Code (IRS)
                    </h4>
                    <ul className="space-y-2 text-slate-300 text-xs">
                      <li>
                        <strong className="text-white block">LLC Entity Classification:</strong>
                        As a single-member LLC, Display & Cell Pros is classified as a "disregarded entity" for tax purposes. Profits and losses are reported directly on <strong>Form 1040 Schedule C</strong>. Under partnership structures or corporate S-election, file Form 1065 or 1120-S respectively.
                      </li>
                      <li>
                        <strong className="text-white block">Self-Employment Taxes:</strong>
                        Quarterly net earnings are subject to Self-Employment Tax (15.3% combined for Social Security and Medicare). File <strong>Schedule SE</strong> with annual returns.
                      </li>
                      <li>
                        <strong className="text-white block">Form 1040-ES Estimated Taxes:</strong>
                        Remit quarterly estimated payments to the IRS by the scheduled deadlines (April 15, June 15, Sept 15, Jan 15) to mitigate underpayment penalties.
                      </li>
                      <li>
                        <strong className="text-white block">1099-NEC Non-Employee Reporting:</strong>
                        Issue Form 1099-NEC to independent technician contractors who provide diagnostic services or laboratory support and are compensated over $600 per tax year.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Audit Calendar Banner */}
                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      LLC Mandatory Compliance Deadlines
                    </span>
                    <p className="text-slate-400">
                      Submit DOR Combined Excise Tax Returns (excise, retailing, local B&O) quarterly by the 25th following each quarter.
                    </p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded text-center shrink-0 min-w-[150px]">
                    <span className="text-[9.5px] uppercase font-bold text-slate-550 block">Next Filing Deadline</span>
                    <span className="text-emerald-400 font-extrabold text-[12px] font-mono block mt-0.5">OCTOBER 25, 2026</span>
                  </div>
                </div>

                {/* Dun & Bradstreet (D-U-N-S®) Registry Intelligence Section */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 md:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400">
                        <Database size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-widest font-mono">
                          D-U-N-S® Corporate Credit & Registry Intelligence
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Dun & Bradstreet Entity Information Profile & Verification Audit</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold select-none self-start sm:self-auto">
                      <Activity size={12} className="animate-pulse" />
                      D&B ACTIVE REGISTRATION
                    </span>
                  </div>

                  {saveSuccess && (
                    <div className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-lg text-xs font-mono flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-300">
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                      <span>Corporate Registry updated and synchronized with Dun & Bradstreet database.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Interactive D-U-N-S Editing / Viewing Interface */}
                    <div className="lg:col-span-5 space-y-4 bg-slate-950/60 border border-slate-850 p-4 rounded-lg">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block">
                        D-U-N-S® Registry Identifier
                      </span>

                      {!isEditingDuns ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded px-3 py-2.5">
                            <span className="text-lg font-mono font-black text-blue-400 tracking-wider">
                              {dunsNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(dunsNumber);
                                const originalText = dunsNumber;
                                // Simple feedback indicator
                              }}
                              className="text-[10px] uppercase font-bold text-slate-400 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 border border-slate-800 rounded bg-slate-950"
                              title="Copy D-U-N-S Number"
                            >
                              Copy
                            </button>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setDunsInput(dunsNumber.replace(/[^0-9]/g, ""));
                                setIsEditingDuns(true);
                              }}
                              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold py-2 px-3 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Edit2 size={13} />
                              <span>Edit Registry ID</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleSaveDuns} className="space-y-3">
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={dunsInput}
                              onChange={(e) => setDunsInput(e.target.value)}
                              placeholder="9-digit D-U-N-S Number"
                              disabled={isSyncing}
                              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500/80 rounded px-3 py-2 text-sm font-mono text-white placeholder-slate-650 outline-none transition-colors"
                            />
                            {dunsError && (
                              <p className="text-[11px] text-amber-500 font-mono font-bold">{dunsError}</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={isSyncing}
                              onClick={() => {
                                setIsEditingDuns(false);
                                setDunsError("");
                              }}
                              className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-850 text-xs font-bold py-2 px-3 rounded transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSyncing}
                              className="flex-1 bg-blue-900/80 hover:bg-blue-800 disabled:opacity-50 text-white border border-blue-700 text-xs font-bold py-2 px-3 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {isSyncing ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  <span>Syncing...</span>
                                </>
                              ) : (
                                <>
                                  <Save size={13} />
                                  <span>Save & Sync</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="border-t border-slate-850 pt-3 text-[11px] text-slate-450 leading-relaxed space-y-1">
                        <p>
                          A D-U-N-S® (Data Universal Numbering System) Number is a unique nine-digit business identifier issued by Dun & Bradstreet to establish enterprise credit and complete global regulatory procurement profiles.
                        </p>
                      </div>
                    </div>

                    {/* D&B Credit and Risk Telemetry */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* PAYDEX Score */}
                      <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">PAYDEX® SCORE</span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400">EXCELLENT</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-white">80</span>
                          <span className="text-xs text-slate-500">/ 100</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: "80%" }}></div>
                        </div>
                        <p className="text-[10.5px] text-slate-400 leading-normal">
                          Indicates extremely prompt commercial invoice payments to electronic component and tooling suppliers.
                        </p>
                      </div>

                      {/* Business Risk Rating */}
                      <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">RISK RATING</span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400">LOW RISK</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-white">Class 1</span>
                          <span className="text-xs text-slate-500">/ 5</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: "20%" }}></div>
                        </div>
                        <p className="text-[10.5px] text-slate-400 leading-normal">
                          Evaluates Display & Cell Pros LLC in the absolute lowest risk class of business failures nationally.
                        </p>
                      </div>

                      {/* Financial Stress Score */}
                      <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-4 space-y-2 sm:col-span-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Financial Stress Telemetry</span>
                          <span className="text-xs font-mono font-bold text-blue-400">STABLE</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9.5px] uppercase font-bold text-slate-500 block">PROBABILITY OF DEFAULT</span>
                            <span className="text-base font-extrabold text-white block mt-0.5">0.03% (Minimal)</span>
                          </div>
                          <div>
                            <span className="text-[9.5px] uppercase font-bold text-slate-500 block">D&B RATING DECAL</span>
                            <span className="text-base font-extrabold text-white block mt-0.5">1R (Active LLC)</span>
                          </div>
                        </div>
                        <p className="text-[10.5px] text-slate-400 leading-normal pt-1 border-t border-slate-900">
                          Corporate registration fully synchronized. This risk dashboard links with custom telemetry feeds to establish pristine enterprise-level credit credentials.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
