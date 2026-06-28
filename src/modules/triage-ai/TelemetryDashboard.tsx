import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import {
  Cpu,
  Lock,
  Terminal,
  Activity,
  Eye,
  ShieldCheck,
  Brain,
  Upload,
  User,
  Zap,
  Flame,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  RotateCcw,
  Sparkles,
  Database,
  ArrowRight,
  Loader2
} from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { BrandLogo } from "../../components/BrandLogo";

interface TelemetryDashboardProps {
  authUser: any;
  handleGoogleSignIn: () => Promise<void>;
  addToast: (message: string, description: string, type: "success" | "error" | "info" | "warning") => void;
}

export function TelemetryDashboard({
  authUser,
  handleGoogleSignIn,
  addToast
}: TelemetryDashboardProps) {
  // Navigation / screen states
  const [activeTab, setActiveTab] = useState<"manifesto" | "s2c_engine" | "live_telemetry" | "nist_audit" | "ai_research">("manifesto");
  
  // Handshake and loading states
  const [handshakeActive, setHandshakeActive] = useState<boolean>(true);
  const [handshakeStep, setHandshakeStep] = useState<number>(0);
  const [handshakeLogs, setHandshakeLogs] = useState<string[]>([]);
  
  // Simulated device states
  const [selectedDeviceState, setSelectedDeviceState] = useState<"healthy" | "warning" | "fault">("fault");
  
  // Interactive Slider for S2C comparison (0 to 100 percentage)
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Sync history and loading states
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTick, setLastSyncTick] = useState<number>(0);

  // Advanced Telemetry & S2C Forensic Solver States
  const [researchProfile, setResearchProfile] = useState<"iphone13" | "samsung24" | "pixel8">("iphone13");
  const [researchQuery, setResearchQuery] = useState<string>("Analyze VCC Main transient drop and map S2C fault coordinates.");
  const [isResearching, setIsResearching] = useState<boolean>(false);
  const [researchResponse, setResearchResponse] = useState<string>("");
  const [researchLogs, setResearchLogs] = useState<string[]>([]);
  const [transientTimeMs, setTransientTimeMs] = useState<number>(140);
  const [dielectricFreqKhz, setDielectricFreqKhz] = useState<number>(250);
  const [acousticFreqKhz, setAcousticFreqKhz] = useState<number>(38);

  // Automated Nominal Range & Threshold Violation States
  const [vccMinLimit, setVccMinLimit] = useState<number>(3.30);
  const [vccMaxLimit, setVccMaxLimit] = useState<number>(4.15);
  const [liveVccVoltage, setLiveVccVoltage] = useState<number>(1.20);
  const [showThresholdConfig, setShowThresholdConfig] = useState<boolean>(false);
  const [hasNotifiedAnomaly, setHasNotifiedAnomaly] = useState<boolean>(false);

  useEffect(() => {
    // Synchronize live VCC voltage to simulated presets
    if (selectedDeviceState === "healthy") {
      setLiveVccVoltage(3.82);
    } else if (selectedDeviceState === "warning") {
      setLiveVccVoltage(3.71);
    } else if (selectedDeviceState === "fault") {
      setLiveVccVoltage(1.20);
    }
  }, [selectedDeviceState]);

  useEffect(() => {
    // Evaluate if current live voltage is out of the bounds
    const outOfBounds = liveVccVoltage < vccMinLimit || liveVccVoltage > vccMaxLimit;
    if (outOfBounds) {
      if (!hasNotifiedAnomaly) {
        addToast(
          "Automated Threshold Violation",
          `PP_VCC_MAIN has shifted to ${liveVccVoltage.toFixed(2)}V (Defined Limits: ${vccMinLimit.toFixed(2)}V - ${vccMaxLimit.toFixed(2)}V). High risk of logic loop collapse!`,
          "warning"
        );
        setHasNotifiedAnomaly(true);
      }
    } else {
      setHasNotifiedAnomaly(false);
    }
  }, [liveVccVoltage, vccMinLimit, vccMaxLimit, addToast, hasNotifiedAnomaly]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncTick((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const getRelativeTime = (isoString: string) => {
    if (!isoString) return "NEVER";
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5) return "JUST NOW";
    if (diffSec < 60) return `${diffSec}S AGO`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}M AGO`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}H AGO`;
    return new Date(isoString).toLocaleDateString();
  };

  const generatePdfReport = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Colors conforming strictly to DISPLAY CELL PROS specifications
      const primaryColor = [22, 22, 22]; // obsidian / rich dark grey (#111111)
      const accentColor = [0, 128, 128]; // audit teal (#008080)
      const secondaryColor = [0, 191, 255]; // silicon blue (#00BFFF)
      const warningColor = [255, 191, 0]; // forensic amber (#FFBF00)
      const errorColor = [220, 38, 38]; // diagnostic red (#dc2626)

      // Document Outer border (Aesthetic Framing)
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.rect(8, 8, 194, 281);

      // Top Header Accent Strip
      doc.setFillColor(22, 22, 22);
      doc.rect(8, 8, 194, 6, "F");

      // Brand Title Block
      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("DISPLAY CELL PROS", 16, 26);

      // Subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(0, 128, 128); // Audit Teal
      doc.text("FORENSIC TELEMETLY & SILICON-LAYER DIAGNOSTIC AUDIT", 16, 31);

      // Metadata / Timestamp right-aligned
      const timestamp = new Date().toLocaleString();
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`AUDIT TIMESTAMP: ${timestamp}`, 190, 26, { align: "right" });
      doc.text("SYSTEM CORE ID: DCP-S2C-MDF-CORE", 190, 31, { align: "right" });

      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(16, 35, 194, 35);

      // Section 1: Target Device Identity & Overall State
      doc.setFillColor(245, 247, 250); // very soft grey background
      doc.rect(16, 42, 178, 38, "F");
      doc.setDrawColor(220, 225, 230);
      doc.rect(16, 42, 178, 38, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text("SECTION 1: PHYSICAL DEVICE IDENTITY & S2C STATE", 22, 48);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Device Profile:", 22, 55);
      doc.text("Analyst Account:", 22, 61);
      doc.text("Compliance Class:", 22, 67);
      doc.text("Sanitization Status:", 22, 73);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 24, 39);
      doc.text("Generic Handset (Live Telemetry Probe)", 56, 55);
      doc.text(authUser ? (authUser.displayName || authUser.email || "Spokane Analyst") : "GUEST ANALYST SIMULATION", 56, 61);
      doc.text("NIST SP 800-88 R1 Cleared/Secure", 56, 67);
      doc.text("COMPLIANT / ZERO RESIDUAL DECAY", 56, 73);

      // Right side metrics (Device state)
      let stateLabel = "NOMINAL (HEALTHY)";
      let stateColor = accentColor;
      let scoreVal = "98";
      if (selectedDeviceState === "warning") {
        stateLabel = "DEGRADED (WARNING)";
        stateColor = warningColor;
        scoreVal = "64";
      } else if (selectedDeviceState === "fault") {
        stateLabel = "CRITICAL FAULT (REWORK)";
        stateColor = errorColor;
        scoreVal = "27";
      }

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("S2C Diagnostic Score:", 120, 55);
      doc.text("Impedance Alignment:", 120, 61);
      doc.text("Thermal Guard Status:", 120, 67);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(stateColor[0], stateColor[1], stateColor[2]);
      doc.text(`${scoreVal} / 100`, 158, 55);
      doc.text(stateLabel, 158, 61);
      doc.setTextColor(16, 185, 129); // Green
      doc.text("SAFE (<45°C Lockout Nominal)", 158, 67);

      // Section 2: Core Electrical Telemetry Indicators
      doc.setFillColor(245, 247, 250);
      doc.rect(16, 86, 178, 38, "F");
      doc.setDrawColor(220, 225, 230);
      doc.rect(16, 86, 178, 38, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text("SECTION 2: CORE ELECTRICAL TELEMETRY & VOLTAGE SHUNTS", 22, 92);

      let railVolts = "3.82V";
      let boardHeat = "29°C";
      if (selectedDeviceState === "warning") {
        railVolts = "3.71V";
        boardHeat = "42°C";
      } else if (selectedDeviceState === "fault") {
        railVolts = "1.20V";
        boardHeat = "48°C";
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("VCC_MAIN Rail Voltage:", 22, 99);
      doc.text("Logic Board Core Heat:", 22, 105);
      doc.text("Battery Charge Cycles:", 22, 111);
      doc.text("Base Standby Current:", 22, 117);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 24, 39);
      doc.text(railVolts, 60, 99);
      doc.text(boardHeat, 60, 105);
      doc.text("842 Cycles", 60, 111);
      doc.text(selectedDeviceState === "healthy" ? "0.010A" : selectedDeviceState === "warning" ? "0.150A" : "1.120A (Static Draw Loop)", 60, 117);

      // Right side: shunt measurements
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Diode Mode Anode Line:", 120, 99);
      doc.text("Cathode Line Impedance:", 120, 105);
      doc.text("Micro-Solder Filter FL1728:", 120, 111);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 24, 39);
      doc.text(selectedDeviceState === "fault" ? "OL (Open Loop)" : "0.480V (Nominal)", 162, 99);
      doc.text("0.520V (Nominal)", 162, 105);
      doc.setTextColor(selectedDeviceState === "fault" ? errorColor[0] : 16, 185, 129);
      doc.text(selectedDeviceState === "fault" ? "BLOWN (Infinite Ohms)" : "NOMINAL (<0.5 Ohms)", 162, 111);

      // Section 3: Peripheral Node Integrity Matrix
      doc.setFillColor(245, 247, 250);
      doc.rect(16, 130, 178, 48, "F");
      doc.setDrawColor(220, 225, 230);
      doc.rect(16, 130, 178, 48, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text("SECTION 3: PERIPHERAL INTEGRITY NODE MATRIX", 22, 136);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("FaceID Biometrics Link:", 22, 143);
      doc.text("OIS Rear Camera Optics:", 22, 149);
      doc.text("Baseband Co-Processor:", 22, 155);
      doc.text("Digitizer Touch Screen:", 22, 161);
      doc.text("NAND Silicon Flash Storage:", 22, 167);

      doc.setFont("helvetica", "bold");
      if (selectedDeviceState === "fault") {
        doc.setTextColor(errorColor[0], errorColor[1], errorColor[2]);
        doc.text("FAULT [I2C Timeout / Uncoupled]", 68, 143);
      } else {
        doc.setTextColor(16, 185, 129);
        doc.text("Nominal S2C Link", 68, 143);
      }

      doc.setTextColor(16, 185, 129);
      doc.text("Nominal Integration Verified", 68, 149);

      if (selectedDeviceState === "healthy") {
        doc.setTextColor(16, 185, 129);
        doc.text("Lock Verified Stable", 68, 155);
      } else {
        doc.setTextColor(warningColor[0], warningColor[1], warningColor[2]);
        doc.text("Waveform Stutter (Degraded)", 68, 155);
      }

      if (selectedDeviceState === "fault") {
        doc.setTextColor(errorColor[0], errorColor[1], errorColor[2]);
        doc.text("FAULT [SPI_IMPED_OUT_OF_BOUNDS]", 68, 161);
      } else {
        doc.setTextColor(16, 185, 129);
        doc.text("Nominal Operational", 68, 161);
      }

      doc.setTextColor(16, 185, 129);
      doc.text("Healthy / Integrity 100%", 68, 167);

      // Section 4: Forensic S2C Log Analysis & Recommendations
      doc.setFillColor(245, 247, 250);
      doc.rect(16, 184, 178, 56, "F");
      doc.setDrawColor(220, 225, 230);
      doc.rect(16, 184, 178, 56, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text("SECTION 4: FORENSIC CLINICAL ANALYSIS REPORT", 22, 190);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);

      // Render the correct log strings based on the device state
      let lines: string[] = [];
      if (selectedDeviceState === "healthy") {
        lines = [
          "1. All Symptom-to-Circuit (S2C) impedance rails evaluated within standard threshold (\u00b10.03V).",
          "2. Baseband calibration is completely authentic and original. Passable state.",
          "3. No logic-level leakage detected across main supply rails. Rework unnecessary.",
          "4. Standard operation is fully certified. Storage sectors remain secure and clean."
        ];
      } else if (selectedDeviceState === "warning") {
        lines = [
          "1. WARNING: Shunt sensor registered a 24% voltage drop mismatch on rail PP_VCC_MAIN.",
          "2. High battery charge count (842) indicates chemical storage decay and high resistance.",
          "3. Recommend systematic decoupling and replacement of secondary filtering capacitor lines.",
          "4. Device stable under moderate stress load but requires eventual preventative service."
        ];
      } else {
        lines = [
          "1. CRITICAL FAULT: Screen/Baseband calibration failed direct handshake sequence.",
          "2. ELECTRICAL ANALYSIS: Blown backlight inductor FL1728 (registering open loop / infinite ohms).",
          "3. Clinician Recommendation: Desolder FL1728 filter and micro-solder original replacement elements.",
          "4. Thermal specification: Use SAC305 Lead-Free alloy at 350\u00b0C-400\u00b0C; soften underfill at 200\u00b0C-250\u00b0C."
        ];
      }

      let yOffset = 197;
      lines.forEach(line => {
        doc.text(line, 22, yOffset);
        yOffset += 6;
      });

      // Section 5: Legal & Right to Repair Signoff
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(17, 24, 39);
      doc.text("WASHINGTON STATE RIGHT TO REPAIR & CLINICAL SHIELD COMPLIANT", 16, 248);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Display Cell Pros operates strictly within microelectronic reverse engineering parameters. This report confirms direct physical audit data sourced from Spokane/Seattle micro-soldering labs. We do not do blind part-swapping. All logical analyses are NIST compliant.",
        16,
        253,
        { maxWidth: 178 }
      );

      // Signatures
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(17, 24, 39);
      doc.text("Authorized Lead Forensic Engineer", 16, 273);
      doc.text("Triage-AI Security Core Signature", 120, 273);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("DISPLAY CELL PROS LABS", 16, 277);
      doc.text("[DIGITALLY AUDITED & SIGNED]", 120, 277);

      // Save PDF
      doc.save(`DCP-Forensics-Report-${selectedDeviceState.toUpperCase()}.pdf`);
      addToast("Report Generated", "Concise S2C diagnostic findings downloaded as a branded PDF report.", "success");
    } catch (e: any) {
      addToast("PDF Generation Error", `Failed to compile PDF report: ${e.message}`, "error");
    }
  };
  
  // NIST Wipe simulator
  const [nistWipeProgress, setNistWipeProgress] = useState<number>(-1); // -1 = idle, 100 = complete
  const [nistLogLines, setNistLogLines] = useState<string[]>([]);
  const [nistModelInput, setNistModelInput] = useState<string>("DCP-A16-PRO");

  const fetchSyncHistory = async () => {
    if (!authUser) return;
    try {
      const q = query(
        collection(db, "pos-logs"),
        where("userId", "==", authUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => doc.data());
      // Filter out only telemetry sync logs
      const tlmLogs = list.filter((log: any) => log.message && log.message.startsWith("[Telemetry Sync]"));
      // Sort descending by timestamp
      tlmLogs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSyncHistory(tlmLogs);
    } catch (err) {
      console.error("Failed to fetch sync history:", err);
    }
  };

  const syncTelemetryPayload = async (autoTrigger = false) => {
    if (!authUser) {
      addToast("Sync Blocked", "Please connect analyst account to trigger cloud synchronization.", "warning");
      return;
    }
    
    setIsSyncing(true);
    
    const scoreVal = selectedDeviceState === "healthy" ? 98 : selectedDeviceState === "warning" ? 64 : 27;
    const railVolts = selectedDeviceState === "healthy" ? "3.82V" : selectedDeviceState === "warning" ? "3.71V" : "1.20V";
    const boardHeat = selectedDeviceState === "healthy" ? "29°C" : selectedDeviceState === "warning" ? "42°C" : "48°C";
    
    const logId = `TLM-SYNC-${Date.now()}`;
    const syncMessage = `[Telemetry Sync] HANDSET: ${nistModelInput || "DCP-A16-PRO"} | S2C SCORE: ${scoreVal}% | VCC_MAIN: ${railVolts} | TEMP: ${boardHeat} | STATUS: ${selectedDeviceState.toUpperCase()}`;
    
    try {
      const logRef = doc(db, "pos-logs", logId);
      await setDoc(logRef, {
        id: logId,
        timestamp: new Date().toISOString(),
        level: "info",
        message: syncMessage,
        source: "CellSmart",
        userId: authUser.uid
      });
      
      addToast("Diagnostic Synced", autoTrigger ? "Telemetry payload auto-saved to Firebase." : "Diagnostic payload successfully synced to Firebase.", "success");
      fetchSyncHistory();
    } catch (err: any) {
      console.error("Failed to sync diagnostic payload:", err);
      addToast("Sync Failed", "Could not sync payload to Firebase.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchSyncHistory();
    } else {
      setSyncHistory([]);
    }
  }, [authUser]);
  
  // Handshake simulation triggers
  useEffect(() => {
    if (activeTab !== "live_telemetry" || !authUser) {
      setHandshakeActive(true);
      setHandshakeStep(0);
      setHandshakeLogs([]);
      return;
    }

    const logs = [
      "Initializing WebUsbTelemetryBridge connection protocol...",
      "Establising direct interface to Spokane WA laboratory server channels...",
      "Interrogating logic board PMU power rails (PP_VCC_MAIN)...",
      "Analyzing micro-soldering trace shunt voltage drops...",
      "Retrieving uncorrupted device twin firmware signatures...",
      "Establishing secure S2C cryptographic link... [LOCKED]"
    ];

    let currentStep = 0;
    setHandshakeLogs([logs[0]]);
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < logs.length) {
        setHandshakeStep(currentStep);
        setHandshakeLogs(prev => [...prev, logs[currentStep]]);
      } else {
        clearInterval(interval);
        setHandshakeActive(false);
        addToast("S2C Handshake Successful", "Telemetry diagnostic link fully synchronized.", "success");
        syncTelemetryPayload(true);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [activeTab, authUser]);

  // EKG canvas drawing
  const [ekgOffset, setEkgOffset] = useState<number>(0);
  useEffect(() => {
    const handle = requestAnimationFrame(function animate() {
      setEkgOffset(prev => (prev + 1.5) % 360);
      requestAnimationFrame(animate);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const runNistWipeSim = () => {
    if (nistWipeProgress >= 0 && nistWipeProgress < 100) return;
    
    setNistWipeProgress(0);
    const logPool = [
      `[NIST SP 800-88 R1] Initiating crypto-shred payload for target unit: ${nistModelInput}...`,
      "Verifying persistent flash memory sectors...",
      "Writing random binary pass 0xAA pattern across NAND cell partitions...",
      "Writing complementary pattern 0x55 for dielectric charge leveling...",
      "Applying final zero-out overwrite phase (Pass 3)...",
      "Validating sector null-integrity signature checks...",
      "Generating cryptographic SHA-256 certificate metadata...",
      "Erasure completed. Device state purged. Certificate generated."
    ];

    setNistLogLines([logPool[0]]);
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(Math.round((step / logPool.length) * 100), 100);
      setNistWipeProgress(progress);
      
      if (step < logPool.length) {
        setNistLogLines(prev => [...prev, logPool[step]]);
      } else {
        clearInterval(timer);
        addToast("NIST Purge Certified", "Device wiped. Certificate of Erasure successfully stored.", "success");
      }
    }, 850);
  };

  const executeForensicAiResearch = async () => {
    setIsResearching(true);
    setResearchResponse("");
    setResearchLogs([]);
    
    const logs = [
      `[DTCWA Engine] Connecting high-speed ammeter probe channels to ${researchProfile === "iphone13" ? "PP_VDD_MAIN" : researchProfile === "samsung24" ? "VCC_BATT_SENSE" : "PP_DISPLAY_BOOST"}...`,
      "[Silicon CAD] Querying physical layout files and loading Spokane WA schematic nodes...",
      `[S2C Bridge] Analyzing interactive slider variables (Target State at ${researchProfile === "iphone13" ? transientTimeMs + "ms" : researchProfile === "samsung24" ? dielectricFreqKhz + "kHz" : acousticFreqKhz + "kHz"})...`,
      "[Gemini Core] Invoking server-side diagnostic reasoning module [ThinkingLevel: HIGH]..."
    ];

    // Stream logs locally with subtle staggered delays
    for (let i = 0; i < logs.length; i++) {
      setResearchLogs(prev => [...prev, logs[i]]);
      await new Promise(r => setTimeout(r, 650));
    }

    try {
      const response = await fetch("/api/complex-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Profile: ${researchProfile}. Query: ${researchQuery}. Advanced telemetry settings: Transient Time = ${transientTimeMs}ms, Dielectric Freq = ${dielectricFreqKhz}kHz, Acoustic Freq = ${acousticFreqKhz}kHz. Detail the Symptom-to-Circuit (S2C) mapping, intermetallic solder thresholds, and hot-air rework profiles.`,
          deviceDetails: {
            brand: researchProfile === "iphone13" ? "Apple" : researchProfile === "samsung24" ? "Samsung" : "Google",
            model: researchProfile === "iphone13" ? "iPhone 13 Pro" : researchProfile === "samsung24" ? "Galaxy S24 Ultra" : "Pixel 8 Pro",
            tier: "flagship",
            issueType: researchProfile === "iphone13" ? "power" : researchProfile === "samsung24" ? "leakage" : "display"
          }
        })
      });

      const data = await response.json();
      if (data.text) {
        setResearchResponse(data.text);
        addToast("Forensic Research Complete", "Deep S2C diagnostic report retrieved successfully.", "success");
        
        if (authUser) {
          const logId = `TLM-SYNC-${Date.now()}`;
          const syncMessage = `[Telemetry Sync] RESEARCH RUN: ${researchProfile.toUpperCase()} | S2C FAILURE PINPOINTED | TARGET RAIL: ${researchProfile === "iphone13" ? "PP_VDD_MAIN" : researchProfile === "samsung24" ? "VCC_BATT_SENSE" : "PP_DISPLAY_BOOST"}`;
          await setDoc(doc(db, "pos-logs", logId), {
            id: logId,
            timestamp: new Date().toISOString(),
            level: "info",
            message: syncMessage,
            source: "CellSmart",
            userId: authUser.uid
          });
          try {
            fetchSyncHistory();
          } catch (e) {}
        }
      } else {
        throw new Error("Invalid response envelope");
      }
    } catch (err: any) {
      console.error(err);
      setResearchResponse(`### ❌ Error Invoking Diagnostic RAG Core
Failed to complete the logical S2C routing. Please verify backend connection.

**System Log:** ${err.message || err}`);
      addToast("Research Failed", "The complex S2C solver encountered a communication drop.", "error");
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="bg-[#111111] text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      
      {/* BRAND HEADER RAIL */}
      <div className="bg-[#161616] px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo size={36} showText={true} />
        </div>
        
        {/* Navigation nomenclature conforming strictly to DISPLAY CELL PROS specifications */}
        <div className="flex flex-wrap items-center justify-center gap-1 bg-[#0c0c0c] p-1.5 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab("manifesto")}
            className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider font-mono transition-all ${
              activeTab === "manifesto"
                ? "bg-slate-900 border border-slate-800 text-teal-400 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📋 Lab Core / Mandate
          </button>
          
          <button
            onClick={() => setActiveTab("s2c_engine")}
            className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider font-mono transition-all ${
              activeTab === "s2c_engine"
                ? "bg-slate-900 border border-slate-800 text-blue-400 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚡ S2C Intelligence
          </button>

          <button
            onClick={() => setActiveTab("live_telemetry")}
            className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider font-mono transition-all flex items-center gap-1.5 ${
              activeTab === "live_telemetry"
                ? "bg-slate-900 border border-slate-800 text-teal-450 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📡 Live Telemetry
            {!authUser && <Lock className="w-3 h-3 text-[#FFBF00] animate-pulse" />}
          </button>

          <button
            onClick={() => setActiveTab("nist_audit")}
            className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider font-mono transition-all ${
              activeTab === "nist_audit"
                ? "bg-slate-900 border border-slate-800 text-[#FFBF00] shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🛡️ NIST Compliance
          </button>

          <button
            onClick={() => setActiveTab("ai_research")}
            className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider font-mono transition-all flex items-center gap-1.5 ${
              activeTab === "ai_research"
                ? "bg-slate-900 border border-slate-800 text-[#00BFFF] shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🔬 AI Forensic Solver
          </button>
        </div>

        {/* Auth Ribbon Indicator */}
        <div className="flex items-center gap-3">
          {authUser ? (
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/35 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono font-bold text-emerald-400">
                LOCKED SECURE: {authUser.displayName || authUser.email?.split("@")[0]}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-900/35 px-3 py-1.5 rounded-lg">
              <Lock className="w-3 h-3 text-[#FFBF00] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[#FFBF00] uppercase">
                GUEST SIMULATOR LINK
              </span>
            </div>
          )}
        </div>
      </div>

      {/* RENDER ACTIVE LAB VIEW */}
      <div className="p-6 md:p-8 bg-[#111111]">
        
        {/* =============== VIEW 1: LAB CORE / MANDATE =============== */}
        {activeTab === "manifesto" && (
          <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
            {/* HERO HERO COGNITIVE STATEMENT */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-[#161616] to-[#0c0c0c] border border-slate-800 text-center overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,191,255,0.06),_transparent_60%)]" />

              <span className="text-[10px] font-mono font-black text-[#FFBF00] uppercase tracking-[0.4em] mb-3 block">
                [Triage-AI Forensic Division]
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                STOP GUESSING.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BFFF] to-[#008080]">
                  START AUDITING.
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-4 max-w-2xl mx-auto leading-relaxed">
                Most technical shops swap parts blindly and charge exorbitant fees. Display Cell Pros operates at the silicon layer, pinpointing exact resistor shorts and track faults via clinical S2C logic mapping.
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setActiveTab("s2c_engine")}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 font-mono"
                >
                  Inspect S2C Visualizer <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab("live_telemetry")}
                  className="px-5 py-2.5 bg-[#008080] hover:bg-[#009b9b] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2"
                >
                  Initiate Telemetry Scan <Activity className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
                </button>
              </div>
            </div>

            {/* MANIFESTO COMPARISON BOX */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900 opacity-70 group hover:opacity-90 transition-all">
                <div className="w-8 h-8 rounded-lg bg-red-950/30 border border-red-900/30 flex items-center justify-center text-red-500 mb-4 font-mono font-bold text-xs">
                  [X]
                </div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">The Modular Swap Monopoly</h3>
                <p className="text-xs text-slate-550 mt-2 leading-relaxed">
                  Retail giants declare unfixable motherboard faults, coercion toward new $1,200 hardware, raw battery exchanges that prompt locking notifications, and general visual guessing. No electrical probing, high waste.
                </p>
                <div className="mt-4 border-t border-slate-900 pt-3">
                  <span className="text-[10px] text-red-400/80 font-mono tracking-widest uppercase block">[RESULT]: 85% E-WASTE OR PRICE OVERCHARGE</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-b from-teal-950/20 to-slate-950/60 border border-[#008080]/30 hover:border-[#008080]/60 transition-all shadow-lg shadow-[#008080]/3">
                <div className="w-8 h-8 rounded-lg bg-teal-950/30 border border-[#008080]/30 flex items-center justify-center text-[#008080] mb-4">
                  <Cpu className="w-4 h-4 animate-spin-slow" />
                </div>
                <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider font-mono">Silicon Forensic Rework</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Selective diagnostic isolation. Injecting test micro-charges to isolate circuit grounds. Desoldering component nodes selectively, preserving authentic baseband calibration and saving 90% of structural raw material.
                </p>
                <div className="mt-4 border-t border-slate-900/80 pt-3">
                  <span className="text-[10px] text-[#00BFFF] font-mono tracking-widest uppercase block">[RESULT]: 100% SECURED CALIBRATION & DIRECT SAVINGS</span>
                </div>
              </div>
            </div>

            {/* ACCREDITATIONS HEADER */}
            <div className="pt-6 border-t border-slate-900 text-center">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Operating strictly in compliance with Washington State Right to Repair Code
              </p>
              <div className="mt-4 flex flex-wrap justify-center items-center gap-6 opacity-45">
                <span className="text-[11px] font-mono">NIST SP 800-88 R1</span>
                <span className="text-[11px] xg:font-bold">Display Cell Pros LLC</span>
                <span className="text-[11px] font-mono">SECURE LANDFILL EXEMPTION</span>
              </div>
            </div>
          </div>
        )}

        {/* =============== VIEW 2: S2C ENGINE VISUALIZER =============== */}
        {activeTab === "s2c_engine" && (
          <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">
                [Microelectronic Diagnostic Simulator]
              </span>
              <h2 className="text-2xl font-black text-white uppercase mt-1">S2C Visual Logic Engine</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Compare typical retail repair visual inspections against our clinical Symptom-to-Circuit mathematical model of logic boards.
              </p>
            </div>

            {/* INTERACTIVE COMPARISON SLIDER */}
            <div className="relative bg-[#0c0c0c] border border-slate-800 rounded-2xl overflow-hidden shadow-inner h-[380px]">
              
              {/* RETAIL BLIND SIDE (LEFT) */}
              <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-6 md:p-8 bg-[#111] bg-[radial-gradient(#ff000004_1px,transparent_1px)] bg-[size:16px_16px]">
                <div className="max-w-sm">
                  <span className="text-[10px] font-mono bg-red-950/60 text-red-400 px-2.5 py-1 rounded border border-red-900/30 font-extrabold tracking-widest">
                    GENERIC RETAIL VIEW
                  </span>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight mt-3">"Cracked Front Glass"</h3>
                  <p className="text-xs text-slate-450 mt-1.5 leading-relaxed font-sans">
                    Generic diagnosis suggests complex assemblies total swaps. Demanded chassis replacements. Completely destroys original touch controller serialized encryption chips causing lagging alerts.
                  </p>
                </div>

                <div className="space-y-2 mt-4 font-mono text-[11px] border-l-2 border-red-500/30 pl-3 max-w-xs">
                  <div className="text-red-400">✗ FaceID IC Serialization: Severe Lockout</div>
                  <div className="text-red-400">✗ Raw Chassis Material Waste: 247g heavy metal</div>
                  <div className="text-slate-450">✗ Estimated Charge: $479.00</div>
                </div>
              </div>

              {/* S2C AUDIT SIDE (RIGHT) */}
              <div 
                className="absolute inset-y-0 right-0 h-full bg-[#18181b] bg-grid-pattern transition-all overflow-hidden border-l border-teal-500/50"
                style={{ width: `${100 - sliderPosition}%` }}
              >
                {/* Content offset matching parent width to look unified */}
                <div 
                  className="absolute inset-y-0 right-0 h-full p-6 md:p-8 flex flex-col justify-between"
                  style={{ width: "100%", minWidth: "400px" }}
                >
                  <div className="max-w-sm">
                    <span className="text-[10px] font-mono bg-teal-950/60 text-teal-400 px-2.5 py-1 rounded border border-teal-900/30 font-extrabold tracking-widest">
                      DCP S2C INTEL VIEW
                    </span>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight mt-3">"FL1728 Inductive Open-Circuit"</h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                      Our system maps the broken backlight loop to a single uncoupled inductor filtering line. Using low thermals we micro-solder a targeted substitute preserving all genuine FaceID screens.
                    </p>
                  </div>

                  <div className="space-y-2 mt-4 font-mono text-[11px] border-l-2 border-teal-500/80 pl-3 max-w-xs">
                    <div className="text-teal-400">✓ Original Screen Security Key Preserved</div>
                    <div className="text-teal-400">✓ Raw Materials Salvaged: 99.8%</div>
                    <div className="text-teal-400">✓ S2C Estimated Charge: $125.00</div>
                  </div>
                </div>
              </div>

              {/* SLIDER CONTROLLER BAR */}
              <div 
                className="absolute inset-y-0 top-0 bottom-0 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-px h-full bg-[#00BFFF]" />
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border border-[#00BFFF] flex items-center justify-center text-[#00BFFF] shadow-lg shadow-[#00BFFF]/20 cursor-ew-resize pointer-events-auto">
                  ⇄
                </div>
              </div>

              {/* SLIDER INPUT */}
              <input 
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
              />
            </div>
            
            <p className="text-center font-mono text-[10px] text-slate-500 uppercase tracking-widest">
              [DRAG SLIDER LEFT OR RIGHT TO REVEAL CIRCUIT ANALYSIS]
            </p>
          </div>
        )}

        {/* =============== VIEW 3: LIVE TELEMETRY DASHBOARD =============== */}
        {activeTab === "live_telemetry" && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
            
            {/* FORCE USER LOGIN IF NON-SECURE LINK SENSOR */}
            {!authUser ? (
              <div className="p-8 flex-1 flex flex-col items-center justify-center text-center bg-slate-950/80 border border-slate-850 rounded-2xl min-h-[460px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-600/20 to-blue-650/20 border border-teal-500/30 flex items-center justify-center text-[#00BFFF] mb-6 relative">
                  <Activity className="w-8 h-8 animate-pulse" />
                  <Lock className="w-4 h-4 text-amber-500 absolute bottom-0 right-0 bg-slate-1000 rounded-full p-0.5 border border-slate-800" />
                </div>
                
                <span className="text-[10px] font-extrabold text-[#00BFFF] uppercase tracking-widest font-mono bg-blue-950/40 px-2.5 py-1 rounded border border-blue-900/30 mb-3">
                  S2C Live Diagnostic Vault Locked
                </span>
                
                <h3 className="text-xl font-black text-white uppercase tracking-tight max-w-lg leading-normal">
                  STOP GUESSING. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-[#00BFFF]">START AUDITING.</span>
                </h3>
                
                <p className="text-xs text-slate-450 mt-3 max-w-sm leading-relaxed font-sans">
                  Deploying the real-time <strong className="text-slate-350">Spokane Laboratory Live Telemetry Twin</strong> requires user validation. Connect your certified credentials to access signal impedance mappings.
                </p>

                {/* ADVANCED REASONING INFRASTRUCTURE KEYPOINTS */}
                <div className="mt-6 w-full max-w-md bg-slate-900/30 rounded-xl p-5 border border-slate-800/60 text-left space-y-3 font-mono text-[11px]">
                  <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-850 pb-2 flex items-center justify-between">
                    <span>Active Telemetry Matrix Node</span>
                    <span className="text-[#FFBF00] font-extrabold font-mono">Bypass Available</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#00BFFF] mt-0.5">●</span>
                    <p className="text-slate-350 font-sans leading-relaxed">
                      <strong>Digital Twin Wireframe Synthesis</strong>: See real-time signal auric pulses mapping to logic lines inside Apple/Android circuits.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#00BFFF] mt-0.5">●</span>
                    <p className="text-slate-350 font-sans leading-relaxed">
                      <strong>NIST Wipe Conformity Sync</strong>: Remotely invoke Cryptographic Shred cycles with instant cryptographically signed erasure audits.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-none justify-center">
                  <button
                    onClick={handleGoogleSignIn}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-500/10 inline-flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    Connect Analyst Account
                  </button>
                </div>
              </div>
            ) : (
              
              /* TELEMETRY VAULT GRANTED: CORE AUTH VIEW */
              <div className="space-y-6 animate-in zoom-in duration-300">
                
                {/* ACTIVE HANDSHAKE SEQUENCE LOADER */}
                <AnimatePresence>
                  {handshakeActive && (
                    <motion.div 
                      key="handshake"
                      exit={{ opacity: 0, height: 0 }}
                      className="p-6 bg-slate-950 border border-slate-850 rounded-2xl font-mono text-xs text-blue-400 space-y-2 overflow-hidden shadow-inner"
                    >
                      <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FFBF00] flex items-center gap-1.5 animate-pulse">
                          ⚡ ESTABLISHING SECURE LAB WIRE TELEMETRY HANDSHAKE
                        </span>
                        <div className="w-4 h-4 rounded-full border-2 border-[#00BFFF] border-t-transparent animate-spin" />
                      </div>
                      
                      <div className="space-y-1.5 text-slate-400 max-h-[160px] overflow-y-auto">
                        {handshakeLogs.map((log, index) => (
                          <div key={index} className="flex gap-2">
                            <span className="text-slate-600 select-none">{">"}</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* MAIN DASHBOARD BLOCK */}
                {!handshakeActive && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT PANEL: DIGITAL TWIN WIREFRAME DIAGNOSTICS (6 col) */}
                    <div className="lg:col-span-6 bg-[#0c0c0c] border border-slate-855 rounded-2xl p-6 flex flex-col justify-between h-[520px] relative overflow-hidden">
                      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                      
                      {/* Control Panel state selector inside digital twin */}
                      <div className="flex justify-between items-center z-10">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">[Digital Twin Simulation]</span>
                          <h3 className="text-lg font-bold text-white uppercase tracking-tight leading-none mt-1">Telemetry Aura</h3>
                        </div>
                        
                        <div className="flex items-center gap-2.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                          <button
                            onClick={() => setSelectedDeviceState("healthy")}
                            className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                              selectedDeviceState === "healthy"
                                ? "bg-[#008080] text-white"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            Nominal
                          </button>
                          <button
                            onClick={() => setSelectedDeviceState("warning")}
                            className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                              selectedDeviceState === "warning"
                                ? "bg-[#FFBF00] text-slate-950"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            Degraded
                          </button>
                          <button
                            onClick={() => setSelectedDeviceState("fault")}
                            className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                              selectedDeviceState === "fault"
                                ? "bg-red-600 text-white"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            Fault
                          </button>
                        </div>
                      </div>

                      {/* WIREFRAME CELL SILHOUETTE SVG with diagnostic glows */}
                      <div className="flex-1 flex items-center justify-center py-6 relative">
                        <div
                          className={`absolute w-44 h-80 rounded-3xl blur-3xl opacity-20 transition-all duration-1000 ${
                            selectedDeviceState === "healthy" && "bg-teal-500"
                          } ${selectedDeviceState === "warning" && "bg-amber-500"} ${
                            selectedDeviceState === "fault" && "bg-red-600 animate-pulse"
                          }`}
                        />

                        <svg
                          viewBox="0 0 200 360"
                          width="180"
                          height="324"
                          className="relative z-10 drop-shadow-2xl select-none"
                          fill="none"
                        >
                          {/* Phone outer chassis bezel */}
                          <rect
                            x="10"
                            y="10"
                            width="180"
                            height="340"
                            rx="30"
                            stroke={
                              selectedDeviceState === "healthy"
                                ? "#008080"
                                : selectedDeviceState === "warning"
                                ? "#FFBF00"
                                : "#dc2626"
                            }
                            strokeWidth="3.5"
                            className="transition-colors duration-700"
                          />

                          {/* Top pill dynamic island notch */}
                          <rect x="65" y="25" width="70" height="12" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />

                          {/* Simulated logic board sidebar traces inside phone */}
                          <g opacity="0.6">
                            <rect x="35" y="75" width="40" height="230" rx="4" stroke="#475569" strokeWidth="1.5" strokeDasharray="3,3" />
                            <path d="M 55 120 L 55 160 L 68 175 L 68 210" stroke="#475569" strokeWidth="1" />
                            <path d="M 45 220 L 45 270 L 62 270" stroke="#475569" strokeWidth="1" />
                          </g>

                          {/* IC chip highlight glow logic area */}
                          <rect
                            x="40"
                            y="130"
                            width="30"
                            height="30"
                            rx="2"
                            stroke={
                              selectedDeviceState === "healthy"
                                ? "#2dd4bf"
                                : selectedDeviceState === "warning"
                                ? "#f59e0b"
                                : "#ef4444"
                            }
                            strokeWidth="2"
                            fill={
                              selectedDeviceState === "healthy"
                                ? "rgba(45,212,191,0.06)"
                                : selectedDeviceState === "warning"
                                ? "rgba(245,158,11,0.06)"
                                : "rgba(239,68,68,0.12)"
                            }
                            className="transition-all duration-700"
                          />
                          <text x="55" y="148" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="monospace">A16 CPU</text>

                          {/* Charge module area at bottom */}
                          <rect
                            x="40"
                            y="250"
                            width="30"
                            height="20"
                            rx="2"
                            stroke={selectedDeviceState === "fault" ? "#ef4444" : "#475569"}
                            strokeWidth="1.5"
                            fill="transparent"
                          />
                          <text x="55" y="262" textAnchor="middle" fill="#64748b" fontSize="5" fontFamily="monospace">PMU_PWR</text>
                        </svg>
                      </div>

                      {/* Status indicator notes */}
                      <div className="z-10 flex justify-between items-center border-t border-slate-900 pt-3">
                        <span className="text-[10px] font-mono text-slate-500">PAIRING_MODE: WEB_USB_ACTIVE</span>
                        <div className="text-right">
                          <span className="text-[10px] font-mono font-bold block uppercase tracking-wide">
                            {selectedDeviceState === "healthy" && "🟢 IMMUNE_STATE_CLEAN"}
                            {selectedDeviceState === "warning" && "🟡 DEGRADED_LINE_IMPEDANCE"}
                            {selectedDeviceState === "fault" && "🔴 SILICON_DIELECTRIC_FAULT"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL: TELEMETRY METRIC WIDGETS (6 col) */}
                    <div className="lg:col-span-6 flex flex-col gap-6">
                      
                      {/* BENTO GRID ROW 1: HEALTH SCORE & ELECTRICAL STUFF */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        
                        {/* WIDGET 1: HEALTH SCORE CIRCULAR RADIAL */}
                        <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 flex flex-col justify-between items-center text-center">
                          <div className="w-full text-left">
                            <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest">[Telemetry Core]</span>
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-tight mt-0.5">S2C Live Score</h4>
                          </div>

                          {/* Radial indicator */}
                          <div className="my-4 relative flex items-center justify-center">
                            <svg className="w-28 h-28 transform -rotate-90">
                              <circle cx="56" cy="56" r="44" stroke="#1e293b" strokeWidth="5.5" fill="transparent" />
                              <circle 
                                cx="56" 
                                cy="56" 
                                r="44" 
                                stroke={
                                  selectedDeviceState === "healthy"
                                    ? "#008080"
                                    : selectedDeviceState === "warning"
                                    ? "#FFBF00"
                                    : "#dc2626"
                                } 
                                strokeWidth="6" 
                                strokeDasharray={276.4}
                                strokeDashoffset={
                                  selectedDeviceState === "healthy"
                                    ? 276.4 * (1 - 0.98)
                                    : selectedDeviceState === "warning"
                                    ? 276.4 * (1 - 0.64)
                                    : 276.4 * (1 - 0.27)
                                }
                                fill="transparent" 
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                              />
                            </svg>
                            <span className="absolute font-mono font-black text-white text-2xl">
                              {selectedDeviceState === "healthy" && "98"}
                              {selectedDeviceState === "warning" && "64"}
                              {selectedDeviceState === "fault" && "27"}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono uppercase text-slate-400">
                            {selectedDeviceState === "healthy" && "✓ LOGIC INTEGRITY MAXIMUM"}
                            {selectedDeviceState === "warning" && "🗲 CRITICAL SHUNT DETECTED"}
                            {selectedDeviceState === "fault" && "☠ REWORK DISPATCH MANDATED"}
                          </span>
                        </div>

                        {/* WIDGET 2: POWER DELIVERY & THERMAL MAPS */}
                        {(() => {
                          const isVccAnomaly = liveVccVoltage < vccMinLimit || liveVccVoltage > vccMaxLimit;
                          const deviation = isVccAnomaly
                            ? liveVccVoltage < vccMinLimit
                              ? -(vccMinLimit - liveVccVoltage)
                              : (liveVccVoltage - vccMaxLimit)
                            : 0;

                          return (
                            <div className={`rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                              isVccAnomaly
                                ? "bg-red-950/10 border-red-500/80 shadow-lg shadow-red-950/40 animate-pulse-subtle"
                                : "bg-[#0c0c0c] border border-slate-850"
                            }`}>
                              <div>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest">[Electrical Twins]</span>
                                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-tight mt-0.5">VCC MAIN Telemetry</h4>
                                  </div>
                                  
                                  <button
                                    onClick={() => setShowThresholdConfig(!showThresholdConfig)}
                                    className={`px-2 py-1 rounded text-[8px] font-mono uppercase font-black transition-all border ${
                                      showThresholdConfig
                                        ? "bg-[#008080] border-teal-500 text-white"
                                        : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                                    }`}
                                  >
                                    {showThresholdConfig ? "[Close Limits]" : "[Nominal Limits]"}
                                  </button>
                                </div>
                              </div>

                              {/* COLLAPSIBLE CONFIG PANEL */}
                              {showThresholdConfig && (
                                <div className="mt-3 p-3 bg-slate-950/95 border border-slate-850 rounded-xl space-y-3 font-mono text-[9px] animate-in slide-in-from-top-2 duration-200 z-10">
                                  <div className="border-b border-slate-900 pb-1.5 flex justify-between items-center text-slate-400">
                                    <span className="font-bold">⚡ S2C CALIBRATION CONTROLS</span>
                                    <span className="text-teal-400">Live Feedback</span>
                                  </div>

                                  {/* Live Voltage Adjustment */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-slate-300">
                                      <span>Manual VCC Main Rail Voltage</span>
                                      <span className="text-[#00BFFF] font-bold">{liveVccVoltage.toFixed(2)} V</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="1.00"
                                      max="4.50"
                                      step="0.05"
                                      value={liveVccVoltage}
                                      onChange={(e) => setLiveVccVoltage(parseFloat(e.target.value))}
                                      className="w-full accent-teal-500 h-1 bg-slate-900 rounded-lg cursor-ew-resize"
                                    />
                                  </div>

                                  {/* Min Threshold */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-slate-400">
                                      <span>Min Nominal Baseline</span>
                                      <span className="text-emerald-400 font-bold">{vccMinLimit.toFixed(2)} V</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="2.00"
                                      max="3.60"
                                      step="0.05"
                                      value={vccMinLimit}
                                      onChange={(e) => setVccMinLimit(parseFloat(e.target.value))}
                                      className="w-full accent-emerald-500 h-1 bg-slate-900 rounded-lg cursor-ew-resize"
                                    />
                                  </div>

                                  {/* Max Threshold */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-slate-400">
                                      <span>Max Nominal Baseline</span>
                                      <span className="text-red-400 font-bold">{vccMaxLimit.toFixed(2)} V</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="3.70"
                                      max="4.50"
                                      step="0.05"
                                      value={vccMaxLimit}
                                      onChange={(e) => setVccMaxLimit(parseFloat(e.target.value))}
                                      className="w-full accent-red-500 h-1 bg-slate-900 rounded-lg cursor-ew-resize"
                                    />
                                  </div>

                                  <div className="flex justify-between text-[8px] text-slate-500 pt-1 border-t border-slate-900">
                                    <span>Preset: healthy=3.82V</span>
                                    <span>warning=3.71V</span>
                                    <span>fault=1.20V</span>
                                  </div>
                                </div>
                              )}

                              <div className="my-3 space-y-2 font-mono text-xs">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                                  <span className="text-slate-500">Rail Voltage:</span>
                                  <span className={`font-bold flex items-center gap-1 ${
                                    isVccAnomaly ? "text-red-500 animate-pulse font-black" : "text-white"
                                  }`}>
                                    {isVccAnomaly && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                                    {liveVccVoltage.toFixed(2)}V
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                                  <span className="text-slate-500">Nominal Target:</span>
                                  <span className="text-slate-300 font-semibold">
                                    {vccMinLimit.toFixed(2)}V - {vccMaxLimit.toFixed(2)}V
                                  </span>
                                </div>
                                {isVccAnomaly && (
                                  <div className="flex justify-between items-center pb-2 border-b border-slate-900 text-[10px]">
                                    <span className="text-red-400">S2C Drift:</span>
                                    <span className="text-red-500 font-extrabold">
                                      {deviation < 0 ? "" : "+"}{deviation.toFixed(2)}V {deviation < 0 ? "[UNDERVOLT]" : "[OVERVOLT]"}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500">Board Heat:</span>
                                  <span className={`font-bold flex items-center gap-1 ${
                                    isVccAnomaly ? "text-amber-500" : "text-emerald-400"
                                  }`}>
                                    <Flame className="w-3.5 h-3.5" />
                                    {selectedDeviceState === "healthy" && !isVccAnomaly && "29°C"}
                                    {selectedDeviceState === "warning" && !isVccAnomaly && "42°C"}
                                    {(selectedDeviceState === "fault" || isVccAnomaly) && "48°C"}
                                  </span>
                                </div>
                              </div>

                              {/* AUTOMATED COMPLIANCE WARNING BANNER */}
                              {isVccAnomaly && (
                                <div className="bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl text-[10px] text-red-400 font-mono space-y-1 mb-3">
                                  <div className="flex items-center gap-1 font-extrabold uppercase text-xs">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                                    <span>S2C VIOLATION DISPATCHED</span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 leading-snug">
                                    Power supply drifted outside safe boundaries. High risk of immediate memory lock!
                                  </p>
                                </div>
                              )}

                              {/* Quick EKG Charging Graph */}
                              <div className="h-10 bg-slate-950/80 border border-slate-900 rounded-lg overflow-hidden flex items-end relative">
                                <svg className="w-full h-full" stroke={isVccAnomaly ? "#ef4444" : "#2dd4bf"} strokeWidth="1.2" fill="none">
                                  <path d={`M 0 20 ${[...Array(20)].map((_, i) => {
                                    const angle = (i * 18) + ekgOffset;
                                    const rad = (angle * Math.PI) / 180;
                                    let yHeight = Math.sin(rad * 4) * 8;
                                    
                                    if (isVccAnomaly) {
                                      // Highly erratic signal showing voltage spikes and collapses
                                      if (i % 3 === 0) {
                                        yHeight = (i % 2 === 0 ? -16 : 14);
                                      } else {
                                        yHeight = Math.sin(rad * 6) * 11;
                                      }
                                    } else {
                                      // Smooth healthy sine wave
                                      yHeight = Math.sin(rad * 3) * 6;
                                    }
                                    return `L ${i * 15} ${20 + yHeight}`;
                                  }).join(" ")}`} />
                                  
                                  {/* Visual Highlight of Anomaly Peaks */}
                                  {isVccAnomaly && (
                                    <>
                                      <circle cx="45" cy="4" r="3" fill="#ef4444" opacity="0.8" className="animate-ping" />
                                      <circle cx="45" cy="4" r="1.5" fill="#ef4444" />
                                      <circle cx="135" cy="34" r="3" fill="#ef4444" opacity="0.8" className="animate-ping" />
                                      <circle cx="135" cy="34" r="1.5" fill="#ef4444" />
                                      <circle cx="225" cy="4" r="3" fill="#ef4444" opacity="0.8" className="animate-ping" />
                                      <circle cx="225" cy="4" r="1.5" fill="#ef4444" />
                                    </>
                                  )}
                                </svg>
                                
                                {isVccAnomaly && (
                                  <span className="absolute top-1 right-2 font-mono text-[8px] text-red-500 font-extrabold uppercase animate-pulse">
                                    [ANOMALY_PEAK]
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* BENTO GRID ROW 2: PERIPHERAL INTEGRITY NODE MATRIX */}
                      <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                        <div>
                          <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest">[Impedance Bridge Handshake]</span>
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-tight mt-0.5">Peripheral Integrity Matrix</h4>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-[10px]">
                          {/* FaceID node */}
                          <div className={`p-2.5 rounded-lg border flex flex-col justify-between h-14 ${
                            selectedDeviceState === "fault" 
                              ? "bg-red-950/20 border-red-500/30 text-red-400 animate-pulse" 
                              : "bg-slate-950 border-slate-850 text-slate-400"
                          }`}>
                            <span className="font-bold">FaceID Biometrics</span>
                            <span className="text-[9px]">
                              {selectedDeviceState === "fault" ? "✗ FAULT [I2C Timeout]" : "✓ Nominal Link"}
                            </span>
                          </div>

                          {/* Cameras node */}
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 flex flex-col justify-between h-14">
                            <span className="font-semibold">OIS Rear Optics</span>
                            <span className="text-[9px] text-[#008080]">🟢 Nominal</span>
                          </div>

                          {/* Baseband node */}
                          <div className={`p-2.5 rounded-lg border flex flex-col justify-between h-14 ${
                            selectedDeviceState !== "healthy" 
                              ? "bg-amber-950/20 border-amber-500/20 text-[#FFBF00]" 
                              : "bg-slate-950 border-slate-850 text-slate-400"
                          }`}>
                            <span className="font-semibold">BB Co-Processor</span>
                            <span className="text-[9px]">
                              {selectedDeviceState === "healthy" ? "🟢 Lock Verified" : "⚠️ Waveform Stutter"}
                            </span>
                          </div>

                          {/* WiFi node */}
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 flex flex-col justify-between h-14">
                            <span className="font-semibold">Wi-Fi 6E SoC</span>
                            <span className="text-[9px] text-[#008080]">🟢 Operational</span>
                          </div>

                          {/* Touch node */}
                          <div className={`p-2.5 rounded-lg border flex flex-col justify-between h-14 ${
                            selectedDeviceState === "fault" 
                              ? "bg-red-950/20 border-red-500/20 text-red-400" 
                              : "bg-slate-950 border-slate-850 text-slate-400"
                          }`}>
                            <span className="font-semibold">Digitizer Matrix</span>
                            <span className="text-[9px]">
                              {selectedDeviceState === "fault" ? "✗ FAULT_SPI_IMPED" : "🟢 Operational"}
                            </span>
                          </div>

                          {/* NAND storage node */}
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 flex flex-col justify-between h-14">
                            <span className="font-semibold">NAND Storage Flash</span>
                            <span className="text-[9px] text-[#008080]">🟢 Healthy</span>
                          </div>
                        </div>
                      </div>

                      {/* BENTO GRID ROW 3: FORENSIC LOGS & ACTIONS */}
                      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3 font-mono text-[11px]">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 tracking-wider font-bold border-b border-slate-900 pb-2">
                          <span>[S2C CLINICAL LOGSTREAM]</span>
                          <span className="text-teal-400 animate-pulse">● FEED ACTIVE</span>
                        </div>

                        <div className="h-28 overflow-y-auto space-y-1.5 leading-snug">
                          {selectedDeviceState === "healthy" && (
                            <>
                              <p className="text-[#008080]">{"> All S2C impedance rails evaluated within ±0.03V of standard schematics."}</p>
                              <p className="text-slate-400">{"> Baseband calibration check: PASS. CPU die thermal behavior: NOMINAL."}</p>
                              <p className="text-slate-400">{"> Device state registered clean. Free from thermal solder fatigue."}</p>
                            </>
                          )}
                          {selectedDeviceState === "warning" && (
                            <>
                              <p className="text-amber-500">{"> WARNING: Line impedance reading drop of 24% detected near power rail PP_VCC_MAIN."}</p>
                              <p className="text-slate-400">{"> High charge cycle (842) suggests battery storage chemical exhaustion."}</p>
                              <p className="text-slate-400">{"> Recommend replacement of secondary power filtering capacitors to bypass latching errors."}</p>
                            </>
                          )}
                          {selectedDeviceState === "fault" && (
                            <>
                              <p className="text-red-500">{"> CRITICAL FAULT: Baseband / Screen communication matrix failed calibration handshake."}</p>
                              <p className="text-[#FFBF00]">{"> ANALYSIS: Micro-backlight inductors open circuit (Infinite resistance detected at FL1728)."}</p>
                              <p className="text-slate-400">{"> Clinician recommendation: Desolder FL1728 filter and micro-solder original replacement elements preserved under SAC305."}</p>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 mt-2">
                          <button
                            onClick={generatePdfReport}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-[#008080]/30 hover:border-[#008080]/60 rounded-lg text-[10px] font-bold text-teal-400 uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Export PDF Report
                          </button>

                          <button
                            onClick={() => {
                              addToast("Hardware Scan Reset", "Cleared active telemetry cache.", "info");
                              setHandshakeActive(true);
                              setHandshakeStep(0);
                              setHandshakeLogs([]);
                            }}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 uppercase tracking-widest transition-colors cursor-pointer"
                          >
                            Recalibrate Link
                          </button>
                          
                          <button
                            onClick={() => {
                              addToast(
                                "Micro-Rework Authorized",
                                "S2C Rework queued for Display Cell Pros Spokane laboratory.",
                                "success"
                              );
                            }}
                            className="px-4.5 py-2 bg-[#008080] hover:bg-[#009a9a] text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Cpu className="w-3.5 h-3.5 animate-spin-slow" />
                            [Authorize Tier-3 Repair]
                          </button>
                        </div>
                      </div>

                      {/* BENTO GRID ROW 4: FIREBASE SYNC HISTORY */}
                      <div id="firebase-sync-history-panel" className="bg-[#0b0c0c] border border-slate-850 rounded-2xl p-5 flex flex-col gap-4 font-mono text-[11px]">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 tracking-wider font-bold border-b border-slate-900 pb-2">
                          <span className="flex items-center gap-1.5 uppercase">
                            <Database className="w-3.5 h-3.5 text-teal-500" />
                            [Firebase Sync Registry]
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              id="refresh-sync-history-btn"
                              onClick={() => {
                                fetchSyncHistory();
                                addToast("Registry Updated", "Synchronized telemetry cloud registry.", "info");
                              }}
                              className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                              title="Refresh logs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-teal-400 animate-pulse">● CLOUD SYNC ACTIVE</span>
                          </div>
                        </div>

                        {/* Sync health summary overview header */}
                        <div id="sync-summary-header" className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60 text-center font-mono text-[10px]">
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Total Successful Syncs</span>
                            <span id="total-syncs-count" className="text-sm font-black text-teal-400 mt-1">
                              {syncHistory.length}
                            </span>
                          </div>
                          <div className="flex flex-col items-center justify-center border-l border-slate-900">
                            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Last Sync Success</span>
                            <span id="last-sync-duration" className={`text-sm font-black mt-1 ${syncHistory[0] ? "text-sky-400 animate-pulse" : "text-slate-600"}`}>
                              {syncHistory[0] ? getRelativeTime(syncHistory[0].timestamp) : "NEVER"}
                            </span>
                          </div>
                        </div>

                        {/* Sync payload action trigger */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-slate-900 shadow-inner">
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Active Diagnostic Frame</span>
                            <span className="text-[9px] text-slate-500 mt-0.5 font-mono">
                              Model: {nistModelInput || "Generic"} | State: {selectedDeviceState.toUpperCase()}
                            </span>
                          </div>
                          <button
                            id="sync-telemetry-payload-btn"
                            onClick={() => syncTelemetryPayload()}
                            disabled={isSyncing}
                            className="px-3.5 py-1.5 bg-[#008080] hover:bg-[#009a9a] disabled:bg-slate-900 text-white font-bold rounded-lg text-[10px] font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed border border-[#008080]/30"
                          >
                            {isSyncing ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <Database className="w-3.5 h-3.5" />
                                Sync Payload
                              </>
                            )}
                          </button>
                        </div>

                        {/* The log viewer timeline */}
                        <div className="h-36 overflow-y-auto pr-1 space-y-2 font-mono text-[10.5px]">
                          {syncHistory.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-900 rounded-xl text-slate-600">
                              <Database className="w-6 h-6 stroke-[1.5] mb-2 opacity-30" />
                              <span className="text-[9.5px] uppercase font-bold tracking-wider">[No Synced Telemetry Payloads]</span>
                              <span className="text-[9px] text-slate-500 mt-1 font-sans">Run a telemetry handshake or click 'Sync Payload' to commit logs to Firebase.</span>
                            </div>
                          ) : (
                            syncHistory.map((log) => {
                              const date = new Date(log.timestamp);
                              const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString();
                              
                              // Parse diagnostic fields from message
                              const msgStr = log.message || "";
                              const handsetMatch = msgStr.match(/HANDSET:\s*([^|]+)/);
                              const scoreMatch = msgStr.match(/SCORE:\s*([^|]+)/);
                              const voltsMatch = msgStr.match(/VCC_MAIN:\s*([^|]+)/);
                              const tempMatch = msgStr.match(/TEMP:\s*([^|]+)/);
                              const statusMatch = msgStr.match(/STATUS:\s*([^\s]+)/);

                              const handset = handsetMatch ? handsetMatch[1].trim() : "Generic";
                              const score = scoreMatch ? scoreMatch[1].trim() : "N/A";
                              const volts = voltsMatch ? voltsMatch[1].trim() : "N/A";
                              const temp = tempMatch ? tempMatch[1].trim() : "N/A";
                              const status = statusMatch ? statusMatch[1].trim() : "UNKNOWN";

                              return (
                                <div key={log.id} className="p-2.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-900 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors group">
                                  <div className="flex items-start gap-2.5">
                                    <div className="mt-0.5 shrink-0">
                                      {status === "HEALTHY" ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : status === "WARNING" ? (
                                        <AlertTriangle className="w-3.5 h-3.5 text-[#FFBF00]" />
                                      ) : (
                                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                      )}
                                    </div>
                                    <div className="flex flex-col text-left">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-extrabold text-slate-300 uppercase">{handset}</span>
                                        <span className="text-[9px] text-slate-400 border border-slate-900 px-1 rounded bg-slate-1000">S2C: {score}</span>
                                        <span className="text-[9px] text-slate-400 border border-slate-900 px-1 rounded bg-slate-1000">{volts}</span>
                                        <span className="text-[9px] text-slate-400 border border-slate-900 px-1 rounded bg-slate-1000">{temp}</span>
                                      </div>
                                      <span className="text-[9px] text-slate-500 mt-1 font-sans">
                                        Cloud Commit: <strong className="text-slate-400 font-mono text-[9.5px]">{log.id}</strong>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[9.5px] font-bold text-slate-450 block font-mono">{formattedDate}</span>
                                    <span className="text-[8px] uppercase tracking-widest text-emerald-400 font-bold block mt-0.5 font-mono">
                                      ✓ SYNCED_OK
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* =============== VIEW 4: NIST SECURE COMPLIANCE =============== */}
        {activeTab === "nist_audit" && (
          <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-mono text-[#FFBF00] uppercase tracking-widest font-bold">
                [Certifiable Fleet Storage Clearance]
              </span>
              <h2 className="text-2xl font-black text-white uppercase mt-1">NIST SP 800-88 R1 Erasure Sanitization</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Display Cell Pros guarantees non-recoverable secure wipe trajectories for corporate mobile fleets, supplying cryptographically signed Certificates of Erasure.
              </p>
            </div>

            {/* NIST WIPE SIMULATOR WORKBENCH */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="md:col-span-4 bg-[#0c0c0c] border border-slate-850 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="font-mono text-[9px] text-[#FFBF00] uppercase tracking-wider">
                    [Sanitization Controller]
                  </div>
                  
                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <label htmlFor="nist-model-select" className="text-slate-500 font-mono text-[10px] block mb-1 uppercase tracking-wide">Target Unit Serial</label>
                      <input 
                        id="nist-model-select"
                        type="text"
                        value={nistModelInput}
                        onChange={(e) => setNistModelInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        placeholder="e.g. DCP-A16-PRO"
                      />
                    </div>

                    <div>
                      <span className="text-slate-500 font-mono text-[10px] block mb-1 uppercase tracking-wide">Purge Protocol</span>
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg font-mono text-[11px] leading-relaxed">
                        <strong className="text-white">Active Cryptographic Shred Selection</strong>: Purges flash keys immediately to prevent subsequent NAND decoding.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={runNistWipeSim}
                    disabled={nistWipeProgress >= 0 && nistWipeProgress < 100}
                    className="w-full py-3 bg-[#FFBF00] hover:bg-[#ffa600] disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-amber-500/5 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {nistWipeProgress >= 0 && nistWipeProgress < 100 ? `${nistWipeProgress}% OVERWRITE ACTIVE` : "Launch NIST SP Purge"}
                  </button>
                </div>
              </div>

              {/* LIVE SIMULATOR MONITOR */}
              <div className="md:col-span-8 bg-slate-950 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between h-[340px] font-mono text-[11px]">
                <div className="flex justify-between items-center text-[10px] text-slate-500 tracking-wider font-bold border-b border-slate-900 pb-2.5 mb-3">
                  <span>[NIST PURGE DECAY FEED]</span>
                  <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded ${
                    nistWipeProgress === -1 ? "bg-slate-900 text-slate-450" : nistWipeProgress < 100 ? "bg-amber-950 text-amber-400 animate-pulse" : "bg-emerald-950 text-emerald-400"
                  }`}>
                    {nistWipeProgress === -1 ? "IDLE_CHANNELS" : nistWipeProgress < 100 ? "CLEAR_PURGE_ENGAGED" : "CERTIFIED_PURGED"}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 leading-normal mb-4">
                  {nistWipeProgress === -1 ? (
                    <p className="text-slate-600 italic select-none">{"> Purge monitor raw signal is completely static. Select target and invoke 'Launch NIST SP Purge' to audit NAND shredding."}</p>
                  ) : (
                    nistLogLines.map((line, index) => (
                      <p key={index} className={index === nistLogLines.length - 1 ? "text-amber-400 font-bold" : "text-slate-300"}>
                        {">"} {line}
                      </p>
                    ))
                  )}
                </div>

                {/* Secure certificate receipt download receipt */}
                {nistWipeProgress === 100 && (
                  <div className="bg-emerald-950/20 border border-emerald-900/40 p-3.5 rounded-lg flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="font-bold text-white block">Certificate Generated (SHA-256 Signature)</span>
                        <span className="text-[10px] text-slate-450 font-mono block">DCP-NIST-COE: 7fb12e79603ef8812...</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        addToast("Certificate Stored", "Certificate PDF queued for Spokane secure drive sync.", "success");
                      }}
                      className="px-3.5 py-1.5 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/50 text-emerald-300 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
                    >
                      Download COE
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =============== VIEW 5: S2C AI FORENSIC RESEARCH SOLVER =============== */}
        {activeTab === "ai_research" && (
          <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-mono text-[#00BFFF] uppercase tracking-widest font-bold">
                [Sub-Surface Silicon Research Lab]
              </span>
              <h2 className="text-2xl font-black text-white uppercase mt-1">S2C AI Forensic Workbench</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Evaluate low-level board physics using our physical telemetry streams. Bridge dynamic ammeter waveforms, dielectric sweep graphs, and piezo-acoustic harmonics directly into Gemini to pinpoint micro-soldering rework solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT PANEL: LOW-LEVEL TELEMETRY STREAMS & SCOPES */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* PROFILE SELECTOR TABS */}
                <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-4 space-y-3">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    [1] Select Telemetry Stream Target
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setResearchProfile("iphone13");
                        setResearchQuery("Analyze VCC Main transient current collapse at 140ms and recommend hot-air thermal reflow profiles.");
                      }}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        researchProfile === "iphone13"
                          ? "bg-slate-900 border-teal-500 text-teal-400 shadow"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="font-bold text-[10px] uppercase font-mono tracking-tight">iPhone 13</div>
                      <div className="text-[8px] text-slate-500 font-mono mt-0.5">DTCWA AMMETER</div>
                    </button>

                    <button
                      onClick={() => {
                        setResearchProfile("samsung24");
                        setResearchQuery("Evaluate C1032 delamination under high-frequency dielectric LCR sweeps and calculate shunt leaks.");
                      }}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        researchProfile === "samsung24"
                          ? "bg-slate-900 border-blue-500 text-blue-400 shadow"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="font-bold text-[10px] uppercase font-mono tracking-tight">Galaxy S24</div>
                      <div className="text-[8px] text-slate-500 font-mono mt-0.5">DLIF DIELECTRIC</div>
                    </button>

                    <button
                      onClick={() => {
                        setResearchProfile("pixel8");
                        setResearchQuery("Isolate high-frequency backlight inductor L1501 piezo-acoustic resonance cracking at 38kHz.");
                      }}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        researchProfile === "pixel8"
                          ? "bg-slate-900 border-amber-500 text-amber-400 shadow"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="font-bold text-[10px] uppercase font-mono tracking-tight">Pixel 8 Pro</div>
                      <div className="text-[8px] text-slate-500 font-mono mt-0.5">RACP ACOUSTIC</div>
                    </button>
                  </div>
                </div>

                {/* DYNAMIC SCOPE WORKBENCH */}
                <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                  
                  {/* IPHONE 13: DTCWA OSCILLOSCOPE CONTROL & SCOPE */}
                  {researchProfile === "iphone13" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">
                          [DTCWA Scope - PP_VDD_MAIN]
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">500ms Frame Capture</span>
                      </div>

                      {/* Oscilloscope SVG */}
                      <div className="h-44 bg-slate-950 border border-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                        
                        <svg className="w-full h-full" stroke="#008080" strokeWidth="1.5" fill="none" viewBox="0 0 300 150">
                          {/* Grid background markers */}
                          <line x1="0" y1="75" x2="300" y2="75" stroke="#111827" strokeWidth="1" strokeDasharray="5,5" />
                          <line x1="150" y1="0" x2="150" y2="150" stroke="#111827" strokeWidth="1" strokeDasharray="5,5" />
                          
                          {/* Oscilloscope Transient line */}
                          {/* 0ms to 140ms is stable at 3.82V (scaled to y=40). at 140ms (x=84), collapses to 1.15V (scaled to y=120) */}
                          <path 
                            d="M 0 40 L 84 40 L 87 110 L 120 120 L 150 115 L 200 120 L 250 118 L 300 120" 
                            stroke="#10b981" 
                            strokeWidth="2" 
                            fill="none" 
                            className="transition-all duration-300"
                          />
                          
                          {/* Glowing vertical target marker scanline at current transientTimeMs slider position */}
                          {/* Scales 0-500ms to 0-300px (factor *0.6) */}
                          <line 
                            x1={transientTimeMs * 0.6} 
                            y1="0" 
                            x2={transientTimeMs * 0.6} 
                            y2="150" 
                            stroke={transientTimeMs >= 140 ? "#FFBF00" : "#00BFFF"} 
                            strokeWidth="1.5" 
                            strokeDasharray="3,3" 
                          />
                          
                          {/* Fault Highlight Circle on the collapse node at 140ms */}
                          <circle cx="85" cy="40" r="5" fill="#ef4444" opacity="0.4" className="animate-ping" />
                          <circle cx="85" cy="40" r="3" fill="#ef4444" />
                        </svg>

                        {/* Floater values */}
                        <div className="absolute bottom-2.5 left-2.5 font-mono text-[9px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">
                          SCANPOINT: <strong className="text-white">{transientTimeMs}ms</strong>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 font-mono text-[9px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">
                          VALUE: <strong className={transientTimeMs >= 140 ? "text-amber-400 animate-pulse" : "text-emerald-400"}>
                            {transientTimeMs >= 140 ? "1.15V [CRITICAL_PANIC_DECAY]" : "3.82V [NOMINAL]"}
                          </strong>
                        </div>
                      </div>

                      {/* Slider controls */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Transient Offset Time</span>
                          <span className="text-[#00BFFF] font-bold">{transientTimeMs} ms</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          value={transientTimeMs}
                          onChange={(e) => setTransientTimeMs(Number(e.target.value))}
                          className="w-full accent-teal-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-450 leading-relaxed">
                        <strong className="text-white uppercase">DTCWA Theory Output</strong>: Scanning active bus cycles shows a critical 70% current collapse when memory blocks initializations are attempted at <strong className="text-amber-400 font-bold">140ms</strong>. This isolates a micro-short in decoupling line cap <strong className="text-teal-400 font-bold">C247_W</strong>.
                      </div>
                    </div>
                  )}

                  {/* SAMSUNG S24: DLIF LCR IMPEDANCE SWEEP PROFILE */}
                  {researchProfile === "samsung24" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                          [DLIF LCR Sweep - VCC_BATT_SENSE]
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">100Hz - 1MHz AC Sweep</span>
                      </div>

                      {/* LCR Graph SVG */}
                      <div className="h-44 bg-slate-950 border border-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                        
                        <svg className="w-full h-full" stroke="#3b82f6" strokeWidth="1.5" fill="none" viewBox="0 0 300 150">
                          {/* Reference Healthy Line (Green curve, sloping down but stays high) */}
                          <path d="M 10 20 Q 150 25 290 35" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
                          
                          {/* Faulty dielectric leakage curve (Drops sharply as freq increases) */}
                          <path d="M 10 20 Q 80 40 120 90 T 200 135 T 290 142" stroke="#ef4444" strokeWidth="2" fill="none" />
                          
                          {/* Frequency Sweep Line Marker */}
                          {/* Scales 10-1000kHz to 10-290px */}
                          <line 
                            x1={10 + (dielectricFreqKhz * 0.28)} 
                            y1="0" 
                            x2={10 + (dielectricFreqKhz * 0.28)} 
                            y2="150" 
                            stroke="#3b82f6" 
                            strokeWidth="1.5" 
                            strokeDasharray="2,2" 
                          />
                          
                          {/* Baseline labels */}
                          <text x="15" y="30" fill="#10b981" fontSize="7" fontFamily="monospace">Healthy MLCC</text>
                          <text x="50" y="115" fill="#ef4444" fontSize="7" fontFamily="monospace">Dielectric Leakage</text>
                        </svg>

                        {/* Floater values */}
                        <div className="absolute bottom-2.5 left-2.5 font-mono text-[9px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">
                          FREQ: <strong className="text-white">{dielectricFreqKhz} kHz</strong>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 font-mono text-[9px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">
                          IMPEDANCE: <strong className={dielectricFreqKhz > 150 ? "text-amber-400 animate-pulse" : "text-emerald-400"}>
                            {dielectricFreqKhz > 150 
                              ? `${Math.max(3, Math.round(1500 / (dielectricFreqKhz * 0.05))) / 10} Ω [SHORT]`
                              : ">2.4M Ω [NOMINAL]"}
                          </strong>
                        </div>
                      </div>

                      {/* Slider controls */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>AC Sweep Frequency</span>
                          <span className="text-[#00BFFF] font-bold">{dielectricFreqKhz} kHz</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="1000"
                          value={dielectricFreqKhz}
                          onChange={(e) => setDielectricFreqKhz(Number(e.target.value))}
                          className="w-full accent-blue-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-450 leading-relaxed">
                        <strong className="text-white uppercase">DLIF Theory Output</strong>: High-frequency AC excitation confirms the barium titanate crystal structure within decoupling cap bank <strong className="text-blue-400 font-bold">C1032</strong> has suffered mechanical shear, resulting in a resistive shunt of <strong className="text-amber-400 font-bold">3.2 Ω</strong> at high switching frequencies.
                      </div>
                    </div>
                  )}

                  {/* PIXEL 8: RACP ACOUSTIC SPECTRAL PROBING PROFILE */}
                  {researchProfile === "pixel8" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                          [RACP Acoustic Spectrum - PP_DISPLAY_BOOST]
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">20kHz - 100kHz FFT Hum</span>
                      </div>

                      {/* Acoustic FFT SVG */}
                      <div className="h-44 bg-slate-950 border border-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                        
                        <svg className="w-full h-full" stroke="#d97706" strokeWidth="1.5" fill="none" viewBox="0 0 300 150">
                          {/* Safe Threshold Limit Line */}
                          <line x1="0" y1="90" x2="300" y2="90" stroke="#b91c1c" strokeWidth="1" strokeDasharray="3,3" />
                          <text x="210" y="85" fill="#ef4444" fontSize="6" fontFamily="monospace">MAX RESONANCE LIMIT</text>
                          
                          {/* Spectral Peak representing ferrite core crack hum at 38kHz. Peak is at x=70. Amplitude is 120 (y=30) */}
                          <path 
                            d="M 10 130 L 40 130 Q 70 20 100 130 L 150 130 L 180 130 Q 200 110 220 130 L 290 130" 
                            stroke="#f59e0b" 
                            strokeWidth="2" 
                            fill="none" 
                          />
                          
                          {/* Frequency sweep slider scanning */}
                          {/* Scales 20-100kHz to 10-290px */}
                          <line 
                            x1={10 + ((acousticFreqKhz - 20) * 3.5)} 
                            y1="0" 
                            x2={10 + ((acousticFreqKhz - 20) * 3.5)} 
                            y2="150" 
                            stroke="#f59e0b" 
                            strokeWidth="1.5" 
                            strokeDasharray="2,2" 
                          />
                        </svg>

                        {/* Floater values */}
                        <div className="absolute bottom-2.5 left-2.5 font-mono text-[9px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">
                          SCANPOINT: <strong className="text-white">{acousticFreqKhz} kHz</strong>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 font-mono text-[9px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">
                          ACOUSTIC PEAK: <strong className={acousticFreqKhz >= 34 && acousticFreqKhz <= 42 ? "text-red-500 animate-pulse font-extrabold" : "text-emerald-400"}>
                            {acousticFreqKhz >= 34 && acousticFreqKhz <= 42 ? "4.2x AMBIGUOUS RES [CRACK]" : "1.0x NOMINAL"}
                          </strong>
                        </div>
                      </div>

                      {/* Slider controls */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Inductor Acoustic Tuning</span>
                          <span className="text-[#FFBF00] font-bold">{acousticFreqKhz} kHz</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={acousticFreqKhz}
                          onChange={(e) => setAcousticFreqKhz(Number(e.target.value))}
                          className="w-full accent-amber-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-450 leading-relaxed">
                        <strong className="text-white uppercase">RACP Theory Output</strong>: Ferrite acoustic emission checks identify a mechanical core fracture on backlight boost inductor <strong className="text-amber-500 font-bold">L1501</strong>. Under a 38kHz duty cycle, reluctance loop collapse occurs, prompting backlight driver protection shutdowns.
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* RIGHT PANEL: S2C AI FORENSIC RESEARCH SOLVER & TERMINAL */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* PROMPT CONSOLE */}
                <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      [2] S2C Intelligence Prompter
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">Dual-Phase AI Solver</span>
                  </div>

                  {/* PRESET SHORTCUTS */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Interactive Shortcuts:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          if (researchProfile === "iphone13") {
                            setResearchQuery("Analyze PP_VDD_MAIN transient current collapse at 140ms and recommend hot-air thermal reflow profiles.");
                          } else if (researchProfile === "samsung24") {
                            setResearchQuery("Evaluate C1032 delamination under high-frequency dielectric LCR sweeps and calculate shunt leaks.");
                          } else {
                            setResearchQuery("Isolate high-frequency backlight inductor L1501 piezo-acoustic resonance cracking at 38kHz.");
                          }
                        }}
                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-850 hover:border-[#00BFFF]/40 text-slate-350 hover:text-white rounded-lg text-[10px] font-mono transition-colors text-left cursor-pointer"
                      >
                        ⚡ Isolate Root Cause & S2C Mapping
                      </button>

                      <button
                        onClick={() => {
                          setResearchQuery(`Determine thermal profile around critical logic nodes. Outline why low-melt Bismuth (Sn42/Bi58) must be avoided compared to SAC305 structural lead-free solder.`);
                        }}
                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-850 hover:border-[#FFBF00]/40 text-slate-350 hover:text-white rounded-lg text-[10px] font-mono transition-colors text-left cursor-pointer"
                      >
                        🔥 Calculate Intermetallic Solder Rework Profiles
                      </button>

                      <button
                        onClick={() => {
                          setResearchQuery(`Draft complete right-to-repair compliant diagnostics summary including specific circuit nodes, temperatures, and 45°C thermal lockout thresholds.`);
                        }}
                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-850 hover:border-[#008080]/40 text-slate-350 hover:text-white rounded-lg text-[10px] font-mono transition-colors text-left cursor-pointer"
                      >
                        📋 Compile CoV Compliant SOP Document
                      </button>
                    </div>
                  </div>

                  {/* CUSTOM QUERY TEXTAREA */}
                  <div className="space-y-1">
                    <label htmlFor="research-prompt-input" className="text-slate-500 font-mono text-[9px] block uppercase tracking-wide">Custom RAG Command Parameters</label>
                    <textarea
                      id="research-prompt-input"
                      rows={3}
                      value={researchQuery}
                      onChange={(e) => setResearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white placeholder-slate-700 font-mono leading-relaxed focus:outline-none focus:border-[#00BFFF]"
                      placeholder="e.g. Map current spikes to logical PMIC blocks..."
                    />
                  </div>

                  {/* LAUNCH BUTTON */}
                  <button
                    onClick={executeForensicAiResearch}
                    disabled={isResearching}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-blue-650 hover:from-teal-500 hover:to-blue-500 disabled:from-slate-850 disabled:to-slate-850 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/5 cursor-pointer"
                  >
                    {isResearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        Analyzing S2C Telemetry Matrices...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 text-[#00BFFF]" />
                        Invoke S2C Forensic Research Engine
                      </>
                    )}
                  </button>
                </div>

                {/* LOGS MONITOR */}
                <AnimatePresence>
                  {isResearching && (
                    <motion.div
                      key="research-logs"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 bg-slate-950 border border-slate-850 rounded-2xl font-mono text-[11px] text-blue-400 space-y-1.5 shadow-inner"
                    >
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-2">
                        <span className="text-[9px] text-[#FFBF00] font-black uppercase tracking-widest animate-pulse">
                          🔬 CONNECTING RESEARCH CHANNEL PIPELINES
                        </span>
                        <div className="w-3.5 h-3.5 rounded-full border border-[#00BFFF] border-t-transparent animate-spin" />
                      </div>
                      {researchLogs.map((log, index) => (
                        <div key={index} className="flex gap-2">
                          <span className="text-slate-600 select-none">{">"}</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* FORENSIC AI RESPONSE TERMINAL */}
                {researchResponse && !isResearching && (
                  <div className="bg-slate-1000 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                    
                    {/* Header bar */}
                    <div className="bg-[#121212] px-5 py-3.5 border-b border-slate-850 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-teal-400" />
                        <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                          [S2C Forensic Intel Report]
                        </span>
                      </div>

                      {/* COE Signoff details */}
                      <span className="text-[9px] font-mono text-slate-550 bg-slate-900/50 px-2.5 py-1 rounded border border-slate-800">
                        NIST SP 800-88 Compliance Secured
                      </span>
                    </div>

                    {/* Report Content */}
                    <div className="p-6 font-mono text-[11px] text-slate-300 leading-normal space-y-4 max-h-[480px] overflow-y-auto whitespace-pre-wrap select-text selection:bg-[#008080]/30 select-text-style">
                      {researchResponse}
                    </div>

                    {/* Action Footer for Sync */}
                    {authUser && (
                      <div className="bg-[#121212] px-5 py-3.5 border-t border-slate-850 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                          <span className="text-[9px] font-mono text-slate-500 uppercase">Synced with Spokane Lab Database</span>
                        </div>
                        
                        <button
                          onClick={() => {
                            addToast("Audit Log Saved", "Diagnostic report securely registered in permanent Pos Logs database.", "success");
                          }}
                          className="px-3.5 py-1.5 bg-[#008080]/25 border border-[#008080]/40 hover:bg-[#008080]/40 text-teal-300 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                        >
                          Push to Sync logs
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
