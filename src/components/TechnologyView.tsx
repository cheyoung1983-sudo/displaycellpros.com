import React, { useState } from "react";
import { Cpu, Terminal, Shield, RefreshCw, Zap, CheckCircle, Database, Server, Smartphone, Play, AlertCircle, Sparkles } from "lucide-react";

export function TechnologyView() {
  const [selectedDevice, setSelectedDevice] = useState<string>("iPhone 15 Pro Max");
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStepText, setScanStepText] = useState<string>("System Ready");
  const [scanLogs, setScanLogs] = useState<string[]>([
    "[System] Forensic diagnostic sandbox initialized.",
    "[System] Ready to probe target virtual device controller."
  ]);
  const [scanResult, setScanResult] = useState<any | null>(null);

  const devicePresets: Record<string, { brand: string; model: string; chip: string; baseV: string; expectedA: string }> = {
    "iPhone 15 Pro Max": {
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      chip: "A17 Pro",
      baseV: "3.82V",
      expectedA: "1.25A"
    },
    "Samsung Galaxy S23 Ultra": {
      brand: "Samsung",
      model: "Galaxy S23 Ultra",
      chip: "Snapdragon 8 Gen 2",
      baseV: "3.88V",
      expectedA: "1.10A"
    },
    "Google Pixel 8 Pro": {
      brand: "Google",
      model: "Pixel 8 Pro",
      chip: "Google Tensor G3",
      baseV: "3.85V",
      expectedA: "1.05A"
    }
  };

  const handleStartScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanResult(null);
    
    const preset = devicePresets[selectedDevice];
    const logsList = [
      `[WebUSB] Requesting direct handshake with ${preset.brand} ${preset.model}...`,
      `[System] Hardware controller matched chip signature: ${preset.chip}`,
      `[Ammeter] Establishing secure voltage rail baseline...`,
      `[S2C] Probing charge path PMU_USB_BRICKID & USB_VBUS...`,
      `[Memory] Executing secure storage read test...`,
      `[NIST] Verifying sanitization sector registry...`,
      `[System] Compilation of local diagnostics telemetry successful!`
    ];

    setScanLogs([`[${new Date().toLocaleTimeString()}] [System] Starting virtual hardware scan for ${preset.model}...`]);

    let stepIndex = 0;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanStepText("Diagnostic Scan Complete");
          setScanLogs(prevLogs => [
            ...prevLogs,
            `[${new Date().toLocaleTimeString()}] [Forensic RAG] Complete telemetry analysis compiled successfully.`,
            `[${new Date().toLocaleTimeString()}] [NIST-800-88] Secure memory verification passed. Zero latent sectors.`
          ]);
          setScanResult({
            voltage: preset.baseV,
            current: preset.expectedA,
            chipTemp: "28.4°C",
            batterySoh: "94.2%",
            pathwayStatus: "Normal (PP_VDD_MAIN: 3.82V)",
            nistStatus: "NIST SP 800-88 R1 Cleared",
            recaptchaRisk: "0.02 (Safe)"
          });
          return 100;
        }
        
        const nextProgress = prev + 15;
        if (nextProgress >= stepIndex * 20 && stepIndex < logsList.length) {
          const newStep = logsList[stepIndex];
          setScanStepText(newStep);
          setScanLogs(prevLogs => [
            ...prevLogs,
            `[${new Date().toLocaleTimeString()}] ${newStep}`
          ]);
          stepIndex++;
        }
        
        return Math.min(nextProgress, 100);
      });
    }, 450);
  };

  return (
    <div id="technology-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300 text-left">
      {/* Header */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,191,255,0.06)_0%,_transparent_70%)] pointer-events-none"></div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-4 font-mono">
          <Terminal className="w-3.5 h-3.5" /> Silicon-Layer Diagnostics
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-4">
          Core Technology Engine
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Explore our fully operational full-stack diagnostic routing engine. Built with Google Cloud Run, Firestore Sync, and interactive WebUSB simulator pipelines.
        </p>
      </div>

      {/* Embedded Proof of Life Interactive Simulator */}
      <div className="bg-[#111111] border border-slate-800 rounded-2xl p-6 sm:p-8 mb-16 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          ACTIVE SIMULATOR (NO LOGIN REQUIRED)
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400 animate-pulse" /> Live Client Diagnostics Sandbox
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Perform a virtual hardware scan to witness our Symptom-to-Circuit (S2C) telemetry engine in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls - Left */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
              <label className="block text-[10px] font-mono text-slate-450 uppercase tracking-wider mb-2 font-bold">
                1. Select Target Device Preset
              </label>
              <div className="space-y-2">
                {Object.keys(devicePresets).map(deviceName => (
                  <button
                    key={deviceName}
                    onClick={() => !isScanning && setSelectedDevice(deviceName)}
                    disabled={isScanning}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      selectedDevice === deviceName
                        ? "bg-blue-900/30 text-white border-blue-500/40"
                        : "bg-slate-900 text-slate-400 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                      {deviceName}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {devicePresets[deviceName].chip}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                isScanning
                  ? "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/10 hover:shadow-blue-900/20"
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  Analyzing Circuit...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-white" />
                  Initiate Forensic Audit
                </>
              )}
            </button>

            {/* Simulated Live Ammeter Feed */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Live Voltage Draw</span>
                <span className="text-xl font-black font-mono text-white mt-0.5 block">
                  {isScanning ? "3.84V" : scanResult ? scanResult.voltage : "0.00V"}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-850"></div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Expected Amperage</span>
                <span className="text-xl font-black font-mono text-teal-400 mt-0.5 block">
                  {isScanning ? "0.85A" : scanResult ? scanResult.current : "0.00A"}
                </span>
              </div>
            </div>
          </div>

          {/* Terminal Console - Right */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-850 rounded-xl flex-1 flex flex-col overflow-hidden h-72">
              <div className="px-4 py-2 border-b border-slate-850 flex justify-between items-center bg-slate-900/50">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  Telemetry Console Output
                </span>
                <span className="text-[9px] font-mono text-slate-500">v3.5 // CPU_FREQ: OK</span>
              </div>
              
              <div className="p-4 flex-1 font-mono text-[11px] text-slate-300 space-y-1.5 overflow-y-auto select-text scrollbar-thin scrollbar-thumb-slate-800">
                {scanLogs.map((log, idx) => {
                  let colorClass = "text-slate-300";
                  if (log.includes("[System]")) colorClass = "text-blue-400";
                  if (log.includes("[WebUSB]")) colorClass = "text-indigo-300";
                  if (log.includes("[Ammeter]")) colorClass = "text-amber-400 font-bold";
                  if (log.includes("[S2C]")) colorClass = "text-teal-400";
                  if (log.includes("[NIST]")) colorClass = "text-pink-400";
                  return (
                    <div key={idx} className={colorClass}>
                      {log}
                    </div>
                  );
                })}
                {isScanning && (
                  <div className="text-blue-400 flex items-center gap-1.5 mt-2 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping"></span>
                    Scanning active motherboard nodes...
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full bg-slate-900">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Scan Results Card */}
            {scanResult && (
              <div className="bg-slate-950 border border-teal-950/40 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="text-emerald-400 w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      DIAGNOSTIC TELEMETRY RECORDED
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      S2C Mapping Status: <span className="text-emerald-400 font-bold">{scanResult.pathwayStatus}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Battery SOH</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{scanResult.batterySoh}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Sanitization</span>
                    <span className="text-xs font-mono font-bold text-pink-400">{scanResult.nistStatus}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">reCAPTCHA Risk</span>
                    <span className="text-xs font-mono font-bold text-blue-400">{scanResult.recaptchaRisk}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Architecture Stack Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-[#121415] border border-slate-850 p-6 rounded-2xl relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full"></div>
          <div className="flex items-center gap-2.5 mb-4">
            <Server className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">1. Google Cloud Run</h3>
          </div>
          <p className="text-slate-350 text-xs leading-relaxed mb-3">
            Our diagnostic platform runs inside containerized environments deployed via secure, scalable Cloud Run services.
          </p>
          <ul className="text-[10px] font-mono text-slate-450 space-y-1.5 border-t border-slate-900 pt-3">
            <li className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-blue-400" /> Fully custom full-stack architecture</li>
            <li className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-blue-400" /> Auto-scale down to zero cold starts</li>
          </ul>
        </div>

        <div className="bg-[#121415] border border-slate-850 p-6 rounded-2xl relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-bl-full"></div>
          <div className="flex items-center gap-2.5 mb-4">
            <Database className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">2. Firestore Sync</h3>
          </div>
          <p className="text-slate-350 text-xs leading-relaxed mb-3">
            Persistent cloud telemetry and secure client records are automatically synchronized in real-time via Google Cloud Firestore.
          </p>
          <ul className="text-[10px] font-mono text-slate-450 space-y-1.5 border-t border-slate-900 pt-3">
            <li className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-teal-400" /> Offline fallback caching state</li>
            <li className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-teal-400" /> Encrypted B2B dispatch logs</li>
          </ul>
        </div>

        <div className="bg-[#121415] border border-slate-850 p-6 rounded-2xl relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full"></div>
          <div className="flex items-center gap-2.5 mb-4">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">3. Security Operations</h3>
          </div>
          <p className="text-slate-350 text-xs leading-relaxed mb-3">
            Fully validated through secure Google reCAPTCHA v3 risk analysis, ensuring that bot automated attacks are rejected immediately.
          </p>
          <ul className="text-[10px] font-mono text-slate-450 space-y-1.5 border-t border-slate-900 pt-3">
            <li className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-400" /> Risk threshold filters set at 0.5</li>
            <li className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-400" /> Authenticated administrative roles</li>
          </ul>
        </div>
      </div>

      {/* Compliance / Footnote */}
      <div className="bg-[#151718] border border-slate-850 rounded-xl p-5 text-center text-xs text-slate-400">
        <Sparkles className="w-4 h-4 text-blue-400 mx-auto mb-2.5 animate-pulse" />
        This technology showcase operates as a sandbox demo to visually prove the capabilities of our **Symptom-to-Circuit (S2C)** diagnostic engine. No diagnostic parameters or device serials are stored on public non-secure repositories. All database backups are processed over SSL/TLS directly to encrypted Firestore segments.
      </div>
    </div>
  );
}
