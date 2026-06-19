import React, { useState } from "react";
import { Cpu, Activity, Zap, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

interface MotherboardSchematicOverlayProps {
  activeDevice: "iPhone XR" | "iPad Pro 9.7";
  liveDiodeReading: number;
  liveAmmeterReading: number;
  liveTemp: number;
  onFaultInjected?: (fault: "short_rail" | "backlight" | "none") => void;
}

export const MotherboardSchematicOverlay: React.FC<MotherboardSchematicOverlayProps> = ({
  activeDevice,
  liveDiodeReading,
  liveAmmeterReading,
  liveTemp,
  onFaultInjected
}) => {
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [activeFault, setActiveFault] = useState<"short_rail" | "backlight" | "none">("none");

  const componentsData = {
    "iPhone XR": [
      { id: "C247_W", name: "Dielectric Main Filter Capacitor", rail: "PP_VDD_MAIN", expected: "0.345V - 0.420V", function: "VDD Main Decoupling Capacitor", desc: "Filters high frequency ripple on main power line. Prone to catastrophic dielectric breakdown under thermal overload." },
      { id: "U6300", name: "Hydra USB Charger IC", rail: "PP_VDD_BOOST", expected: "0.380V - 0.450V", function: "USB Multiplexer & Charging Transceiver", desc: "Orchestrates charge routing and handshake detection on Lightning/USB VBUS interfaces." },
      { id: "PMU_MAIN", name: "Main Power Management Unit", rail: "PP_VDD_MAIN", expected: "0.410V", function: "Power Rails Regulator", desc: "Provides high efficiency buck-boost regulators for core AP voltages." }
    ],
    "iPad Pro 9.7": [
      { id: "FL1728", name: "Backlight Anode Filter Fuse", rail: "PP_LCM_BL_ANODE", expected: "0.450V (Continuity Test: 0.1Ω)", function: "LCM Backlight Safety Fuse", desc: "Acts as a protective fuse for the backlight voltage trace. Extremely susceptible to corrosion from moisture ingress." },
      { id: "U3300", name: "Tigris Charging IC", rail: "PP_VBUS_LDO", expected: "0.355V", function: "Battery Charger & DC/DC Converter", desc: "Manages early VBUS handshake checks and initiates standard charging cycles." },
      { id: "J4200", name: "LCM Display Connector", rail: "PP_LCM_BL_ANODE", expected: "0.412V (Anode Pin)", function: "LCM Board-to-Board Interface", desc: "Connects digital signals and high-voltage backlight power line directly to display panel." }
    ]
  };

  const activeComponents = componentsData[activeDevice];

  const handleSelectComponent = (id: string) => {
    setSelectedPin(id);
  };

  const handleInjectFault = (fault: "short_rail" | "backlight" | "none") => {
    setActiveFault(fault);
    if (onFaultInjected) {
      onFaultInjected(fault);
    }
  };

  // Compute live resistance display value based on faults
  const getDisplayDiodeValue = (compId: string) => {
    if (activeFault === "short_rail" && compId === "C247_W") {
      return "0.002V (DIRECT SHORT)";
    }
    if (activeFault === "backlight" && compId === "FL1728") {
      return "OL (OPEN LOOP - BLOWN)";
    }
    
    // Normal / simulated variations
    const component = activeComponents.find(c => c.id === compId);
    if (!component) return "N/A";
    
    if (compId === "C247_W") {
      return `${liveDiodeReading.toFixed(3)}V`;
    }
    if (compId === "FL1728") {
      return activeFault === "backlight" ? "OL" : "0.452V (0.2 Ω)";
    }

    return component.expected.split(" ")[0];
  };

  const getTraceColor = (compId: string) => {
    if (activeFault === "short_rail" && (compId === "C247_W" || compId === "PMU_MAIN")) {
      return "stroke-red-500 fill-red-950/40 animate-pulse";
    }
    if (activeFault === "backlight" && (compId === "FL1728" || compId === "J4200")) {
      return "stroke-amber-500 fill-amber-950/40 animate-pulse";
    }
    return selectedPin === compId ? "stroke-violet-400 fill-violet-950/30" : "stroke-slate-500 fill-slate-900/60";
  };

  const selectedCompObj = activeComponents.find(c => c.id === selectedPin) || activeComponents[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left font-sans shadow-lg flex flex-col gap-5">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-violet-400" />
          <div>
            <h4 className="text-xs font-extrabold uppercase font-mono text-white tracking-wider">
              Interactive Micro-Continuity PCB Overlay
            </h4>
            <p className="text-[10px] text-slate-400">
              Live Symptom-to-Circuit (S2C) vector schematic trace and trace calibration interface.
            </p>
          </div>
        </div>
        <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono text-violet-300 font-extrabold uppercase">
          SVG Schema Ingestion
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* SVG Motherboard Layout (Visual Viewport) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-850 p-4 flex flex-col items-center justify-center relative min-h-[280px]">
          <span className="absolute top-2.5 left-3 text-[9px] font-mono text-slate-550 uppercase tracking-widest">
            LOGIC BOARD VECTOR SCHEMATIC
          </span>

          <div className="w-full max-w-[340px] aspect-[4/3] relative">
            <svg 
              viewBox="0 0 400 300" 
              className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-300"
            >
              {/* Motherboard base plate */}
              <rect 
                x="20" y="20" width="360" height="260" rx="16" 
                className="fill-slate-900 stroke-slate-800 stroke-[2] transition-colors" 
              />
              
              {/* Ground planes / Copper traces */}
              <path d="M 40 40 L 360 40 L 360 260 L 40 260 Z" className="fill-none stroke-slate-950/20 stroke-[15]" />
              <path d="M 60 80 L 150 80 L 150 140 L 220 140 L 220 220" className="fill-none stroke-slate-800/40 stroke-[4] stroke-dasharray-[4,4]" />
              <path d="M 300 80 L 300 180 L 260 180" className="fill-none stroke-slate-800/40 stroke-[4]" />

              {/* iPhone XR Schematic SVG Nodes */}
              {activeDevice === "iPhone XR" && (
                <>
                  {/* Primary Power Rails (PP_VDD_MAIN) */}
                  <path 
                    d="M 60 120 L 160 120 L 160 180 L 260 180" 
                    className={`fill-none stroke-[3] transition-all duration-500 ${
                      activeFault === "short_rail" ? "stroke-red-500 animate-pulse stroke-[4]" : "stroke-violet-650"
                    }`} 
                  />
                  <path 
                    d="M 160 120 L 160 50" 
                    className={`fill-none stroke-[2.5] transition-all duration-500 ${
                      activeFault === "short_rail" ? "stroke-red-500 animate-pulse stroke-[3.5]" : "stroke-violet-650"
                    }`} 
                  />

                  {/* CPU Area (Representation) */}
                  <rect 
                    x="200" y="50" width="100" height="100" rx="6" 
                    className="fill-slate-950 stroke-slate-800 stroke-[1.5] hover:stroke-violet-800 transition-all cursor-help"
                  />
                  <text x="250" y="105" textAnchor="middle" className="fill-slate-600 font-mono text-[9px] uppercase font-bold select-none">A12 AP</text>

                  {/* Capacitor C247_W */}
                  <g 
                    onClick={() => handleSelectComponent("C247_W")}
                    className="cursor-pointer group"
                  >
                    <rect 
                      x="145" y="110" width="30" height="20" rx="3"
                      className={`stroke-[1.5] transition-all duration-300 ${getTraceColor("C247_W")}`} 
                    />
                    <text x="160" y="123" textAnchor="middle" className="fill-white font-mono text-[8px] font-black pointer-events-none select-none">C247</text>
                  </g>

                  {/* PMU Main */}
                  <g 
                    onClick={() => handleSelectComponent("PMU_MAIN")}
                    className="cursor-pointer group"
                  >
                    <rect 
                      x="50" y="180" width="50" height="50" rx="4"
                      className={`stroke-[1.5] transition-all duration-300 ${getTraceColor("PMU_MAIN")}`} 
                    />
                    <text x="75" y="210" textAnchor="middle" className="fill-white font-mono text-[8px] font-black pointer-events-none select-none">PMU</text>
                  </g>

                  {/* Hydra USB IC U6300 */}
                  <g 
                    onClick={() => handleSelectComponent("U6300")}
                    className="cursor-pointer group"
                  >
                    <rect 
                      x="300" y="180" width="40" height="40" rx="4"
                      className={`stroke-[1.5] transition-all duration-300 ${getTraceColor("U6300")}`} 
                    />
                    <text x="320" y="204" textAnchor="middle" className="fill-white font-mono text-[8px] font-black pointer-events-none select-none">U6300</text>
                  </g>
                </>
              )}

              {/* iPad Pro 9.7 Schematic SVG Nodes */}
              {activeDevice === "iPad Pro 9.7" && (
                <>
                  {/* Backlight Anode Rails (PP_LCM_BL_ANODE) */}
                  <path 
                    d="M 80 150 L 180 150 L 180 220 L 290 220" 
                    className={`fill-none stroke-[3] transition-all duration-500 ${
                      activeFault === "backlight" ? "stroke-amber-500 animate-pulse stroke-[4]" : "stroke-indigo-650"
                    }`} 
                  />

                  {/* A9X Processor Block */}
                  <rect 
                    x="80" y="40" width="110" height="90" rx="6" 
                    className="fill-slate-950 stroke-slate-800 stroke-[1.5] hover:stroke-indigo-800 transition-all cursor-help"
                  />
                  <text x="135" y="90" textAnchor="middle" className="fill-slate-600 font-mono text-[9px] uppercase font-bold select-none">A9X CORE</text>

                  {/* Backlight Filter FL1728 */}
                  <g 
                    onClick={() => handleSelectComponent("FL1728")}
                    className="cursor-pointer group"
                  >
                    <rect 
                      x="165" y="140" width="30" height="20" rx="3"
                      className={`stroke-[1.5] transition-all duration-300 ${getTraceColor("FL1728")}`} 
                    />
                    <text x="180" y="153" textAnchor="middle" className="fill-white font-mono text-[8px] font-black pointer-events-none select-none">FL1728</text>
                  </g>

                  {/* Tigris Charger U3300 */}
                  <g 
                    onClick={() => handleSelectComponent("U3300")}
                    className="cursor-pointer group"
                  >
                    <rect 
                      x="230" y="50" width="45" height="45" rx="4"
                      className={`stroke-[1.5] transition-all duration-300 ${getTraceColor("U3300")}`} 
                    />
                    <text x="252" y="76" textAnchor="middle" className="fill-white font-mono text-[8px] font-black pointer-events-none select-none">U3300</text>
                  </g>

                  {/* LCM Connector J4200 */}
                  <g 
                    onClick={() => handleSelectComponent("J4200")}
                    className="cursor-pointer group"
                  >
                    <rect 
                      x="290" y="190" width="60" height="40" rx="4"
                      className={`stroke-[1.5] transition-all duration-300 ${getTraceColor("J4200")}`} 
                    />
                    <text x="320" y="214" textAnchor="middle" className="fill-white font-mono text-[8px] font-black pointer-events-none select-none">J4200</text>
                  </g>
                </>
              )}
            </svg>
          </div>

          <div className="absolute bottom-2 right-3 text-[8.5px] font-mono text-slate-500">
            Click component pins to query telemetry parameters
          </div>
        </div>

        {/* Electrical Parametric Panel & Fault Injector */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Active Diagnostic Parameters Block */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3.5">
            <span className="text-[9px] font-mono text-violet-400 font-extrabold uppercase tracking-widest block border-b border-slate-900 pb-1.5">
              Probe Diagnostics Panel
            </span>

            <div className="space-y-2.5 text-left text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Selected Reference Trace:</span>
                <strong className="text-white text-[13px]">{selectedCompObj?.id} ({selectedCompObj?.name})</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-900 pt-2.5">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Power Rail Target:</span>
                  <span className="text-slate-300 text-[11px] font-bold">{selectedCompObj?.rail}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Standard Diode Tolerance:</span>
                  <span className="text-slate-300 text-[11px] font-bold">{selectedCompObj?.expected}</span>
                </div>
              </div>
              <div className="border-t border-slate-900 pt-2.5">
                <span className="text-[9px] text-slate-500 block uppercase">Active Multimeter Reading:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[15px] font-bold tracking-tight font-mono ${
                    getDisplayDiodeValue(selectedCompObj?.id).includes("SHORT") || getDisplayDiodeValue(selectedCompObj?.id).includes("OL")
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}>
                    {getDisplayDiodeValue(selectedCompObj?.id)}
                  </span>
                </div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850 text-[10px] text-slate-400 font-sans leading-relaxed">
                {selectedCompObj?.desc}
              </div>
            </div>
          </div>

          {/* Fault Injector Sandbox Panel */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
            <span className="text-[9px] font-mono text-amber-400 font-extrabold uppercase tracking-widest block border-b border-slate-900 pb-1.5 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              S2C Fault Ingestion Sandbox
            </span>

            <p className="text-[10px] text-slate-400 font-sans leading-relaxed text-left">
              Force physical faults on critical traces to verify visual alerts, validation rules, and automated RAG-routing:
            </p>

            <div className="flex flex-col gap-2">
              {activeDevice === "iPhone XR" ? (
                <button
                  type="button"
                  onClick={() => handleInjectFault(activeFault === "short_rail" ? "none" : "short_rail")}
                  className={`w-full py-2 rounded text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeFault === "short_rail"
                      ? "bg-red-650 text-white font-black hover:bg-red-600"
                      : "bg-slate-900 hover:bg-slate-850 text-red-300 border border-red-950"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  {activeFault === "short_rail" ? "❌ Clear VDD_MAIN Short" : "🚨 Inject VDD_MAIN Short (0.002V)"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleInjectFault(activeFault === "backlight" ? "none" : "backlight")}
                  className={`w-full py-2 rounded text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeFault === "backlight"
                      ? "bg-amber-650 text-white font-black hover:bg-amber-600"
                      : "bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-950"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {activeFault === "backlight" ? "❌ Clear FL1728 Blown Fuse" : "🚨 Blow Backlight Fuse (OL)"}
                </button>
              )}

              {activeFault !== "none" && (
                <div className="p-2.5 rounded bg-amber-955/30 border border-amber-900/40 text-[10px] text-amber-200 font-mono text-left leading-normal flex gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>S2C Trigger Activated:</strong> High risk of logic board deadlock. Diode drop check has triggered warnings. Ensure rework heat does not bleed to processor.
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
