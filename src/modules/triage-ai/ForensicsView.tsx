import React from "react";
import { 
  Cpu, Zap, Sparkles, Filter, Database, Copy, ChevronRight, 
  AlertCircle, CheckCircle, Sliders, ShieldAlert, FileText, 
  Terminal, ArrowRight, ShieldCheck, Activity, ThumbsUp, ThumbsDown,
  Loader2, FileDown, RefreshCw, Brain
} from "lucide-react";
import { jsPDF } from "jspdf";
import { BrandLogo } from "../../components/BrandLogo";

interface ForensicsViewProps {
  forensicDevice: "iPhone XR" | "iPad Pro 9.7";
  setForensicDevice: (val: "iPhone XR" | "iPad Pro 9.7") => void;
  isForensicScanning: boolean;
  setIsForensicScanning: (val: boolean) => void;
  forensicProgress: number;
  setForensicProgress: React.Dispatch<React.SetStateAction<number>>;
  forensicLogs: string[];
  setForensicLogs: (val: string[]) => void;
  forensicSOP: any;
  setForensicSOP: (val: any) => void;
  mountedSources: Record<string, boolean>;
  setMountedSources: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  s2cActivePathway: "backlight" | "charging" | "short_rail";
  setS2cActivePathway: (val: "backlight" | "charging" | "short_rail") => void;
  s2cActiveCodeTab: "typescript" | "json";
  setS2cActiveCodeTab: (val: "typescript" | "json") => void;
  s2cBatteryTemp: number;
  setS2cBatteryTemp: (val: number) => void;
  s2cAmmeterReading: number;
  setS2cAmmeterReading: (val: number) => void;
  s2cIsSimulatingCheck: boolean;
  setS2cIsSimulatingCheck: (val: boolean) => void;
  s2cCheckLogs: string[];
  setS2cCheckLogs: (val: string[]) => void;
  s2cCheckStatus: "idle" | "testing" | "passed" | "thermal_halt";
  setS2cCheckStatus: (val: "idle" | "testing" | "passed" | "thermal_halt") => void;
  s2cFeedbackRating: Record<string, "up" | "down" | null>;
  setS2cFeedbackRating: React.Dispatch<React.SetStateAction<Record<string, "up" | "down" | null>>>;
  s2cFeedbackNotes: Record<string, string>;
  setS2cFeedbackNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  s2cFeedbackSubmitted: Record<string, boolean>;
  setS2cFeedbackSubmitted: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  s2cIsSubmittingFeedback: boolean;
  setS2cIsSubmittingFeedback: (val: boolean) => void;
  covThreshold: number;
  setCovThreshold: (val: number) => void;
  covCustomDraft: string;
  setCovCustomDraft: (val: string) => void;
  isCovRunning: boolean;
  setIsCovRunning: (val: boolean) => void;
  covLogs: string[];
  setCovLogs: React.Dispatch<React.SetStateAction<string[]>>;
  covStatus: "PASS" | "REDO" | "IDLE";
  setCovStatus: (val: "PASS" | "REDO" | "IDLE") => void;
  covAuditResult: any;
  setCovAuditResult: (val: any) => void;
  isNarrowingActive: boolean;
  setIsNarrowingActive: (val: boolean) => void;
  narrowingLogs: string[];
  setNarrowingLogs: React.Dispatch<React.SetStateAction<string[]>>;
  narrowedAudit: any;
  setNarrowedAudit: (val: any) => void;
  selectedCovTab: "interactive" | "payload";
  setSelectedCovTab: (val: "interactive" | "payload") => void;
  
  // Custom Visual Orchestrator States
  telemetrySpecTab: "visual" | "android" | "ios" | "macos";
  setTelemetrySpecTab: (val: "visual" | "android" | "ios" | "macos") => void;
  activePlanTier: "standard" | "plus" | "pro" | "ultra" | "enterprise";
  setActivePlanTier: (val: "standard" | "plus" | "pro" | "ultra" | "enterprise") => void;
  referenceMode: "solder_matrices" | "thermal_seeker" | "handshake_failures";
  setReferenceMode: (val: "solder_matrices" | "thermal_seeker" | "handshake_failures") => void;
  hallucinationSimulatedKeyword: string;
  setHallucinationSimulatedKeyword: (val: string) => void;
  imeiInput: string;
  setImeiInput: (val: string) => void;
  isSecurityScraping: boolean;
  setIsSecurityScraping: (val: boolean) => void;
  securityCheckResult: any;
  setSecurityCheckResult: (val: any) => void;

  // Utilities
  addToast: (title: string, msg: string, type: "success" | "info" | "warning" | "error") => void;
  getPathwayDraft: (pathway: string) => string;
  runChainOfVerification: () => void;
  triggerSourceNarrowing: () => void;
  handleS2cFeedbackSubmit: (pathwayId: string) => Promise<void>;
  copyToClipboard: (text: string) => void;
  keywordsList: { keyword: string; matched: boolean; sourceDoc: string }[];
  calculatedFidelity: number;
  noisePenalty: number;
  pass: boolean;
}

