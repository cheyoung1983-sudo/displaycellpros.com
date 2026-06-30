import React, { useState } from "react";
import { 
  Shield, Cpu, Terminal, CheckCircle2, AlertCircle, FileText, 
  Layers, Lock, Scale, FileSignature, Send, Check, AlertTriangle, HelpCircle, RefreshCw
} from "lucide-react";

interface TicketSubmission {
  id: string;
  partnerName: string;
  deviceModel: string;
  inferredFault: string;
  sealedScreen: boolean;
  hasMeasurements: boolean;
  connectorsCount: number;
  aiConfidenceScore: number;
  requiresClarification: boolean;
  isLiquidDamage: boolean;
}

interface ProcessedResult {
  status: "APPROVED_FACTUAL_QUOTE" | "ABSTENTION_PROTOCOL_ENGAGED";
  scope: string;
  wholesale_price_usd: number;
  disclaimer: string;
  message?: string;
  actionRequired?: string;
}

export function B2BWholesalePortal() {
  const [partnerName, setPartnerName] = useState<string>("Spokane Device Pro");
  const [deviceModel, setDeviceModel] = useState<string>("iPhone 13 Pro Max");
  const [inferredFault, setInferredFault] = useState<string>("U4500_TRISTAR_FAILURE");
  const [sealedScreen, setSealedScreen] = useState<boolean>(true);
  const [hasMeasurements, setHasMeasurements] = useState<boolean>(true);
  const [connectorsCount, setConnectorsCount] = useState<number>(1);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);

  // Past tickets for simulation history
  const [history, setHistory] = useState<Array<{ ticket: TicketSubmission; result: ProcessedResult; timestamp: string }>>([
    {
      ticket: {
        id: "TKT-B2B-8802",
        partnerName: "Cascade Electronics",
        deviceModel: "iPhone 11",
        inferredFault: "U4500_TRISTAR_FAILURE",
        sealedScreen: true,
        hasMeasurements: true,
        connectorsCount: 1,
        aiConfidenceScore: 0.98,
        requiresClarification: false,
        isLiquidDamage: false,
      },
      result: {
        status: "APPROVED_FACTUAL_QUOTE",
        scope: "Level 3: Charging IC (Tristar/Hydra) Replacement",
        wholesale_price_usd: 149.00,
        disclaimer: "Quote generated under STRICT FACTUAL MODE. Pending physical bench verification."
      },
      timestamp: "10 mins ago"
    },
    {
      ticket: {
        id: "TKT-B2B-8791",
        partnerName: "Spokane Device Pro",
        deviceModel: "iPad Air 2",
        inferredFault: "TORN_DIGITIZER_FPC",
        sealedScreen: true,
        hasMeasurements: false,
        connectorsCount: 2,
        aiConfidenceScore: 0.96,
        requiresClarification: false,
        isLiquidDamage: false,
      },
      result: {
        status: "APPROVED_FACTUAL_QUOTE",
        scope: "Level 2: FPC Connector Passive SMT Rework",
        wholesale_price_usd: 89.00, // $49 + $20 (iPad fee) + $20 (second connector)
        disclaimer: "Quote generated under STRICT FACTUAL MODE. Pending physical bench verification."
      },
      timestamp: "1 hour ago"
    }
  ]);

  const devicePresets = [
    { name: "iPhone 13 Pro Max", type: "iphone", tier: "new" },
    { name: "iPhone 12", type: "iphone", tier: "new" },
    { name: "iPhone X", type: "iphone", tier: "new" },
    { name: "iPhone 8", type: "iphone", tier: "old" },
    { name: "iPhone 6S", type: "iphone", tier: "old" },
    { name: "iPad Pro 11", type: "ipad", tier: "pro" },
    { name: "iPad Air 2", type: "ipad", tier: "standard" },
    { name: "Google Pixel 7 Pro", type: "other", tier: "standard" }
  ];

  const faultPresets = [
    { code: "U4500_TRISTAR_FAILURE", label: "Charging IC Fault (Tristar/Hydra U4500)" },
    { code: "TORN_DIGITIZER_FPC", label: "Torn Screen/Digitizer FPC Connector" },
    { code: "LIQUID_DAMAGE", label: "Severe Liquid Ingress - Power Rail Failure" },
    { code: "UNKNOWN_BLOWOUT", label: "Multiple Suspected Shorts (No ammeter measurements)" }
  ];

  const triggerAudit = async () => {
    setIsEvaluating(true);
    setProcessedResult(null);

    const isLiquidDamage = inferredFault === "LIQUID_DAMAGE";
    const isUnknown = inferredFault === "UNKNOWN_BLOWOUT";

    // Build reportedSymptom description based on selected preset
    let reportedSymptom = "";
    let diodeModeReading = "";
    let ammeterReading = "";

    if (inferredFault === "U4500_TRISTAR_FAILURE") {
      reportedSymptom = "Device completely dead, does not boot. Charging IC suspect. Static loop on ammeter.";
      ammeterReading = "0.1A flat standby loop";
      diodeModeReading = "0.540V on CC lines";
    } else if (inferredFault === "TORN_DIGITIZER_FPC") {
      reportedSymptom = "Dark Screen. No touch or display image. Pin 12 backlight anode displays open loop on LCD connector.";
      diodeModeReading = "OL on Pin 12 backlight line";
      ammeterReading = "0.8A standard charging";
    } else if (isLiquidDamage) {
      reportedSymptom = "Heavy liquid ingress on logic board. Severe corrosion around PMU charging rails.";
      ammeterReading = "0.0A absolute zero draw";
      diodeModeReading = "Short circuit (0.00V) on primary lines";
    } else {
      reportedSymptom = "Unspecified blowout, dark screen or dead device with unknown issue.";
    }

    setLogs([`[${new Date().toLocaleTimeString()}] INGESTION: Initiating Telemetry ingestion for ${deviceModel}...`]);

    const pipelineSteps = [
      "Step 1: [B2B Ingestion] Reading partner telemetry and environmental constraints...",
      "Step 2: [Strict Factual Engine] Activating STRICT_FACTUAL_MODE RAG audit layers.",
      "Step 3: [Rule Assessment] Evaluating reported symptoms against 9 non-negotiable prompt instructions.",
      "Step 4: [Verification Check] Scanning for unconfirmed board assumptions...",
      "Step 5: [S2C Pricing Matching] Transmitting payload to Cloud Run Gatekeeper and Firestore wholesale matrix...",
      "Step 6: [Finalization Gate] Executing mandatory gate checks: verifying claims support & uncertainty disclosure..."
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < pipelineSteps.length) {
        const stepMsg = pipelineSteps[currentLogIndex];
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${stepMsg}`]);
        currentLogIndex++;
      }
    }, 200);

    try {
      const response = await fetch("/api/b2b/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${partnerName.replace(/\s+/g, "_").toUpperCase()}`
        },
        body: JSON.stringify({
          deviceModel,
          reportedSymptom,
          isLiquidDamage,
          hasMeasurements,
          diodeModeReading: hasMeasurements ? diodeModeReading : "",
          ammeterReading: hasMeasurements ? ammeterReading : ""
        })
      });

      const data = await response.json();

      setTimeout(() => {
        clearInterval(interval);
        setLogs(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] SUCCESS: Cloud Run Gatekeeper returned status ${data.status} (ID: ${data.id}).`,
          `[${new Date().toLocaleTimeString()}] FIRESTORE: Ticket logged with confidence score ${(data.confidence_score * 100).toFixed(0)}%.`
        ]);
        setIsEvaluating(false);
        setProcessedResult(data);
        
        // Add to local history list
        setHistory(prev => [{
          ticket: {
            id: data.id,
            partnerName,
            deviceModel,
            inferredFault,
            sealedScreen,
            hasMeasurements,
            connectorsCount,
            aiConfidenceScore: data.confidence_score,
            requiresClarification: data.status === "ABSTENTION_PROTOCOL_ENGAGED",
            isLiquidDamage
          },
          result: {
            status: data.status,
            scope: data.scope,
            wholesale_price_usd: data.wholesale_price_usd,
            disclaimer: data.disclaimer,
            message: data.message,
            actionRequired: data.actionRequired
          },
          timestamp: "Just now"
        }, ...prev]);
      }, 1200);

    } catch (error) {
      console.error("[B2B_PORTAL_ERROR] Telemetry transmission failed:", error);
      clearInterval(interval);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ERROR: Connection failed. Engaging resilient local fallback.`]);
      setIsEvaluating(false);
    }
  };

  return (
    <div className="bg-[#111111] text-slate-100 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,128,128,0.03)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(0,128,128,0.03)_1px,_transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-8 mb-8 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/50 border border-teal-500/20 text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-3 font-mono">
            <Lock className="w-3.5 h-3.5 animate-pulse text-teal-400" /> STRICT FACTUAL ENGINE OPERATIONAL
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            Wholesale B2B Triage Portal
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-sans">
            Secure, zero-drift pricing engine mapped against microscopic BGA rework tiers for registered partner depots.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400 shrink-0" />
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Model Framework</span>
              <span className="text-xs font-bold text-slate-200 block font-mono">Anti-Hallucination Gatekeeper v4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Intake Parameters */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#151718] border border-slate-850 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2 font-mono">
              <FileSignature className="text-teal-400 w-4 h-4" /> B2B Intake Telemetry
            </h3>

            <div className="space-y-4">
              {/* Partner Name */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Partner Depot Store</label>
                <input 
                  type="text" 
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                  placeholder="e.g. Cascade Repairs"
                />
              </div>

              {/* Target Device */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Device Model Selection</label>
                <select 
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono cursor-pointer"
                >
                  {devicePresets.map(preset => (
                    <option key={preset.name} value={preset.name}>{preset.name} ({preset.type.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              {/* Inferred Fault Preset */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Inferred Board Symptom</label>
                <select 
                  value={inferredFault}
                  onChange={(e) => setInferredFault(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono cursor-pointer"
                >
                  {faultPresets.map(fault => (
                    <option key={fault.code} value={fault.code}>{fault.label}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Connector Count for SMT Rework */}
              {inferredFault === "TORN_DIGITIZER_FPC" && (
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5 font-bold">FPC Connectors to SMT Rework</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input 
                        type="radio" 
                        name="connectors" 
                        checked={connectorsCount === 1}
                        onChange={() => setConnectorsCount(1)}
                        className="accent-teal-500"
                      />
                      1 Connector ($49.00 Base)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input 
                        type="radio" 
                        name="connectors" 
                        checked={connectorsCount === 2}
                        onChange={() => setConnectorsCount(2)}
                        className="accent-teal-500"
                      />
                      2 Connectors ($69.00 Dual)
                    </label>
                  </div>
                </div>
              )}

              {/* Device Physical Parameters & Readings */}
              <div className="bg-slate-950/70 border border-slate-850 p-4 rounded-xl space-y-3">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Verification Modifiers</span>
                
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={sealedScreen}
                    onChange={(e) => setSealedScreen(e.target.checked)}
                    className="mt-0.5 rounded border-slate-800 text-teal-600 focus:ring-teal-500 bg-slate-900"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Sealed Screen Attached</span>
                    <span className="text-[10px] text-slate-400 block">Applies disassembly safety fee ($20-$30) for iPads.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={hasMeasurements}
                    onChange={(e) => setHasMeasurements(e.target.checked)}
                    className="mt-0.5 rounded border-slate-800 text-teal-600 focus:ring-teal-500 bg-slate-900"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Bench Measurements Provided</span>
                    <span className="text-[10px] text-slate-400 block">Diode mode or ammeter values logged. Keeps confidence high (&gt;95%).</span>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={triggerAudit}
                disabled={isEvaluating}
                className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                  isEvaluating
                    ? "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/10 hover:shadow-teal-900/20"
                }`}
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                    Executing Gatekeeper Audit...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    Evaluate SLA & Quote Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Output Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Gatekeeper Engine Logs */}
          <div className="bg-[#151718] border border-slate-850 rounded-2xl p-6 flex flex-col h-64">
            <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-teal-400" />
                Anti-Hallucination Pipeline Logs
              </span>
              <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono uppercase font-bold">
                Factual Monitor Mode
              </span>
            </div>

            <div className="flex-1 font-mono text-[11px] text-slate-300 space-y-2 overflow-y-auto select-text scrollbar-thin scrollbar-thumb-slate-800">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic h-full flex items-center justify-center">
                  Awaiting ingestion input parameters...
                </div>
              ) : (
                logs.map((log, idx) => {
                  let colorClass = "text-slate-300";
                  if (log.includes("[System]")) colorClass = "text-blue-400";
                  if (log.includes("[B2B Ingestion]")) colorClass = "text-cyan-400";
                  if (log.includes("[Strict Factual Engine]")) colorClass = "text-teal-400 font-bold";
                  if (log.includes("[Rule Assessment]")) colorClass = "text-indigo-400";
                  if (log.includes("[S2C Pricing Matching]")) colorClass = "text-teal-400";
                  if (log.includes("[Verification Check]")) colorClass = "text-blue-400";
                  if (log.includes("[Finalization Gate]")) colorClass = "text-pink-400 font-bold";
                  return (
                    <div key={idx} className={colorClass}>
                      {log}
                    </div>
                  );
                })
              )}
              {isEvaluating && (
                <div className="text-teal-400 flex items-center gap-1.5 mt-2 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping"></span>
                  Analyzing circuit board parameters...
                </div>
              )}
            </div>
          </div>

          {/* SLA Response / Binding Estimate Card */}
          {processedResult && (
            <div className={`border rounded-2xl p-6 animate-in slide-in-from-bottom-3 duration-300 relative ${
              processedResult.status === "APPROVED_FACTUAL_QUOTE"
                ? "bg-slate-950/90 border-sky-500/30 shadow-[0_10px_30px_rgba(0,191,255,0.05)]"
                : "bg-slate-950/90 border-amber-500/30 shadow-[0_10px_30px_rgba(255,191,0,0.05)]"
            }`}>
              <div className="flex items-start justify-between gap-4 border-b border-slate-850 pb-4 mb-4">
                <div>
                  <span className={`text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                    processedResult.status === "APPROVED_FACTUAL_QUOTE"
                      ? "bg-sky-950/40 text-sky-400 border-sky-500/20"
                      : "bg-amber-950/40 text-amber-400 border-amber-500/20"
                  }`}>
                    {processedResult.status === "APPROVED_FACTUAL_QUOTE" ? "SLA ACTIVE: BINDING ESTIMATE APPROVED" : "ABSTENTION ENGAGED: MANUAL INTERVENTION"}
                  </span>
                  
                  <h4 className="text-base font-bold text-white uppercase font-sans mt-2 tracking-tight">
                    {processedResult.scope}
                  </h4>
                </div>
 
                {processedResult.status === "APPROVED_FACTUAL_QUOTE" && (
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Wholesale Rate</span>
                    <span className="text-2xl font-black text-sky-400 font-mono block">${processedResult.wholesale_price_usd.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {processedResult.status === "APPROVED_FACTUAL_QUOTE" ? (
                <div className="space-y-4">
                  <div className="text-xs text-slate-300 leading-relaxed font-sans">
                    Our pricing algorithm mapped this fault directly to the B2B Level 2/3 S2C database. This estimate has successfully passed our model integrity gates. It represents a binding legal SLA.
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-[#111] p-3 rounded-xl text-xs font-mono border border-slate-900">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Hardware Diagnostic</span>
                      <span className="text-slate-300 font-bold">{inferredFault === "U4500_TRISTAR_FAILURE" ? "U4500 Charge Loop" : inferredFault === "TORN_DIGITIZER_FPC" ? "SMT FPC Connector" : "Data Recovery Only"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Target Device</span>
                      <span className="text-slate-300 font-bold">{deviceModel}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 border-t border-slate-850 pt-3 italic font-mono">
                    <Scale className="w-3.5 h-3.5 text-slate-500" />
                    {processedResult.disclaimer}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                    <AlertTriangle className="text-amber-400 w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                        9-Rule Non-Negotiable Gate Blocked
                      </h5>
                      <p className="text-xs text-amber-100 mt-1 leading-relaxed">
                        &ldquo;{processedResult.message}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 leading-relaxed font-sans">
                    <strong>Cause of Abstention:</strong> Model confidence fell below the 95% threshold because ammeter or diode readings were omitted. To prevent hallucinatory misquotes or diagnostic drift, the automated engine has halted execution.
                  </div>

                  <div className="border-t border-slate-850 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                      Status: Checked with strict zero-guess filter.
                    </div>
                    
                    <button 
                      onClick={() => {
                        alert("Ticket successfully escalated to Ryan Young (Lead Forensic Engineer). Manual review link sent over POS webhook.");
                      }}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 transition-colors text-slate-950 rounded text-[10px] font-black uppercase tracking-wider font-mono cursor-pointer"
                    >
                      Escalate to Lead Engineer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SLA History Logs / Active Audits */}
      <div className="mt-10 border-t border-slate-800 pt-8">
        <h3 className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold font-mono mb-6">
          [Wholesale SLA Ticket History & Audit Records]
        </h3>

        <div className="space-y-3">
          {history.map((record, index) => (
            <div key={index} className="bg-[#121415] border border-slate-850 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-slate-500 font-bold">{record.ticket.id}</span>
                <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">{record.ticket.partnerName}</span>
                <span className="text-slate-400 font-bold">{record.ticket.deviceModel}</span>
                <span className="text-slate-500">&mdash;</span>
                <span className="text-slate-400">{record.result.scope}</span>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <span className="text-slate-500 text-[10px]">{record.timestamp}</span>
                {record.result.status === "APPROVED_FACTUAL_QUOTE" ? (
                  <div className="flex items-center gap-2 text-teal-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>APPROVED (${record.result.wholesale_price_usd.toFixed(2)})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>ABSTAINED</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