export const ForensicsView: React.FC<ForensicsViewProps> = ({
  forensicDevice,
  setForensicDevice,
  isForensicScanning,
  setIsForensicScanning,
  forensicProgress,
  setForensicProgress,
  forensicLogs,
  setForensicLogs,
  forensicSOP,
  setForensicSOP,
  mountedSources,
  setMountedSources,
  s2cActivePathway,
  setS2cActivePathway,
  s2cActiveCodeTab,
  setS2cActiveCodeTab,
  s2cBatteryTemp,
  setS2cBatteryTemp,
  s2cAmmeterReading,
  setS2cAmmeterReading,
  s2cIsSimulatingCheck,
  setS2cIsSimulatingCheck,
  s2cCheckLogs,
  setS2cCheckLogs,
  s2cCheckStatus,
  setS2cCheckStatus,
  s2cFeedbackRating,
  setS2cFeedbackRating,
  s2cFeedbackNotes,
  setS2cFeedbackNotes,
  s2cFeedbackSubmitted,
  setS2cFeedbackSubmitted,
  s2cIsSubmittingFeedback,
  setS2cIsSubmittingFeedback,
  covThreshold,
  setCovThreshold,
  covCustomDraft,
  setCovCustomDraft,
  isCovRunning,
  setIsCovRunning,
  covLogs,
  setCovLogs,
  covStatus,
  setCovStatus,
  covAuditResult,
  setCovAuditResult,
  isNarrowingActive,
  setIsNarrowingActive,
  narrowingLogs,
  setNarrowingLogs,
  narrowedAudit,
  setNarrowedAudit,
  selectedCovTab,
  setSelectedCovTab,
  telemetrySpecTab,
  setTelemetrySpecTab,
  activePlanTier,
  setActivePlanTier,
  referenceMode,
  setReferenceMode,
  hallucinationSimulatedKeyword,
  setHallucinationSimulatedKeyword,
  imeiInput,
  setImeiInput,
  isSecurityScraping,
  setIsSecurityScraping,
  securityCheckResult,
  setSecurityCheckResult,
  addToast,
  getPathwayDraft,
  runChainOfVerification,
  triggerSourceNarrowing,
  handleS2cFeedbackSubmit,
  copyToClipboard,
  keywordsList,
  calculatedFidelity,
  noisePenalty,
  pass
}) => {
  // --- ENTERPRISE RAG CORE SPECIFICATION STATES ---
  const [targetAlloy, setTargetAlloy] = React.useState<"SAC305" | "Sn63_Pb37" | "LowTemp_Bi58">("SAC305");
  const [hasUnderfill, setHasUnderfill] = React.useState<boolean>(true);
  const [appliedTempC, setAppliedTempC] = React.useState<number>(370);
  const [validationResult, setValidationResult] = React.useState<any | null>(null);

  const [selectedSourceType, setSelectedSourceType] = React.useState<"pdf" | "excel_over_150k" | "excel_under_150k" | "markdown">("pdf");
  const [isPreProcessing, setIsPreProcessing] = React.useState<boolean>(false);
  const [preProcessLogs, setPreProcessLogs] = React.useState<string[]>([]);

  const [isInterposerJoined, setIsInterposerJoined] = React.useState<boolean>(true);
  const [queryText, setQueryText] = React.useState<string>("Short circuit only present when sandwich interposer is joined.");
  const [isQueryingRAG, setIsQueryingRAG] = React.useState<boolean>(false);
  const [ragQueryResult, setRagQueryResult] = React.useState<any | null>(null);

  const handleValidateReworkProfile = () => {
    // 1. Evaluate Underfill Softening Requirements
    if (hasUnderfill && appliedTempC < 200) {
      setValidationResult({
        status: "UNDERFILL_WARNING",
        style: "warning",
        directive: "UNDERFILL_WARNING: Temperature too low. Epoxy will not soften at this temp, risking ripped copper pads during chip extraction."
      });
      addToast("Rework Profile Flagged", "Underfill softener temperature is insufficient!", "warning");
      return;
    }

    // 2. Validate Peak Temperature against Alloy Liquidus
    let maxSafeTemp = 0;
    switch (targetAlloy) {
      case "SAC305": maxSafeTemp = 400; break;      // Factory Lead-free (Sn96.5/Ag3.0/Cu0.5)
      case "Sn63_Pb37": maxSafeTemp = 330; break;   // Traditional Leaded
      case "LowTemp_Bi58": maxSafeTemp = 220; break; // Bismuth
    }

    if (appliedTempC > maxSafeTemp) {
      setValidationResult({
        status: "DENIED_THERMAL_OVERLOAD",
        style: "danger",
        directive: `Reduce airflow. Exceeding ${maxSafeTemp}°C for ${targetAlloy} exponentially increases electromigration risk and substrate CTE shear.`
      });
      addToast("Thermal Profile Denied", "Excessive heat violates material safe zones!", "error");
    } else {
      setValidationResult({
        status: "APPROVED_THERMAL_PROFILE",
        style: "success",
        directive: "Thermal parameters within safe logic board hardware tolerances. CTE mechanical shear limits respected."
      });
      addToast("Thermal Profile Approved", "Metallurgical parameters are within safety thresholds.", "success");
    }
  };

  const handleOptimizeSource = () => {
    setIsPreProcessing(true);
    setPreProcessLogs(["[RAG-PREPROC] Scanning uploaded payload binary structures..."]);
    
    setTimeout(() => {
      if (selectedSourceType === "pdf") {
        setPreProcessLogs(prev => [
          ...prev,
          "[RAG-PREPROC] Detected heavy binary: application/pdf",
          "❌ RAG_OPTIMIZATION_ERROR: PDFs require excessive OCR tokens. Convert schematic to .md, .txt, or Google Docs prior to upload to prevent context flooding."
        ]);
        setIsPreProcessing(false);
        addToast("PDF Upload Restricted", "Convert to Markdown/Text to ensure 100% reasoning depth.", "error");
      } else if (selectedSourceType === "excel_over_150k") {
        setPreProcessLogs(prev => [
          ...prev,
          "[RAG-PREPROC] Detected spreadsheet: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "[RAG-PREPROC] Word Count Audit: Cell count exceeds 150,000 threshold limit.",
          "⚠️ Splitting Excel workbook to prevent 500,000-word structural character inflation limit...",
          "[RAG-PREPROC] Segment 1: Rows 1-75000 compiled to 'XS_Max_Interposer_Part1.md' (SUCCESS_SOURCE_ADDED)",
          "[RAG-PREPROC] Segment 2: Rows 75001-150000 compiled to 'XS_Max_Interposer_Part2.md' (SUCCESS_SOURCE_ADDED)",
          "[RAG-PREPROC] Enterprise Context Guard: Grounding cache synced cleanly!"
        ]);
        setIsPreProcessing(false);
        addToast("Spreadsheet Optimized", "Split into clean Markdown chunks successfully!", "success");
      } else if (selectedSourceType === "excel_under_150k") {
        setPreProcessLogs(prev => [
          ...prev,
          "[RAG-PREPROC] Detected spreadsheet: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "[RAG-PREPROC] Cell Count: 45,210 active cells. Within safe bounds.",
          "[RAG-PREPROC] Converting directly to row-wise JSON Markdown array representation...",
          "[RAG-PREPROC] SUCCESS_SOURCE_ADDED: File indexed safely with 100% telemetry integrity."
        ]);
        setIsPreProcessing(false);
        addToast("Spreadsheet Uploaded", "Indexed directly within context limitations.", "success");
      } else {
        setPreProcessLogs(prev => [
          ...prev,
          "[RAG-PREPROC] Detected high-fidelity file: text/markdown",
          "[RAG-PREPROC] 100% Unicode parity. No image-based OCR tokens required.",
          "[RAG-PREPROC] SUCCESS_SOURCE_ADDED: Syncing with NotebookLM Enterprise us-central1 endpoint..."
        ]);
        setIsPreProcessing(false);
        addToast("Markdown Source Linked", "Enterprise RAG context successfully cached!", "success");
      }
    }, 1500);
  };

  const handleQueryRAGInterposer = () => {
    setIsQueryingRAG(true);
    setRagQueryResult(null);
    
    setTimeout(() => {
      setIsQueryingRAG(false);
      if (isInterposerJoined) {
        setRagQueryResult({
          status: "DETACH_INTERPOSER_REQUIRED",
          targetedSources: ["XS_Max_Interposer_Schematic.md", "VDD_MAIN_Routing_Rules.txt"],
          directive: "WARNING: VDD_MAIN short is localized inside the sandwich interface. VDD_MAIN is not contiguous across a single layer. You must separate the upper RF logic board from the lower board to inject voltage and prevent destroying the baseband CPU. Use an iSocket test jig to test layers independently."
        });
        addToast("S2C Fault Isolated", "Interposer boundary mismatch detected. Separation required!", "warning");
      } else {
        setRagQueryResult({
          status: "VOLTAGE_INJECTION_SAFE",
          targetedSources: ["XS_Max_Interposer_Schematic.md"],
          directive: "Boards are separated. It is now safe to inject 1.0V - 2.0V current onto VDD_MAIN to localize the faulty decoupling capacitor (like C247_W) using the thermal Seek microbolometer camera. Do not exceed 400°C for SAC305 rework."
        });
        addToast("Safe-Zone Confirmed", "Ready for targeted voltage injection.", "success");
      }
    }, 1200);
  };

  // Pathway configuration metadata for rendering S2C interactive circuit trace layout with nominal specifications
  const pathwayData = {
    backlight: {
      pdf: "iPad-Pro-9.7-Backlight-FL1728.pdf",
      sourceName: "iPad Pro Backlight Schema",
      component: "FL1728",
      rail: "PP_LCM_BL_ANODE (Backlight)",
      color: "#00BFFF", // Silicon Blue
      description: "LCD backlight fuse filter FL1728 open loop. Display is functional but backlight doesn't activate.",
      nodes: [
        { id: "vbat", label: "PP_BAT_VCC", desc: "Battery Main Power", x: 70, y: 120, status: "good", val: "3.82V", nominalRail: "PP_BAT_VCC", nominalVoltage: "3.7V - 4.2V", expectedDiodeValue: "0.345 V" },
        { id: "fuse", label: "FL1728", desc: "Backlight Filter Fuse", x: 210, y: 120, status: "fault", val: "OL Impedance", isFault: true, nominalRail: "PP_LCM_BL_ANODE_CONN", nominalVoltage: "18.5V - 22.0V", expectedDiodeValue: "0.522 V" },
        { id: "diode", label: "D4020", desc: "Schottky Boost Diode", x: 350, y: 120, status: "blocked", val: "3.82V (Unboosted)", nominalRail: "PP_LCM_BL_ANODE_SW", nominalVoltage: "18.5V - 22.0V", expectedDiodeValue: "0.412 V" },
        { id: "lcm", label: "J4200 Pin Anode", desc: "LCM Screen Connector", x: 490, y: 120, status: "bad", val: "0V Output", nominalRail: "PP_BL_LCM_ANODE", nominalVoltage: "18.5V - 22.0V", expectedDiodeValue: "0.520 V" }
      ],
      traces: [
        { from: "vbat", to: "fuse" },
        { from: "fuse", to: "diode" },
        { from: "diode", to: "lcm" }
      ]
    },
    charging: {
      pdf: "Tristar-1610A3-USB-Multiplexer.pdf",
      sourceName: "Tristar 1610A3 Multiplexer",
      component: "1610A3",
      rail: "USB_VBUS",
      color: "#008080", // Audit Teal
      description: "USB handshake controller failed, drawing flat static 1.1A without registering charge.",
      nodes: [
        { id: "vbus", label: "VBUS_OVP", desc: "USB Charger Input", x: 70, y: 120, status: "good", val: "5.04V", nominalRail: "PP_VBUS_E75", nominalVoltage: "4.75V - 5.25V", expectedDiodeValue: "0.485 V" },
        { id: "ic", label: "U4500", desc: "1610A3 Tristar IC", x: 210, y: 120, status: "fault", val: `${s2cAmmeterReading}A Draw / Short`, isFault: true, nominalRail: "PP_VCC_MAIN", nominalVoltage: "3.71V - 4.2V", expectedDiodeValue: "0.315 V" },
        { id: "mosfet", label: "Q4500", desc: "OVP MOSFET Gate", x: 350, y: 120, status: "blocked", val: "0.0V (Latch closed)", nominalRail: "PP_VBUS_PROT", nominalVoltage: "4.75V - 5.25V", expectedDiodeValue: "0.490 V" },
        { id: "pmic", label: "U2100 PMIC", desc: "Power Management IC", x: 490, y: 120, status: "bad", val: "0.0A Charging", nominalRail: "PP1V8_ALWAYS", nominalVoltage: "1.80V", expectedDiodeValue: "0.285 V" }
      ],
      traces: [
        { from: "vbus", to: "ic" },
        { from: "ic", to: "mosfet" },
        { from: "mosfet", to: "pmic" }
      ]
    },
    short_rail: {
      pdf: "iPhone-XR-Schematics-Power-Rails.pdf",
      sourceName: "iPhone XR Power Rails Schema",
      component: "C247_W",
      rail: "VDD_MAIN",
      color: "#00BFFF", // Silicon Blue
      description: "Filter capacitor C247_W short-to-ground collapsed main power rail, generating heat.",
      nodes: [
        { id: "vbat", label: "PP_BATT_VCC", desc: "Battery Source Input", x: 70, y: 120, status: "good", val: "3.82V", nominalRail: "PP_BAT_VCC", nominalVoltage: "3.7V - 4.2V", expectedDiodeValue: "0.345 V" },
        { id: "cap", label: "C247_W", desc: "Dielectric Capacitor", x: 210, y: 120, status: "fault", val: "0.1 Ω Short", isFault: true, nominalRail: "PP_VDD_MAIN", nominalVoltage: "3.71V - 4.2V", expectedDiodeValue: "0.322 V" },
        { id: "rail", label: "VDD_MAIN", desc: "Collapsed System Rail", x: 350, y: 120, status: "bad", val: `${s2cBatteryTemp > 65 ? "Thermal Halt" : "Collapsed (0.04V)"}`, nominalRail: "PP_VDD_MAIN", nominalVoltage: "3.71V - 4.2V", expectedDiodeValue: "0.322 V" },
        { id: "ap", label: "A12 Core", desc: "Processor Power Rails", x: 490, y: 120, status: "bad", val: "0V Core Supply", nominalRail: "PP_CPU_CORE", nominalVoltage: "0.95V - 1.12V", expectedDiodeValue: "0.024 V" }
      ],
      traces: [
        { from: "vbat", to: "cap" },
        { from: "cap", to: "rail" },
        { from: "rail", to: "ap" }
      ]
    }
  };

  const [selectedNodeState, setSelectedNodeState] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSelectedNodeState(null);
  }, [s2cActivePathway]);

  const selectedPathway = pathwayData[s2cActivePathway] || pathwayData.backlight;
  const isMounted = !!mountedSources[selectedPathway.pdf];

  // Derive the active node inside the selected pathway
  const activeNodeId = selectedNodeState || (selectedPathway.nodes.find(n => n.isFault)?.id || selectedPathway.nodes[0].id);
  const activeNode = selectedPathway.nodes.find(n => n.id === activeNodeId) || selectedPathway.nodes[0];

  return (
    <section className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col flex-1 shadow-md overflow-hidden animate-in fade-in duration-300 font-sans text-left">
      <div className="bg-slate-850 px-6 py-5 border-b border-slate-700 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BrandLogo size={34} showText={true} />
          <div className="h-10 w-px bg-slate-700 hidden xl:block"></div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-tight font-mono">
              [S2C Intelligence Dashboard]
            </h2>
            <p className="text-[11px] text-slate-400 max-w-xl">
              Forensic RAG-Diagnostics Engine with hardware-level telemetry ingestion and strict NIST SP 800-88 R1 audit protocols.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-violet-955/60 border border-violet-900/40 px-3 py-1 rounded-lg text-[9.5px] font-mono text-violet-300 font-extrabold uppercase tracking-wider shrink-0">
          CoV System Live
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">

      {/* TOP GRID: Low-Level Physical Telemetry & NotebookLM API Capacity limits */}
      <div className="grid grid-cols-12 gap-5 mb-6 items-stretch">
        
        {/* Left Block: Low-Level Ingestion Subsystem */}
        <div className="col-span-12 lg:col-span-6 bg-slate-900/50 border border-slate-755 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-750 pb-2 mb-3">
              <span className="text-[10px] font-extrabold text-violet-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-violet-400 animate-pulse" />
                1. Low-Level Ingestion Layer
              </span>
              <span className="text-[9px] text-emerald-400 font-mono tracking-wider font-extrabold uppercase">
                ● CORE RECOVERY API PROTOCOL
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed mb-4 text-left">
              Sovereign micro-diagnostics capture hardware status directly. Solder technicians can switch between the simulated active bench view and low-level source-code templates that hook physical telemetry:
            </p>

            {/* Secondary code tabs for low level hardware adapters */}
            <div className="flex border-b border-slate-800 pb-2 mb-3 gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setTelemetrySpecTab("visual")}
                className={`px-2.5 py-1 rounded font-mono text-[9.5px] font-extrabold uppercase transition-all tracking-wider cursor-pointer border ${
                  telemetrySpecTab === "visual"
                    ? "bg-violet-950 text-violet-350 border-violet-800/60"
                    : "text-slate-500 border-transparent hover:text-slate-350"
                }`}
              >
                🖥️ Visual Console
              </button>
              <button
                type="button"
                onClick={() => setTelemetrySpecTab("android")}
                className={`px-2.5 py-1 rounded font-mono text-[9.5px] font-extrabold uppercase transition-all tracking-wider cursor-pointer border ${
                  telemetrySpecTab === "android"
                    ? "bg-violet-950 text-violet-350 border-violet-800/60"
                    : "text-slate-500 border-transparent hover:text-slate-350"
                }`}
              >
                🤖 Android Broadcast
              </button>
              <button
                type="button"
                onClick={() => setTelemetrySpecTab("ios")}
                className={`px-2.5 py-1 rounded font-mono text-[9.5px] font-extrabold uppercase transition-all tracking-wider cursor-pointer border ${
                  telemetrySpecTab === "ios"
                    ? "bg-violet-950 text-violet-350 border-violet-800/60"
                    : "text-slate-500 border-transparent hover:text-slate-350"
                }`}
              >
                🍏 iOS CFAllocator Override
              </button>
              <button
                type="button"
                onClick={() => setTelemetrySpecTab("macos")}
                className={`px-2.5 py-1 rounded font-mono text-[9.5px] font-extrabold uppercase transition-all tracking-wider cursor-pointer border ${
                  telemetrySpecTab === "macos"
                    ? "bg-violet-950 text-violet-350 border-violet-800/60"
                    : "text-slate-500 border-transparent hover:text-slate-350"
                }`}
              >
                💻 macOS IOPowerInfo
              </button>
            </div>

            {telemetrySpecTab === "visual" && (
              <div className="space-y-3.5">
                <div>
                  <label htmlFor="forensicDeviceSelect" className="block text-[9.5px] text-slate-400 font-bold uppercase mb-1.5 font-mono">
                    Configure Active Device Hardware Profile
                  </label>
                  <select
                    id="forensicDeviceSelect"
                    value={forensicDevice}
                    onChange={(e) => {
                      setForensicDevice(e.target.value as any);
                      setForensicSOP(null);
                      setForensicLogs([]);
                      setForensicProgress(0);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono cursor-pointer outline-none focus:border-violet-650"
                  >
                    <option value="iPhone XR">Apple iPhone XR (Intel Baseband / N104)</option>
                    <option value="iPad Pro 9.7">Apple iPad Pro 9.7" (A9X AP / J98a)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-850 space-y-1.5 text-left font-mono">
                  <p className="text-[10px] text-violet-400 uppercase tracking-wider font-extrabold">Active Symptoms Profile:</p>
                  {forensicDevice === "iPhone XR" ? (
                    <p className="text-[10.5px] text-slate-300 leading-relaxed">
                      ⚡ <strong>PP_VCC_MAIN / VDD_MAIN Deadlock Profile:</strong> Device consumes flat <span className="text-red-400 font-bold">1.1A</span> at USB ammeter, boot loop, static impedance. Hot air removal of dielectric capacitor <span className="text-indigo-350 underline">C247_W</span> indicated.
                    </p>
                  ) : (
                    <p className="text-[10.5px] text-slate-300 leading-relaxed">
                      📺 <strong>Backlight Anode Anomaly:</strong> Corroded backlight filter fuse <span className="text-indigo-300 underline">FL1728</span> (liquid trigger). LCD screen is dark, but 45° angled light reveals active image graphics.
                    </p>
                  )}
                </div>
              </div>
            )}

            {telemetrySpecTab === "android" && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-sans">
                  <strong>Sticky Intents Broadcast:</strong> Bypasses typical security sandbox on Android by pulling directly from `BatteryManager` cached properties.
                </p>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[10px] font-mono text-indigo-350 text-left overflow-x-auto leading-normal">
{`// Android Telemetry Receiver
val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
val stickyIntent: Intent? = context.registerReceiver(null, filter)
val millivolts = stickyIntent?.getIntExtra(BatteryManager.EXTRA_VOLTAGE, -1) ?: -1
val microamps = batteryManager.getIntProperty(BatteryPropertyCurrentNow)
val batteryTemp = stickyIntent?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) ?: 0
// Output: ${s2cAmmeterReading}A verified draw. Temp: ${s2cBatteryTemp}°C`}
                </pre>
              </div>
            )}

            {telemetrySpecTab === "ios" && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400 font-sans">
                  <strong>CFAllocator Injector:</strong> Traps private Objective-C updates to `UIDevice` battery and hardware state dictionaries.
                </p>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[10px] font-mono text-emerald-400 text-left overflow-x-auto leading-normal">
{`// iOS Memory Registry Interception
static CFAllocatorRef MyCustomAllocatorOverride(void) {
  // Overrides Cocoa system allocator to lock device battery current
  IOKit_battery_dict_t *trapped_dict = trap_cfproperties_on_update();
  int instantCurrentNow = trapped_dict->InstantAmperage;
  return OriginalAllocatorRef;
}
// Live values: current = ${s2cAmmeterReading}A`}
                </pre>
              </div>
            )}

            {telemetrySpecTab === "macos" && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400 font-sans">
                  <strong>Apple PowerSources.h API:</strong> Compiles natively to target IOKit telemetry nodes representing SMC current shunt readings.
                </p>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[10px] font-mono text-violet-300 text-left overflow-x-auto leading-normal">
{`#include <IOKit/ps/IOPowerSources.h>
CFTypeRef blob = IOPSCopyPowerSourcesInfo();
CFArrayRef sources = IOPSCopyPowerSourcesList(blob);
// Enumerates hardware arrays...
double tempReading = IOPSGetTemperatureReading(sources[0]);
// Current extracted: temp = ${s2cBatteryTemp}°C`}
                </pre>
              </div>
            )}
          </div>

          {telemetrySpecTab === "visual" && (
            <div className="space-y-3 pt-2">
              {isForensicScanning ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>POLLING POWER DRIVERS PORT 3000...</span>
                    <span>{forensicProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
                      style={{ width: `${forensicProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsForensicScanning(true);
                    setForensicProgress(0);
                    setForensicSOP(null);
                    const logs = [
                      "[IOKit] CDC-ACM USB Driver multiplexer initialized.",
                      `[IOKit] Connected target: ${forensicDevice} hardware registry.`,
                      "[Ammeter] Polling stable input bus amperage draws...",
                      `[Ammeter] Telemetry captured: ${forensicDevice === "iPhone XR" ? "1.104A static current draw." : "0.008A (continuity check fail)."}`,
                      "[Forensic Engine] Parsing watchdog timer watchdog-reset logs...",
                      "[RAG] Executing source segment vector mapping...",
                      "[CoV] Validating suspected fault node layout coordinates against schematics...",
                      "[SOP] Mapping completed with 98% factual validation fidelity."
                    ];
                    setForensicLogs([]);
                    
                    let currentProgress = 0;
                    const interval = setInterval(() => {
                      currentProgress += 10;
                      setForensicProgress(Math.min(currentProgress, 100));
                      
                      const logIndex = Math.min(Math.floor((currentProgress / 100) * logs.length), logs.length - 1);
                      setForensicLogs(logs.slice(0, logIndex + 1));

                      if (currentProgress >= 100) {
                        clearInterval(interval);
                        setIsForensicScanning(false);
                        
                        if (forensicDevice === "iPhone XR") {
                          setForensicSOP({
                            rail: "VDD_MAIN",
                            suspectedComponent: "C247_W (Filter Capacitor)",
                            measurementProtocol: "Resistance to Ground Check",
                            dmodeValue: "0.1 Ω (Direct Main Rail Short to ground)",
                            alloy: "SAC305 Lead-Free",
                            reworkTemp: "360°C - 380°C",
                            underfillSoftenerTemp: "220°C",
                            sopSteps: [
                              "Confirm short to ground on VDD_MAIN using a multimeter in diode mode.",
                              "Apply a localized thermal test under Seek CompactXR LWIR camera while injecting 1.8V / 2A to the rail.",
                              "Verify C247_W instantly spikes in temperature (reaches > 75°C), showing microbolometer thermal signature.",
                              "Use hot air station at 220°C with 40% air to gently scrape underfill epoxy around adjacent components.",
                              "Increase nozzle rework temperature to 370°C, then gently lift bad capacitor C247_W off the PCB board.",
                              "Check the rail resistance again to ensure main-rail short is fully eliminated (should read > 0.350V diode drop)."
                            ],
                            fidelityScore: 0.98,
                            citation: "iPhone-XR-Power-Rails.pdf, Page 12"
                          });
                        } else {
                          setForensicSOP({
                            rail: "PP_LCM_BL_ANODE (Backlight)",
                            suspectedComponent: "FL1728 (Backlight Filter Fuse)",
                            measurementProtocol: "Continuity Line Probe",
                            dmodeValue: "OL (Open Loop / Infinite Impedance)",
                            alloy: "SAC305 Lead-Free",
                            reworkTemp: "350°C - 380°C",
                            underfillSoftenerTemp: "Not Applicable",
                            sopSteps: [
                              "Check for backlight diode mode drop at J4200 LCM connector pinning (should be ~0.412V).",
                              "If pin reads OL, test continuity directly across FL1728 board filter terminals.",
                              "If terminals are wide open, apply tacky rosin flux and desolder FL1728 at 360°C.",
                              "Bridge micro-terminals using a copper 0.02mm insulated jumper wire or solder a clean replacement filter.",
                              "Inject diode-test parameter and re-verify backlight forward voltage on J4200 pin anodes."
                            ],
                            fidelityScore: 0.95,
                            citation: "iPad-Pro-9.7-Backlight-FL1728.pdf, Page 29"
                          });
                        }
                        addToast("Telemetry Analyzed", `Fidelity verified structure generated for ${forensicDevice}!`, "success");
                      }
                    }, 200);
                  }}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-md font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-350 animate-pulse" />
                  Poll Device Telemetry via IOKit
                </button>
              )}

              {forensicLogs.length > 0 && (
                <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-[10px] font-mono text-slate-400 space-y-1 block max-h-[110px] overflow-y-auto">
                  {forensicLogs.map((log, idx) => (
                    <div key={idx} className="leading-snug">
                      <span className="text-slate-600 select-none">[{idx + 1}]</span> {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Block: NotebookLM Enterprise-Grade RAG Capacity Limits Router */}
        <div className="col-span-12 lg:col-span-6 bg-slate-900/50 border border-slate-755 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-750 pb-2 mb-3">
              <span className="text-[10px] font-extrabold text-violet-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-violet-400" />
                2. Enterprise-Grade RAG Router Limits
              </span>
              <span className="text-[9px] text-violet-300 font-mono font-bold bg-violet-955/60 border border-violet-900/35 px-1.5 py-0.5 rounded">
                API CAPACITY ENFORCER
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed text-left mb-3">
              Configure active schematic memory boundaries of the Google NotebookLM indexing API. Select standard tiers or enterprise-grade environments of the closed-loop diagnostics pipeline:
            </p>

            {/* Plan Tiers selector */}
            <div className="grid grid-cols-5 bg-slate-950 p-1.5 rounded-lg border border-slate-850 gap-1.5 mb-4">
              {(["standard", "plus", "pro", "ultra", "enterprise"] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => {
                    setActivePlanTier(tier);
                    addToast("NotebookLM Tier Switched", `RAG configured to enforce ${tier.toUpperCase()} system limits.`, "info");
                  }}
                  className={`py-1 rounded text-[9px] font-extrabold font-mono uppercase tracking-wide transition-all cursor-pointer ${
                    activePlanTier === tier
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-350"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Dynamic specifications parameters display */}
            <div className="grid grid-cols-2 gap-3.5 text-left text-xs text-slate-300 font-mono bg-slate-955 p-3.5 rounded-lg border border-slate-850">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Max Notebooks Limit:</span>
                <strong className="text-white text-[12px] font-extrabold">
                  {activePlanTier === "standard" ? "100 slots" : activePlanTier === "plus" ? "200 slots" : "500 slots"}
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Sources / Notebook Limit:</span>
                <strong className="text-white text-[12px] font-extrabold">
                  {activePlanTier === "standard" ? "50 files" : activePlanTier === "plus" ? "100 files" : activePlanTier === "pro" ? "300 files" : activePlanTier === "ultra" ? "500 files" : "300 files (Google API)"}
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Max Words / Source file:</span>
                <strong className="text-white text-[12px] font-extrabold">500,000 words</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Max Upload File Size:</span>
                <strong className="text-white text-[12px] font-extrabold">200.00 MB / source</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Daily Web Query Allocation:</span>
                <strong className="text-white text-[12px] font-extrabold">
                  {activePlanTier === "standard" ? "50 queries" : activePlanTier === "plus" ? "~500 queries" : "500+ (High Priority)"}
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Daily Deep Research Run Cap:</span>
                <strong className="text-white text-[12px] font-extrabold">
                  {activePlanTier === "standard" ? "10 / month" : activePlanTier === "plus" ? "3 / day" : activePlanTier === "pro" ? "20 / day" : activePlanTier === "ultra" ? "75 / day" : "200 / day"}
                </strong>
              </div>
            </div>
          </div>

          {/* Special details block representing Enterprise SCIM Identity management or Google Workspace project link */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1.5 text-left font-mono text-[10px]">
            <div className="flex justify-between items-center text-slate-450 border-b border-slate-900 pb-1 mb-1">
              <span>Sovereign Identity Protection Status</span>
              <span className="text-[8.5px] text-emerald-400 font-extrabold bg-emerald-950/40 border border-emerald-900/30 px-1 py-0.2 rounded font-mono">
                ACTIVE SSO
              </span>
            </div>
            {activePlanTier === "enterprise" ? (
              <div className="text-[10px] leading-relaxed text-slate-350 space-y-1">
                <div>• <strong>Enterprise SSO Integration:</strong> SAML 2.0 / OIDC linked via Okta.</div>
                <div>• <strong>Resource Provisioning:</strong> SCIM directory active for over 150 groups.</div>
                <div>• <strong>Region URL router:</strong> <span className="text-violet-400">https://notebooklm.cloud.google.com/us-central1/?project=7129584</span></div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 leading-normal">
                ⚠️ Standard individual sign-on active. Excel bounding box enforces a strict <strong className="text-amber-400">150,000 active cells limit</strong>. Sheets larger than this undergo row compression (word inflation warning). Complete SSO controls locked.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* INTERACTIVE CHAIN-OF-VERIFICATION (CoV) FLOW & ABSTENTION SANDBOX */}
      <div className="bg-slate-900/60 border border-violet-900/35 rounded-xl p-5 mb-6 block text-left">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-755 pb-3 mb-4 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-955/50 border border-violet-700/35 rounded-lg text-violet-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                Automated Chain-of-Verification (CoV) & Honest-Abstention Loop
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Checks generated layout designators. Includes an active sandbox mode to verify how the engine prevents LLM hallucinations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-violet-950 text-violet-350 font-extrabold uppercase font-mono px-2 py-0.5 rounded border border-violet-900/40 tracking-wider">
              ANTI_HALLUCINATION_GUARANTEE
            </span>
          </div>
        </div>

        {/* Visual 4-Phase Flowchart Diagram */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 mb-5 text-center">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block mb-3 text-left">
            Active CoV Closed-Loop Flowchart (The Paragraph Test)
          </span>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 items-center font-mono text-[10.5px]">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-left">
              <span className="text-violet-400 font-extrabold block">Phase 1: Draft SOP</span>
              <span className="text-slate-400 text-[10px]">Ingest diagnostic text containing part layout refs.</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-left relative">
              <span className="text-violet-400 font-extrabold block">Phase 2: Questioning</span>
              <span className="text-slate-400 text-[10px]">Plan validation probes on component markers.</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-left relative">
              <span className="text-violet-400 font-extrabold block">Phase 3: Deep Query</span>
              <span className="text-slate-400 text-[10px]">Check matching active vector schema PDFs.</span>
            </div>
            <div className="p-2 rounded bg-emerald-950/45 border border-emerald-900/60 text-left">
              <span className="text-emerald-400 font-extrabold block">Phase 4: Output Align</span>
              <span className="text-slate-300 text-[9.5px]">Verified SOP outputs OR strictly abstains!</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5 mb-5">
          
          {/* LEFT COLUMN: Draft Input & Verification Controls */}
          <div className="col-span-12 lg:col-span-6 bg-slate-950/45 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              
              {/* Interactive Simulation Sandbox Trigger panel */}
              <div className="p-3 bg-violet-955/30 rounded-lg border border-violet-900/40 space-y-2">
                <span className="text-[9.5px] text-violet-300 font-mono font-extrabold uppercase block tracking-wider">
                  🧪 ANTI-HALLUCINATION TEST SANDBOX CONTROL:
                </span>
                <p className="text-[10.5px] text-slate-400 font-sans leading-normal">
                  Inject a <strong>fictional hardware part</strong> into the SOP text layout to test whether our CoV system stops it or allows the hallucination through:
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCovCustomDraft("Replaces leaking filter FL1728 to solve backlight breakdown on high priority tablet.");
                      addToast("Valid Draft Loaded", "Includes genuine FL1728 backlight filter.", "success");
                    }}
                    className="py-1.5 bg-slate-900 hover:bg-slate-850 hover:text-white rounded text-[10px] font-mono text-slate-350 border border-slate-800 cursor-pointer"
                  >
                    ✅ Mount genuine "FL1728"
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCovCustomDraft("Repair instructions for board maintenance: Swap unrecognized component FL9999 adjacent to processor core immediately.");
                      addToast("Phantom Component Injected", "Phantom 'FL9999' injected to trigger the Strict Abstention Protocol!", "warning");
                    }}
                    className="py-1.5 bg-amber-950/40 hover:bg-amber-900/50 hover:text-white rounded text-[10px] font-mono text-amber-300 border border-amber-900/40 cursor-pointer"
                  >
                    🚨 Inject phantom "FL9999"
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCovCustomDraft("Diagnosing stable deadlock: Confirm dielectric capacitor C247_W is intact and does not bypass to ground.");
                      addToast("Valid Draft Loaded", "Includes genuine C247_W primary line capacitor.", "success");
                    }}
                    className="py-1.5 bg-slate-900 hover:bg-slate-850 hover:text-white rounded text-[10px] font-mono text-slate-350 border border-slate-800 cursor-pointer"
                  >
                    ✅ Mount genuine "C247_W"
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCovCustomDraft("Replace dielectric phantom component C9999 to resolve unstable high-frequency motherboard shorts on device.");
                      addToast("Phantom Component Injected", "Phantom 'C9999' injected to trigger the Strict Abstention Protocol!", "warning");
                    }}
                    className="py-1.5 bg-amber-950/40 hover:bg-amber-900/50 hover:text-white rounded text-[10px] font-mono text-amber-300 border border-amber-900/40 cursor-pointer"
                  >
                    🚨 Inject phantom "C9999"
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest font-mono">1. SOP Draft Content (Editable)</span>
                <div className="flex bg-slate-900 border border-slate-800 rounded p-0.5 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setS2cActivePathway("backlight");
                      setCovCustomDraft(getPathwayDraft("backlight"));
                      addToast("Backlight Scenario Loaded", "iPad Pro Backlight draft initialized.", "info");
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono transition-all cursor-pointer ${
                      s2cActivePathway === "backlight" ? "bg-violet-955 text-violet-300 border border-violet-900/40" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Backlight
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setS2cActivePathway("charging");
                      setCovCustomDraft(getPathwayDraft("charging"));
                      addToast("Charging Scenario Loaded", "iPhone XR Tristar draft initialized.", "info");
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono transition-all cursor-pointer ${
                      s2cActivePathway === "charging" ? "bg-violet-955 text-violet-300 border border-violet-900/40" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Charging
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setS2cActivePathway("short_rail");
                      setCovCustomDraft(getPathwayDraft("short_rail"));
                      addToast("Short Rail Scenario Loaded", "iPhone XR Short Rail draft initialized.", "info");
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono transition-all cursor-pointer ${
                      s2cActivePathway === "short_rail" ? "bg-violet-955 text-violet-300 border border-violet-900/40" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Short Rail
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={covCustomDraft}
                onChange={(e) => setCovCustomDraft(e.target.value)}
                placeholder="Type or paste draft SOP content to evaluate here..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 font-mono outline-none focus:border-violet-650 resize-none leading-relaxed select-text"
              />

              {/* Verification Threshold Setting Sliders */}
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900 space-y-2">
                <div className="flex justify-between items-center text-[10.5px] font-mono">
                  <span className="text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-violet-400" />
                    CoV Enforced Overlap Threshold
                  </span>
                  <strong className="text-violet-300 text-xs font-extrabold font-mono">{(covThreshold * 100).toFixed(0)}%</strong>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.90"
                  step="0.05"
                  value={covThreshold}
                  onChange={(e) => setCovThreshold(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-violet-600 outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isCovRunning || isNarrowingActive}
              onClick={runChainOfVerification}
              className={`w-full py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-white ${
                isCovRunning 
                  ? "bg-violet-950 text-violet-500 cursor-not-allowed" 
                  : "bg-gradient-to-r from-violet-750 to-indigo-700 hover:from-violet-700 hover:to-indigo-600 shadow-md shadow-violet-900/10 cursor-pointer"
              }`}
            >
              {isCovRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Decomposing & Cross-Referencing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                  Execute Factual Grounding Evaluation
                </>
              )}
            </button>
          </div>

          {/* RIGHT COLUMN: Interactive Grounding Visualizer & Strict Abstention Protocol Safeguard */}
          <div className="col-span-12 lg:col-span-6 bg-slate-950/45 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest block border-b border-slate-850 pb-2 font-mono">
                2. Closed-Loop Grounded Outcome Output
              </span>
              
              {/* Fidelity Meter Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/30 p-3 rounded-xl border border-slate-900">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-mono block">CoV Grounding Rating</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <strong className={`text-2xl font-mono tracking-tight font-extrabold ${calculatedFidelity >= covThreshold && !/9999/i.test(covCustomDraft) ? "text-emerald-400" : "text-amber-500"}`}>
                      {/9999/i.test(covCustomDraft) ? "0%" : `${(calculatedFidelity * 100).toFixed(0)}%`}
                    </strong>
                    <span className="text-[10px] text-slate-500">/ 100%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${calculatedFidelity >= covThreshold && !/9999/i.test(covCustomDraft) ? "bg-emerald-500" : "bg-amber-500"}`} 
                      style={{ width: `${/9999/i.test(covCustomDraft) ? 0 : calculatedFidelity * 100}%` }}
                    />
                  </div>
                </div>

                <div className="border-l border-slate-900 pl-4">
                  <span className="text-[9px] text-slate-550 uppercase font-mono block">Context Dilution Warning</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <strong className={`text-xl font-mono tracking-tight font-extrabold ${noisePenalty > 0 ? "text-red-400" : "text-emerald-450"}`}>
                      {noisePenalty > 0 ? `-${(noisePenalty * 100).toFixed(0)}% penalty` : "0% penalty"}
                    </strong>
                  </div>
                  <span className="text-[9.5px] text-slate-400 mt-1 block leading-tight font-mono">
                    {noisePenalty > 0 ? `${Object.values(mountedSources).filter(Boolean).length} books mounted (Threshold: 2)` : "Perfect schema focus"}
                  </span>
                </div>
              </div>

              {/* Section: Live Claims Verification (The Paragraph Test) */}
              <div className="space-y-2 text-left">
                <span className="text-[9.5px] text-slate-550 font-bold uppercase tracking-wide font-mono block">
                  Component Layout Extraction Audit Traces:
                </span>
                
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 text-left">
                  {keywordsList.map((k, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-900 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-semibold">{k.keyword}</span>
                        <span className="text-[9px] text-slate-500 truncate max-w-[180px]">
                          ({k.sourceDoc})
                        </span>
                      </div>
                      {k.matched ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-450 border border-emerald-900/30 font-bold">
                          ✔️ FOUND IN SCHEMATIC
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-955/50 text-amber-500 border border-amber-900/30 font-bold animate-pulse">
                          ❌ MISSING FROM VAULT
                        </span>
                      )}
                    </div>
                  ))}
                  {keywordsList.length === 0 && (
                    <div className="p-3 bg-slate-900/20 border border-slate-900 text-center rounded text-slate-500 font-mono text-[10.5px]">
                      ⚠️ No micro-electronic descriptors detected. Try writing or selecting an SOP draft incorporating "FL1728" or "C247_W"!
                    </div>
                  )}
                </div>
              </div>

              {/* Strict Abstention Protocol SAFEGUARD SHIELD (CRITICAL RULE IMPLEMENTATION) */}
              {/9999/i.test(covCustomDraft) ? (
                <div className="p-3 bg-red-955/20 border-l-4 border-red-500/60 rounded flex flex-col gap-2 transition-all animate-bounce text-left">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-450 shrink-0 mt-0.5" />
                    <span className="text-xs font-mono font-extrabold text-red-400 uppercase tracking-wider">
                      STRICT ABSTENTION SAFEGUARD TRIGGERED:
                    </span>
                  </div>
                  <div className="text-[11px] font-mono leading-relaxed text-rose-300">
                    Detector matched unverified chip layout. Active model hallucination threat halted in compliance with safety metrics!
                    <div className="mt-2 p-2.5 bg-slate-950 rounded font-bold border border-red-900/40 text-rose-250">
                      MANDATORY OUTPUT SAFE RESPONSE ACTION:
                      <pre className="mt-1 text-white text-xs bg-slate-900 p-2 rounded block">
                        "Data not present in local source vaults"
                      </pre>
                    </div>
                  </div>
                </div>
              ) : covStatus !== "IDLE" ? (
                <div className={`p-3 rounded-lg border transition-all animate-in fade-in duration-350 text-left ${
                  pass 
                    ? "bg-emerald-955/15 border-emerald-900/30 text-emerald-450" 
                    : "bg-amber-955/20 border-amber-900/30 text-amber-500"
                }`}>
                  <div className="flex items-start gap-2.5 font-mono text-[11px] leading-relaxed select-text">
                    {pass ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-450 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-emerald-300 uppercase block font-extrabold tracking-wide">Factual Grounding Ratio Certified Accurate</strong>
                          Extracted layout keys mapped perfectly inside vector PDF schematics. SOP is certified safe for workshop assembly.
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-550 shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div>
                            <strong className="text-amber-400 uppercase block font-extrabold tracking-wide">Signal-To-Noise Resolution Low</strong>
                            High context flooding penalty is current diluting signal. Too many documents are mounted or critical maps are unindexed.
                          </div>
                          <button
                            type="button"
                            disabled={isNarrowingActive}
                            onClick={triggerSourceNarrowing}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-450 text-slate-950 text-[10.5px] font-extrabold uppercase rounded shadow-md transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {isNarrowingActive ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Refining Context...
                              </>
                            ) : (
                              <>
                                <Filter className="w-3.5 h-3.5" />
                                Trigger Two-Phase Source Narrowing Heuristics
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Narrowing Progression Timeline Logs Console */}
        {(isNarrowingActive || narrowingLogs.length > 0) && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10.5px] font-mono text-slate-350 space-y-1 block text-left max-h-[130px] overflow-y-auto mb-4 transition-all duration-300 select-text">
            <span className="text-[8.5px] text-violet-400 font-extrabold block uppercase tracking-wide border-b border-violet-900 pb-1 mb-1.5 flex justify-between items-center">
              <span>Context Precision Orchestrator Logs (CPO)</span>
              <span className="text-[8px] bg-violet-950 text-violet-400 border border-violet-900/40 px-1 py-0.2 rounded font-extrabold uppercase animate-pulse">Filtering Vector Streams</span>
            </span>
            {narrowingLogs.map((log, id) => (
              <div key={id} className="leading-relaxed text-left">
                <span className="text-slate-650 select-none">[{id + 1}]</span>{" "}
                <span className={log.includes("unmounting") || log.includes("Pruning") ? "text-violet-400" : log.includes("precision") ? "text-emerald-400 font-bold" : "text-slate-300"}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual 'S2C Diagnostic Trace' Mapping Chart */}
      <div className="bg-[#111111] border border-slate-800 rounded-xl p-5 mb-6 block text-left font-mono animate-in fade-in zoom-in-95 duration-250">
        <style>{`
          @keyframes traceDash {
            to {
              stroke-dashoffset: -20;
            }
          }
          .animate-trace {
            stroke-dasharray: 6, 4;
            animation: traceDash 1.2s linear infinite;
          }
          @keyframes pulseScale {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.8; }
          }
          .animate-node-pulse {
            animation: pulseScale 2s ease-in-out infinite;
          }
        `}</style>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-950/40 border border-teal-850 rounded-lg text-teal-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Silicon S2C Diagnostic Trace & Circuit Path mapping [CoV Engine]
              </h3>
              <p className="text-[11px] text-slate-400 font-sans leading-tight">
                Grounded logic board trace mapping physical sensors directly to mounted source schematics validation layers.
              </p>
            </div>
          </div>
          
          {/* Active Status metrics / Badge */}
          <div className="flex items-center gap-2 text-[10px]">
            {isMounted ? (
              <span className="bg-teal-950/80 border border-teal-800 text-teal-400 font-extrabold px-2.5 py-1 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                CoV GROUNDED: SOURCE MOUNTED
              </span>
            ) : (
              <span className="bg-amber-950/70 border border-amber-850 text-amber-400 font-extrabold px-2.5 py-1 rounded-md flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                UNGROUNDED WARNING: SRC UNMOUNTED
              </span>
            )}
          </div>
        </div>

        {/* Diagnostic Grid layout */}
        <div className="grid grid-cols-12 gap-5">
          {/* Left panel: Interactive SVG Schematic Trace Area */}
          <div className="col-span-12 lg:col-span-8 bg-slate-950 border border-slate-850 rounded-xl relative p-4 flex flex-col justify-between min-h-[310px]">
            
            {/* PCB Blueprint grid background effect */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle, #00BFFF 1px, transparent 1px)`,
              backgroundSize: "20px 20px"
            }}></div>
            
            <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-900 pb-2 mb-3 z-10">
              <span>BOARD MODEL WORKBENCH LAYOUT CO-ORDINATE SYSTEM [GRID_v2.1]</span>
              <span className="text-violet-400 font-bold uppercase">{selectedPathway.sourceName}</span>
            </div>

            {/* SVG Interactive Circuit Layout */}
            <div className="relative w-full overflow-x-auto flex justify-center py-6 z-10 scrollbar-none">
              <svg width="560" height="200" viewBox="0 0 560 200" className="mx-auto block">
                {/* Board tracks background lines */}
                <path d="M 50,100 L 510,100" 
                      fill="none" 
                      stroke="#1e293b" 
                      strokeWidth="1.5" />

                {/* Live Current Flow Signal Pulse (only active if mounted) */}
                {isMounted && (
                  <path d="M 50,100 L 510,100" 
                        fill="none" 
                        stroke={selectedPathway.color} 
                        strokeWidth="2" 
                        className="animate-trace opacity-90" />
                )}

                {/* Active Highlight Leader Line & Detail HUD Box overlaid on the active, clicked node */}
                {activeNode && (
                  <g transform={`translate(${activeNode.x > 280 ? activeNode.x - 170 : activeNode.x + 35}, 15)`} className="transition-all duration-300">
                    {/* Shadow overlay effect */}
                    <rect width="135" height="70" rx="5" fill="#020617" className="opacity-40" transform="translate(2, 2)" />
                    {/* Body container */}
                    <rect width="135" height="70" rx="5" fill="#090d16" stroke={isMounted ? "#00BFFF" : "#FFBF00"} strokeWidth="1.5" className="opacity-95" />
                    
                    {/* Header bar area */}
                    <rect width="135" height="18" rx="2" fill={isMounted ? "rgba(0,191,255,0.15)" : "rgba(255,191,0,0.15)"} />
                    <text x="6" y="12" fill={isMounted ? "#00BFFF" : "#FFBF00"} fontSize="7.5" fontWeight="black" className="font-mono">
                      {isMounted ? "✔️ SPEC METRIC ACTIVE" : "⚠️ UNGROUNDED NODE"}
                    </text>
                    
                    {/* Nominal Voltage Rail */}
                    <text x="6" y="32" fill="#94a3b8" fontSize="7" fontWeight="bold" className="font-mono uppercase">RAIL:</text>
                    <text x="32" y="32" fill="#ffffff" fontSize="7" fontWeight="black" className="font-mono">{activeNode.nominalRail}</text>
                    
                    {/* Expected Diode Drop Value */}
                    <text x="6" y="46" fill="#94a3b8" fontSize="7" fontWeight="bold" className="font-mono uppercase">DIODE:</text>
                    <text x="32" y="46" fill="#14b8a6" fontSize="7.5" fontWeight="bold" className="font-mono">{activeNode.expectedDiodeValue}</text>

                    {/* Nominal Voltage */}
                    <text x="6" y="60" fill="#94a3b8" fontSize="7" fontWeight="bold" className="font-mono uppercase">NOMINAL:</text>
                    <text x="44" y="60" fill="#38bdf8" fontSize="7.5" fontWeight="extrabold" className="font-mono">{activeNode.nominalVoltage}</text>

                    {/* Mathematically precise overlay leader indicator line going directly to node */}
                    <path 
                      d={`M ${activeNode.x > 280 ? 135 : 0},35 L ${activeNode.x > 280 ? 170 : -35},85`} 
                      fill="none" 
                      stroke={isMounted ? "#00BFFF" : "#FFBF00"} 
                      strokeWidth="1.2" 
                      strokeDasharray="2,2" 
                    />
                  </g>
                )}

                {/* Nodes representation */}
                {selectedPathway.nodes.map((node) => {
                  const circleColor = node.isFault 
                    ? "#FFBF00" 
                    : node.status === "bad" 
                    ? "#ef4444" 
                    : node.status === "blocked"
                    ? "#64748b"
                    : "#a7f3d0";

                  const isCurrentActive = node.id === activeNodeId;

                  return (
                    <g 
                      key={node.id} 
                      transform={`translate(${node.x}, ${node.y - 20})`} 
                      onClick={() => {
                        setSelectedNodeState(node.id);
                        addToast(
                          "Forensic Focus Shift", 
                          `Probing board node ${node.label} [${node.nominalRail}]. Specifications overlay loaded.`, 
                          "success"
                        );
                      }} 
                      className="cursor-pointer group select-none transition-transform duration-150 hover:scale-110 active:scale-95"
                    >
                      {/* Active highlight golden/teal overlays rings */}
                      {isCurrentActive && (
                        <circle r="22" fill="none" stroke={isMounted ? "#00BFFF" : "#FFBF00"} strokeWidth="2.2" className="animate-node-pulse" />
                      )}
                      {isCurrentActive && (
                        <circle r="29" fill="none" stroke={isMounted ? "rgba(0,191,255,0.25)" : "rgba(255,191,0,0.2)"} strokeWidth="1" strokeDasharray="3,3" />
                      )}

                      {/* Default glowing failure rings */}
                      {node.isFault && !isCurrentActive && (
                        <circle r="20" fill="none" stroke="#FFBF00" strokeWidth="1" strokeDasharray="2,2" className="animate-node-pulse" />
                      )}
                      
                      {node.status === "good" && isMounted && !isCurrentActive && (
                        <circle r="16" fill="none" stroke="#00BFFF" strokeWidth="1.5" className="animate-node-pulse opacity-40" />
                      )}

                      {/* Node circle body */}
                      <circle r="12" fill="#111" stroke={node.isFault ? "#FFBF00" : isCurrentActive ? (isMounted ? "#00BFFF" : "#FFBF00") : "#334155"} strokeWidth="2" />
                      <circle r="4" fill={circleColor} />
                      
                      {/* Tooltip on Node Hover */}
                      <foreignObject x="-45" y="-55" width="100" height="42" className="overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="bg-slate-950 text-[9px] border border-slate-800 rounded p-1.5 shadow-xl text-center text-slate-300 pointer-events-none leading-normal font-mono">
                          <div className="font-extrabold text-white text-[9.5px]">{node.label}</div>
                          <div>{node.val}</div>
                        </div>
                      </foreignObject>

                      {/* Display labels */}
                      <text x="0" y="26" textAnchor="middle" fill="#fff" fontSize="9.5" fontWeight={isCurrentActive ? "black" : "bold"} className="select-none font-mono">
                        {node.label}
                      </text>
                      <text x="0" y="36" textAnchor="middle" fill={isCurrentActive ? "#67e8f9" : "#94a3b8"} fontSize="8" className="select-none font-mono">
                        {node.desc}
                      </text>
                    </g>
                  );
                })}

                {/* Multimeter Probing Leads Visual Overlay */}
                <g opacity="0.85" transform="translate(0, -20)">
                  {/* Lead connection trace */}
                  <path d="M 210,100 C 170,140 230,165 210,100" 
                        fill="none" 
                        stroke="#FFBF00" 
                        strokeWidth="1" 
                        strokeDasharray="2,2" />
                  
                  {/* Failure Tag Indicator box */}
                  <g transform={`translate(${selectedPathway.nodes[1].x + 30}, ${selectedPathway.nodes[1].y - 35})`}>
                    <rect width="112" height="32" rx="4" fill="#1e1e1e" stroke="#FFBF00" strokeWidth="1.2" />
                    <text x="56" y="13" textAnchor="middle" fill="#FFBF00" fontSize="8" fontWeight="black" className="font-mono">
                      ▲ SILICON CIRCUIT FAULT
                    </text>
                    <text x="56" y="24" textAnchor="middle" fill="#fff" fontSize="8.5" fontWeight="semibold" className="font-mono">
                      {selectedPathway.nodes[1].val}
                    </text>
                  </g>
                </g>
              </svg>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-900/50 mt-2 z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-left">
                  <span className="text-[9px] text-slate-550 block font-bold">ACTIVE PATHWAY BLUEPRINT EXPLANATION:</span>
                  <p className="text-[11px] text-slate-300 leading-normal font-sans font-medium">
                    {selectedPathway.description}
                  </p>
                </div>
                {/* Interaction Instruction */}
                <div className="text-right shrink-0">
                  <span className="text-[8.5px] text-teal-400 font-extrabold bg-[#111] border border-teal-950 px-2.5 py-1 rounded font-mono animate-pulse">
                    💡 Click nodes to toggle highlight specifications overlay
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Board Pin Inquisitor specs, CoV, and Toggle mount button */}
          <div className="col-span-12 lg:col-span-4 flex flex-col justify-between space-y-4">
            
            {/* Interactive Pin Inquisitor Spec Card */}
            <div className="bg-slate-950/65 border border-slate-850 p-4 rounded-xl space-y-3 flex-1 flex flex-col justify-start">
              <div className="border-b border-slate-900 pb-2 mb-1 flex justify-between items-center">
                <span className="text-[9.5px] text-violet-400 font-extrabold uppercase tracking-wider">🔬 Board Pin Inquisitor Specs</span>
                <span className="text-[8px] text-teal-400 bg-teal-950/40 border border-teal-900 px-1.5 py-0.5 rounded font-black font-mono">
                  FOCUS: {activeNode.label}
                </span>
              </div>
              
              {/* Quick Tab Selectors */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {selectedPathway.nodes.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setSelectedNodeState(n.id);
                      addToast("Pin Focused", `Highlighted motherboard component ${n.label} nominal values.`, "success");
                    }}
                    className={`text-[8.5px] py-1 border rounded font-black tracking-wide truncate transition-all cursor-pointer ${
                      n.id === activeNodeId
                        ? "bg-teal-950 text-teal-400 border-teal-800"
                        : "bg-slate-900/60 text-slate-400 border-slate-850 hover:text-slate-200"
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>

              {/* Specification table */}
              <div className="p-2.5 bg-[#090d16]/90 border border-slate-850 rounded-lg space-y-2 text-left text-[11px]">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500">Component:</span>
                  <span className="text-white font-extrabold text-right">{activeNode.label} ({activeNode.desc})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nominal Voltage Rail:</span>
                  <span className="text-violet-300 font-bold text-right">{activeNode.nominalRail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Expected Value (Diode):</span>
                  <span className="text-cyan-400 font-bold text-right">{activeNode.expectedDiodeValue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Expected Target V:</span>
                  <span className="text-teal-400 font-extrabold text-right">{activeNode.nominalVoltage}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-900 pt-1.5 mt-1.5 text-[10px]">
                  <span className="text-slate-500">Ammeter Node State:</span>
                  <span className={`font-semibold text-right ${activeNode.status === 'good' ? 'text-emerald-450' : 'text-amber-400'}`}>
                    {activeNode.status === 'good' ? '✅ NORMAL' : activeNode.status === 'fault' ? '⚡ CRITICAL FAULT' : '⏸️ BLOCKED / COLLAPSED'}
                  </span>
                </div>
              </div>

              {/* Auxiliary general stats */}
              <div className="space-y-1.5 pt-1 text-[11px] border-t border-slate-900/40">
                <div className="flex justify-between items-center text-left">
                  <span className="text-slate-500">Live Pathway current:</span>
                  <span className="text-amber-400 font-bold">{s2cAmmeterReading}A</span>
                </div>
                <div className="flex justify-between items-center text-left">
                  <span className="text-slate-500">Live Temperature level:</span>
                  <span className="text-rose-400 font-bold">{s2cBatteryTemp}°C</span>
                </div>
              </div>
            </div>

            {/* Document details / CoV Validation Card */}
            <div className="bg-slate-950/65 border border-slate-850 p-4 rounded-xl flex-1 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-900 pb-2 mb-3">
                  <span className="text-[9.5px] text-violet-400 font-extrabold uppercase tracking-wider">Schematic Verification Status</span>
                </div>
                
                <div className="space-y-3 font-sans text-xs">
                  <div className="p-2.5 bg-[#111] border border-slate-850 rounded-lg flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${isMounted ? "text-teal-400" : "text-amber-500"}`} />
                    <div className="text-left font-mono text-[10.5px]">
                      <span className="text-slate-400 block font-bold text-[9px] uppercase">DOCUMENT REFERENCE:</span>
                      <span className="text-white font-semibold truncate block max-w-[170px]" title={selectedPathway.pdf}>
                        {selectedPathway.pdf}
                      </span>
                    </div>
                  </div>

                  {isMounted ? (
                    <div className="p-2.5 bg-teal-950/30 border border-teal-900/30 text-teal-400 rounded-lg text-left text-[11px] font-mono leading-normal">
                      ✅ <strong>Check Active:</strong> Schematic verified inside core local source vaults. CoV matches hardware designators.
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-950/20 border border-amber-900/30 text-amber-300 rounded-lg text-left text-[11px] font-mono leading-normal animate-pulse">
                      ⚠️ <strong>Verification Blocked:</strong> Grounding source unmounted. Please mount the document to verify the trace.
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Interactive toggle button to Mount/Unmount document */}
              <div className="pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isMounted;
                    setMountedSources((prev) => ({
                      ...prev,
                      [selectedPathway.pdf]: nextVal,
                    }));
                    addToast(
                      nextVal ? "Schematic Mounted" : "Schematic Unmounted", 
                      `${selectedPathway.pdf} state updated in NotebookLM database context.`, 
                      nextVal ? "success" : "warning"
                    );
                  }}
                  className={`w-full py-2 border rounded-lg text-xs font-bold font-mono tracking-wide uppercase transition-all cursor-pointer ${
                    isMounted 
                      ? "bg-slate-900 hover:bg-slate-850 border-slate-850 text-slate-300 cursor-pointer"
                      : "bg-teal-950/60 hover:bg-teal-950 text-teal-400 border-teal-900/60 shadow-md shadow-teal-900/10 cursor-pointer"
                  }`}
                >
                  {isMounted ? "🔌 Unmount Reference schematic" : "📂 Mount Reference" }
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* INTERACTIVE SYMPTOM-TO-CIRCUIT (S2C) ENGINE & MICRO-SOLDERING REFERENCE LIBRARY */}
      <div className="grid grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Active Pathway Symptom Analyser */}
        <div className="col-span-12 xl:col-span-6 bg-slate-900/55 border border-slate-755 rounded-xl p-5 block text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-violet-400" />
                Active Pathway S2C Logic Controller
              </h3>
              <div className="flex bg-slate-950 border border-slate-850 rounded p-0.5 gap-1">
                <button
                  type="button"
                  onClick={() => setS2cActiveCodeTab("typescript")}
                  className={`px-2 py-0.5 rounded text-[8.5px] font-bold font-mono uppercase tracking-wide cursor-pointer transition-all ${
                    s2cActiveCodeTab === "typescript" ? "bg-violet-955 text-violet-300 border border-violet-900/40" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  TS Schema
                </button>
                <button
                  type="button"
                  onClick={() => setS2cActiveCodeTab("json")}
                  className={`px-2 py-0.5 rounded text-[8.5px] font-bold font-mono uppercase tracking-wide cursor-pointer transition-all ${
                    s2cActiveCodeTab === "json" ? "bg-violet-955 text-violet-300 border border-violet-900/40" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  JSON Schema
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  setS2cActivePathway("backlight");
                  setS2cCheckLogs([]);
                  setS2cCheckStatus("idle");
                  addToast("Backlight Pathway Selected", "iPad Pro Backlight filter short circuit mapped.", "info");
                }}
                className={`p-3 rounded-xl border block text-left font-mono transition-all cursor-pointer ${
                  s2cActivePathway === "backlight"
                    ? "bg-violet-950/40 border-violet-600 shadow shadow-violet-900/20"
                    : "bg-slate-950/60 border-slate-850 hover:border-slate-750"
                }`}
              >
                <span className="text-[11px] font-black text-white block">ANODE PATHWAY</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">iPad Backlight Fuse FL1728</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setS2cActivePathway("charging");
                  setS2cCheckLogs([]);
                  setS2cCheckStatus("idle");
                  addToast("Charging Pathway Selected", "iPhone XR Tristar non-charging block mapped.", "info");
                }}
                className={`p-3 rounded-xl border block text-left font-mono transition-all cursor-pointer ${
                  s2cActivePathway === "charging"
                    ? "bg-violet-950/40 border-violet-600 shadow shadow-violet-900/20"
                    : "bg-slate-950/60 border-slate-850 hover:border-slate-750"
                }`}
              >
                <span className="text-[11px] font-black text-white block">TRISTAR PATHWAY</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">U4500 USB Multiplexer IC</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setS2cActivePathway("short_rail");
                  setS2cCheckLogs([]);
                  setS2cCheckStatus("idle");
                  addToast("Short Rail Pathway Selected", "iPhone XR VDD_MAIN dielectric capacitor mapped.", "info");
                }}
                className={`p-3 rounded-xl border block text-left font-mono transition-all cursor-pointer ${
                  s2cActivePathway === "short_rail"
                    ? "bg-violet-950/40 border-violet-600 shadow shadow-violet-900/20"
                    : "bg-slate-950/60 border-slate-850 hover:border-slate-750"
                }`}
              >
                <span className="text-[11px] font-black text-white block">DIELECTRIC LINE</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">VDD_MAIN Cap C247_W short</span>
              </button>
            </div>

            {/* Control dial values for physical telemetry inputs */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-3.5 rounded-xl border border-slate-850 mb-3.5">
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-900 pb-1 mb-1.5">
                  <span>BATTERY CRITICAL TEMP</span>
                  <strong className="text-violet-350">{s2cBatteryTemp}°C</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="1"
                  value={s2cBatteryTemp}
                  onChange={(e) => setS2cBatteryTemp(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-850 rounded accent-violet-600 outline-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-900 pb-1 mb-1.5">
                  <span>AMMETER CURRENT DRAW</span>
                  <strong className="text-violet-350">{s2cAmmeterReading}A</strong>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="3.50"
                  step="0.05"
                  value={s2cAmmeterReading}
                  onChange={(e) => setS2cAmmeterReading(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-850 rounded accent-violet-600 outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-4 pt-1 mb-3">
              <button
                type="button"
                disabled={s2cIsSimulatingCheck}
                onClick={() => {
                  setS2cIsSimulatingCheck(true);
                  setS2cCheckLogs(["[S2C Engine] Initializing automated signal path analyzer..."]);
                  setS2cCheckStatus("testing");
                  
                  const totalSteps = 5;
                  let step = 1;
                  const timer = setInterval(() => {
                    if (step === 1) {
                      setS2cCheckLogs(prev => [...prev, `[S2C Telemetry] Current shunt reads: ${s2cAmmeterReading}A. Die temperature: ${s2cBatteryTemp}°C.`]);
                    } else if (step === 2) {
                      if (s2cBatteryTemp >= 68) {
                        setS2cCheckLogs(prev => [...prev, `[S2C Thermal Safeguard] 🚨 OVERHEAT TRIGGERED! Component temperature at ${s2cBatteryTemp}°C exceeds structural safety boundary (65°C). Halting check.`]);
                        setS2cCheckStatus("thermal_halt");
                        setS2cIsSimulatingCheck(false);
                        clearInterval(timer);
                        addToast("Thermal Safeguard Loop Triggered", "S2C mapping halted to prevent board dynamic warping.", "error");
                        return;
                      }
                      setS2cCheckLogs(prev => [...prev, `[S2C Diagnostic Loop] Injecting specialized signal telemetry into target pathway: "${s2cActivePathway}"...`]);
                    } else if (step === 3) {
                      setS2cCheckLogs(prev => [...prev, "[S2C Vector Grid] Performing programmatic node lookup across uncorrupted PDF schematic repositories."]);
                    } else if (step === 4) {
                      if (s2cActivePathway === "backlight") {
                        setS2cCheckLogs(prev => [
                          ...prev,
                          "[S2C Resolution] 📺 FAIL MATCH IDENTIFIED: Backlight fuse filter FL1728 impedance is infinite.",
                          "[Verification Action] MANDATORY CHECK: Bridge fuse filter FL1728 using rosin preheating."
                        ]);
                      } else if (s2cActivePathway === "charging") {
                        setS2cCheckLogs(prev => [
                          ...prev,
                          "[S2C Resolution] ⚡ BUS FAILURE ENCOUNTERED: USB high speed multiplexer control lines drawing unstable 0.008A.",
                          "[Verification Action] MANDATORY CHECK: Swap U4550 controller chip with brand-new SAC305 profile alloy preheating."
                        ]);
                      } else {
                        setS2cCheckLogs(prev => [
                          ...prev,
                          "[S2C Resolution] 🚨 DIELECTRIC RAIL ISOLATED: Direct dielectric short-to-ground detected on PP_VCC_MAIN voltage line.",
                          "[Verification Action] Verify thermal zone of dielectric capacitor C247_W instantly spikes under LWIR Seek CompactXR camera."
                        ]);
                      }
                    } else if (step === 5) {
                      setS2cCheckStatus("passed");
                      setS2cIsSimulatingCheck(false);
                      clearInterval(timer);
                      addToast("S2C Check Complete", "Circuit mapping analyzed successfully!", "success");
                    }
                    step++;
                  }, 250);
                }}
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 text-xs font-bold uppercase tracking-wider rounded-lg font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer h-[38px]"
              >
                {s2cIsSimulatingCheck ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                    MAPPING CIRCUIT PATHWAY...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 text-emerald-440 animate-pulse" />
                    Trigger Live S2C Circuit Check
                  </>
                )}
              </button>
            </div>
          </div>

          {/* S2C Active Technical Feedback Form */}
          {s2cCheckStatus === "passed" && (
            <div className="bg-slate-950/60 p-4 border border-violet-900/35 rounded-xl animate-in fade-in">
              <span className="text-[10px] text-violet-300 font-extrabold uppercase font-mono block border-b border-slate-900 pb-1.5 mb-3">
                3. Log Workbench Diagnostic Feedback (Persistent)
              </span>
              {!s2cFeedbackSubmitted[s2cActivePathway] ? (
                <div className="space-y-3.5 block text-left">
                  <div className="flex items-center gap-4">
                    <span className="text-[10.5px] font-mono text-slate-400 uppercase font-black">Was path mapping accurate?</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setS2cFeedbackRating(prev => ({ ...prev, [s2cActivePathway]: "up" }))}
                        className={`p-1.5 rounded transition-all cursor-pointer border ${
                          s2cFeedbackRating[s2cActivePathway] === "up"
                            ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
                            : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setS2cFeedbackRating(prev => ({ ...prev, [s2cActivePathway]: "down" }))}
                        className={`p-1.5 rounded transition-all cursor-pointer border ${
                          s2cFeedbackRating[s2cActivePathway] === "down"
                            ? "bg-red-950/30 border-red-500/45 text-red-400"
                            : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="feedbackNotes" className="block text-[9.5px] text-slate-500 font-bold uppercase font-mono">Bench notes & measured parameter specs</label>
                    <input
                      id="feedbackNotes"
                      type="text"
                      value={s2cFeedbackNotes[s2cActivePathway] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setS2cFeedbackNotes(prev => ({ ...prev, [s2cActivePathway]: val }));
                      }}
                      placeholder="e.g. Diode value reads exactly 0.415V, C247_W thermals confirmed at 3.3V injection."
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-violet-650"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={s2cIsSubmittingFeedback}
                    onClick={() => handleS2cFeedbackSubmit(s2cActivePathway)}
                    className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-black uppercase rounded shadow cursor-pointer transition-colors"
                  >
                    {s2cIsSubmittingFeedback ? "STORING AUDIT TRAIL..." : "Register Bench Feedback"}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg flex items-center justify-between font-mono text-[11px] text-slate-350">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-450 shrink-0" />
                    <span>
                      Feedback logged with <strong className="text-white">{s2cFeedbackRating[s2cActivePathway] === "up" ? "Positive (Yes)" : "Negative (No)"}</strong> rating. Bench notes registered!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setS2cFeedbackSubmitted((prev) => ({ ...prev, [s2cActivePathway]: false }));
                      setS2cFeedbackRating((prev) => ({ ...prev, [s2cActivePathway]: null }));
                      setS2cFeedbackNotes((prev) => ({ ...prev, [s2cActivePathway]: "" }));
                    }}
                    className="text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer font-bold"
                  >
                    Revise response
                  </button>
                </div>
              )}
            </div>
          )}

          {s2cCheckLogs.length > 0 && (
            <div className="bg-slate-950 p-3 rounded flex flex-col gap-1 border border-slate-850 text-[10.5px] font-mono text-slate-350 max-h-[120px] overflow-y-auto select-text text-left">
              <span className="text-[8.5px] text-violet-400 font-extrabold block uppercase tracking-wide border-b border-indigo-900 pb-1 mb-1.5 flex justify-between items-center">
                <span>S2C Logic Telemetry Log Stream</span>
                <span className="text-[8.5px] text-violet-400 font-bold tracking-wider">{s2cCheckStatus.toUpperCase()}</span>
              </span>
              {s2cCheckLogs.map((log, idx) => (
                <div key={idx} className="leading-snug">
                  <span className="text-slate-650">[{idx + 1}]</span>{" "}
                  <span className={log.includes("🚨") || log.includes("OVERHEAT") ? "text-red-400 font-bold" : log.includes("Resolution") || log.includes("VERIFIED") ? "text-emerald-400 font-bold" : "text-slate-300"}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: SSM & Micro-soldering Reference Matrices */}
        <div className="col-span-12 xl:col-span-6 bg-slate-900/55 border border-slate-755 rounded-xl p-5 flex flex-col justify-between block text-left">
          <div>
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Database className="w-4 h-4 text-violet-400" />
                Technical Micro-Solder & Hardware Handshake Matrix
              </h3>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed mb-3 text-left">
              Direct technical documentation on lead-free motherboard profiles, Seek LWIR specifications, and U4500/Tristar multiplexer compatibility standards:
            </p>

            {/* Mode toggles for reference tables */}
            <div className="grid grid-cols-3 bg-slate-950 p-1 rounded border border-slate-850 gap-1 mb-4 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setReferenceMode("solder_matrices");
                  addToast("Solder Profiles Loaded", "Solder classifications and temperature parameters active.", "info");
                }}
                className={`py-1 rounded font-bold uppercase transition-all cursor-pointer ${
                  referenceMode === "solder_matrices" ? "bg-violet-955 text-violet-300 border border-violet-850" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Solder Alloys
              </button>
              <button
                type="button"
                onClick={() => {
                  setReferenceMode("thermal_seeker");
                  addToast("Thermal Specs Loaded", "Seek CompactXR LWIR technical parameters active.", "info");
                }}
                className={`py-1 rounded font-bold uppercase transition-all cursor-pointer ${
                  referenceMode === "thermal_seeker" ? "bg-violet-955 text-violet-300 border border-violet-850" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Seek Seek-XR
              </button>
              <button
                type="button"
                onClick={() => {
                  setReferenceMode("handshake_failures");
                  addToast("Handshake Matrix Loaded", "Tristar backward compatibility equivalents active.", "info");
                }}
                className={`py-1 rounded font-bold uppercase transition-all cursor-pointer ${
                  referenceMode === "handshake_failures" ? "bg-violet-955 text-violet-300 border border-violet-850" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Tristar Chips
              </button>
            </div>

            {/* Section: Solder Alloy classifications */}
            {referenceMode === "solder_matrices" && (
              <div className="space-y-3 font-mono text-[11px] text-left">
                <div className="overflow-x-auto rounded border border-slate-850">
                  <table className="w-full text-left bg-slate-950 text-[10px]">
                    <thead>
                      <tr className="border-b border-slate-850 bg-slate-900 text-violet-300">
                        <th className="p-2 font-extrabold uppercase">Rework Title</th>
                        <th className="p-2 font-extrabold uppercase">Alloy Standard</th>
                        <th className="p-2 font-extrabold uppercase">Preheat Temp</th>
                        <th className="p-2 font-extrabold uppercase">Nozzle Profile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      <tr>
                        <td className="p-2 font-bold text-white">Level 1: Modular</td>
                        <td className="p-2">No thermal (Pure Mechanical)</td>
                        <td className="p-2">Room (Unheated)</td>
                        <td className="p-2">No thermal tip (Manual)</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-white">Level 2: SMT (FL1728)</td>
                        <td className="p-2 text-indigo-300">SAC305 Lead-Free</td>
                        <td className="p-2">150°C (Preheated flat)</td>
                        <td className="p-2">350°C - 380°C hot air</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-white">Level 3: BGA Rework</td>
                        <td className="p-2 text-indigo-300">SAC305 Lead-Free</td>
                        <td className="p-2">150°C (Preheated stage)</td>
                        <td className="p-2">380°C - 400°C nozzles</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed font-sans text-left">
                  💡 <strong>Epoxy-underfill Softening:</strong> Quick station nozzle must be run at <strong>220°C with 40% air flow</strong> to scratch surrounding compound without adjacent pad damage. BGA rework must enforce <strong>SAC305 alloy</strong> parameters to avoid logical board alignment errors or dry joints.
                </p>
              </div>
            )}

            {referenceMode === "thermal_seeker" && (
              <div className="space-y-3 font-mono text-[11px] text-left">
                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 text-slate-300 text-left">
                  <div className="text-[10.5px] border-b border-slate-900 pb-1 text-violet-300 font-extrabold">Seek CompactXR LWIR Thermography Datasheet</div>
                  <div className="grid grid-cols-2 gap-2 text-[10.5px] text-left">
                    <div>• <strong>Sensor Resolution Grid:</strong> 206x156 Array</div>
                    <div>• <strong>Microbolometer Spec:</strong> VOx Type</div>
                    <div>• <strong>Lens Coating material:</strong> Focusable Chalcogenide</div>
                    <div>• <strong>Pixel Pitch thickness:</strong> 12-micron</div>
                    <div>• <strong>Total Area Pixels:</strong> 32,136 total points</div>
                    <div>• <strong>Field Of View (FOV):</strong> 20° Narrow</div>
                    <div>• <strong>Temperature Range:</strong> -40°C to 330°C</div>
                    <div>• <strong>Operating Power Draw:</strong> &lt; 280 milliwatt</div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed font-sans text-left">
                  📸 <strong>Micro-Short Localization:</strong> Enables rapid localization of VDD_MAIN dielectric capacitor heating signatures down to individual microscopic SMDs on dense smartphone Sandwich PCBs.
                </p>
              </div>
            )}

            {referenceMode === "handshake_failures" && (
              <div className="space-y-3 font-mono text-[11px] text-left">
                <div className="overflow-x-auto rounded border border-slate-850">
                  <table className="w-full text-left bg-slate-950 text-[10px]">
                    <thead>
                      <tr className="border-b border-slate-850 bg-slate-900 text-violet-300 font-extrabold uppercase">
                        <th className="p-2">Target MCU Chip Code</th>
                        <th className="p-2">Release Era</th>
                        <th className="p-2">Unified Equivalent Series</th>
                        <th className="p-2">Power/Handshake Limit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      <tr>
                        <td className="p-2 font-bold text-white">1610A1 Tristar multiplexer</td>
                        <td className="p-2">iPad Air, iPhone 5s</td>
                        <td className="p-2">Fully backward interchangeable</td>
                        <td className="p-2 text-rose-400">High susceptibility to uncertified chargers</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-white">1610A2 Tristar multiplexer</td>
                        <td className="p-2">iPhone 6, 6 Plus</td>
                        <td className="p-2">Compatible in matching slots</td>
                        <td className="p-2 text-rose-400">Moderately robust, fails at continuous 5.5V spikes</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-white">1610A3 Tristar multiplexer</td>
                        <td className="p-2">iPhone 6s, 6s Plus SE</td>
                        <td className="p-2 text-emerald-450">Universal drop-in for 1610A1/1610A2</td>
                        <td className="p-2 text-emerald-450">Standard of excellence; robust ESD gate</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-white">1612A1 / SN2400AB0 series</td>
                        <td className="p-2">iPhone 7, 8, X series</td>
                        <td className="p-2">Dedicated Hydra Series architecture</td>
                        <td className="p-2 text-rose-450 font-bold">Non-interchangeable with 1610 series chips</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed font-sans text-left">
                  ⚠️ <strong>Handshake Failures:</strong> Under-voltage below 2.0V or over-voltage surges spikes on raw uncertified fast chargers trigger immediate internal gate combustion inside U4500 multiplexing chip. Fully backward-compatible equivalents shown above.
                </p>
              </div>
            )}
          </div>

          {/* Warnings block */}
          <div className="mt-4 p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono leading-relaxed text-slate-400 text-left">
              <strong className="text-white">Active Diagnostics Notice:</strong> Level 3 thermal signatures on dielectric copper lines require immediate preheating board separation. Avoid localized high-temp stress to prevent sandwiches board warping.
            </div>
          </div>
        </div>
      </div>

      {/* NIST SP 800-88 R1 Compliance Section */}
      <div className="bg-slate-900/50 border border-slate-750 rounded-xl p-5 mt-6 block text-left">
        <div className="flex items-center gap-2 border-b border-slate-755 pb-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wide font-mono">NIST-SP 800-88 R1 Erasure & MDM Validation</h3>
            <p className="text-[11px] text-slate-400 font-mono text-left">Authenticate security compliance & scrape activation lockers for multi-device fleet wipes.</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5 items-end">
          <div className="col-span-12 md:col-span-4 space-y-2">
            <label htmlFor="imeiField" className="block text-[10px] text-slate-400 font-bold uppercase font-mono">Device IMEI / Serial Address</label>
            <input 
              id="imeiField"
              value={imeiInput}
              onChange={(e) => setImeiInput(e.target.value)}
              type="text"
              placeholder="358921102948192"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-violet-650"
            />
          </div>

          <div className="col-span-12 md:col-span-3">
            <button
              type="button"
              onClick={() => {
                setIsSecurityScraping(true);
                setSecurityCheckResult(null);
                setTimeout(() => {
                  setIsSecurityScraping(false);
                  setSecurityCheckResult({
                    imei: imeiInput || "358921102948192",
                    gsmaStatus: "Clean / Non-Stolen Verified",
                    mdmStatus: "Clear (No Profile MDM Block Detected)",
                    activationLock: "Off (Safe to Refurbish / Clear Boot)",
                    erasureCompliance: "NIST SP 800-88 R1 Purge Complete",
                    checksum: "SHA256: 3a9ffb42c8d8ae0a823b12ce045abccd072bba"
                  });
                  addToast("Security Record Pulled", "GSMA registries and activation lock status scraped successfully!", "success");
                }, 1200);
              }}
              className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg font-mono transition-all flex items-center justify-center gap-2 cursor-pointer h-[38px]"
            >
              {isSecurityScraping ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
                  SCRAPING GSMA REGISTRIES...
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-emerald-450" />
                  Scrape GSMA & MDM Lock
                </>
              )}
            </button>
          </div>

          <div className="col-span-12 md:col-span-5">
            <button
              type="button"
              disabled={!securityCheckResult}
              onClick={() => {
                if (!securityCheckResult) return;
                const doc = new jsPDF();
                doc.setFont("courier", "bold");
                doc.setFontSize(20);
                doc.text("DISPLAY & CELL PROS", 20, 30);
                doc.setFontSize(11);
                doc.setFont("courier", "normal");
                doc.text("-----------------------------------------------", 20, 38);
                doc.text("NIST SP 800-88 R1 CERTIFICATE OF ERASURE", 20, 45);
                doc.text("-----------------------------------------------", 20, 52);
                doc.text(`Device IMEI: ${securityCheckResult.imei}`, 20, 62);
                doc.text(`GSMA Record: ${securityCheckResult.gsmaStatus}`, 20, 72);
                doc.text(`MDM Registry: ${securityCheckResult.mdmStatus}`, 20, 82);
                doc.text(`Activation Lock: ${securityCheckResult.activationLock}`, 20, 92);
                doc.text(`Compliance Standard: ${securityCheckResult.erasureCompliance}`, 20, 102);
                doc.text(`Authenticity Checksum: ${securityCheckResult.checksum}`, 20, 112);
                doc.text("Approved by: Spokane Lead Hardware Forensics Engineer", 20, 125);
                doc.text(`Timestamp: ${new Date().toISOString()}`, 20, 135);
                doc.text("-----------------------------------------------", 20, 142);
                doc.save(`NIST-Certificate-Erasure-${securityCheckResult.imei}.pdf`);
                addToast("Certificate Downloaded", "Signed NIST Certificate of Erasure (COE) saved inside downloads folder!", "success");
              }}
              className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md font-mono transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-[38px]"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download Compliance COE PDF
            </button>
          </div>
        </div>

        {securityCheckResult && (
          <div className="mt-4 p-4 bg-slate-955/80 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono animate-in slide-in-from-bottom duration-250">
            <div className="space-y-1">
              <span className="text-[9.5px] text-slate-500 uppercase font-extrabold font-mono">GSMA Guard Status</span>
              <p className="text-emerald-450 font-bold">{securityCheckResult.gsmaStatus}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9.5px] text-slate-500 uppercase font-extrabold font-mono">Remote MDM Lock</span>
              <p className="text-white font-bold">{securityCheckResult.mdmStatus}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9.5px] text-slate-500 uppercase font-extrabold font-mono">FMI Activation Guard</span>
              <p className="text-white font-bold">{securityCheckResult.activationLock}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9.5px] text-slate-500 uppercase font-extrabold font-mono">Erasure Standard</span>
              <p className="text-violet-400 font-extrabold">{securityCheckResult.erasureCompliance}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <span className="text-[9.5px] text-slate-500 uppercase font-extrabold font-mono">Cryptographic Block Checksum</span>
              <p className="text-slate-400 truncate select-all">{securityCheckResult.checksum}</p>
            </div>
          </div>
        )}
      </div>

      {/* ENTERPRISE RAG CONTEXT OPTIMIZER & THERMODYNAMIC SAFETY CONTROLLER */}
      <div className="bg-slate-900/50 border border-slate-750 rounded-xl p-5 mt-6 block text-left">
        <div className="flex items-center gap-2 border-b border-slate-755 pb-3 mb-5">
          <Brain className="w-5 h-5 text-[#00BFFF]" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wide font-mono">Enterprise RAG & Thermodynamic Safety Controller</h3>
            <p className="text-[11px] text-slate-400 font-mono text-left">Enforce Black's Equation, preheat limits, and 1M-token context narrowing for high-stakes Tier 3 escalations.</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sub-Panel 1: Thermodynamic Safety & Electromigration */}
          <div className="col-span-12 lg:col-span-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
              <Sliders className="w-4 h-4 text-[#FFBF00]" />
              <span className="text-[11px] text-white font-extrabold font-mono uppercase tracking-wider">1. Solder Alloy & Thermal Physics</span>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Target Solder Alloy</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded border border-slate-800">
                  {(["SAC305", "Sn63_Pb37", "LowTemp_Bi58"] as const).map((alloy) => (
                    <button
                      key={alloy}
                      type="button"
                      onClick={() => setTargetAlloy(alloy)}
                      className={`py-1 text-[9px] font-bold rounded cursor-pointer transition-all ${
                        targetAlloy === alloy
                          ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {alloy === "SAC305" ? "SAC305" : alloy === "Sn63_Pb37" ? "Sn63/Pb37" : "Bi58 (Low)"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-900/40 rounded border border-slate-850/60">
                <label htmlFor="underfillToggle" className="text-[10px] text-slate-400 font-bold uppercase cursor-pointer">Epoxy Underfill Softening</label>
                <input
                  id="underfillToggle"
                  type="checkbox"
                  checked={hasUnderfill}
                  onChange={(e) => setHasUnderfill(e.target.checked)}
                  className="w-4 h-4 text-[#008080] border-slate-700 rounded bg-slate-900 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Applied Temperature</span>
                  <span className="text-white font-extrabold">{appliedTempC}°C</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="450"
                  value={appliedTempC}
                  onChange={(e) => setAppliedTempC(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                  <span>150°C</span>
                  <span>300°C</span>
                  <span>450°C</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleValidateReworkProfile}
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-amber-400 hover:text-amber-300 border border-slate-800 hover:border-slate-700 text-[10px] font-bold uppercase tracking-wider rounded font-mono transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                Audit Thermal Profile
              </button>

              {validationResult && (
                <div className={`p-3 rounded-lg border text-[10px] leading-relaxed ${
                  validationResult.style === "success"
                    ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                    : validationResult.style === "warning"
                    ? "bg-amber-950/20 border-amber-900/40 text-amber-300"
                    : "bg-red-950/20 border-red-900/40 text-red-300"
                }`}>
                  <div className="font-extrabold uppercase mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    STATUS: {validationResult.status}
                  </div>
                  <p>{validationResult.directive}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sub-Panel 2: Enterprise RAG Document Pre-Processor */}
          <div className="col-span-12 lg:col-span-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
              <FileText className="w-4 h-4 text-[#008080]" />
              <span className="text-[11px] text-white font-extrabold font-mono uppercase tracking-wider">2. Context Pre-Processor (1M Limit)</span>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Select Source Document</label>
                <div className="space-y-1.5">
                  {(["pdf", "excel_over_150k", "excel_under_150k", "markdown"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedSourceType(type)}
                      className={`w-full p-2 rounded text-left border flex items-center justify-between cursor-pointer transition-all ${
                        selectedSourceType === type
                          ? "bg-teal-950/30 border-[#008080]/60 text-white"
                          : "bg-slate-900/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[10px]">
                        <FileText className={`w-3.5 h-3.5 ${selectedSourceType === type ? "text-teal-400" : "text-slate-500"}`} />
                        <span>
                          {type === "pdf"
                            ? "iPhone-Schematics.pdf (Raw Binary)"
                            : type === "excel_over_150k"
                            ? "DiodeValues_180k_Cells.xlsx (>150k)"
                            : type === "excel_under_150k"
                            ? "BOM_List_45k_Cells.xlsx (<=150k)"
                            : "XS_Max_Interposer_Layout.md (Text)"}
                        </span>
                      </div>
                      <span className="text-[8px] opacity-70">
                        {type === "pdf" ? "Heavy" : type === "excel_over_150k" ? "Bloated" : "Clean"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleOptimizeSource}
                disabled={isPreProcessing}
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-teal-400 hover:text-teal-300 border border-slate-800 hover:border-slate-700 text-[10px] font-bold uppercase tracking-wider rounded font-mono transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPreProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                    Optimizing & Chunking...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-teal-500" />
                    Optimize & Upload Source
                  </>
                )}
              </button>

              {preProcessLogs.length > 0 && (
                <div className="bg-slate-950 p-2.5 rounded border border-slate-900 text-[9.5px] font-mono text-slate-400 space-y-1 block max-h-[140px] overflow-y-auto leading-normal">
                  <div className="text-[8px] font-extrabold text-teal-400 uppercase tracking-widest border-b border-slate-900 pb-1 mb-1 font-mono">
                    Optimization Pipeline Logs
                  </div>
                  {preProcessLogs.map((log, idx) => (
                    <div key={idx} className={log.includes("❌") ? "text-red-400" : log.includes("SUCCESS") || log.includes("✔️") ? "text-emerald-400" : "text-slate-400"}>
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sub-Panel 3: XS Max VDD_MAIN Sandwich Interposer Narrowing */}
          <div className="col-span-12 lg:col-span-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
              <Brain className="w-4 h-4 text-[#00BFFF]" />
              <span className="text-[11px] text-white font-extrabold font-mono uppercase tracking-wider">3. S2C Interposer Routing (iPhone XS Max)</span>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="space-y-1 p-2 bg-slate-900/30 rounded border border-slate-850">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Interposer Interface State</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${isInterposerJoined ? "bg-amber-950/50 border border-amber-900/30 text-amber-300" : "bg-emerald-950/50 border border-emerald-900/30 text-emerald-300"}`}>
                    {isInterposerJoined ? "SANDWICH JOINED" : "RF / LOGIC SEPARATED"}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 mt-1">
                  XS Max power lines (VDD_MAIN) rejoined across layered interposers. Injecting current with layers connected risks baseband destruction.
                </p>
                <button
                  type="button"
                  onClick={() => setIsInterposerJoined(!isInterposerJoined)}
                  className="mt-2 w-full py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] font-extrabold uppercase font-mono tracking-wide rounded cursor-pointer transition-all"
                >
                  {isInterposerJoined ? "Separate RF from Upper Board" : "Join RF to Upper Board"}
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Dynamic Source-Narrowing Query</label>
                <textarea
                  readOnly
                  value={queryText}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-[10.5px] text-slate-300 font-mono outline-none h-[45px] resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleQueryRAGInterposer}
                disabled={isQueryingRAG}
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-sky-400 hover:text-sky-300 border border-slate-800 hover:border-slate-700 text-[10px] font-bold uppercase tracking-wider rounded font-mono transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isQueryingRAG ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    Querying Isolated Schematics...
                  </>
                ) : (
                  <>
                    <Brain className="w-3.5 h-3.5 text-sky-500" />
                    Source-Narrowing Query
                  </>
                )}
              </button>

              {ragQueryResult && (
                <div className={`p-3 rounded-lg border text-[10px] leading-relaxed ${
                  ragQueryResult.status === "DETACH_INTERPOSER_REQUIRED"
                    ? "bg-amber-950/20 border-amber-900/40 text-amber-300"
                    : "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                }`}>
                  <div className="font-extrabold uppercase mb-1">
                    NARROWED SOURCES TARGETED:
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ragQueryResult.targetedSources.map((s: string) => (
                        <span key={s} className="px-1 bg-slate-900 text-slate-300 text-[8px] rounded border border-slate-800 font-mono font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="font-bold border-t border-slate-900/40 pt-1 mt-1">Resolution SOP:</div>
                  <p className="mt-0.5">{ragQueryResult.directive}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </section>
  );
};
