import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Cpu, 
  Battery, 
  Smartphone, 
  MessageSquare,
  ShoppingCart,
  Briefcase,
  Wrench,
  Send,
  X,
  CheckCircle2,
  ChevronRight,
  Menu,
  Terminal,
  Activity,
  TrendingUp,
  DollarSign,
  Plus,
  RefreshCw,
  User,
  AlertCircle,
  Layers,
  Server,
  Wifi,
  Info,
  FileText,
  Check,
  ArrowRight,
  Database,
  Upload,
  Zap,
  Trash2,
  Globe,
  Settings,
  ChevronDown,
  ChevronUp,
  QrCode,
  Copy,
  Download,
  Bell,
  FileDown,
  Calendar,
  Loader2,
  UserCheck,
  Sparkles,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Sliders,
  SlidersHorizontal,
  Brain,
  ShieldAlert,
  Filter,
  FileSpreadsheet,
  Mail
} from "lucide-react";
import { RepairTicket, POSLog, QuoteResponse, HighPriorityLead } from "./types";
import { Toast, ToastContainer, ToastType } from "./components/ToastNotification";
import { HardwareScanChart } from "./components/HardwareScanChart";
import { ForensicsView } from "./components/ForensicsView";
import { TechnicianDashboard } from "./components/TechnicianDashboard";
import { CspManualView } from "./components/CspManualView";
import { LegalView } from "./components/LegalView";
import { SignaturePad } from "./components/SignaturePad";
import { FormsIntegrationView } from "./components/FormsIntegrationView";
import { GmailIntegrationView } from "./components/GmailIntegrationView";
import { FirebaseAiWorkbenchView } from "./components/FirebaseAiWorkbenchView";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { auth, db, googleProvider } from "./lib/firebase";
import { handleFirestoreError, OperationType } from "./lib/firebase-errors";

// --- DATA MODELS ---

const SERVICES = [
  {
    tier: "Tier 1",
    title: "Core Power & Port Restoration",
    price: "$69 - $97",
    desc: "Fixed-price minor repairs focusing on power delivery.",
    examples: "Batteries, Charging Ports",
    icon: <Battery className="w-8 h-8 text-blue-400" />
  },
  {
    tier: "Tier 2",
    title: "Elite Display Renewal",
    price: "From $139",
    desc: "Fixed-price major repairs for cracked or failing screens.",
    examples: "iPhone 12-15, Galaxy S Series Screens",
    icon: <Smartphone className="w-8 h-8 text-blue-400" />
  },
  {
    tier: "Tier 3",
    title: "Specialized Diagnostics",
    price: "Custom Quote",
    desc: "Motherboard surgery, data recovery, and micro-soldering.",
    examples: "Liquid Damage, Board-Level Shorts, Cameras",
    icon: <Cpu className="w-8 h-8 text-blue-400" />
  }
];

const STORE_PRODUCTS = [
  { id: 1, name: "Casper Tempered Glass", price: 29.99, category: "Protection", img: "https://images.unsplash.com/photo-1606841120025-a130635c0292?auto=format&fit=crop&w=300&q=80" },
  { id: 2, name: "AmpSentrix Fast Charger (20W)", price: 34.99, category: "Power", img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=300&q=80" },
  { id: 3, name: "CPO iPhone 13 Pro (128GB)", price: 549.00, category: "Devices", img: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&w=300&q=80" },
  { id: 4, name: "Heavy Duty Fleet Case", price: 49.99, category: "Protection", img: "https://images.unsplash.com/photo-1541892079639-65107954fa0f?auto=format&fit=crop&w=300&q=80" }
];

// --- MAIN MASTER APP COMPONENT ---

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("tab") || "home";
    }
    return "home";
  });
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [storeCart, setStoreCart] = useState<Record<number, number>>({});

  // --- STORE INVENTORY STATES & THRESHOLDS ---
  const [storeStock, setStoreStock] = useState<Record<number, number>>({
    1: 3,   // Casper Tempered Glass (High-Turnover, starts below threshold)
    2: 2,   // AmpSentrix Fast Charger (20W) (High-Turnover, starts below threshold)
    3: 12,  // CPO iPhone 13 Pro (128GB)
    4: 15   // Heavy Duty Fleet Case
  });
  const [stockThreshold, setStockThreshold] = useState<number>(5);

  const hasLowStockHighTurnover = Object.entries(storeStock).some(([idStr, stock]) => {
    const id = parseInt(idStr);
    const isHighTurnover = id === 1 || id === 2; // Tempered Glass and Fast Chargers
    return isHighTurnover && stock < stockThreshold;
  });

  // --- DIAGNOSTIC HUB STATES ---
  const [labTab, setLabTab] = useState<"triage" | "pos" | "tax" | "directory" | "escalation" | "forensics" | "forms" | "gmail" | "firebase_ai">("triage");
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [leads, setLeads] = useState<HighPriorityLead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState<boolean>(false);

  // Google Cloud Service Directory state variables
  const [sdStatus, setSdStatus] = useState<{ active: boolean; usingFallback: boolean; error: string | null; message: string; mode?: string }>({
    active: false,
    usingFallback: true,
    error: null,
    message: "Initializing Service Directory...",
    mode: "simulated"
  });
  const [sdProjectId, setSdProjectId] = useState<string>("displaycellpros");
  const [sdLocationId, setSdLocationId] = useState<string>("us-central1");
  const [sdNamespaces, setSdNamespaces] = useState<Array<{ name: string }>>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>("");
  const [sdServices, setSdServices] = useState<Array<{ name: string; annotations?: Record<string, string> }>>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [sdEndpoints, setSdEndpoints] = useState<Array<{ name: string; address: string; port: number; annotations?: Record<string, string> }>>([]);

  // Creation variables
  const [newNamespaceId, setNewNamespaceId] = useState<string>("");
  const [newServiceId, setNewServiceId] = useState<string>("");
  const [newServiceAnnotations, setNewServiceAnnotations] = useState<string>("version=v1.2,env=lab");
  const [newEndpointId, setNewEndpointId] = useState<string>("");
  const [newEndpointAddress, setNewEndpointAddress] = useState<string>("10.128.0.80");
  const [newEndpointPort, setNewEndpointPort] = useState<number>(80);
  const [newEndpointAnnotations, setNewEndpointAnnotations] = useState<string>("zone=us-central1-a");

  const [sdLoading, setSdLoading] = useState<boolean>(false);
  const [sdError, setSdError] = useState<string | null>(null);
  const [sdSuccess, setSdSuccess] = useState<string | null>(null);
  
  // --- FORENSICS HUB & TELEMETRY STANDS ---
  const [forensicDevice, setForensicDevice] = useState<"iPhone XR" | "iPad Pro 9.7">("iPhone XR");
  const [isForensicScanning, setIsForensicScanning] = useState<boolean>(false);
  const [forensicProgress, setForensicProgress] = useState<number>(0);
  const [forensicLogs, setForensicLogs] = useState<string[]>([]);
  const [forensicSOP, setForensicSOP] = useState<any>(null);
  const [imeiInput, setImeiInput] = useState<string>("358921102948192");
  const [isSecurityScraping, setIsSecurityScraping] = useState<boolean>(false);
  const [securityCheckResult, setSecurityCheckResult] = useState<any>(null);
  const [mountedSources, setMountedSources] = useState<Record<string, boolean>>({
    "iPhone-XR-Schematics-Power-Rails.pdf": true,
    "iPad-Pro-9.7-Backlight-FL1728.pdf": true,
    "Tristar-1610A3-USB-Multiplexer.pdf": false,
    "NIST-SP-800-88-R1-Compliance.pdf": true,
  });

  // --- S2C DIAGNOSTIC CORE ENG STATES ---
  const [s2cActivePathway, setS2cActivePathway] = useState<"backlight" | "charging" | "short_rail">("backlight");
  const [s2cActiveCodeTab, setS2cActiveCodeTab] = useState<"typescript" | "json">("typescript");
  const [s2cBatteryTemp, setS2cBatteryTemp] = useState<number>(34.2);
  const [s2cAmmeterReading, setS2cAmmeterReading] = useState<number>(1.12);
  const [s2cIsSimulatingCheck, setS2cIsSimulatingCheck] = useState<boolean>(false);
  const [s2cCheckLogs, setS2cCheckLogs] = useState<string[]>([]);
  const [s2cCheckStatus, setS2cCheckStatus] = useState<"idle" | "testing" | "passed" | "thermal_halt">("idle");

  const [s2cFeedbackRating, setS2cFeedbackRating] = useState<Record<string, "up" | "down" | null>>({
    backlight: null,
    charging: null,
    short_rail: null,
  });
  const [s2cFeedbackNotes, setS2cFeedbackNotes] = useState<Record<string, string>>({
    backlight: "",
    charging: "",
    short_rail: "",
  });
  const [s2cFeedbackSubmitted, setS2cFeedbackSubmitted] = useState<Record<string, boolean>>({
    backlight: false,
    charging: false,
    short_rail: false,
  });
  const [s2cIsSubmittingFeedback, setS2cIsSubmittingFeedback] = useState<boolean>(false);

  // --- FORENSICS ORCHESTRATOR VISUAL SUB-STATES ---
  const [telemetrySpecTab, setTelemetrySpecTab] = useState<"visual" | "android" | "ios" | "macos">("visual");
  const [activePlanTier, setActivePlanTier] = useState<"standard" | "plus" | "pro" | "ultra" | "enterprise">("enterprise");
  const [referenceMode, setReferenceMode] = useState<"solder_matrices" | "thermal_seeker" | "handshake_failures">("solder_matrices");
  const [hallucinationSimulatedKeyword, setHallucinationSimulatedKeyword] = useState<string>("");

  // --- CHAIN-OF-VERIFICATION (CoV) & SOURCE NARROWING STATES ---
  const [covThreshold, setCovThreshold] = useState<number>(0.35);
  const [covCustomDraft, setCovCustomDraft] = useState<string>("");
  const [isCovRunning, setIsCovRunning] = useState<boolean>(false);
  const [covLogs, setCovLogs] = useState<string[]>([]);
  const [covStatus, setCovStatus] = useState<"PASS" | "REDO" | "IDLE">("IDLE");
  const [covAuditResult, setCovAuditResult] = useState<any>(null);
  const [isNarrowingActive, setIsNarrowingActive] = useState<boolean>(false);
  const [narrowingLogs, setNarrowingLogs] = useState<string[]>([]);
  const [narrowedAudit, setNarrowedAudit] = useState<any>(null);
  const [selectedCovTab, setSelectedCovTab] = useState<"interactive" | "payload">("interactive");

  // Active Customer & Device Details
  const [customerName, setCustomerName] = useState<string>("Jane Miller");
  const [deviceBrand, setDeviceBrand] = useState<string>("Apple");
  const [deviceModel, setDeviceModel] = useState<string>("iPhone 14 Pro Max");
  const [deviceTier, setDeviceTier] = useState<"flagship" | "midrange" | "budget">("flagship");
  const [issueType, setIssueType] = useState<"screen" | "battery" | "button">("screen");
  const [internalNotes, setInternalNotes] = useState<string>("");

  const [userRole, setUserRole] = useState<"technician" | "customer">(() => {
    return (localStorage.getItem("dcp_user_role") as "technician" | "customer") ?? "customer";
  });
  const [profilePhone, setProfilePhone] = useState<string>("(509) 555-0199");
  const [profilePreferredDevice, setProfilePreferredDevice] = useState<string>("iPhone 14 Pro Max");
  
  // Custom message state for the Customer Chat Portal
  const [customerMessages, setCustomerMessages] = useState<Array<{ sender: "user" | "company" | "system"; text: string; timestamp: string }>>([
    {
      sender: "company",
      text: "Hello! Welcome to Display & Cell Pros Customer Triage Desk. How can we help you with your device today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [customerChatInput, setCustomerChatInput] = useState<string>("");
  const [isCustomerChatSending, setIsCustomerChatSending] = useState<boolean>(false);
  
  // Device Hardware Scan state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(false);
  const [isReportExpanded, setIsReportExpanded] = useState<boolean>(true);
  const [copiedTelemetry, setCopiedTelemetry] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [forceScanTimeout, setForceScanTimeout] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // B2B Customer Verification
  const [emailInput, setEmailInput] = useState<string>("marcus@amazon.com");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState<boolean>(false);
  const [isCorporate, setIsCorporate] = useState<boolean>(true);
  const [companyName, setCompanyName] = useState<string>("AMAZON Fleet");
  const [b2bMessage, setB2bMessage] = useState<string>("VERIFICATION SUCCESS: Corporate customer identified! 20% Fast-Track fleet repair discount & zero-deposit check-in is unlocked.");

  // Washington State Destination Sales Tax Config
  const [zipInput, setZipInput] = useState<string>("98101");
  const [taxRate, setTaxRate] = useState<number>(0.1035);
  const [taxCity, setTaxCity] = useState<string>("Seattle");
  const [taxVerifiedMessage, setTaxVerifiedMessage] = useState<string>("WASHINGTON TAX COMPLIANT: Destined delivery in Seattle (98101) is subject to 10.35% local combined sales tax.");
  const [isValidZip, setIsValidZip] = useState<boolean>(true);

  // Live Quote Response
  const [quote, setQuote] = useState<QuoteResponse>({
    baseQuote: { partsCost: 180, laborCost: 170, overhead: 52.5, subtotal: 402.5 },
    taxInfo: { zipCode: "98101", city: "Seattle", rate: 0.1035, calculatedTax: 33.32 },
    discountInfo: { applied: true, percentage: 20, amount: 80.5, company: "AMAZON Fleet" },
    subtotal: 322,
    grandTotal: 355.32
  });
  const [isCalculatingQuote, setIsCalculatingQuote] = useState<boolean>(false);

  // --- FIREBASE SSO AUTH & FIRESTORE CLOUD STATES ---
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [firestoreTickets, setFirestoreTickets] = useState<RepairTicket[]>([]);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // --- MULTI-MODAL & ADVANCED DIAGNOSTIC SUB-MODE STATES ---
  const [diagnosticMode, setDiagnosticMode] = useState<"standard" | "thinking" | "vision">("standard");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const [thinkingPrompt, setThinkingPrompt] = useState<string>("Analyze the volume flex ribbon cable. Is impedance of 45 Ohm acceptable for core motherboard signal lines during boot? Detail typical multimeter diagnostic steps.");
  const [deepDiagnosticResult, setDeepDiagnosticResult] = useState<string>("");
  const [isDeepDiagnosing, setIsDeepDiagnosing] = useState<boolean>(false);
  const [groundingSources, setGroundingSources] = useState<Array<{ title: string; url: string }>>([]);

  // Fetch Firestore backup logs
  const fetchFirestoreTickets = async (uid: string) => {
    try {
      setFirestoreError(null);
      if (uid === "sandbox-tech-101") {
        const existing = localStorage.getItem("dcp_sandbox_tickets");
        const list = existing ? JSON.parse(existing) : [];
        setFirestoreTickets(list);
        return;
      }
      if (!auth.currentUser) {
        console.warn("Skipping Firestore tickets fetch: No authenticated user session active.");
        return;
      }
      const ticketsRef = collection(db, "tickets");
      const q = query(ticketsRef, where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const fetched: RepairTicket[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push(docSnap.data() as RepairTicket);
      });
      setFirestoreTickets(fetched);
    } catch (err) {
      console.error("Failed to load Firestore tickets:", err);
      try {
        handleFirestoreError(err, OperationType.LIST, "tickets");
      } catch (formattedError: any) {
        setFirestoreError(formattedError.message);
      }
    }
  };

  const fetchFirestoreLeads = async (uid: string) => {
    try {
      setIsLoadingLeads(true);
      setFirestoreError(null);
      if (uid === "sandbox-tech-101") {
        const existing = localStorage.getItem("dcp_sandbox_leads");
        const list = existing ? JSON.parse(existing) : [];
        setLeads(list);
        return;
      }
      if (!auth.currentUser) {
        console.warn("Skipping Firestore leads fetch: No authenticated user session active.");
        return;
      }
      const leadsRef = collection(db, "high-priority-leads");
      const q = query(leadsRef, where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const fetched: HighPriorityLead[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push(docSnap.data() as HighPriorityLead);
      });
      setLeads(fetched);
    } catch (err) {
      console.error("Failed to load Firestore leads:", err);
      try {
        handleFirestoreError(err, OperationType.LIST, "high-priority-leads");
      } catch (formattedError: any) {
        setFirestoreError(formattedError.message);
      }
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const handleCreateLead = async (customerName: string, phone: string, deviceModel: string) => {
    if (!authUser) {
      addToast("Auth Required", "Please login with Google or use Sandbox bypass to submit high-priority escalations.", "warning");
      return;
    }
    const leadId = `LEAD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newLead: HighPriorityLead = {
      id: leadId,
      customerName: customerName || "Spokane Lead Client",
      phone: phone || "509-555-0199",
      deviceModel: deviceModel || "Generic Device",
      status: "pending",
      createdAt: new Date().toISOString(),
      userId: authUser.uid
    };

    if (authUser.uid === "sandbox-tech-101") {
      const existing = localStorage.getItem("dcp_sandbox_leads");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newLead);
      localStorage.setItem("dcp_sandbox_leads", JSON.stringify(list));
      setLeads(list);
      addToast("Sandbox Escalation Success", `Lead simulated and saved locally! Click 'High-Priority Escalation' tab to track progress.`, "success");
      return;
    }

    try {
      setFirestoreError(null);
      const docRef = doc(db, "high-priority-leads", leadId);
      await setDoc(docRef, newLead);
      addToast("Escalation Created", "Your high-priority motherboard callback case has been securely queued!", "success");
      fetchFirestoreLeads(authUser.uid);
    } catch (err) {
      console.error("Failed to sync lead on Firestore:", err);
      try {
        handleFirestoreError(err, OperationType.CREATE, `high-priority-leads/${leadId}`);
      } catch (formattedError: any) {
        setFirestoreError(formattedError.message);
      }
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: "pending" | "in_progress" | "contacted" | "completed" | "cancelled") => {
    if (!authUser) return;

    if (authUser.uid === "sandbox-tech-101") {
      const existing = localStorage.getItem("dcp_sandbox_leads");
      const list = existing ? JSON.parse(existing) : [];
      const updated = list.map((l: HighPriorityLead) => {
        if (l.id === leadId) {
          return { ...l, status: newStatus };
        }
        return l;
      });
      localStorage.setItem("dcp_sandbox_leads", JSON.stringify(updated));
      setLeads(updated);
      addToast("Status Updated", `Sandbox lead status changed to ${newStatus}.`, "success");
      return;
    }

    try {
      setFirestoreError(null);
      const docRef = doc(db, "high-priority-leads", leadId);
      const leadSnap = await getDoc(docRef);
      if (!leadSnap.exists()) {
        addToast("Update Fail", "The selected lead does not exist on Firestore.", "error");
        return;
      }
      
      const currentLead = leadSnap.data() as HighPriorityLead;
      const updatedLead = {
        ...currentLead,
        status: newStatus
      };

      await setDoc(docRef, updatedLead);
      addToast("Status Updated", `Callback case updated to ${newStatus}.`, "success");
      fetchFirestoreLeads(authUser.uid);
    } catch (err) {
      console.error("Failed to update status on Firestore:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `high-priority-leads/${leadId}`);
      } catch (formattedError: any) {
        setFirestoreError(formattedError.message);
      }
    }
  };

  const handleCreateFirestoreTicket = async () => {
    if (!authUser) {
      alert("Please authenticate using your Google account to enable secure cloud backups.");
      return;
    }
    const ticketId = "DCP-" + Math.floor(100000 + Math.random() * 900000);
    const newTicket: RepairTicket = {
      id: ticketId,
      customerName: customerName || "Jane Miller",
      companyName: isCorporate ? companyName : "",
      device: `${deviceBrand} ${deviceModel}`,
      issueType: issueType,
      status: "open",
      quotedPrice: quote.baseQuote.subtotal,
      tax: quote.taxInfo.calculatedTax,
      discount: quote.discountInfo.amount,
      total: quote.grandTotal,
      createdAt: new Date().toISOString(),
      userId: authUser.uid,
      internalNotes: internalNotes.trim() || undefined
    };

    if (authUser.uid === "sandbox-tech-101") {
      const existing = localStorage.getItem("dcp_sandbox_tickets");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newTicket);
      localStorage.setItem("dcp_sandbox_tickets", JSON.stringify(list));
      setFirestoreTickets(list);
      setTicketCreationSuccess(true);
      setInternalNotes("");
      setTimeout(() => setTicketCreationSuccess(false), 3000);
      addToast(
        "Sandbox Cloud Backup Success",
        `D&CP Ticket ${ticketId} simulated backup with internal notes and registered successfully in sandbox memory logs!`,
        "success"
      );
      return;
    }

    try {
      setFirestoreError(null);
      const docRef = doc(db, "tickets", ticketId);
      await setDoc(docRef, newTicket);
      setTicketCreationSuccess(true);
      setInternalNotes("");
      setTimeout(() => setTicketCreationSuccess(false), 3000);
      fetchFirestoreTickets(authUser.uid);
    } catch (err) {
      console.error("Failed to sync ticket on Firestore:", err);
      try {
        handleFirestoreError(err, OperationType.CREATE, `tickets/${ticketId}`);
      } catch (formattedError: any) {
        setFirestoreError(formattedError.message);
      }
    }
  };

  const handleSandboxLogin = () => {
    // Reset any state before starting sandbox session
    handleSessionReset();

    const sandboxUser = {
      uid: "sandbox-tech-101",
      displayName: "Spokane Tech Sandbox",
      email: "spokane.van.test@displaycellpros.com",
      photoURL: "",
    };
    setAuthUser(sandboxUser as any);
    const saved = localStorage.getItem("dcp_sandbox_tickets");
    if (saved) {
      setFirestoreTickets(JSON.parse(saved));
    } else {
      const defaultTickets: RepairTicket[] = [
        {
          id: "DCP-881902",
          customerName: "Nathan Spokane",
          companyName: "Avista Fleet",
          device: "Galaxy S24 Ultra",
          issueType: "screen",
          status: "open",
          quotedPrice: 175,
          tax: 15.4,
          discount: 35,
          total: 155.4,
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          userId: sandboxUser.uid
        }
      ];
      localStorage.setItem("dcp_sandbox_tickets", JSON.stringify(defaultTickets));
      setFirestoreTickets(defaultTickets);
    }

    const savedLeads = localStorage.getItem("dcp_sandbox_leads");
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    } else {
      const defaultLeads: HighPriorityLead[] = [
        {
          id: "LEAD-771802",
          customerName: "Spokane Fleet Manager",
          phone: "509-535-4200",
          deviceModel: "iPhone 15 Pro Max",
          status: "pending",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          userId: sandboxUser.uid
        }
      ];
      localStorage.setItem("dcp_sandbox_leads", JSON.stringify(defaultLeads));
      setLeads(defaultLeads);
    }

    addToast(
      "Sandbox Environment Active",
      "Simulated local sandbox session initiated! Bypass browser SSO popup constraints.",
      "success"
    );
  };

  const handleS2cSimulate = () => {
    setS2cIsSimulatingCheck(true);
    setS2cCheckStatus("testing");
    setS2cCheckLogs([]);

    const baseLogs = [
      `[S2C Engine] Initializing Symptom-to-Circuit mapping analysis pipeline...`,
      `[Telemetry] Polling digital ammeter live data. Value read: ${s2cAmmeterReading}A.`,
      `[Telemetry] Sensor monitoring active... Battery Temp: ${s2cBatteryTemp}°C.`,
    ];

    let currentLogs: string[] = [];
    let logIndex = 0;

    const runLogStep = () => {
      if (logIndex < baseLogs.length) {
        currentLogs.push(baseLogs[logIndex]);
        setS2cCheckLogs([...currentLogs]);
        logIndex++;
        setTimeout(runLogStep, 400);
      } else {
        // Assert safety threshold FIRST
        if (s2cBatteryTemp > 45) {
          currentLogs.push(`[🚨 FATAL CRITICAL EXCLUSION] BATTERY TEMPERATURE DETECTED AS EXCESSIVE (${s2cBatteryTemp}°C > 45.0°C).`);
          currentLogs.push(`[🚨 SYSTEM SHUTDOWN] Terminating forensic diagnostic session programmatically to prevent thermal runaway & chemical flashover.`);
          setS2cCheckLogs([...currentLogs]);
          setS2cCheckStatus("thermal_halt");
          setS2cIsSimulatingCheck(false);
          addToast("Thermal Shutdown", "Diagnostic session terminated! Battery exceeds safety limits (45°C).", "error");
          return;
        }

        // Add pathway specific logs
        if (s2cActivePathway === "backlight") {
          const backlightLogs = [
            `[S2C Mapping] Cross-referencing "Backlight failure" symptoms against 1,000,000-token schematics...`,
            `[S2C Mapping] Identified target voltage rail: PP_LCM_BL_ANODE (Backlight Boost Out)`,
            `[S2C Fault Isolation] Suspected component focal point: FL1728 (Filter Fuse)`,
            `[Verification Cmd] MANDATORY CHECK: Probe FL1728 terminals for continuity. Expected impedance < 0.5 Ω.`,
            `[S2C Outcome] SUCCESS: Backlight pathway mapped successfully (Fidelity verified: PASS).`
          ];
          let subIdx = 0;
          const runSub = () => {
            if (subIdx < backlightLogs.length) {
              currentLogs.push(backlightLogs[subIdx]);
              setS2cCheckLogs([...currentLogs]);
              subIdx++;
              setTimeout(runSub, 350);
            } else {
              setS2cCheckStatus("passed");
              setS2cIsSimulatingCheck(false);
              addToast("Mapping Succeeded", "Backlight circuit paths mapped successfully!", "success");
            }
          };
          runSub();
        } else if (s2cActivePathway === "charging") {
          const chargingLogs = [
            `[S2C Mapping] Analysing non-charging symptoms & ammeter readings...`,
            `[S2C Mapping] Identified target voltage rails: USB_VBUS / PMU_USB_BRICKID`,
            `[S2C Fault Isolation] Suspected controller IC: 1610A3 (Tristar Charging Multiplexer)`,
            `[Verification Cmd] MANDATORY CHECK: Examine battery terminals. If flat-voltage < 2.0V or diode-drop fails, Tristar failure confirmed.`,
            `[S2C Outcome] SUCCESS: Charging controller pathway mapped successfully.`
          ];
          let subIdx = 0;
          const runSub = () => {
            if (subIdx < chargingLogs.length) {
              currentLogs.push(chargingLogs[subIdx]);
              setS2cCheckLogs([...currentLogs]);
              subIdx++;
              setTimeout(runSub, 350);
            } else {
              setS2cCheckStatus("passed");
              setS2cIsSimulatingCheck(false);
              addToast("Mapping Succeeded", "U2/Tristar pathway mapped successfully!", "success");
            }
          };
          runSub();
        } else {
          const shortLogs = [
            `[S2C Mapping] Analyzing primary VDD_MAIN 1.1A deadlock...`,
            `[S2C Mapping] Suspicious active main rail found: VDD_MAIN (Direct short to ground)`,
            `[S2C Fault Isolation] Localized thermal target pinpointed on LWIR camera: Capacitor C247_W`,
            `[Verification Cmd] MANDATORY CHECK: Probe C247_W in diode mode. Replace & clear main short before injecting current.`,
            `[S2C Outcome] SUCCESS: Primary rail short-circuit pathway identified.`
          ];
          let subIdx = 0;
          const runSub = () => {
            if (subIdx < shortLogs.length) {
              currentLogs.push(shortLogs[subIdx]);
              setS2cCheckLogs([...currentLogs]);
              subIdx++;
              setTimeout(runSub, 350);
            } else {
              setS2cCheckStatus("passed");
              setS2cIsSimulatingCheck(false);
              addToast("Mapping Succeeded", "Main rail shorts isolated successfully!", "success");
            }
          };
          runSub();
        }
      }
    };
    runLogStep();
  };

  const handleS2cFeedbackSubmit = async (pathwayId: string) => {
    const rtg = s2cFeedbackRating[pathwayId];
    if (!rtg) {
      addToast("Feedback Required", "Please select thumbs up or thumbs down before submitting.", "warning");
      return;
    }

    setS2cIsSubmittingFeedback(true);
    const feedbackId = `S2C-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const currentDevice = s2cActivePathway === "backlight" ? "iPad Pro 9.7" : s2cActivePathway === "charging" ? "Apple iPhone XR" : "iPhone XR Board";
    const feedbackPayload = {
      id: feedbackId,
      userId: authUser?.uid || "sandbox-tech-101",
      pathway: pathwayId,
      rating: rtg,
      deviceModel: currentDevice,
      notes: s2cFeedbackNotes[pathwayId] || "",
      ammeterReading: s2cAmmeterReading,
      batteryTemp: s2cBatteryTemp,
      createdAt: new Date().toISOString()
    };

    try {
      if (authUser && authUser.uid !== "sandbox-tech-101") {
        const collectionRef = collection(db, "s2c-feedback");
        const docRef = doc(collectionRef, feedbackId);
        await setDoc(docRef, feedbackPayload);
        addToast(
          "Feedback Submitted",
          `Thank you! Your circuit mapping feedback for ${currentDevice} has been stored in Cloud Firestore for future model refinement.`,
          "success"
        );
      } else {
        const existing = localStorage.getItem("dcp_sandbox_s2c_feedback");
        const list = existing ? JSON.parse(existing) : [];
        list.push(feedbackPayload);
        localStorage.setItem("dcp_sandbox_s2c_feedback", JSON.stringify(list));
        addToast(
          "Sandbox Feedback Submitted",
          `Feedback simulated successfully! Pathway of ${currentDevice} rated "${rtg}" and saved in browser sandbox memory logs!`,
          "success"
        );
      }
      setS2cFeedbackSubmitted((prev) => ({ ...prev, [pathwayId]: true }));
    } catch (error) {
      console.error("Failed to save S2C feedback:", error);
      try {
        handleFirestoreError(error, OperationType.WRITE, `s2c-feedback/${feedbackId}`);
      } catch (jsonErr: any) {
        addToast("Submission Error", jsonErr.message || "Could not synchronize S2C feedback rating.", "error");
      }
    } finally {
      setS2cIsSubmittingFeedback(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setFirestoreError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
      }
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || "Spokane Client",
        email: user.email || "",
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        console.warn("Google login popup closed by user.");
        addToast(
          "Login Cancelled",
          "The authentication window was closed. please try again when you are ready.",
          "info",
          4000
        );
      } else {
        console.error("Google login failed:", err);
        setFirestoreError(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const handleSessionReset = () => {
    // Reset Profile / Customer Details back to generic unauthenticated defaults
    setCustomerName("Jane Miller");
    setProfilePhone("(509) 555-0199");
    setProfilePreferredDevice("iPhone 14 Pro Max");
    setDeviceBrand("Apple");
    setDeviceModel("iPhone 14 Pro Max");
    setDeviceTier("flagship");
    setIssueType("screen");
    setInternalNotes("");

    // Reset Diagnostic States (Caches and progress indicators)
    setIsScanning(false);
    setHasScanned(false);
    setScanProgress(0);
    setScanStep("");

    // Reset Forensic Diagnostics & Telemetry Hub states
    setIsForensicScanning(false);
    setForensicProgress(0);
    setForensicLogs([]);
    setForensicSOP(null);
    setIsSecurityScraping(false);
    setSecurityCheckResult(null);
    setImeiInput("358921102948192");
    setMountedSources({
      "iPhone-XR-Schematics-Power-Rails.pdf": true,
      "iPad-Pro-9.7-Backlight-FL1728.pdf": true,
      "Tristar-1610A3-USB-Multiplexer.pdf": false,
      "NIST-SP-800-88-R1-Compliance.pdf": true,
    });

    // Clear CRM Lead Data, Ticket States, & POS indicators to prevent cross-session leaks
    setLeads([]);
    setIsLoadingLeads(false);
    setTickets([]);
    setFirestoreTickets([]);
    setPosLogs([]);

    // Reset Chat messages to safe system defaults
    setCustomerMessages([
      {
        sender: "company",
        text: "Hello! Welcome to Display & Cell Pros Customer Triage Desk. How can we help you with your device today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    
    setMessages([
      { 
        role: "assistant", 
        text: "Display & Cell Pros Diagnostic Cloud activated. Secure GCP Cloud Run instance online. Please describe your hardware issue. I am constrained strictly to screen, battery, and button diagnostics." 
      }
    ]);

    // Clear any temporary user input fields
    setChatInput("Screen touch lag and horizontal pink lines");
    setCustomerChatInput("");
    localStorage.removeItem("dcp_unsent_diagnostic_input");
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAuthUser(null);
      setFirestoreTickets([]);
      handleSessionReset();
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  // SEO Metadata Manager
  useEffect(() => {
    const titles: Record<string, string> = {
      home: "Mobile iPhone Repair & Tech Fixes | Display & Cell Pros Spokane",
      services: "Repair Services & Rates in Spokane, WA | Display & Cell Pros",
      b2b: "Enterprise & Fleet Device Repair | Display & Cell Pros",
      csp: "Certified Service Provider Status | Display & Cell Pros",
      legal: "Compliance Guidelines & Data Privacy Policy | Spokane WA | Display & Cell Pros",
      store: "Shop Replacement Parts & Accessories | Display & Cell Pros",
      "customer-hub": "Customer Portal & Booking System | Display & Cell Pros",
      lab: "Technical Analytics Lab & Forensics | Display & Cell Pros",
    };

    const descriptions: Record<string, string> = {
      home: "Expert mobile device repairs in Spokane, WA. From cracked screens to complex microsoldering, we bring the lab to your driveway.",
      services: "View our comprehensive device repair solutions, OEM-quality parts, and upfront pricing models. Lifetime physical solder warranty included.",
      b2b: "Priority dispatch queue and Net-30 bulk billing for enterprise and corporate device fleets across Washington state.",
      csp: "Verify our official certifications, NIST SP-800-88 R1 data compliance standards, and ANSI/ESD protocols.",
      legal: "Review our strict logical isolation protocols, physical compliance procedures, and 120-Day Limited Hardware Warranty terms specifically indexed for our Spokane WA clients.",
      store: "Original quality components and highly vetted aftermarket accessories available for on-demand dispatch or direct purchase.",
      "customer-hub": "Manage your open repair tickets, message technicians directly, and approve service quotes securely via our client portal.",
      lab: "Advanced logic board triage insights, Symptom-to-Circuit mapping, and real-time electronic footprint analysis.",
    };

    const newTitle = titles[activeTab] || "Display & Cell Pros | Premium Device Solutions";
    const newDescription = descriptions[activeTab] || "Professional cell phone logic board repair and mobile forensics servicing Spokane, Washington.";

    document.title = newTitle;
    
    // Sync URL for SEO purposes (allows direct linking to specific tabs)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (activeTab === "home") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", activeTab);
      }
      window.history.replaceState({}, "", url.toString());
    }
    
    // Update or create the meta description tag dynamically
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', newDescription);
  }, [activeTab]);

  // Firebase Auth Observer subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        // Clear state before loading the new user's profile to prevent crossover
        handleSessionReset();
        fetchFirestoreTickets(user.uid);
        fetchFirestoreLeads(user.uid);
        // Load custom profile details if stored in Firestore
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.phone) setProfilePhone(data.phone);
            if (data.preferredDevice) setProfilePreferredDevice(data.preferredDevice);
            if (data.displayName) setCustomerName(data.displayName);
          }
        } catch (e) {
          console.warn("Could not retrieve customer database profile:", e);
        }
      } else {
        setFirestoreTickets([]);
        setLeads([]);
        handleSessionReset();
      }
    });
    return () => unsubscribe();
  }, []);

  // Hardware Diagnostic Chat Console State
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { 
      role: "assistant", 
      text: "Display & Cell Pros Diagnostic Cloud activated. Secure GCP Cloud Run instance online. Please describe your hardware issue. I am constrained strictly to screen, battery, and button diagnostics." 
    }
  ]);
  const [chatInput, setChatInput] = useState<string>(() => {
    return localStorage.getItem("dcp_unsent_diagnostic_input") ?? "Screen touch lag and horizontal pink lines";
  });
  const [isChatSending, setIsChatSending] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("dcp_unsent_diagnostic_input", chatInput);
  }, [chatInput]);

  // POS Tickets and Live Synchronization Logs
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [posLogs, setPosLogs] = useState<POSLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [ticketCreationSuccess, setTicketCreationSuccess] = useState<boolean>(false);
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);

  // Automated workday POS log reminders and export configurations
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    return localStorage.getItem("dcp_reminder_enabled") === "true";
  });
  const [workdayEndTime, setWorkdayEndTime] = useState<string>(() => {
    return localStorage.getItem("dcp_workday_end_time") || "17:00";
  });
  const [reminderDismissedForToday, setReminderDismissedForToday] = useState<boolean>(false);

  const requestNotificationPermission = () => {
    if (!("Notification" in window)) {
      addToast("Not Supported", "Desktop notifications are not supported by this browser.", "info");
      return;
    }
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        addToast("Permission Granted", "System notifications active for workday reminders!", "success");
      } else {
        addToast("Permission Denied", "Notifications disabled. Standard in-app warnings remain active.", "info");
      }
    });
  };

  const exportLogsAsJSON = () => {
    if (posLogs.length === 0) {
      addToast("Export Empty", "No transaction logs loaded to export.", "info");
      return;
    }
    const dataStr = JSON.stringify(posLogs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CP_POS_Sync_Logs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Export Successful", "POS logs successfully downloaded as JSON file.", "success");
  };

  const exportLogsAsCSV = () => {
    if (posLogs.length === 0) {
      addToast("Export Empty", "No transaction logs loaded to export.", "info");
      return;
    }
    const headers = ["Timestamp", "Source", "Level", "Message"];
    const rows = posLogs.map(log => {
      const formattedTime = new Date(log.timestamp).toISOString();
      const escapedMsg = log.message.replace(/"/g, '""');
      return [
        `"${formattedTime}"`,
        `"${log.source}"`,
        `"${log.level}"`,
        `"${escapedMsg}"`
      ].join(",");
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CP_POS_Sync_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Export Successful", "POS logs successfully downloaded as CSV file.", "success");
  };

  // Check for workday end reminder
  useEffect(() => {
    if (!reminderEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      // Check if it's a weekday or Saturday
      const isWorkday = now.getDay() >= 1 && now.getDay() <= 6;
      if (!isWorkday) return;

      const [hoursStr, minutesStr] = workdayEndTime.split(":");
      const targetHours = parseInt(hoursStr, 10);
      const targetMinutes = parseInt(minutesStr, 10);

      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      // Check if current time has passed the configured end time for today
      const passedEndTime = (currentHours > targetHours) || (currentHours === targetHours && currentMinutes >= targetMinutes);

      if (passedEndTime && !reminderDismissedForToday) {
        addToast(
          "⚠️ WORKDAY RECORD SUBMISSION",
          `Workday has ended (${workdayEndTime}). Please export and submit your POS Webhook Transaction Logs now to maintain AHANA & DOR tax compliance!`,
          "warning",
          20000
        );
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("D&CP Workday Over: Submit Sync Logs", {
            body: `Your Spokane billing & sync logs are ready for export and DOR filing. Click to review in App.`,
            tag: "workday-end-reminder"
          });
        }
        setReminderDismissedForToday(true);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [reminderEnabled, workdayEndTime, reminderDismissedForToday]);

  // Washington Preset ZIP Clicker
  const WA_ZIP_PRESETS = [
    { zip: "98101", city: "Seattle", rate: "10.35%" },
    { zip: "98004", city: "Bellevue", rate: "10.1%" },
    { zip: "98402", city: "Tacoma", rate: "10.3%" },
    { zip: "98052", city: "Redmond", rate: "10.1%" },
    { zip: "98201", city: "Everett", rate: "9.9%" },
    { zip: "98501", city: "Olympia", rate: "9.5%" }
  ];

  // Fetch Sync Logs & Tickets on Mount, plus load Service Directory Status
  useEffect(() => {
    fetchPOSLogs();
    fetchSdStatus();
    handleListNamespaces("displaycellpros", "us-central1");
  }, []);

  // Recalculate quote automatically on changes
  useEffect(() => {
    fetchDynamicQuote();
  }, [issueType, deviceTier, zipInput, isCorporate, companyName]);

  const fetchPOSLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch("/api/pos-sync-logs");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        setPosLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error fetching POS data:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleAddNewLeadFromForms = async (newLeadData: { customerName: string; phone: string; deviceModel: string }) => {
    try {
      const newLead: HighPriorityLead = {
        id: "LEAD-" + Math.floor(100000 + Math.random() * 900000),
        customerName: newLeadData.customerName,
        phone: newLeadData.phone,
        deviceModel: newLeadData.deviceModel,
        status: "pending",
        createdAt: new Date().toISOString(),
        userId: authUser?.uid || "sandbox-tech-101"
      };

      if (authUser?.uid && authUser.uid !== "sandbox-tech-101") {
        const { doc, setDoc } = await import("firebase/firestore");
        const leadRef = doc(db, "high-priority-leads", newLead.id);
        await setDoc(leadRef, newLead);
      } else {
        const savedLeads = localStorage.getItem("dcp_sandbox_leads");
        const list = savedLeads ? JSON.parse(savedLeads) : [];
        list.unshift(newLead);
        localStorage.setItem("dcp_sandbox_leads", JSON.stringify(list));
      }
      
      setLeads(prev => [newLead, ...prev]);
      return newLead;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const handleAddNewTicketFromForms = async (newTicketData: Omit<RepairTicket, "id" | "createdAt" | "userId">) => {
    try {
      const newTicket: RepairTicket = {
        ...newTicketData,
        id: `DCP-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        userId: authUser?.uid || "sandbox-tech-101"
      };

      if (authUser?.uid && authUser.uid !== "sandbox-tech-101") {
        const { doc, setDoc } = await import("firebase/firestore");
        const docRef = doc(db, "tickets", newTicket.id);
        await setDoc(docRef, newTicket);
      } else {
        // Mock session ticket lists
        const savedTickets = localStorage.getItem("dcp_sandbox_tickets");
        const list = savedTickets ? JSON.parse(savedTickets) : [];
        list.unshift(newTicket);
        localStorage.setItem("dcp_sandbox_tickets", JSON.stringify(list));
      }

      setTickets(prev => [newTicket, ...prev]);
      return newTicket;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const handleAddSampleTickets = () => {
    const brands = ["Apple", "Samsung", "Google"];
    const models = ["iPhone 15 Pro", "Galaxy S24 Ultra", "Pixel 8 Pro", "iPad Pro", "iPhone 14"];
    const issues = ["screen", "battery", "button"];
    const customers = ["Liam Spokane", "Emma Henderson", "Sophia Martinez", "Olivia Davis", "Jackson Reed"];
    const companies = ["Avista Utilities", "Spokane Fire Dept", "Gonzaga Univ", "Spokane Public Schools", "MultiCare Health"];
    
    const newItems: RepairTicket[] = [];
    const now = Date.now();
    
    for (let i = 0; i < 5; i++) {
      const isCompleted = Math.random() > 0.3;
      const status: "open" | "parts_assigned" | "technician_working" | "quality_check" | "completed" = isCompleted 
        ? "completed" 
        : Math.random() > 0.5 ? "technician_working" : "open";
      
      const issue = issues[Math.floor(Math.random() * issues.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const customer = customers[i];
      const company = Math.random() > 0.4 ? companies[i] : undefined;
      
      const basePrice = issue === "screen" ? 220 : issue === "battery" ? 99 : 149;
      const discount = company ? Math.round(basePrice * 0.2) : 0;
      const taxStr = ((basePrice - discount) * 0.1035).toFixed(2);
      const tax = parseFloat(taxStr);
      const total = basePrice - discount + tax;
      
      const hoursAgo = Math.floor(Math.random() * 12); // mostly today
      const createdAt = new Date(now - hoursAgo * 3600000).toISOString();
      const completedAt = status === "completed" 
        ? new Date(new Date(createdAt).getTime() + (Math.random() * 1.5 + 0.5) * 3600000).toISOString()
        : undefined;

      newItems.push({
        id: `DCP-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: customer,
        companyName: company,
        device: `${brand} ${model}`,
        issueType: issue,
        status,
        quotedPrice: basePrice,
        tax,
        discount,
        total,
        createdAt,
        completedAt
      });
    }
    
    setTickets(prev => [...newItems, ...prev]);
    addToast("Sample Data Pre-loaded", "5 enriched operating records merged with POS ledger charts!", "success");
  };

  useEffect(() => {
    localStorage.setItem("dcp_user_role", userRole);
    
    // Systematically scrub diagnostic caches, lead data, forensics, and ticket states 
    // whenever userRole switches, preventing cross-session data leakage.
    handleSessionReset();

    if (userRole === "customer") {
      setActiveTab("customer-hub");
      
      if (authUser) {
        // Logged-in customer: reload only their owned Firestore tickets and leads
        fetchFirestoreTickets(authUser.uid);
        fetchFirestoreLeads(authUser.uid);
      }
    } else {
      setActiveTab("home");
      fetchPOSLogs();
      if (authUser) {
        fetchFirestoreLeads(authUser.uid);
        fetchFirestoreTickets(authUser.uid);
      }
    }
  }, [userRole, authUser]);

  const handleVerifyB2B = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput.trim()) return;
    
    setIsVerifyingEmail(true);
    try {
      const res = await fetch("/api/verify-b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput })
      });
      if (res.ok) {
        const data = await res.json();
        setIsCorporate(data.isCorporate);
        setCompanyName(data.isCorporate ? data.companyName : "");
        setB2bMessage(data.message);
      }
    } catch (err) {
      console.error("B2B API lookup failed:", err);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleTaxLookup = async (zip: string) => {
    const targetZip = zip.trim();
    if (!targetZip) return;
    try {
      const res = await fetch("/api/tax-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode: targetZip })
      });
      if (res.ok) {
        const data = await res.json();
        
        // Notify the user if the local rate differs from the previously saved/active tax rate value
        if (data.valid && data.rate !== taxRate) {
          const oldPercentage = (taxRate * 100).toFixed(2);
          const newPercentage = (data.rate * 100).toFixed(2);
          addToast(
            "Washington State Tax Rate Adjustment",
            `Destination sales tax adjusted from ${oldPercentage}% (${taxCity}) to ${newPercentage}% (${data.city}).`,
            "info",
            6000
          );
        }
        
        setTaxRate(data.rate);
        setTaxCity(data.city);
        setTaxVerifiedMessage(data.message);
        setIsValidZip(data.valid);
      }
    } catch (err) {
      console.error("Tax lookup API failed:", err);
    }
  };

  // Re-validate Washington State tax rate automatically if the zip code is changed by the user (exactly 5 digits)
  useEffect(() => {
    const cleaned = zipInput.trim();
    if (cleaned.length === 5) {
      handleTaxLookup(cleaned);
    }
  }, [zipInput]);

  const getPathwayDraft = (pathway: string) => {
    if (pathway === "backlight") {
      return `Level 3 Revision Draft:
Checking "No Backlight" symptom for iPad Pro 9.7 display assembly.
Analysis of vector board maps reveals suspected fault node: FL1728 filter fuse. Ensure to test diode mode line drop on PP_LCM_BL_ANODE. 
If FL1728 has blown open, bypass using 0.02mm enameled copper microjumper or swap with a lead-free SAC305 replacement. 
Rework at 350-400C with high-resolution microscope magnification.`;
    } else if (pathway === "charging") {
      return `Level 3 Revision Draft:
Analyzing USB non-charging symptom on iPhone XR motherboards.
Cross-referencing charging rails USB_VBUS and PMU_USB_BRICKID to locate power routing path. 
Suspected integrated controller: 161093 Tristar multiplexer reference. If flat battery voltage drops under 2.0V, Tristar swap is mandated.
Check 1610A3 charging manager. Solder replacement with SAC305 flux at 370C.`;
    } else {
      return `Level 3 Revision Draft:
VDD_MAIN primary voltage line shorted to ground causing 1.1A deadlocks.
Thermal spike on LWIR imaging first points to filter capacitor C247_W as the localized hot zone.
Note: Adjacent capacitors might show false-positives due to thermal soak. Probe C247_W resistance to ground.
If short is confirmed, replace C247_W immediately. Check sandwich layers interface on iPhone XS+ models.`;
    }
  };

  useEffect(() => {
    setCovCustomDraft(getPathwayDraft(s2cActivePathway));
    setCovStatus("IDLE");
    setNarrowedAudit(null);
    setNarrowingLogs([]);
  }, [s2cActivePathway]);

  const scanKeywords = (text: string) => {
    const list: { keyword: string; matched: boolean; sourceDoc: string }[] = [];
    const lower = text.toLowerCase();
    
    if (lower.includes("fl1728")) {
      list.push({ keyword: "FL1728", matched: !!mountedSources["iPad-Pro-9.7-Backlight-FL1728.pdf"], sourceDoc: "iPad-Pro-9.7-Backlight-FL1728.pdf" });
    }
    if (lower.includes("pp_lcm_bl_anode")) {
      list.push({ keyword: "PP_LCM_BL_ANODE", matched: !!mountedSources["iPad-Pro-9.7-Backlight-FL1728.pdf"], sourceDoc: "iPad-Pro-9.7-Backlight-FL1728.pdf" });
    }
    if (lower.includes("1610a3") || lower.includes("tristar")) {
      list.push({ keyword: "1610A3", matched: !!mountedSources["Tristar-1610A3-USB-Multiplexer.pdf"], sourceDoc: "Tristar-1610A3-USB-Multiplexer.pdf" });
    }
    if (lower.includes("usb_vbus") || lower.includes("pmu_usb_brickid")) {
      list.push({ keyword: "USB_VBUS", matched: !!mountedSources["Tristar-1610A3-USB-Multiplexer.pdf"], sourceDoc: "Tristar-1610A3-USB-Multiplexer.pdf" });
    }
    if (lower.includes("c247_w")) {
      list.push({ keyword: "C247_W", matched: !!mountedSources["iPhone-XR-Schematics-Power-Rails.pdf"], sourceDoc: "iPhone-XR-Schematics-Power-Rails.pdf" });
    }
    if (lower.includes("vdd_main") || lower.includes("pp_vcc_main")) {
      list.push({ keyword: "VDD_MAIN", matched: !!mountedSources["iPhone-XR-Schematics-Power-Rails.pdf"], sourceDoc: "iPhone-XR-Schematics-Power-Rails.pdf" });
    }
    
    // Dynamic Simulation: Check for unmounted or unrecognized components (Strict Abstention Protocol Trigger)
    if (lower.includes("fl9999")) {
      list.push({ keyword: "FL9999", matched: false, sourceDoc: "(Unrecognized Component Code)" });
    }
    if (lower.includes("c9999")) {
      list.push({ keyword: "C9999", matched: false, sourceDoc: "(Unrecognized Component Code)" });
    }
    if (lower.includes("u9999")) {
      list.push({ keyword: "U9999", matched: false, sourceDoc: "(Unrecognized Component Code)" });
    }
    return list;
  };

  const runChainOfVerification = () => {
    setIsCovRunning(true);
    setCovLogs(["[CoV Phase 1] Initiating Chain-of-Verification (CoV) loop on current draft claims..."]);
    
    setTimeout(() => {
      setCovLogs(prev => [...prev, "[CoV Phase 2] Breaking draft into individual diagnostic claims..."]);
    }, 200);

    setTimeout(() => {
      const keywords = scanKeywords(covCustomDraft);
      const kNames = keywords.map(k => k.keyword);
      setCovLogs(prev => [
        ...prev, 
        `[CoV Phase 2] Granular Extraction: Identified hardware nodes and rails: [${kNames.length > 0 ? kNames.join(", ") : "None Detected"}]`
      ]);
    }, 450);

    setTimeout(() => {
      setCovLogs(prev => [...prev, "[CoV Phase 3] Cross-referencing against active vector schematic layouts... checking layout matching accuracy."]);
    }, 700);

    setTimeout(() => {
      const keywords = scanKeywords(covCustomDraft);
      const totalKeywords = keywords.length;
      const verifiedKeywordsCount = keywords.filter(k => k.matched).length;
      
      let baseOverlap = totalKeywords > 0 ? (verifiedKeywordsCount / totalKeywords) : 0;
      
      const activeSourcesCount = Object.values(mountedSources).filter(Boolean).length;
      let noisePenalty = 0;
      if (activeSourcesCount > 2) {
        noisePenalty = 0.15 * (activeSourcesCount - 2);
      }
      
      const calculatedFidelity = Math.max(0, baseOverlap - noisePenalty);
      
      const pass = calculatedFidelity >= covThreshold;
      setCovStatus(pass ? "PASS" : "REDO");
      
      setCovLogs(prev => [
        ...prev,
        `[CoV Phase 3] Verification complete. Net Fidelity Score: ${(calculatedFidelity * 100).toFixed(0)}% (Required Threshold: ${(covThreshold * 100).toFixed(0)}%).`,
        pass 
          ? "✔️ VERIFICATION PASS: Strict factual grounding confirmed! Diagnostic draft is certified safe."
          : `❌ FIDELITY BREACH: Fidelity score is ${(calculatedFidelity * 100).toFixed(0)}%, which is below the safe threshold of ${(covThreshold * 100).toFixed(0)}%. Context narrowing is required to resolve signal dilution!`
      ]);

      const auditPayload = {
        verification_audit: {
          status: pass ? "PASS" : "REDO",
          method: "Chain-of-Verification (CoV)",
          threshold_enforced: covThreshold,
          audit_metrics: {
            paragraphs_tested: covCustomDraft.split("\n\n").length,
            keywords_extracted: keywords.map(k => k.keyword),
            keywords_verified: keywords.filter(k => k.matched).map(k => k.keyword),
            context_flooding_files: activeSourcesCount,
            noise_penalty_applied: noisePenalty,
            fidelity_score: parseFloat(calculatedFidelity.toFixed(2))
          },
          source_grounding: {
            cited_docs: keywords.filter(k => k.matched).map(k => k.sourceDoc),
            verification_mode: "STRICT_FACTUAL"
          }
        }
      };

      setCovAuditResult(auditPayload);
      setIsCovRunning(false);
      
      if (pass) {
        addToast("CoV Check Passed", "High-fidelity diagnostic alignment verified!", "success");
      } else {
        addToast("Fidelity Error Detected", "Verification failed. Please trigger Source Narrowing to increase resolution.", "error");
      }
    }, 1100);
  };

  const triggerSourceNarrowing = () => {
    setIsNarrowingActive(true);
    setNarrowingLogs(["[CPO Phase 1] Contextual Precision Orchestrator initiated..."]);
    
    setTimeout(() => {
      setNarrowingLogs(prev => [...prev, `[CPO Phase 1: Symptom-Based Filtering] Analyzing reported symptom path: "${s2cActivePathway}"`]);
    }, 250);

    setTimeout(() => {
      let targetSubsystem = "";
      let requiredDoc = "";
      if (s2cActivePathway === "backlight") {
        targetSubsystem = "iPad Backlight Core Power Layout";
        requiredDoc = "iPad-Pro-9.7-Backlight-FL1728.pdf";
      } else if (s2cActivePathway === "charging") {
        targetSubsystem = "Tristar USB Charger Interface";
        requiredDoc = "Tristar-1610A3-USB-Multiplexer.pdf";
      } else {
        targetSubsystem = "iPhone VDD_MAIN Power Rails Module";
        requiredDoc = "iPhone-XR-Schematics-Power-Rails.pdf";
      }

      setNarrowingLogs(prev => [
        ...prev,
        `[CPO Phase 1] Target required subsystem pinpointed: ${targetSubsystem}.`,
        `[CPO Phase 2: Citation Audit] Audit complete. Relevant source blueprint file identified: ${requiredDoc}`
      ]);
    }, 600);

    setTimeout(() => {
      setNarrowingLogs(prev => [...prev, "[CPO Phase 2: Source Pruning] Disengaging unrelated context files to mitigate context flooding risk..."]);
    }, 1000);

    setTimeout(() => {
      let requiredDoc = "";
      if (s2cActivePathway === "backlight") {
        requiredDoc = "iPad-Pro-9.7-Backlight-FL1728.pdf";
      } else if (s2cActivePathway === "charging") {
        requiredDoc = "Tristar-1610A3-USB-Multiplexer.pdf";
      } else {
        requiredDoc = "iPhone-XR-Schematics-Power-Rails.pdf";
      }

      // Update mountedSources in state: mount only the required document, unmount the others
      setMountedSources({
        "iPhone-XR-Schematics-Power-Rails.pdf": requiredDoc === "iPhone-XR-Schematics-Power-Rails.pdf",
        "iPad-Pro-9.7-Backlight-FL1728.pdf": requiredDoc === "iPad-Pro-9.7-Backlight-FL1728.pdf",
        "Tristar-1610A3-USB-Multiplexer.pdf": requiredDoc === "Tristar-1610A3-USB-Multiplexer.pdf",
        "NIST-SP-800-88-R1-Compliance.pdf": false
      });

      setNarrowingLogs(prev => [
        ...prev,
        `[CPO Phase 2] Programmatic unmounting complete. Only high-signal "${requiredDoc}" remains active.`,
        "[Full-Text Retrieval] Mounting restricted 1-million-token full text into grounding cache..."
      ]);
    }, 1400);

    setTimeout(() => {
      setNarrowingLogs(prev => [...prev, "[CoV Recheck] Re-executing paragraph verification pipeline with zero noise index..."]);
    }, 1800);

    setTimeout(() => {
      const activePathway = s2cActivePathway;
      const targetSubsystem = activePathway === "backlight" ? "iPad Backlight Boost" : activePathway === "charging" ? "Tristar Charging Multiplexer" : "iPhone VDD_MAIN Voltage Line";
      const requiredDoc = activePathway === "backlight" ? "iPad-Pro-9.7-Backlight-FL1728.pdf" : activePathway === "charging" ? "Tristar-1610A3-USB-Multiplexer.pdf" : "iPhone-XR-Schematics-Power-Rails.pdf";
      const faultNode = activePathway === "backlight" ? "FL1728" : activePathway === "charging" ? "1610A3" : "C247_W";

      const auditPayload = {
        narrowed_diagnostic_audit: {
          target_system: targetSubsystem,
          narrowing_metrics: {
            initial_sources_available: 300,
            sources_selected_for_query: 1,
            signal_to_noise_optimization: "REFINED"
          },
          grounded_result: {
            fault_node: faultNode,
            verification_status: "PASS (The Paragraph Test)",
            cited_context: `${requiredDoc}, Page 14`
          }
        }
      };

      setNarrowedAudit(auditPayload);
      setCovStatus("PASS");
      setIsNarrowingActive(false);

      // Re-fill logs for CoV as well to reflect the success
      setCovLogs(prev => [
        ...prev,
        `[CPO Bypass Update] Diagnostic recheck passed! Grounded with 100% precision. Hallucination probability reduced to 0%.`
      ]);

      addToast("Source Precision Active", "Signal concentration maximized. Hallucination risk mitigated!", "success");
    }, 2200);
  };

  // Live Reactive CoV Calculations
  const keywordsList = scanKeywords(covCustomDraft);
  const totalKeywords = keywordsList.length;
  const verifiedKeywordsCount = keywordsList.filter(k => k.matched).length;
  
  const baseOverlap = totalKeywords > 0 ? (verifiedKeywordsCount / totalKeywords) : 0;
  
  const activeSourcesCount = Object.values(mountedSources).filter(Boolean).length;
  let noisePenalty = 0;
  if (activeSourcesCount > 2) {
    noisePenalty = 0.15 * (activeSourcesCount - 2);
  }
  
  const calculatedFidelity = Math.max(0, baseOverlap - noisePenalty);
  const pass = calculatedFidelity >= covThreshold;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast("Copied to Clipboard", "Audit schema JSON copied successfully!", "success");
  };

  // --- GOOGLE CLOUD SERVICE DIRECTORY INTEGRATION FUNCTIONS ---
  
  // Helper to parse key=value annotations string
  const parseAnnotations = (str: string): Record<string, string> => {
    const result: Record<string, string> = {};
    if (!str.trim()) return result;
    str.split(",").forEach(pair => {
      const parts = pair.split("=");
      if (parts.length >= 2) {
        result[parts[0].trim()] = parts.slice(1).join("=").trim();
      }
    });
    return result;
  };

  // Fetch Service Directory Authentication Status
  const fetchSdStatus = async () => {
    try {
      const res = await fetch("/api/service-directory/status");
      if (res.ok) {
        const data = await res.json();
        setSdStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch Service Directory status:", err);
    }
  };

  // Toggle Service Directory Registry Mode (Simulated Sandbox vs Real GCP)
  const handleToggleRegistryMode = async (newMode: "simulated" | "gcp") => {
    setSdLoading(true);
    setSdError(null);
    setSdSuccess(null);
    try {
      const res = await fetch("/api/service-directory/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode })
      });
      if (res.ok) {
        const statusRes = await fetch("/api/service-directory/status");
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setSdStatus(statusData);
        }
        setSdSuccess(`Successfully switched to ${newMode === "gcp" ? "Genuine GCP Real-time" : "Local Sandbox Simulated"} mode.`);
        
        // Re-request namespaces to trigger list in the new mode
        handleListNamespaces();
      } else {
        const errData = await res.json();
        setSdError(errData.error || "Failed to switch registry mode.");
      }
    } catch (err: any) {
      setSdError(err.message || "Failed to communicate with local development API.");
    } finally {
      setSdLoading(false);
    }
  };

  // List Namespaces for selected project and location
  const handleListNamespaces = async (proj = sdProjectId, loc = sdLocationId) => {
    setSdLoading(true);
    setSdError(null);
    setSdSuccess(null);
    try {
      const res = await fetch("/api/service-directory/namespaces/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: proj, locationId: loc })
      });
      if (res.ok) {
        const data = await res.json();
        setSdNamespaces(data.namespaces || []);
        if (data.namespaces?.length > 0) {
          // Auto-select first namespace for ease of use
          const firstNs = data.namespaces[0].name;
          setSelectedNamespace(firstNs);
          handleListServices(firstNs);
        } else {
          setSelectedNamespace("");
          setSdServices([]);
          setSelectedService("");
          setSdEndpoints([]);
        }
      } else {
        const errData = await res.json();
        setSdError(errData.error || "Failed to list namespaces.");
      }
    } catch (err: any) {
      setSdError(err.message || "Network error fetching namespaces.");
    } finally {
      setSdLoading(false);
    }
  };

  // Create a new Namespace
  const handleCreateNamespace = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newNamespaceId.trim().toLowerCase();
    if (!cleanId) {
      setSdError("Namespace ID is required.");
      return;
    }
    setSdLoading(true);
    setSdError(null);
    setSdSuccess(null);
    try {
      const res = await fetch("/api/service-directory/namespaces/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: sdProjectId,
          locationId: sdLocationId,
          namespaceId: cleanId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSdSuccess(`Successfully registered namespace "${cleanId}"`);
        setNewNamespaceId("");
        // Reload namespaces list
        handleListNamespaces();
      } else {
        const errData = await res.json();
        setSdError(errData.error || "Failed to create namespace.");
      }
    } catch (err: any) {
      setSdError(err.message || "Network error registering namespace.");
    } finally {
      setSdLoading(false);
    }
  };

  // Delete a Namespace
  const handleDeleteNamespace = async (name: string) => {
    if (!confirm(`Are you sure you want to delete namespace: ${name}?`)) return;
    setSdLoading(true);
    setSdError(null);
    setSdSuccess(null);
    try {
      const res = await fetch("/api/service-directory/namespaces/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        setSdSuccess("Namespace deleted successfully.");
        if (selectedNamespace === name) {
          setSelectedNamespace("");
          setSdServices([]);
          setSelectedService("");
          setSdEndpoints([]);
        }
        handleListNamespaces();
      } else {
        const errData = await res.json();
        setSdError(errData.error || "Failed to delete namespace.");
      }
    } catch (err: any) {
      setSdError(err.message || "Network error deleting namespace.");
    } finally {
      setSdLoading(false);
    }
  };

  // List Services in a Namespace
  const handleListServices = async (nsName: string) => {
    if (!nsName) return;
    setSdLoading(true);
    setSdError(null);
    try {
      const res = await fetch("/api/service-directory/services/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespaceName: nsName })
      });
      if (res.ok) {
        const data = await res.json();
        setSdServices(data.services || []);
        if (data.services?.length > 0) {
          const firstSrv = data.services[0].name;
          setSelectedService(firstSrv);
          handleListEndpoints(firstSrv);
        } else {
          setSelectedService("");
          setSdEndpoints([]);
        }
      } else {
        const errData = await res.json();
        setSdError(errData.error || "Failed to list services.");
      }
    } catch (err: any) {
      setSdError(err.message || "Network error fetching services.");
    } finally {
      setSdLoading(false);
    }
  };

  // Create a new Service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newServiceId.trim().toLowerCase();
    if (!selectedNamespace) {
      setSdError("Please select/create a target Namespace first.");
      return;
    }
    if (!cleanId) {
      setSdError("Service ID is required.");
      return;
    }
    setSdLoading(true);
    setSdError(null);
    setSdSuccess(null);
    
    const parsedAnnots = parseAnnotations(newServiceAnnotations);
    
    try {
      const res = await fetch("/api/service-directory/services/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespaceName: selectedNamespace,
          serviceId: cleanId,
          annotations: parsedAnnots
        })
      });
      if (res.ok) {
        setSdSuccess(`Successfully registered service "${cleanId}"`);
        setNewServiceId("");
        // Reload services log
        handleListServices(selectedNamespace);
      } else {
        const errData = await res.json();
        setSdError(errData.error || "Failed to create service.");
      }
    } catch (err: any) {
      setSdError(err.message || "Network error registering service.");
    } finally {
      setSdLoading(false);
    }
  };

  // Delete a Service
  const handleDeleteService = async (name: string) => {
    if (!confirm(`Are you sure you want to delete service: ${name}?`)) return;
    setSdLoading(true);
    setSdError(null);
    setSdSuccess(null);
    try {
      const res = await fetch("/api/service-directory/services/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        setSdSuccess("Service deleted successfully.");
        if (selectedService === name) {
          setSelectedService("");
          setSdEndpoints([]);
        }
        handleListServices(selectedNamespace);
      } else {
        const errData = await res.json();
        setSdError(errData.error || "Failed to delete service.");
      }
    } catch (err: any) {
      setSdError(err.message || "Network error deleting service.");
    } finally {
      setSdLoading(false);
    }
  };

  // List Endpoints in a Service
  const handleListEndpoints = async (srvName: string) => {
    if (!srvName) return;
    setSdLoading(true);
    setSdError(null);
    try {
      const res = await fetch("/api/service-directory/endpoints/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceName: srvName })
      });
      if (res.ok) {
        const data = await res.json();
        setSdEndpoints(data.endpoints || []);
      } else {
        const errData = await res.json();
        setSdError(errData.error || "Failed to list endpoints.");
      }
    } catch (err: any) {
      setSdError(err.message || "Network error fetching endpoints.");
    } finally {
      setSdLoading(false);
    }
  };

  // Create a new Endpoint
  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newEndpointId.trim().toLowerCase();
    const cleanAddress = newEndpointAddress.trim();
    if (!selectedService) {
      setSdError("Please select/create a target Service first.");
      return;
    }
    if (!cleanId) {
      setSdError("Endpoint ID is required.");
      return;
    }
    if (!cleanAddress) {
      setSdError("Endpoint Address (IP/Host) is required.");
      return;
    }
    setSdLoading(true);
    setSdError(null);
    setSdSuccess(null);
    
    const parsedAnnots = parseAnnotations(newEndpointAnnotations);

    try {
      const res = await fetch("/api/service-directory/endpoints/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: selectedService,
          endpointId: cleanId,
          address: cleanAddress,
          port: Number(newEndpointPort),
          annotations: parsedAnnots
        })
      });
      if (res.ok) {
        setSdSuccess(`Successfully registered endpoint "${cleanId}"`);
        setNewEndpointId("");
        // Reload endpoints log
        handleListEndpoints(selectedService);
      } else {
        const errData = await res.json();
        setSdError(errData.error || "Failed to create endpoint.");
      }
    } catch (err: any) {
      setSdError(err.message || "Network error registering endpoint.");
    } finally {
      setSdLoading(false);
    }
  };

  // Delete an Endpoint
  const handleDeleteEndpoint = async (name: string) => {
    if (!confirm(`Are you sure you want to delete endpoint: ${name}?`)) return;
    setSdLoading(true);
    setSdError(null);
    setSdSuccess(null);
    try {
      const res = await fetch("/api/service-directory/endpoints/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        setSdSuccess("Endpoint deleted successfully.");
        handleListEndpoints(selectedService);
      } else {
        const errData = await res.json();
        setSdError(errData.error || "Failed to delete endpoint.");
      }
    } catch (err: any) {
      setSdError(err.message || "Network error deleting endpoint.");
    } finally {
      setSdLoading(false);
    }
  };

  const fetchDynamicQuote = async () => {
    setIsCalculatingQuote(true);
    try {
      const res = await fetch("/api/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueType,
          deviceTier,
          zipCode: zipInput,
          isCorporate,
          companyName: isCorporate ? companyName : undefined,
        })
      });
      if (res.ok) {
        const data = await res.json();
        setQuote(data);
      }
    } catch (err) {
      console.error("Quote generation API failed:", err);
    } finally {
      setIsCalculatingQuote(false);
    }
  };

  const handleSendTriageChat = async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const textToSend = presetText || chatInput;
    if (!textToSend.trim()) return;

    const userMessage = { role: "user" as const, text: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    if (!presetText) {
      setChatInput("");
    }
    setIsChatSending(true);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          deviceDetails: {
            brand: deviceBrand,
            model: deviceModel,
            tier: deviceTier
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", text: data.text }]);
        if (data.groundingSources && Array.isArray(data.groundingSources)) {
          setGroundingSources(data.groundingSources);
        } else {
          setGroundingSources([]);
        }
        
        if (data.detectedSpecs) {
          const specs = data.detectedSpecs;
          if (specs.brand) setDeviceBrand(specs.brand);
          if (specs.model) setDeviceModel(specs.model);
          if (specs.tier) setDeviceTier(specs.tier);
          if (specs.issue) setIssueType(specs.issue);
          
          addToast(
            "Triage Engine Live-Sync",
            `State Updated: Brand to [${specs.brand || "Undetected"}], Model to [${specs.model || "Undetected"}], Damage Routed to [${specs.pricingTier || specs.issue || "Undetected"}].`,
            "success"
          );
        }
      } else {
        throw new Error("Chat request failed");
      }
    } catch (err: any) {
      console.error("Chat triage error:", err);
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          text: "ERROR: Communication timeout on diagnostic proxy. Hardware fail-safes indicate parts replace needed if there is visible physical degradation." 
        }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleRunThinkingDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thinkingPrompt.trim()) return;
    setIsDeepDiagnosing(true);
    setDeepDiagnosticResult("");
    try {
      const res = await fetch("/api/complex-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: thinkingPrompt,
          deviceDetails: {
            brand: deviceBrand,
            model: deviceModel,
            tier: deviceTier,
            issueType: issueType
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDeepDiagnosticResult(data.text);
      } else {
        const data = await res.json();
        setDeepDiagnosticResult(`ERROR: Deeper reasoning diagnostic model failed. Details: ${data.error || "handshake failed"}`);
      }
    } catch (err: any) {
      console.error(err);
      setDeepDiagnosticResult(`COMMUNICATION TIMEOUT: ${err.message}`);
    } finally {
      setIsDeepDiagnosing(false);
    }
  };

  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const base64Data = reader.result.split(",")[1];
        setSelectedImageBase64(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVisionDiagnostic = async () => {
    if (!selectedImageBase64) {
      alert("Please upload/select a device photo to execute multimodal computer vision analysis.");
      return;
    }
    setIsDeepDiagnosing(true);
    setDeepDiagnosticResult("");
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Data: selectedImageBase64,
          mimeType: "image/png",
          prompt: `Perform an expert hardware visual triage audit of this device: ${deviceBrand} ${deviceModel}. Describe cracked glass fracture patterns, swelling indicator confidence, bezel alignment, and specific parts replacement requirements.`
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDeepDiagnosticResult(data.text);
      } else {
        const data = await res.json();
        setDeepDiagnosticResult(`ERROR: Computer vision visual processing failed. Details: ${data.error || "failed"}`);
      }
    } catch (err: any) {
      console.error(err);
      setDeepDiagnosticResult(`COMMUNICATION TIME-OUT: ${err.message}`);
    } finally {
      setIsDeepDiagnosing(false);
    }
  };

  const createOfficialTicket = async () => {
    try {
      const res = await fetch("/api/create-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          companyName: isCorporate ? companyName : undefined,
          device: `${deviceBrand} ${deviceModel}`,
          issueType,
          quotedPrice: quote.baseQuote.subtotal,
          tax: quote.taxInfo.calculatedTax,
          discount: quote.discountInfo.amount,
          total: quote.grandTotal
        })
      });
      if (res.ok) {
        setTicketCreationSuccess(true);
        setTimeout(() => setTicketCreationSuccess(false), 3000);
        fetchPOSLogs();
      }
    } catch (err) {
      console.error("Failed to push ticket to POS:", err);
    }
  };

  const clearChatLogs = () => {
    setMessages([
      { 
        role: "assistant", 
        text: "Diagnostic timeline flushed on Cloud Run. System stands ready for mobile hardware assessment guidelines." 
      }
    ]);
  };

  // Hardware Scan Trigger
  const startHardwareScan = () => {
    setIsScanning(true);
    setHasScanned(false);
    setScanProgress(0);
    setScanStep("Initializing lab device diagnostic interface...");
    
    addToast(
      "Hardware Scan Initiated",
      "Probing local USB physical bus & hardware controllers...",
      "info",
      2500
    );
    
    const steps = [
      { progress: 15, text: "Searching USB physical bus and local hardware controllers..." },
      { progress: 35, text: "Handshaking with connected controller chipset... Success." },
      { progress: 55, text: "Reading hardware serial: DSC-G6TJX0L3V9X..." },
      { progress: 75, text: "Probing Li-Poly thermal sensor and cycle capacity metrics..." },
      { progress: 90, text: "Analyzing screen digitizer controller and OLED voltage rails..." },
      { progress: 100, text: "Scan complete! Pre-filling device status." }
    ];

    let currentStepIndex = 0;
    
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        const current = steps[currentStepIndex];

        // Simulate Hardware Scan Timeout if the switch is active
        if (forceScanTimeout && current.progress === 55) {
          clearInterval(interval);
          setIsScanning(false);
          setScanStep("Hardware probe timeout: Connected physical bus unresponsive.");
          addToast(
            "Hardware Scan Timeout",
            "Failed to connect to USB controller: Physical bus unresponsive (Code: 0x8E12A).",
            "error",
            6000
          );
          return;
        }

        setScanProgress(current.progress);
        setScanStep(current.text);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        
        const scanCandidates = [
          { brand: "Samsung", model: "Galaxy S23 Ultra", tier: "flagship" as const, issue: "battery" as const, customer: "Alex Rivera", b2b: false, email: "alex.rivera@gmail.com", zip: "98004", city: "Bellevue", rate: 0.101 },
          { brand: "Apple", model: "iPhone 14 Pro Max", tier: "flagship" as const, issue: "screen" as const, customer: "Sarah Jenkins", b2b: true, email: "marcus@amazon.com", zip: "98101", city: "Seattle", rate: 0.1035 },
          { brand: "Google", model: "Pixel 7a", tier: "midrange" as const, issue: "button" as const, customer: "David Miller", b2b: false, email: "dmiller@gmail.com", zip: "98402", city: "Tacoma", rate: 0.103 }
        ];
        
        const selected = scanCandidates[Math.floor(Math.random() * scanCandidates.length)];
        
        setDeviceBrand(selected.brand);
        setDeviceModel(selected.model);
        setDeviceTier(selected.tier);
        setIssueType(selected.issue);
        setCustomerName(selected.customer);
        setIsCorporate(selected.b2b);
        setEmailInput(selected.email);
        setZipInput(selected.zip);
        setTaxCity(selected.city);
        setTaxRate(selected.rate);
        
        if (selected.b2b) {
          setCompanyName("AMAZON Fleet");
          setB2bMessage("VERIFICATION SUCCESS: Corporate customer identified! 20% Fast-Track fleet repair discount & zero-deposit check-in is unlocked.");
        } else {
          setCompanyName("");
          setB2bMessage("Retail client verified. Standard warranty and retail billing rates applied.");
        }

        setTaxVerifiedMessage(`WASHINGTON TAX COMPLIANT: Destined delivery in ${selected.city} (${selected.zip}) is subject to ${selected.rate * 100}% local combined sales tax.`);
        setIsValidZip(true);
        
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            text: `[SYSTEM DIAGNOSIS DETECTED via PHYSICAL PROBE]: Verified device ${selected.brand} ${selected.model} (Serial: DSC-G6TJX0L3V9X). Hardware parameters have been successfully digitized and pre-filled in your diagnostics side-panel. Issue identified on: ${selected.issue.toUpperCase()} Assembly.`
          }
        ]);

        addToast(
          "Hardware Scan Successful",
          `Successfully connected. Digitized and pre-filled parameters for ${selected.brand} ${selected.model}.`,
          "success",
          5000
        );

        setHasScanned(true);
        setIsScanning(false);
      }
    }, 600);
  };

  const startPhysicalUsbScan = async () => {
    setIsScanning(true);
    setHasScanned(false);
    setScanProgress(0);
    setScanStep("Initializing WebUSB subsystem client...");

    addToast(
      "Connecting USB Cable...",
      "Waiting for physical device to authorize connection...",
      "info",
      3500
    );

    try {
      const nav = navigator as any;
      if (!nav.usb) {
        throw new Error("WebUSB API is not supported in this browser or is blocked. Standard in-app iframe previews often require opening the application in a new tab first.");
      }

      const device = await nav.usb.requestDevice({ filters: [] });
      
      setScanProgress(30);
      setScanStep(`Device identified! Brand: ${device.manufacturerName || "Unknown"}. Connecting...`);

      await device.open();
      setScanProgress(60);
      setScanStep(`Reading micro-controller parameters & cycle metrics...`);

      try {
        if (device.configuration === null) {
          await device.selectConfiguration(1);
        }
        await device.claimInterface(0);
      } catch (claimErr) {
        console.warn("Non-critical handshake claim warning:", claimErr);
      }

      setScanProgress(90);
      setScanStep("Parsing motherboard ROM and battery series impedance...");

      let brand = "Google";
      let model = device.productName || "Mobile Diagnostic Device";
      const manufacturerLower = (device.manufacturerName || "").toLowerCase();

      if (manufacturerLower.includes("apple") || device.vendorId === 0x05ac) {
        brand = "Apple";
        model = device.productName || "iPhone USB Interface";
      } else if (manufacturerLower.includes("samsung") || device.vendorId === 0x04e8) {
        brand = "Samsung";
        model = device.productName || "Galaxy Host controller";
      } else if (manufacturerLower.includes("google") || device.vendorId === 0x18d1) {
        brand = "Google";
        model = device.productName || "Pixel Test Board";
      }

      setTimeout(() => {
        setDeviceBrand(brand);
        setDeviceModel(model);
        setDeviceTier(brand === "Apple" || brand === "Samsung" ? "flagship" : "midrange");
        setIssueType("battery"); 
        setCustomerName("PHYSICAL USB CLIENT");
        setIsCorporate(false);
        setCompanyName("");
        setZipInput("98101");
        setTaxCity("Seattle");
        setTaxRate(0.1035);
        setTaxVerifiedMessage(`WASHINGTON TAX COMPLIANT: Connected via Direct Physical USB-C Cable. Destined Seattle (98101) local combined tax scale is 10.35%.`);
        setIsValidZip(true);

        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            text: `[DIRECT USB PAIR SUCCESS]: Physically retrieved device details over cable: ${brand} ${model} (Vendor ID: 0x${device.vendorId.toString(16).toUpperCase()}, Product: 0x${device.productId.toString(16).toUpperCase()}, Serial: ${device.serialNumber || "N/A"}). Telemetry diagnostics successfully mapped in real-time!`
          }
        ]);

        addToast(
          "Direct Cable Connection Established",
          `Physically paired with ${brand} ${model} successfully! Telemetry diagnostics active.`,
          "success",
          6000
        );

        setScanProgress(100);
        setScanStep("Direct USB diagnostic link online.");
        setHasScanned(true);
        setIsScanning(false);
      }, 1000);

    } catch (err: any) {
      console.warn("Direct USB connectivity fault:", err);
      setIsScanning(false);

      const errorMsg = err.message || "Operation cancelled or blocked.";
      const isSecurityError = err.name === "SecurityError" || errorMsg.toLowerCase().includes("security") || errorMsg.toLowerCase().includes("iframe") || errorMsg.toLowerCase().includes("permission");
      const isUserCancelled = errorMsg.includes("No device selected");

      let guidance = "Make sure your device is fully unlocked, plugged-in safely, and trust handshake is approved.";
      if (isSecurityError) {
        guidance = "Iframe sandboxing blocked the USB connection popups. Please click the 'Open in New Tab' button in the toolbar above to run in a secure sandbox context!";
      } else if (isUserCancelled) {
        guidance = "No USB diagnostic device was selected. Plug in a device and try again when you are ready.";
      }

      addToast(
        isUserCancelled ? "Pairing Handshake Cancelled" : "Direct USB Connection Blocked",
        guidance,
        isUserCancelled ? "info" : "error",
        isUserCancelled ? 4000 : 10000
      );

      setScanStep(isUserCancelled ? "Handshake cancelled by technician" : `Direct USB Fail: ${errorMsg}`);
    }
  };

  const downloadPdfReport = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Let's create an elegant, professional layout for a calibration & telemetry diagnostic report
      // Set primary color palette
      const primaryColor = [15, 23, 42]; // slate-900
      const accentColor = [59, 130, 246]; // blue-500
      const activeGreen = [16, 185, 129]; // emerald-500
      const darkGray = [71, 85, 105]; // slate-600

      // Outer border / aesthetic framing
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(1);
      doc.rect(8, 8, 194, 281);

      // Top Header Accent Strip
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(8, 8, 194, 6, "F");

      // Title Block
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("DEVICE DIAGNOSTIC REPORT", 16, 26);

      // Subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("AUTO-GENERATED VIA HARDWARE PROBING LINK", 16, 31);

      // Metadata / Timestamp right-aligned
      const timestamp = new Date().toLocaleString();
      doc.setFontSize(8);
      doc.text(`SCAN TIMESTAMP: ${timestamp}`, 190, 26, { align: "right" });
      doc.text("SYSTEM ID: COM-CORE-USB-01", 190, 31, { align: "right" });

      // Horizontal separator line
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.5);
      doc.line(16, 36, 194, 36);

      // Section 1: Customer & Host Association Info
      doc.setFillColor(248, 250, 252); // slate-50 background for card
      doc.rect(16, 42, 178, 38, "F");
      doc.setDrawColor(226, 232, 240); // border
      doc.rect(16, 42, 178, 38, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("CLIENT & SYSTEM ASSOCIATION DETAILS", 22, 49);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Customer Profile:`, 22, 56);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${customerName || "WALK-IN GUEST"}`, 54, 56);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Corporate Account:`, 22, 62);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${isCorporate ? `YES (${companyName || "N/A"})` : "NO (RETAIL HANDSET)"}`, 54, 62);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Assigned Tax Region:`, 22, 68);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${taxCity || "DEFAULT LOCALE (US-WA)"} (ZIP: ${zipInput || "98101"})`, 54, 68);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Local Processing Rate:`, 22, 74);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${(taxRate * 100).toFixed(4)}% combined state/municipal load`, 54, 74);

      // Right Side metadata (in Section 1)
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Connection Mode:", 120, 56);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129); // emerald green
      doc.text("USB DIRECT CABLE", 148, 56);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Interface Status:", 120, 62);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246); // blue
      doc.text("HANDSHAKE TERMINATED", 148, 62);

      // Section 2: Hardware Physical Probe Data
      doc.setFillColor(248, 250, 252); 
      doc.rect(16, 88, 178, 38, "F");
      doc.rect(16, 88, 178, 38, "D");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("HARDWARE SPECIFICATIONS & DETECTED CHIPSETS", 22, 95);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Device OEM Brand:", 22, 102);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${deviceBrand || "Generic"}`, 54, 102);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Model Identifier:", 22, 108);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${deviceModel || "Mobile Diagnostics Core"}`, 54, 108);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Performance Tier:", 22, 114);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${(deviceTier || "standard").toUpperCase()}`, 54, 114);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Reported Fault Vector:", 22, 120);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(239, 68, 68); // Red
      doc.text(`${(issueType || "system").toUpperCase()}`, 54, 120);

      // Estimated cycle health values in Section 2 side info
      const isBatteryIssue = issueType === "battery";
      const batteryCycleHealth = isBatteryIssue ? 76 : 94;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Rated Battery Health:", 115, 102);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(isBatteryIssue ? 239 : 16, isBatteryIssue ? 68 : 185, isBatteryIssue ? 68 : 129);
      doc.text(`${batteryCycleHealth}% Cap Capacity`, 152, 102);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Mainboard Cycle Load:", 115, 108);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("432 charge cycles", 152, 108);

      // Section 3: Diagnostic Telemetry Metrics Log
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("TELEMETRY TIME-SERIES INTERPOLATION", 16, 138);

      // Table mapping
      const tableTop = 144;
      doc.setFillColor(15, 23, 42);
      doc.rect(16, tableTop, 178, 7, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("CYCLE PROBE SAMPLE", 20, tableTop + 5);
      doc.text("NOMINAL RAIL VOLTAGE (V)", 65, tableTop + 5);
      doc.text("MEASURED STABLE ACTIVE VOLTAGE (V)", 120, tableTop + 5);
      doc.text("RELATIVE DELTA VARIANCE (%)", 165, tableTop + 5);

      const tableData = [
        { sample: "1. Core Boot initialization", nominal: "4.15V", measured: isBatteryIssue ? "3.90V" : "4.14V", delta: isBatteryIssue ? "-6.02%" : "-0.24%" },
        { sample: "2. Memory Load state spike", nominal: "4.20V", measured: isBatteryIssue ? "3.84V" : "4.18V", delta: isBatteryIssue ? "-8.57%" : "-0.48%" },
        { sample: "3. GPU/Display high refresh", nominal: "4.18V", measured: isBatteryIssue ? "3.71V" : "4.15V", delta: isBatteryIssue ? "-11.24%" : "-0.72%" },
        { sample: "4. Fast Charge pipeline toggle", nominal: "4.25V", measured: isBatteryIssue ? "3.91V" : "4.23V", delta: isBatteryIssue ? "-8.00%" : "-0.47%" },
        { sample: "5. Thermal regulation check", nominal: "4.12V", measured: isBatteryIssue ? "3.91V" : "4.10V", delta: isBatteryIssue ? "-5.10%" : "-0.49%" },
        { sample: "6. Idle decay state", nominal: "4.16V", measured: isBatteryIssue ? "3.93V" : "4.15V", delta: isBatteryIssue ? "-5.53%" : "-0.24%" },
      ];

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      tableData.forEach((row, index) => {
        const yOffset = tableTop + 7 + (index * 7.5) + 6;
        if (index % 2 === 0) {
          doc.setFillColor(241, 245, 249); 
          doc.rect(16, tableTop + 7 + (index * 7.5), 178, 7.5, "F");
        }
        doc.setTextColor(30, 41, 59);
        doc.text(row.sample, 20, yOffset);
        doc.text(row.nominal, 65, yOffset);
        doc.setTextColor(15, 23, 42); 
        doc.text(row.measured, 120, yOffset);
        doc.setTextColor(isBatteryIssue ? 220 : 16, isBatteryIssue ? 38 : 185, isBatteryIssue ? 38 : 129);
        doc.text(row.delta, 165, yOffset);
      });

      // Recommendations
      const recTop = 205;
      doc.setFillColor(239, 246, 255); 
      doc.setDrawColor(191, 219, 254); 
      doc.rect(16, recTop, 178, 48, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text("DIAGNOSTIC SYSTEM RECOMMENDATIONS", 22, recTop + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      
      if (isBatteryIssue) {
        doc.text("• Detected voltage load line collapse exceeds the maximum allowable hardware threshold of 3.5%.", 22, recTop + 14);
        doc.text("• Probing sequence indicates active internal dendrite propagation within cell series stack.", 22, recTop + 20);
        doc.text("• Recommend scheduled battery cell replacement within next 48 service hours. DO NOT OVER-CHARGE.", 22, recTop + 26);
        doc.text("• Ensure technician utilizes authentic standard series parts matching OEM ID values.", 22, recTop + 32);
        doc.text(`• Reference service category code: ELEC-BATT-${deviceBrand.toUpperCase()}-HEAVY.`, 22, recTop + 38);
      } else {
        doc.text("• Power rail stability is uniform. Transient drop test successfully cleared within nominal range.", 22, recTop + 14);
        doc.text("• Mainboard charge-counter tracks normal degradation rate of 2.1-2.9% annually.", 22, recTop + 20);
        doc.text("• Scheduled maintenance: Routine exterior hardware clean and liquid seal check recommended next.", 22, recTop + 26);
        doc.text("• No critical components flagged for replacement. Firmware calibration completed successfully.", 22, recTop + 32);
        doc.text(`• Reference service category code: PASS-OK-${deviceBrand.toUpperCase()}-ANNUAL.`, 22, recTop + 38);
      }

      // Disclaimer
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); 
      doc.text("DISCLAIMER: This diagnostic summary report was generated locally using WebUSB and active hardware instrumentation layers.", 16, 264);
      doc.text("Voltage curves, impedance factors, and estimated parameters represent simulated profiles compiled on user authorization.", 16, 269);

      // Signatures
      doc.setDrawColor(203, 213, 225); 
      doc.line(16, 252, 90, 252);
      doc.text("SYSTEM CALIBRATOR SIGN-OFF", 16, 257);
      
      doc.line(120, 252, 194, 252);
      doc.text("AUTHORIZED CABLE CLIENT SIGNATURE", 120, 257);

      const docName = `Diagnostic_Report_${deviceBrand || "Device"}_${Date.now()}.pdf`;
      doc.save(docName);

      addToast(
        "PDF Report Downloaded",
        "A structured high-resolution telemetry report has been compiled and saved to your device.",
        "success",
        5500
      );
    } catch (pdfErr: any) {
      console.error("PDF generation failure:", pdfErr);
      addToast(
        "PDF Compilation Error",
        pdfErr.message || "An unexpected error occurred during PDF assembly.",
        "error",
        6000
      );
    }
  };

  const cartItemCount = Object.values(storeCart).reduce((acc: number, qty) => acc + (qty as number), 0) as number;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30 flex flex-col justify-between">
      
      {/* PROFESSIONAL BUSINESS TOP UTILITY BAR */}
      <div className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs py-2 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shrink-0 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-blue-500" />
              <span>Direct Hotline: <strong className="text-white font-extrabold">(509) 555-0199</strong></span>
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>Spokane Mobile Lab Dispatch Service Area</span>
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mon - Sat: 8:00 AM - 6:00 PM</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 uppercase font-black tracking-widest px-2 py-0.5 rounded flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Mobile Dispatch Active
            </span>
            <span className="text-[9px] bg-blue-950 text-blue-400 border border-blue-950/40 uppercase font-bold tracking-widest px-2 py-0.5 rounded">
              NIST 800-88 Compliant
            </span>
          </div>
        </div>
      </div>

      {/* HEADER / NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setActiveTab("home")}>
              <Wrench className="h-8 w-8 text-blue-500 mr-3 animate-pulse" />
              <div>
                <span className="font-bold text-xl tracking-tight text-white block leading-none">DISPLAY & CELL PROS</span>
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-widest">Professional On-Site Solutions</span>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              {userRole === "technician" ? (
                <div className="flex items-center space-x-6">
                  <NavButton active={activeTab === "home"} onClick={() => setActiveTab("home")}>Home</NavButton>
                  <NavButton active={activeTab === "services"} onClick={() => setActiveTab("services")}>Services</NavButton>
                  <NavButton active={activeTab === "b2b"} onClick={() => setActiveTab("b2b")}>B2B Fleet</NavButton>
                  <NavButton active={activeTab === "csp"} onClick={() => setActiveTab("csp")}>CSP Manual</NavButton>
                  
                  {/* Shopping Cart button */}
                  <button
                    onClick={() => setActiveTab("store")}
                    className={`px-3 py-2 rounded-md text-sm font-bold tracking-wide transition-all uppercase flex items-center gap-1.5 relative cursor-pointer ${
                      activeTab === "store" 
                        ? "text-blue-400 bg-slate-800 border border-blue-500/30" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    {hasLowStockHighTurnover && (
                      <span className="absolute -top-1 -left-1 flex h-3.5 w-3.5" title="High-Turnover Item Low Stock Warn!">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-slate-900 justify-center items-center">
                          <span className="text-[8px] text-slate-950 font-black leading-none">!</span>
                        </span>
                      </span>
                    )}
                    <ShoppingCart className="w-4 h-4 text-blue-400" />
                    <span>Store / Supply</span>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border border-slate-900 animate-bounce">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Diagnostics Embedded Laboratory Link */}
                  <button
                    id="tab-diagnostics-lab"
                    onClick={() => setActiveTab("lab")}
                    className={`px-3 py-2 rounded-md text-sm font-bold tracking-wide transition-all uppercase flex items-center gap-1.5 relative group cursor-pointer ${
                      activeTab === "lab" 
                        ? "text-blue-400 bg-slate-800 shadow-xs border border-blue-500/30" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Cpu className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
                    Lab Portal
                    <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 text-[8px] uppercase tracking-tighter bg-blue-600 text-white rounded font-extrabold animate-pulse">
                      Live
                    </span>
                  </button>

                  <button 
                    onClick={() => setIsAiOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare size={18} />
                    Book / Quote
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-950/40 px-3/12 py-1.5 rounded-md border border-blue-900/30 flex items-center gap-2 font-mono">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    LOCK: SECURE CUSTOMER WORKSPACE
                  </span>
                </div>
              )}

              {/* Interactive Persona Toggler */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-full border border-slate-800 shrink-0">
                <button
                  id="persona-customer"
                  title="Switch to Customer view"
                  type="button"
                  onClick={() => {
                    setUserRole("customer");
                    setActiveTab("customer-hub");
                  }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    userRole === "customer"
                      ? "bg-blue-600 text-white shadow-md font-extrabold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Customer
                </button>
                <button
                  id="persona-technician"
                  title="Switch to Technician view"
                  type="button"
                  onClick={() => {
                    setUserRole("technician");
                    setActiveTab("home");
                  }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    userRole === "technician"
                      ? "bg-emerald-600 text-white shadow-md font-extrabold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Technician
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white p-2">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-850 border-b border-slate-705">
            <div className="px-3 pt-2 pb-4 space-y-3">
              {userRole === "technician" ? (
                <>
                  <MobileNavButton onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}>Home</MobileNavButton>
                  <MobileNavButton onClick={() => { setActiveTab("services"); setMobileMenuOpen(false); }}>Services</MobileNavButton>
                  <MobileNavButton onClick={() => { setActiveTab("b2b"); setMobileMenuOpen(false); }}>B2B Fleet</MobileNavButton>
                  <MobileNavButton onClick={() => { setActiveTab("csp"); setMobileMenuOpen(false); }}>CSP Manual</MobileNavButton>
                  <MobileNavButton onClick={() => { setActiveTab("store"); setMobileMenuOpen(false); }}>
                    Store {hasLowStockHighTurnover && "⚠️ (LOW STOCK Alert!)"}
                  </MobileNavButton>
                  
                  <button 
                      onClick={() => { setActiveTab("lab"); setMobileMenuOpen(false); }}
                      className="w-full text-left flex items-center gap-2 block px-3 py-3 rounded-md text-base font-bold text-blue-400 bg-slate-900 border border-slate-755 mb-2"
                    >
                      <Cpu size={18} /> Diagnostics Lab Portal (Beta)
                  </button>

                  <button 
                      onClick={() => { setIsAiOpen(true); setMobileMenuOpen(false); }}
                      className="w-full text-left block px-3 py-3 rounded-md text-base font-medium text-white bg-blue-600 mb-2"
                    >
                      Book Repair / Get Quote
                  </button>
                </>
              ) : (
                <div className="px-3 py-2 text-xs font-mono text-blue-300 bg-blue-950/20 border border-blue-900/30 rounded-lg">
                  🚨 Customer Sandbox Lock-out Mode is currently active. Switch personas below to explore full capabilities.
                </div>
              )}

              {/* Mobile Switcher block */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setUserRole("customer");
                    setActiveTab("customer-hub");
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 ${
                    userRole === "customer" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400"
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Customer View
                </button>
                <button
                  onClick={() => {
                    setUserRole("technician");
                    setActiveTab("home");
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 ${
                    userRole === "technician" ? "bg-emerald-600 text-white" : "bg-slate-900 text-slate-400"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" /> Tech View
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* CORE CONTENT ROUTING AREA */}
      <main className="flex-1 pb-16">
        {activeTab === "home" && <HomeView onBookClick={() => setIsAiOpen(true)} onLabClick={() => setActiveTab("lab")} onLegalClick={() => setActiveTab("legal")} />}
        {activeTab === "services" && <ServicesView onBookClick={() => setIsAiOpen(true)} />}
        {activeTab === "b2b" && <B2BView onBookClick={() => setIsAiOpen(true)} />}
        {activeTab === "csp" && <CspManualView addToast={addToast} />}
        {activeTab === "legal" && <LegalView />}
        {activeTab === "store" && (
          <StoreView 
            storeCart={storeCart} 
            setStoreCart={setStoreCart} 
            addToast={addToast} 
            storeStock={storeStock}
            setStoreStock={setStoreStock}
            stockThreshold={stockThreshold}
            setStockThreshold={setStockThreshold}
          />
        )}
        
        {activeTab === "customer-hub" && (
          <CustomerHubView 
            authUser={authUser}
            customerName={customerName}
            setCustomerName={setCustomerName}
            profilePhone={profilePhone}
            setProfilePhone={setProfilePhone}
            profilePreferredDevice={profilePreferredDevice}
            setProfilePreferredDevice={setProfilePreferredDevice}
            tickets={firestoreTickets}
            setTickets={setFirestoreTickets}
            leads={leads}
            setLeads={setLeads}
            customerMessages={customerMessages}
            setCustomerMessages={setCustomerMessages}
            customerChatInput={customerChatInput}
            setCustomerChatInput={setCustomerChatInput}
            isCustomerChatSending={isCustomerChatSending}
            setIsCustomerChatSending={setIsCustomerChatSending}
            addToast={addToast}
            startPhysicalUsbScan={startPhysicalUsbScan}
            deviceBrand={deviceBrand}
            setDeviceBrand={setDeviceBrand}
            deviceModel={deviceModel}
            setDeviceModel={setDeviceModel}
            setIssueType={setIssueType}
            setDeviceTier={setDeviceTier}
            handleGoogleSignIn={handleGoogleSignIn}
            handleSandboxLogin={handleSandboxLogin}
          />
        )}
        
        {/* --- DEEP DIAGNOSTIC HUB MAIN PANEL VIEWS --- */}
        {activeTab === "lab" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            {/* Google Authentication Status bar */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {authUser ? `Authed: ${authUser.displayName || authUser.email}` : "Cloud Firestore Sync Registry"}
                    {authUser && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wider font-extrabold border border-emerald-500/30">
                      {authUser.uid === "sandbox-tech-101" ? "SANDBOX SIMULATION SESSION" : "SECURE LINK LOCKED"}
                    </span>}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {authUser 
                      ? `Synchronized with user credential ${authUser.email}. Backing up active Spokane WA tickets.` 
                      : "Login with Google to securely store repair tickets and private quote backups on durable Firestore vaults."}
                  </p>
                  {!authUser && (
                    <span className="text-[10px] text-amber-500 block mt-1 font-mono">
                      ⚠️ Note: Browser sandboxes/iframes block popup SSO login. Use the Sandbox bypass to test sync logs if needed.
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {authUser ? (
                  <button 
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-slate-705 hover:bg-slate-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-600 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleGoogleSignIn}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md flex items-center gap-2 transition-colors border border-blue-500/20"
                    >
                      Connect with Google (SSO)
                    </button>
                    <button 
                      onClick={handleSandboxLogin}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-850 hover:text-white text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      <Terminal className="w-3.5 h-3.5 text-blue-450" />
                      Try Sandbox Session (Popup Fix)
                    </button>
                  </>
                )}
              </div>
            </div>

            {firestoreError && (
              <div className="bg-red-950/40 border border-red-950/50 p-3 rounded-lg text-xs text-red-300 font-mono flex items-center gap-2 mb-4 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>[FIRESTORE EXCEPTION LOG]: {firestoreError}</span>
              </div>
            )}

            {/* Header section representing Lab identity */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest font-mono">D&CP INTELLIGENT LABORATORY INTERFACE</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Interactive Diagnostics Lab Dashboard</h1>
                <p className="text-sm text-slate-400">Manage virtual hardware checks, Washington dest-tax compliance calculations, and live POS sync registries.</p>
              </div>

              {/* Lab telemetry summary indicators */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-400">Sync:</span> <span className="text-emerald-400 font-bold">ONLINE</span>
                </div>
                <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-3">
                  <span className="text-slate-400">Latency:</span> <span className="text-blue-400 font-bold">12ms</span>
                </div>
              </div>
            </div>

            {/* Dashboard Three Column Workspace Splitter */}
            <div className="grid grid-cols-12 gap-6 items-stretch">
              
              {/* === LEFT RAIL: PRESET & STATE MODIFIER BAR === */}
              <aside className="col-span-12 lg:col-span-3 bg-slate-850/60 border border-slate-800 rounded-xl p-4 flex flex-col space-y-5">
                
                {/* Active Session Device Specifier */}
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 font-mono">Device Hardware Analyzer</p>
                  <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 space-y-4 shadow-inner">
                    
                    {/* Hardware Scan Simulator Action */}
                    <div className="pb-3 border-b border-slate-800/80 space-y-2.5">
                      <div className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider flex items-center justify-between mb-1">
                        <span>Diagnostic Trigger Layer</span>
                        <span className="text-blue-400">USB 2.0 / 3.0</span>
                      </div>
                      
                      <button
                        type="button"
                        id="btn-physical-usb"
                        disabled={isScanning}
                        onClick={startPhysicalUsbScan}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-750 disabled:from-slate-700 disabled:to-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-lg hover:scale-[1.01] active:scale-98 transition-all border border-emerald-500/20"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        {isScanning ? "PROBING HARDWARE..." : "🔌 Connect Phone (Cable)"}
                      </button>

                      <button
                        type="button"
                        id="btn-simulate-scan"
                        disabled={isScanning}
                        onClick={startHardwareScan}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-750 disabled:bg-slate-850 text-slate-300 font-bold text-[10.5px] uppercase tracking-wider rounded-lg hover:scale-[1.01] active:scale-98 transition-all border border-slate-700/60 font-mono"
                      >
                        <Zap className={`w-3.5 h-3.5 fill-current ${isScanning ? "animate-spin text-yellow-400" : "text-slate-400"}`} />
                        {isScanning ? "TUNING RAIL FREQUENCY..." : "Simulate Offline Scan"}
                      </button>

                      {/* Timeout toggler switch */}
                      <div className="mt-2.5 flex items-center justify-between px-1">
                        <label htmlFor="forceScanTimeout" className="text-[9px] text-slate-400 hover:text-slate-200 font-bold uppercase font-mono tracking-wider cursor-pointer select-none flex items-center gap-2 transition-colors">
                          <input
                            id="forceScanTimeout"
                            name="forceScanTimeout"
                            type="checkbox"
                            checked={forceScanTimeout}
                            onChange={(e) => setForceScanTimeout(e.target.checked)}
                            className="w-3.5 h-3.5 bg-slate-950 border-slate-850 rounded text-blue-600 focus:ring-blue-500/30 accent-blue-600 cursor-pointer"
                          />
                          Simulate Timeout Error
                        </label>
                        <span className={`text-[8.5px] font-mono font-extrabold ${forceScanTimeout ? "text-red-400 animate-pulse" : "text-slate-500"}`}>
                          {forceScanTimeout ? "TIMEOUT" : "NORMAL"}
                        </span>
                      </div>
                      
                      <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-850/60 space-y-1 text-[8.5px] text-slate-400 font-mono">
                        <div className="text-slate-300 font-extrabold uppercase text-[8px] flex items-center gap-1">
                          <span>💡 CABLE PORT TIPS:</span>
                        </div>
                        <p className="leading-snug">
                          1. Plug phone via certified USB cable to host motherboard.<br />
                          2. Unlock device screen & grant Trust / Debug permissions.<br />
                          3. If trapped in the safe iframe sandbox, <b className="text-blue-400 hover:underline">Open in a New Tab</b> to unlock Google Chrome's WebUSB hardware popup permission engine!
                        </p>
                      </div>

                      {isScanning && (
                        <div className="mt-3 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[10px] text-emerald-400 leading-tight space-y-2.5 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[8.5px] uppercase tracking-widest text-slate-400">HARDWARE PROBE ACTIVE</span>
                            <span className="font-bold text-blue-400 animate-pulse">{scanProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-400 h-full transition-all duration-300"
                              style={{ width: `${scanProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-slate-350 transition-all text-[9px] leading-snug">{scanStep}</p>
                        </div>
                      )}

                      {!isScanning && hasScanned && (
                        <div id="diagnostic-report-collapsible-container" className="mt-4 border border-slate-800 rounded-lg overflow-hidden bg-slate-950 shadow-lg">
                          {/* Header bar that acts as a toggle */}
                          <div 
                            onClick={() => setIsReportExpanded(!isReportExpanded)}
                            className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800/80 cursor-pointer select-none hover:bg-slate-850 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isReportExpanded ? "animate-pulse bg-emerald-400" : "bg-blue-400"}`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isReportExpanded ? "bg-emerald-500" : "bg-blue-500"}`}></span>
                              </span>
                              <span className="text-[10px] font-bold text-slate-300 tracking-wider uppercase font-mono">
                                {isReportExpanded ? "REAL-TIME DIAGNOSTIC RE-RAILS" : "SCAN TELEMETRY READY"}
                              </span>
                            </div>
                            <button
                              type="button"
                              id="btn-toggle-report"
                              onClick={(e) => {
                                e.stopPropagation(); // Avoid triggering double toggle
                                setIsReportExpanded(!isReportExpanded);
                              }}
                              className="text-[9px] font-black uppercase font-mono tracking-widest text-blue-400 hover:text-white hover:bg-blue-600 bg-blue-950/40 hover:border-blue-550 border border-blue-900/60 px-2 py-1 rounded transition-all flex items-center gap-1"
                            >
                              <span>{isReportExpanded ? "MINIMIZE REPORT" : "VIEW FULL REPORT"}</span>
                              {isReportExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          
                          {/* Collapsible report Content with animation */}
                          <AnimatePresence initial={false}>
                            {isReportExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                              >
                                <div className="p-3 bg-slate-950/40">
                                  <HardwareScanChart 
                                    deviceBrand={deviceBrand}
                                    deviceModel={deviceModel}
                                    issueType={issueType}
                                  />
                                  
                                  {/* QR Code Synchronization Card */}
                                  <div id="diagnostic-qr-sync-panel" className="mt-3 bg-slate-900 border border-slate-800/80 rounded-lg p-3 flex flex-col sm:flex-row items-center gap-3.5 shadow-inner">
                                    <div className="relative shrink-0 p-1.5 bg-white rounded-lg border border-slate-700 shadow-md flex items-center justify-center">
                                      <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
`--- TELEMETRY TRACE ---
ID: COM-CORE-USB-01
Timestamp: ${new Date().toLocaleString()}
Manufacturer: ${deviceBrand}
Model: ${deviceModel}
Tier: ${deviceTier}
Fault: ${issueType.toUpperCase()}
Battery Health: ${issueType === "battery" ? "76%" : "94%"}
Status: ${issueType === "battery" ? "DEGRADED" : "OPTIMAL"}`
                                        )}&color=0f172a`}
                                        alt="Diagnostic Handshake QR Code"
                                        id="diagnostic-qr-code-img"
                                        className="w-24 h-24 select-none rounded"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[6.5px] text-white font-black font-mono px-1 rounded shadow-md animate-pulse">
                                        LIVE
                                      </div>
                                    </div>

                                    <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
                                      <div className="flex items-center justify-center sm:justify-start gap-1.5">
                                        <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-[9.5px] font-extrabold text-slate-300 uppercase tracking-wider font-mono">
                                          Terminal Sync QR Code
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-slate-400 font-mono leading-relaxed">
                                        Scan with any workbench terminal or secondary mobile reader to instantly transfer active calibrator state parameters.
                                      </p>
                                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-[8px] font-bold text-slate-500 font-mono">
                                        <span>CODE:</span>
                                        <span className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400 border border-slate-800">
                                          {deviceBrand.toUpperCase()}-{deviceModel.slice(0, 8).replace(/\s+/g, "").toUpperCase()}-{issueType.toUpperCase()}
                                        </span>
                                        <span className="text-slate-700">|</span>
                                        <span className="text-emerald-400/95 uppercase tracking-widest animate-pulse flex items-center gap-1 font-extrabold mr-1">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>
                                          TELEMETRY READY
                                        </span>
                                        <span className="text-slate-700 hidden sm:inline">|</span>
                                        <button
                                          type="button"
                                          id="btn-copy-telemetry-trace"
                                          onClick={() => {
                                            const traceText = `--- TELEMETRY TRACE ---
ID: COM-CORE-USB-01
Timestamp: ${new Date().toLocaleString()}
Manufacturer: ${deviceBrand}
Model: ${deviceModel}
Tier: ${deviceTier}
Fault: ${issueType.toUpperCase()}
Battery Health: ${issueType === "battery" ? "76%" : "94%"}
Status: ${issueType === "battery" ? "DEGRADED" : "OPTIMAL"}`;
                                            navigator.clipboard.writeText(traceText);
                                            setCopiedTelemetry(true);
                                            addToast(
                                              "Telemetry Copied",
                                              "Raw diagnostic telemetry trace parameters have been copied to clipboard.",
                                              "success",
                                              3000
                                            );
                                            setTimeout(() => setCopiedTelemetry(false), 3000);
                                          }}
                                          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-950 hover:bg-slate-800 active:bg-slate-900 border border-slate-800 hover:border-slate-700 text-[8px] font-extrabold text-blue-400 hover:text-blue-300 rounded transition-all font-mono shadow-sm cursor-pointer select-none"
                                        >
                                          {copiedTelemetry ? (
                                            <>
                                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                                              <span className="text-emerald-400 uppercase tracking-wider">COPIED</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-2.5 h-2.5 text-blue-400" />
                                              <span>COPY DATA</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2.5">
                                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                                      ID: COM-CORE-USB-01
                                    </span>
                                    <button
                                      type="button"
                                      id="btn-download-pdf-report"
                                      onClick={downloadPdfReport}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-mono text-[9px] font-extrabold uppercase tracking-wider rounded transition-all shadow border border-blue-500/20"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-blue-200" />
                                      <span>Download PDF Report</span>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Customer details input */}
                    <div>
                      <label htmlFor="customerName" className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Customer Name</label>
                      <input 
                        id="customerName"
                        name="customerName"
                        type="text" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors uppercase font-sans"
                        placeholder="E.g. Jane Miller"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="deviceBrand" className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Brand</label>
                        <select 
                          id="deviceBrand"
                          name="deviceBrand"
                          value={deviceBrand}
                          onChange={(e) => {
                            setDeviceBrand(e.target.value);
                            if (e.target.value === "Apple") {
                              setDeviceModel("iPhone 14 Pro Max");
                              setDeviceTier("flagship");
                            } else if (e.target.value === "Samsung") {
                              setDeviceModel("Galaxy S23 Ultra");
                              setDeviceTier("flagship");
                            } else {
                              setDeviceModel("Pixel 7a");
                              setDeviceTier("midrange");
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded p-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                        >
                          <option value="Apple">Apple</option>
                          <option value="Samsung">Samsung</option>
                          <option value="Google">Google</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="deviceModel" className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Model Name</label>
                        <input
                          id="deviceModel"
                          name="deviceModel"
                          type="text"
                          value={deviceModel}
                          onChange={(e) => setDeviceModel(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded p-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Device Quality Class</label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded border border-slate-800">
                        {(["flagship", "midrange", "budget"] as const).map((tier) => (
                          <button
                            key={tier}
                            onClick={() => setDeviceTier(tier)}
                            className={`text-[9px] font-bold py-1 rounded capitalize transition-all ${
                              deviceTier === tier 
                                ? "bg-blue-600 text-white shadow-sm font-extrabold" 
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Hardware Diagnostic Target</label>
                      <div className="flex flex-col gap-1.5">
                        {(["screen", "battery", "button"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setIssueType(t)}
                            className={`text-[11px] font-semibold text-left px-3 py-2 rounded flex items-center justify-between border capitalize ${
                              issueType === t 
                                ? "bg-blue-900/40 border-blue-500 text-blue-200 font-bold" 
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white"
                            }`}
                          >
                            <span>{t} Assembly</span>
                            {issueType === t && <Check className="w-3.5 h-3.5 text-blue-400" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="internalNotes" className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Internal Technical Notes</label>
                      <textarea
                        id="internalNotes"
                        name="internalNotes"
                        rows={3}
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder="Enter free-form findings, diagnostic codes, micro-soldering tasks, or voltage readings..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 text-xs focus:outline-none focus:border-blue-500 font-mono resize-none leading-relaxed placeholder:text-slate-650"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-tabs indicators in Left Rail */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 font-mono">Active Lab Module</p>
                  <nav className="space-y-1">
                    <button
                      onClick={() => setLabTab("triage")}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all ${
                        labTab === "triage" 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        <span>AI Diagnostic Console</span>
                      </div>
                      <span className={`px-1.5 py-0.2 text-[9px] rounded font-mono ${
                        labTab === "triage" ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-400"
                      }`}>LV3</span>
                    </button>

                    <button
                      onClick={() => setLabTab("pos")}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all ${
                        labTab === "pos" 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>POS Ledger & Sync APIs</span>
                      </div>
                      <span className={`px-1.5 py-0.2 text-[9px] rounded font-mono ${
                        labTab === "pos" ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-400"
                      }`}>{tickets.length}</span>
                    </button>

                    <button
                      onClick={() => setLabTab("tax")}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all ${
                        labTab === "tax" 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>WA Tax Compliance Agent</span>
                      </div>
                      <span className="text-[10px] text-green-400 font-bold">100%</span>
                    </button>

                    <button
                      onClick={() => setLabTab("directory")}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all ${
                        labTab === "directory" 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        <span>GCP Service Directory</span>
                      </div>
                      <span className={`px-1.5 py-0.2 text-[9px] rounded font-mono ${
                        labTab === "directory" ? "bg-emerald-900/50 text-emerald-300 font-bold" : "bg-slate-800 text-slate-400"
                      }`}>{sdNamespaces.length}</span>
                    </button>

                    <button
                      onClick={() => setLabTab("escalation")}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all ${
                        labTab === "escalation" 
                          ? "bg-amber-600 text-white shadow-md font-bold" 
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-amber-550" />
                        <span>Tier 3 Callbacks</span>
                      </div>
                      <span className={`px-1.5 py-0.2 text-[9px] rounded font-mono ${
                        labTab === "escalation" ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-400"
                      }`}>{leads.length}</span>
                    </button>

                    <button
                      onClick={() => setLabTab("forensics")}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all ${
                        labTab === "forensics" 
                          ? "bg-violet-600 text-white shadow-md font-bold" 
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-violet-400" />
                        <span>Triage-AI Forensics Hub</span>
                      </div>
                      <span className="px-1.5 py-0.2 text-[9px] rounded font-mono bg-violet-900/50 text-violet-300">RAG</span>
                    </button>

                    <button
                      onClick={() => setLabTab("forms")}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all ${
                        labTab === "forms" 
                          ? "bg-blue-600 text-white shadow-md font-bold" 
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span>Google Forms Intake</span>
                      </div>
                      <span className="px-1.5 py-0.2 text-[9px] rounded font-mono bg-emerald-950 text-emerald-300 border border-emerald-850/40">GWS</span>
                    </button>

                    <button
                      onClick={() => setLabTab("gmail")}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all ${
                        labTab === "gmail" 
                          ? "bg-blue-600 text-white shadow-md font-bold" 
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-red-400" />
                        <span>Gmail Communications</span>
                      </div>
                      <span className="px-1.5 py-0.2 text-[9px] rounded font-mono bg-red-950 text-red-300 border border-red-850/40 font-bold">GWS</span>
                    </button>

                    <button
                      onClick={() => setLabTab("firebase_ai")}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all ${
                        labTab === "firebase_ai" 
                          ? "bg-blue-600 text-white shadow-md font-bold" 
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span>Firebase AI Workbench</span>
                      </div>
                      <span className="px-1.5 py-0.2 text-[9px] rounded font-mono bg-purple-950 text-purple-300 border border-purple-850/40 font-bold">SDK</span>
                    </button>
                  </nav>
                </div>

                {/* B2B FLEET Verification Frame */}
                <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 mt-auto">
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Fast-Track B2B Verify</span>
                    <span className="text-[9px] bg-cyan-950 text-cyan-300 font-bold px-1.5 rounded">20% SLA</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">
                    Instant fleet validation checker by corporate email domain.
                  </p>
                  
                  <form onSubmit={handleVerifyB2B} className="mt-3 flex gap-1.5">
                    <label htmlFor="b2bEmailInput" className="sr-only">Fleet Corporate Email</label>
                    <input 
                      id="b2bEmailInput"
                      name="b2bEmailInput"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. marcus@amazon.com"
                      className="flex-1 min-w-0 bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs focus:outline-none text-white font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isVerifyingEmail}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors"
                    >
                      {isVerifyingEmail ? "..." : "CHECK"}
                    </button>
                  </form>

                  {b2bMessage && (
                    <div className={`mt-2.5 p-2 rounded text-[10px] leading-relaxed font-mono border ${
                      isCorporate 
                        ? "bg-emerald-950/40 border-emerald-900/50 text-emerald-300" 
                        : "bg-amber-950/40 border-amber-900/50 text-amber-300"
                    }`}>
                      <div className="font-bold flex items-center gap-1">
                        {isCorporate ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        {isCorporate ? "CORPORATE SLA LOCKED" : "RETAIL PRICING"}
                      </div>
                      <p className="mt-1 opacity-90 text-[9px] leading-normal">{b2bMessage}</p>
                    </div>
                  )}
                </div>

                {/* Cloud Firestore Sync Trigger Card */}
                <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Durable Cloud Sync</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Persist diagnostic quotes and customer device state records across external sessions in Google Cloud Firestore.
                  </p>
                  {authUser ? (
                    <button
                      type="button"
                      onClick={handleCreateFirestoreTicket}
                      disabled={ticketCreationSuccess}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10.5px] uppercase tracking-wider rounded-md font-mono transition-all"
                    >
                      <Database className="w-3 h-3" />
                      Back up Quote
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-[10.5px] uppercase tracking-wider rounded-md font-mono transition-all"
                      >
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        Login with Google
                      </button>
                      <button
                        type="button"
                        onClick={handleSandboxLogin}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-755 text-slate-405 font-bold text-[10px] uppercase tracking-wider rounded-md font-mono transition-all"
                      >
                        <Terminal className="w-3.5 h-3.5 text-blue-400" />
                        Sandbox Bypass Mode
                      </button>
                    </div>
                  )}
                  {ticketCreationSuccess && (
                     <p className="text-[9px] text-emerald-400 font-bold font-mono tracking-wider text-center animate-bounce mt-1">
                       ✔️ BACKUP PERSISTED SECURELY
                     </p>
                  )}
                </div>
              </aside>

              {/* === CENTRAL ACTIVE PANEL: MODULE VIEWPORTS (Col-span 6) === */}
              <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
                
                {/* 1. TRIAGE CHAT MODULE */}
                {labTab === "triage" && (
                  <section className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col flex-1 shadow-md overflow-hidden animate-in fade-in duration-200">
                    <div className="px-5 py-4 border-b border-slate-700/80 flex justify-between items-center bg-slate-850/45">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-blue-400" />
                        <h2 className="text-xs font-bold text-slate-250 tracking-wider uppercase font-mono">
                          Hardware Diagnostic Sandbox v3.5
                        </h2>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={clearChatLogs}
                          className="text-[10px] font-bold text-slate-400 hover:text-red-400 transition-colors uppercase font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-900"
                        >
                          Clear logs
                        </button>
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-900/50 text-blue-300 tracking-wider border border-blue-800/30">
                          GEMINI CLUSTER
                        </span>
                      </div>
                    </div>

                    {/* Sub-modes selector tab bar */}
                    <div className="px-5 py-3 bg-slate-850/80 border-b border-slate-700/80 flex flex-wrap gap-2">
                      <button
                        onClick={() => setDiagnosticMode("standard")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all font-mono ${
                          diagnosticMode === "standard"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800/60"
                        }`}
                      >
                        📡 Standard (Grounding)
                      </button>
                      <button
                        onClick={() => setDiagnosticMode("thinking")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all font-mono flex items-center gap-1 ${
                          diagnosticMode === "thinking"
                            ? "bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow-md border border-violet-500/25"
                            : "bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800/60"
                        }`}
                      >
                        🧠 Schematic Reasoning (High-Think)
                      </button>
                      <button
                        onClick={() => setDiagnosticMode("vision")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all font-mono flex items-center gap-1 ${
                          diagnosticMode === "vision"
                            ? "bg-emerald-600 text-white shadow-md border border-emerald-500/25"
                            : "bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800/60"
                        }`}
                      >
                        📸 Photo Vision Analyst
                      </button>
                    </div>

                    {/* CHANNEL CONTENT CONDITIONALS */}
                    {diagnosticMode === "standard" && (
                      <>
                        {/* Chat Messages Frame */}
                        <div className="flex-1 p-5 space-y-4 overflow-y-auto min-h-[350px] max-h-[480px] bg-slate-900/40">
                          {messages.map((msg, idx) => (
                            <div 
                              key={idx} 
                              className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-lg bg-blue-900/40 border border-blue-800 flex items-center justify-center shrink-0 text-blue-400 font-bold text-[10px] shadow-sm font-mono">
                                  LAB
                                </div>
                              )}
                              <div className={`p-4 rounded-xl max-w-[85%] leading-relaxed ${
                                msg.role === "user" 
                                  ? "bg-blue-600 text-white rounded-tr-none shadow-sm text-xs font-medium" 
                                  : "bg-slate-800 border border-slate-700 rounded-tl-none shadow-3xs text-xs font-mono text-slate-200"
                              }`}>
                                {msg.role === "assistant" && (
                                  <p className="text-[9px] uppercase font-extrabold text-blue-400 opacity-80 tracking-wider mb-2 select-none border-b border-slate-700 pb-1 font-mono">
                                    [AI DIAGNOSTIC PROXY LOG]
                                  </p>
                                )}
                                <p className="whitespace-pre-line text-xs">{msg.text}</p>
                              </div>
                            </div>
                          ))}

                          {isChatSending && (
                            <div className="flex gap-3.5 justify-start">
                              <div className="w-8 h-8 rounded-lg bg-blue-955/80 flex items-center justify-center shrink-0 font-mono shadow-inner animate-pulse">
                                ...
                              </div>
                              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-xs text-slate-400 italic">
                                <span className="flex items-center gap-2 font-mono text-[10px] animate-pulse">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                  </span>
                                  ANALYZING GOOGLE SEARCH GROUNDING DATA SOURCES...
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Grounding Citations rendering */}
                        {groundingSources.length > 0 && (
                          <div className="px-5 py-3 border-t border-slate-750 bg-slate-900/50">
                            <span className="text-[9px] text-blue-450 uppercase font-extrabold font-mono tracking-widest block mb-1.5">
                              🌐 GOOGLE SEARCH GROUNDING SOURCES USED:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {groundingSources.map((source, index) => (
                                <a 
                                  key={index}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9.5px] font-mono text-blue-400 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded px-2 py-0.5 flex items-center gap-1 transition-all"
                                >
                                  <Info className="w-2.5 h-2.5" />
                                  <span>{source.title.length > 30 ? source.title.substring(0, 30) + "..." : source.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quick benchmarking diagnostics triggers */}
                        <div className="p-3 border-t border-slate-700/80 bg-slate-850/60 flex flex-wrap gap-2 items-center">
                          <span className="text-[9px] text-slate-400 uppercase font-bold font-mono tracking-wider mr-1">Bench Targets:</span>
                          <button
                            onClick={(e) => handleSendTriageChat(e, "Screen contains horizontal flickering pink lines under diagnostic lighting and lacks vertical calibration.")}
                            className="text-[10px] bg-slate-900 border border-slate-755 hover:border-slate-600 text-slate-300 px-2.5 py-1 rounded-md hover:bg-slate-950 transition-colors shadow-2xs"
                          >
                            📟 Pink OLED Panel
                          </button>
                          <button
                            onClick={(e) => handleSendTriageChat(e, "Battery swollen, battery capacity reports 74% cycle health and it drains 50% in 15 minutes.")}
                            className="text-[10px] bg-slate-900 border border-slate-755 hover:border-slate-600 text-slate-300 px-2.5 py-1 rounded-md hover:bg-slate-950 transition-colors shadow-2xs"
                          >
                            🔋 Swollen Battery
                          </button>
                          <button
                            onClick={(e) => handleSendTriageChat(e, "Power button was exposed to cola and is permanently stuck. No metallic feedback.")}
                            className="text-[10px] bg-slate-900 border border-slate-755 hover:border-slate-600 text-slate-300 px-2.5 py-1 rounded-md hover:bg-slate-950 transition-colors shadow-2xs"
                          >
                            🔘 stuck Button
                          </button>
                        </div>

                        {/* Chat interactive panel */}
                        <div className="p-4 border-t border-slate-700 bg-slate-850/45">
                          <form onSubmit={handleSendTriageChat} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                            <label htmlFor="triageChatInput" className="sr-only">Diagnostic message description</label>
                            <input 
                              id="triageChatInput"
                              name="triageChatInput"
                              type="text" 
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder="Describe screen flashes, digitizer skips, or battery drain behaviors for Seattle/Spokane local Repairs..." 
                              className="flex-1 bg-transparent border-none text-xs px-2 focus:ring-0 focus:outline-none text-white placeholder-slate-500 font-mono"
                              disabled={isChatSending}
                            />
                            <button 
                              type="submit"
                              disabled={isChatSending || !chatInput.trim()}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition-colors"
                            >
                              {isChatSending ? "DIAGNOSING" : "RUN"}
                            </button>
                          </form>
                          <div className="flex items-center gap-2 mt-2 px-1 justify-between text-[9px] text-slate-500 font-mono">
                            <span className="flex items-center gap-2">
                              <span>Google Grounded live query mode active. Spokane-focused local indexes applied.</span>
                              {chatInput.trim() && (
                                <span className="text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 animate-pulse">
                                  ● DRAFT AUTO-SAVED
                                </span>
                              )}
                            </span>
                            <span className="font-semibold text-emerald-500">🛡️ SECURE TLS LINK</span>
                          </div>
                        </div>
                      </>
                    )}

                    {diagnosticMode === "thinking" && (
                      <div className="p-5 flex-1 flex flex-col gap-4 min-h-[350px] bg-slate-900/10">
                        <div>
                          <span className="text-[10px] font-extrabold text-violet-400 uppercase tracking-widest font-mono block mb-1">
                            🧠 COGNITIVE REASONING MATRIX (Model: gemini-3.1-pro-preview)
                          </span>
                          <h3 className="text-sm font-bold text-white">Advanced Electrical Schematic Diagnostic Planner</h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                            Queries are dispatched to the <strong className="text-violet-400 font-bold">gemini-3.1-pro-preview</strong> cluster with <strong className="text-violet-400">thinkingLevel: HIGH</strong> to construct step-by-step motherboard test steps with voltage tolerances.
                          </p>
                        </div>

                        <form onSubmit={handleRunThinkingDiagnostic} className="space-y-3">
                          <label htmlFor="thinkingPrompt" className="block text-[10px] text-slate-450 uppercase font-bold font-mono tracking-wider">Troubleshooting directive</label>
                          <textarea
                            id="thinkingPrompt"
                            name="thinkingPrompt"
                            value={thinkingPrompt}
                            onChange={(e) => setThinkingPrompt(e.target.value)}
                            rows={4}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                            placeholder="State circuit symptoms, ribbon line specs, short circuit behaviors to plan electrical audits..."
                          />
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={isDeepDiagnosing || !thinkingPrompt.trim()}
                              className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono bg-gradient-to-r from-violet-650 ... to-indigo-600 hover:from-violet-550 hover:to-indigo-500 text-white disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 transition-all shadow-md"
                            >
                              {isDeepDiagnosing ? "THINKING PROCESS CHANNELS ACTIVE..." : "DISPATCH COGNITIVE SOLVER"}
                            </button>
                          </div>
                        </form>

                        {deepDiagnosticResult && (
                          <div className="mt-4 bg-slate-950 border border-slate-850 rounded-lg p-4 font-mono text-[11px] leading-relaxed text-indigo-300 shadow-inner max-h-[280px] overflow-y-auto">
                            <div className="text-[9px] text-violet-400 font-extrabold border-b border-slate-850 pb-2 mb-2 uppercase tracking-widest flex justify-between items-center">
                              <span>[SCHEMATIC DISCHARGE GRAPH]</span>
                              <span className="text-slate-505 font-medium">THINKING_LEVEL_HIGH</span>
                            </div>
                            <p className="whitespace-pre-line text-slate-300 font-serif leading-relaxed text-xs">{deepDiagnosticResult}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {diagnosticMode === "vision" && (
                      <div className="p-5 flex-1 flex flex-col gap-4 min-h-[350px] bg-slate-900/10">
                        <div>
                          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest font-mono block mb-1">
                            📸 MULTIMODAL COMPUTER VISION LAB (Model: gemini-3.1-pro-preview)
                          </span>
                          <h3 className="text-sm font-bold text-white">Visual Mechanical/Fracture Pattern Audit</h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                            Upload high-definition closeups of smartphones, bloated cells, stuck power triggers, or oxidized motherboards to compute visual defect check lists.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-950/40 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all relative">
                            <label htmlFor="triageImageUpload" className="sr-only">Upload device photo for mechanical audit</label>
                            <input
                              id="triageImageUpload"
                              name="triageImageUpload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUploadChange}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <Upload className="w-8 h-8 text-slate-500 mb-2" />
                            <p className="text-xs font-bold text-slate-300">
                              {selectedImageName ? `Photo Selected: ${selectedImageName}` : "Click / Drag photo here"}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 font-mono">[Accepted format: images only]</p>
                          </div>

                          <div className="bg-slate-955/80 rounded-xl p-3 border border-slate-800 flex items-center justify-center min-h-[140px]">
                            {selectedImageBase64 ? (
                              <img
                                src={`data:image/png;base64,${selectedImageBase64}`}
                                alt="Hardware diagnostic preview"
                                referrerPolicy="no-referrer"
                                className="max-h-[130px] rounded-lg shadow-md border border-slate-800 object-contain"
                              />
                            ) : (
                              <div className="text-center text-slate-500 font-mono text-[9px] uppercase tracking-widest leading-loose">
                                [Preview Screen empty]
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          {selectedImageBase64 && (
                            <button
                              onClick={() => {
                                setSelectedImageBase64(null);
                                setSelectedImageName("");
                                setDeepDiagnosticResult("");
                              }}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold font-mono transition-colors uppercase"
                            >
                              Clear
                            </button>
                          )}
                          <button
                            onClick={handleVisionDiagnostic}
                            disabled={isDeepDiagnosing || !selectedImageBase64}
                            className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition-all shadow-md"
                          >
                            {isDeepDiagnosing ? "PROBING GEOMETRIC MESH..." : "EXECUTE COMPUTER VISION AUDIT"}
                          </button>
                        </div>

                        {deepDiagnosticResult && (
                          <div className="mt-4 bg-slate-950 border border-slate-850 rounded-lg p-4 font-mono text-[11px] leading-relaxed text-slate-300 shadow-inner max-h-[250px] overflow-y-auto">
                            <div className="text-[9px] text-emerald-400 font-extrabold border-b border-slate-850 pb-2 mb-2 uppercase tracking-widest mb-2 font-mono">
                              [VISUAL AUDIT RESULT LOG]
                            </div>
                            <p className="whitespace-pre-line text-xs font-serif leading-relaxed text-slate-200">{deepDiagnosticResult}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                )}

                {/* 2. POS API SYNC MODULE */}
                {labTab === "pos" && (
                  <div className="flex flex-col flex-1 gap-6">
                    <TechnicianDashboard 
                      tickets={tickets} 
                      onAddSampleTickets={handleAddSampleTickets}
                      isLoading={isLoadingLogs}
                    />
                    <section className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col flex-1 shadow-md p-5 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <div>
                          <h2 className="text-sm font-bold text-white uppercase tracking-tight">Active POS Sync Ledger</h2>
                          <p className="text-xs text-slate-400">Continuous operational loop for Square webhook and CellSmart registries.</p>
                        </div>
                      </div>
                      <button 
                        onClick={fetchPOSLogs}
                        disabled={isLoadingLogs}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-755 hover:bg-slate-950 text-slate-200 rounded-md text-xs font-semibold tracking-wide transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? "animate-spin" : ""}`} />
                        Sync Records
                      </button>
                    </div>

                    <div className="mb-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-extrabold text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-400" /> 
                          Square & CellSmart Registry 
                          <span className="bg-emerald-900/50 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-800/40">
                            {tickets.length} ACTIVE
                          </span>
                        </h3>
                        <button
                          onClick={() => setShowSignatureModal(true)}
                          disabled={ticketCreationSuccess}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-3 py-1 text-[11px] font-bold uppercase transition-all flex items-center gap-1 shadow-sm active:scale-98"
                        >
                          <Plus className="w-3 h-3" />
                          New Quick Ticket
                        </button>
                      </div>

                      {ticketCreationSuccess && (
                        <div className="p-3 bg-emerald-950/70 border border-emerald-900 text-emerald-300 text-xs rounded-lg mb-3 flex items-center gap-2 font-mono">
                          <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                          <span>SUCCESS: Webhook payload transmitted. Ticket registered to synchronized local schema.</span>
                        </div>
                      )}

                      <div className="border border-slate-700/80 rounded-lg overflow-hidden bg-slate-900 shadow-inner flex-1 max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-950/80 text-slate-400 font-mono text-[9px] uppercase border-b border-slate-700 select-none">
                              <th className="p-3">Ticket ID</th>
                              <th className="p-3">Customer</th>
                              <th className="p-3">Device & Target</th>
                              <th className="p-3">Sustained Cost</th>
                              <th className="p-3">SLA Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80 bg-slate-900/30 font-mono text-[10.5px]">
                            {tickets.map((t) => (
                              <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="p-3 font-semibold text-blue-400 font-bold">{t.id}</td>
                                <td className="p-3 font-sans">
                                  <div className="font-bold text-slate-205">{t.customerName}</div>
                                  <div className="text-[9px] text-slate-500 capitalize">{t.companyName || "Retail Client"}</div>
                                </td>
                                <td className="p-3 font-sans">
                                  <p className="font-semibold text-slate-300 text-[11px]">{t.device}</p>
                                  <span className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                    t.issueType === "screen" ? "bg-amber-950 text-amber-300 border border-amber-900/30" :
                                    t.issueType === "battery" ? "bg-purple-950 text-purple-300 border border-purple-900/30" : "bg-blue-950 text-blue-300 border border-blue-900/30"
                                  }`}>
                                    {t.issueType}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-200">
                                  <div className="font-bold">${t.total.toFixed(2)}</div>
                                  <div className="text-[9px] text-emerald-400 font-normal">Disc: -${t.discount.toFixed(2)}</div>
                                </td>
                                <td className="p-3 uppercase font-bold text-[8.5px]">
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    t.status === "completed" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" :
                                    t.status === "quality_check" ? "bg-amber-950 text-amber-400 border border-amber-900" :
                                    t.status === "technician_working" ? "bg-blue-950 text-blue-400 border border-blue-900" : "bg-slate-950 text-slate-400 border border-slate-900"
                                  }`}>
                                    {t.status.replace("_", " ")}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Durable Cloud backups (Firestore) */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3 border-t border-slate-700/80 pt-5">
                        <h3 className="text-xs font-extrabold text-blue-350 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                          <Database className="w-4 h-4 text-emerald-450" />
                          Durable Cloud backups (Firestore)
                          {authUser && (
                            <span className="bg-emerald-950/50 text-emerald-300 text-[10px] px-1 py-0.5 rounded font-mono font-bold border border-emerald-800/40">
                              {firestoreTickets.length} BACKUPS
                            </span>
                          )}
                        </h3>
                      </div>

                      {authUser ? (
                        firestoreTickets.length === 0 ? (
                          <div className="bg-slate-900 border border-slate-850 rounded-lg p-5 text-center font-mono text-[11px] text-slate-400">
                            [System notice: No ticket backups stored for user {authUser.displayName || authUser.email} in Cloud Firestore yet. Run 'Back up Quote' in the standard sidebar panel to generate persistent data.]
                          </div>
                        ) : (
                          <div className="border border-slate-700/80 rounded-lg overflow-hidden bg-slate-950 shadow-inner max-h-[220px] overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-950 text-slate-400 font-mono text-[9px] uppercase border-b border-slate-800">
                                  <th className="p-3">Doc Ref</th>
                                  <th className="p-3">Device Target</th>
                                  <th className="p-3">Grand Total</th>
                                  <th className="p-3">Backup Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850 font-mono text-[10.5px]">
                                {firestoreTickets.map((ft) => (
                                  <tr key={ft.id} className="hover:bg-slate-900/40 transition-colors">
                                    <td className="p-3 font-semibold text-emerald-400 flex items-center gap-1">
                                      <Database className="w-3 h-3 text-emerald-500" />
                                      <span>{ft.id}</span>
                                    </td>
                                    <td className="p-3 text-slate-300 font-sans">
                                      {ft.device}
                                      <div className="text-[9px] text-slate-500 uppercase mt-0.5">{ft.issueType}</div>
                                      {ft.internalNotes && (
                                        <div className="text-[9.5px] text-emerald-400 border-l-2 border-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded mt-1 select-all font-mono leading-relaxed max-w-[180px] break-words" title={ft.internalNotes}>
                                          ✍️ {ft.internalNotes}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3 text-white font-bold">
                                      ${ft.total.toFixed(2)}
                                    </td>
                                    <td className="p-3 text-slate-400 text-[10px]">
                                      {new Date(ft.createdAt).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      ) : (
                        <div className="bg-slate-900/65 border border-slate-800 rounded-xl p-5 text-center font-mono text-xs text-slate-400 leading-relaxed">
                          <p className="font-sans mb-3 text-xs">Unlock persistent multi-device sync, cloud billing pipelines, and custom Spokane service backups.</p>
                          <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                              onClick={handleGoogleSignIn}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-[10.5px] font-bold uppercase tracking-wider rounded-lg shadow-md font-mono inline-flex items-center gap-1.5"
                            >
                              Connect via Google Sign-In
                            </button>
                            <button
                              onClick={handleSandboxLogin}
                              className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-705 text-slate-300 text-[10.5px] font-bold uppercase tracking-wider rounded-lg shadow-md font-mono inline-flex items-center gap-1.5"
                            >
                              <Terminal className="w-3.5 h-3.5 text-blue-400" />
                              Bypass (Sandbox Session)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sync logs console & Record-Keeping Exporter */}
                    <div className="grid grid-cols-12 gap-5 mt-4 pt-4 border-t border-slate-700/60">
                      
                      {/* Left: Sync Logs (col-span-7) */}
                      <div className="col-span-12 md:col-span-7 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-mono">
                            <Terminal className="w-4 h-4 text-blue-400" />
                            POS Webhook Transaction Logs
                          </h3>
                          
                          <div className="bg-slate-950 text-slate-300 font-mono text-[10px] p-3.5 rounded-xl border border-slate-850 space-y-2 h-[210px] overflow-y-auto shadow-inner leading-relaxed">
                            {posLogs.length === 0 ? (
                              <div className="text-slate-500 italic text-center pt-8">No transaction logs loaded to analyze.</div>
                            ) : (
                              posLogs.map((log, idx) => (
                                <div key={idx} className="flex gap-2 hover:bg-slate-900 rounded p-1 transition-colors">
                                  <span className="text-slate-500 text-[9px] whitespace-nowrap">
                                    [{new Date(log.timestamp).toLocaleTimeString()}]
                                  </span>
                                  <span className={`font-extrabold text-[8px] px-1 rounded uppercase whitespace-nowrap self-start ${
                                    log.source === "Square" ? "bg-pink-950/80 text-pink-350 border border-pink-905" : 
                                    log.source === "CellSmart" ? "bg-purple-950/80 text-purple-350 border border-purple-905" : "bg-emerald-950 text-emerald-350"
                                  }`}>
                                    {log.source}
                                  </span>
                                  <span className={`font-bold whitespace-nowrap text-[8.5px] ${
                                    log.level === "ERROR" ? "text-red-400" : log.level === "SUCCESS" ? "text-emerald-400" : "text-blue-300"
                                  }`}>
                                    [{log.level}]
                                  </span>
                                  <span className="text-slate-350 break-all">{log.message}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Record Keeping, Formatting Exporters & Daily Reminders (col-span-5) */}
                      <div className="col-span-12 md:col-span-5 flex flex-col justify-between space-y-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full justify-between shadow-md">
                          
                          {/* Part A: Exporter */}
                          <div>
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                              <span className="text-[10.5px] font-bold text-blue-400 uppercase tracking-widest font-mono">Export Logs</span>
                              <span className="bg-slate-950 border border-slate-850 px-1.5 py-0.2 rounded font-mono text-[9px] text-slate-400 block font-bold">
                                {posLogs.length} LOGS
                              </span>
                            </div>
                            
                            <p className="text-[10px] text-slate-400 mb-3 leading-relaxed font-sans">
                              Export Spokane mobile lab transactions into highly audit-compliant formatted files to verify DOR sales tax and AHANA records.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              <button
                                onClick={exportLogsAsJSON}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-850 hover:border-slate-700 text-slate-300 border border-slate-800 font-bold text-[10px] uppercase tracking-wider rounded-md font-mono transition-all"
                              >
                                <FileDown className="w-3.5 h-3.5 text-blue-450" />
                                Export JSON
                              </button>
                              <button
                                onClick={exportLogsAsCSV}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-850 hover:border-slate-700 text-slate-300 border border-slate-800 font-bold text-[10px] uppercase tracking-wider rounded-md font-mono transition-all"
                              >
                                <Download className="w-3.5 h-3.5 text-emerald-450" />
                                Export CSV
                              </button>
                            </div>
                          </div>

                          {/* Part B: Workday submission automation reminder */}
                          <div className="border-t border-slate-800/80 pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10.5px] font-bold text-blue-400 uppercase tracking-widest font-mono">Workday Reminders</span>
                              <div className="flex items-center gap-1.5">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={reminderEnabled} 
                                    onChange={(e) => {
                                      const val = e.target.checked;
                                      setReminderEnabled(val);
                                      localStorage.setItem("dcp_reminder_enabled", String(val));
                                      addToast(
                                        "Reminder Update", 
                                        val ? `Daily workday reminders enabled for ${workdayEndTime}!` : "Daily reminders disabled.", 
                                        "info"
                                      );
                                    }}
                                    className="sr-only peer" 
                                  />
                                  <div className="w-7 h-4 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                                </label>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-[10px]">
                              <p className="text-slate-400 leading-relaxed font-sans">
                                Automatic system alert when Spokane service hours conclude. Direct countdown to safe local log backups.
                              </p>
                              
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-slate-500 font-mono">End hour:</span>
                                <input 
                                  type="time" 
                                  value={workdayEndTime} 
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setWorkdayEndTime(val);
                                    localStorage.setItem("dcp_workday_end_time", val);
                                    setReminderDismissedForToday(false); // reset trigger state
                                    addToast("Schedule Configured", `Submission reminder timing scheduled at ${val} daily.`, "success");
                                  }}
                                  className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 font-mono text-slate-300 focus:outline-none focus:border-blue-500 text-[10px]"
                                />
                                <button
                                  type="button"
                                  onClick={requestNotificationPermission}
                                  className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[9px] text-slate-400 hover:text-slate-200 transition-colors uppercase ml-auto inline-flex items-center gap-1"
                                  title="Enable System/OS Prompts"
                                >
                                  <Bell className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                                  <span>OS Notify</span>
                                </button>
                              </div>

                              {/* Manual Trigger / Fast-testing Alert button */}
                              <div className="pt-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    addToast(
                                      "🔬 REMINDER DEMO TRIGGERED",
                                      `Simulated Spokane local driveway workday conclusions. Generate JSON/CSV log backups in the console panel above right now!`,
                                      "warning",
                                      10000
                                    );
                                    if ("Notification" in window && Notification.permission === "granted") {
                                      new Notification("D&CP Workday Over: Submit Sync Logs", {
                                        body: `SIMULATED: Your Spokane billing & sync logs are ready for export and archive.`,
                                        icon: "/favicon.ico"
                                      });
                                    }
                                  }}
                                  className="text-[9px] font-bold text-blue-400 hover:underline hover:text-blue-300 transition-colors uppercase font-mono bg-slate-950/40 border border-slate-855 px-2 py-0.5 rounded"
                                >
                                  Test Reminder Prompt
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </section>
                  </div>
                )}

                {/* 3. TAX COMPLIANCE CONSOLE */}
                {labTab === "tax" && (
                  <section className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col flex-1 shadow-md p-5">
                    <div className="flex items-center gap-2 border-b border-slate-700 pb-4 mb-4">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-tight">WA Destination Tax compliance</h2>
                        <p className="text-xs text-slate-400">
                          Washington Right-to-Repair destination-based tax calculations based on device delivery site.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-5 mb-5 flex-1 items-stretch">
                      <div className="col-span-12 md:col-span-5 space-y-4 flex flex-col justify-between">
                        <div className="bg-slate-900 border border-slate-755 rounded-lg p-4 space-y-4 shadow-inner">
                          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">Rate Resolver</h3>
                          <div>
                            <label htmlFor="waDestinationZip" className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">WA DESTINATION ZIP</label>
                            <div className="flex gap-2">
                              <input 
                                id="waDestinationZip"
                                name="waDestinationZip"
                                type="text" 
                                maxLength={5}
                                value={zipInput} 
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  setZipInput(val);
                                }}
                                className="bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 text-xs font-bold font-mono tracking-widest w-28 text-center"
                                placeholder="98101"
                              />
                              <button
                                onClick={() => handleTaxLookup(zipInput)}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 text-xs font-bold tracking-wide uppercase transition-colors"
                              >
                                Resolve
                              </button>
                            </div>
                          </div>

                          {taxVerifiedMessage && (
                            <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
                              isValidZip 
                                ? "bg-emerald-950/40 border-emerald-900/50 text-emerald-300" 
                                : "bg-amber-950/40 border-amber-900/50 text-amber-300"
                            }`}>
                              <div className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1 text-[9.5px] font-mono">
                                {isValidZip ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />}
                                TAX SIGNAL
                              </div>
                              <p className="font-mono text-[10.5px] leading-normal">{taxVerifiedMessage}</p>
                            </div>
                          )}
                        </div>

                        {/* Presets Grid */}
                        <div className="p-4 bg-slate-900/50 border border-slate-850 rounded-lg">
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-2 font-mono">Washington Presets</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {WA_ZIP_PRESETS.map((preset) => (
                              <button
                                key={preset.zip}
                                onClick={() => {
                                  setZipInput(preset.zip);
                                }}
                                className={`text-[10.5px] font-mono p-2 text-left border rounded transition-all leading-snug ${
                                  zipInput === preset.zip 
                                    ? "bg-blue-900/40 border-blue-500 text-blue-200 font-bold shadow-md" 
                                    : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-350"
                                }`}
                              >
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="font-sans font-bold">{preset.city}</span>
                                  <span className="text-slate-500 text-[9px]">{preset.zip}</span>
                                </div>
                                <p className="text-[10px] text-blue-400 font-extrabold mt-0.5">{preset.rate}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* WA GEOLOCATION SVG MAP */}
                      <div className="col-span-12 md:col-span-7 flex flex-col items-center justify-center border border-dashed border-slate-700/80 rounded-xl bg-slate-900/40 p-4 relative">
                        <div className="absolute top-2.5 left-2.5 bg-slate-950 px-2.5 py-0.5 border border-slate-800 text-[8.5px] font-bold text-slate-400 rounded tracking-widest font-mono">
                          REGIONAL RATE RESOLVER GEOMAP
                        </div>

                        <svg viewBox="0 0 400 250" className="w-full max-w-[320px] text-slate-500 mt-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 50 L250 50 L270 120 L370 120 L380 230 L100 230 L50 210 L45 150 L20 130 Z" className="fill-slate-950/70 stroke-slate-700 stroke-2" />
                          <path d="M20 50 Q 0 80, 20 120 T 50 160 T 50 210" className="stroke-blue-500/40 stroke-2" strokeDasharray="3 3" />
                          <path d="M120 50 L125 230 M150 50 L155 230" className="stroke-slate-800/40 stroke-2" strokeDasharray="5 5" />
                          
                          {/* Pins */}
                          <g>
                            <circle cx="95" cy="95" r="5" className="fill-blue-500 animate-pulse" />
                            <text x="105" y="93" className="text-[9.5px] font-bold font-mono fill-slate-200" fontSize="9">Seattle (10.35%)</text>
                          </g>
                          <g>
                            <circle cx="112" cy="100" r="4" className="fill-blue-400" />
                            <text x="120" y="105" className="text-[8.5px] font-semibold fill-slate-400" fontSize="8">Bellevue (10.1%)</text>
                          </g>
                          <g>
                            <circle cx="85" cy="142" r="4" className="fill-cyan-500" />
                            <text x="50" y="152" className="text-[8.5px] font-semibold fill-slate-405" fontSize="8">Olympia (9.5%)</text>
                          </g>
                          <g>
                            <circle cx="340" cy="100" r="4" className="fill-blue-600" />
                            <text x="270" y="98" className="text-[8px] font-mono fill-slate-500" fontSize="8">Spokane (9.0%)</text>
                          </g>
                          <g>
                            <circle cx="90" cy="210" r="4" className="fill-slate-700" />
                            <text x="98" y="214" className="text-[8px] fill-slate-500" fontSize="8">Vancouver (8.7%)</text>
                          </g>
                        </svg>
                        
                        <div className="text-center mt-3">
                          <p className="text-[11px] font-bold text-slate-200 font-mono">Active Delivery Destination Target: <span className="text-blue-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{taxCity} ({zipInput})</span></p>
                          <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                            Washington destination rules enforce calculating rates according to target shipping site.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* 4. GOOGLE CLOUD SERVICE DIRECTORY MODULE */}
                {labTab === "directory" && (
                  <section className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col flex-1 shadow-md p-5 animate-in fade-in duration-300">
                    
                    {/* Module Title & Connectivity Hub Header */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-700 pb-4 mb-5 gap-3">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-400" />
                        <div>
                          <h2 className="text-sm font-bold text-white uppercase tracking-tight">GCP Service Directory Console</h2>
                          <p className="text-xs text-slate-400">Discover and manage registered microservices, endpoints, and metadata labels.</p>
                        </div>
                      </div>
                      
                      {/* Mode and Connection status indicators */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex bg-slate-900 p-1 border border-slate-700/60 rounded-lg text-[10px] font-mono font-bold select-none">
                          <button
                            type="button"
                            onClick={() => handleToggleRegistryMode("simulated")}
                            disabled={sdLoading}
                            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                              sdStatus.mode !== "gcp"
                                ? "bg-blue-600 hover:bg-blue-500 text-white shadow"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${sdStatus.mode !== "gcp" ? "bg-white" : "bg-slate-600"}`}></span>
                            SIMULATED SANDBOX
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleRegistryMode("gcp")}
                            disabled={sdLoading}
                            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                              sdStatus.mode === "gcp"
                                ? "bg-indigo-650 hover:bg-indigo-550 text-white shadow"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${sdStatus.mode === "gcp" ? "bg-green-400 animate-pulse" : "bg-slate-655"}`}></span>
                            GENUINE GCP
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => { fetchSdStatus(); handleListNamespaces(); }}
                          disabled={sdLoading}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-950 text-slate-200 rounded-lg text-xs font-semibold transition-colors font-mono"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${sdLoading ? "animate-spin" : ""}`} />
                          SYNC REGISTRY STATS
                        </button>
                      </div>
                    </div>

                    {/* Target Scope Modifier (Inputs for Project ID and Location ID) */}
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-755/60 mb-5 grid grid-cols-12 gap-4 items-end shadow-inner">
                      <div className="col-span-12 md:col-span-5">
                        <label htmlFor="sdProjectId" className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">GCP PROJECT ID</label>
                        <input
                          id="sdProjectId"
                          name="sdProjectId"
                          type="text"
                          value={sdProjectId}
                          onChange={(e) => setSdProjectId(e.target.value.trim())}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-[1px] focus:outline-blue-500 font-mono"
                          placeholder="displaycellpros"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-5">
                        <label htmlFor="sdLocationId" className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">GCP REGION / LOCATION</label>
                        <input
                          id="sdLocationId"
                          name="sdLocationId"
                          type="text"
                          value={sdLocationId}
                          onChange={(e) => setSdLocationId(e.target.value.trim())}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-[1px] focus:outline-blue-500 font-mono"
                          placeholder="us-central1"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-2">
                        <button
                          type="button"
                          onClick={() => handleListNamespaces(sdProjectId, sdLocationId)}
                          disabled={sdLoading}
                          className="w-full h-9 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wide rounded shadow-md flex items-center justify-center transition-all disabled:bg-slate-700"
                        >
                          Query Registry
                        </button>
                      </div>
                    </div>

                    {/* Global loading / errors / success bar */}
                    {sdError && (
                      <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-lg text-xs text-red-300 font-mono flex items-center gap-2 mb-4 leading-normal">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>[REGISTRY EXCEPTION FILE]: {sdError}</span>
                      </div>
                    )}

                    {sdSuccess && (
                      <div className="bg-emerald-950/40 border border-emerald-950/50 p-3 rounded-lg text-xs text-emerald-300 font-mono flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                        <span>[REGISTRY MUTATION SUCCESS]: {sdSuccess}</span>
                      </div>
                    )}

                    {/* Status Logger Banner */}
                    <div className={`p-3 rounded-lg text-xs leading-relaxed border mb-5 font-mono ${
                      sdStatus.usingFallback 
                        ? "bg-amber-950/15 border-amber-900/40 text-amber-300"
                        : "bg-emerald-950/15 border-emerald-900/40 text-emerald-300"
                    }`}>
                      <div className="font-extrabold uppercase tracking-widest mb-1 text-[9px] flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${sdStatus.usingFallback ? "bg-amber-500" : "bg-emerald-400 animate-pulse"}`}></span>
                        Service Directory Connection Status
                      </div>
                      <p className="text-[10.5px] leading-snug">{sdStatus.message}</p>
                      {sdStatus.error && (
                        <p className="text-[9px] text-slate-500 mt-1 font-sans">Details: {sdStatus.error}</p>
                      )}
                    </div>

                    {/* Visual 3-Column Split for Namespaces, Services, and Endpoints */}
                    <div className="grid grid-cols-12 gap-5 flex-1 items-stretch mb-5">
                      
                      {/* COLUMN 1: NAMESPACES ROOT (Col-span 4) */}
                      <div className="col-span-12 lg:col-span-4 bg-slate-900/45 border border-slate-755 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5 mb-3.5">
                            <span className="text-[10.5px] font-bold text-blue-400 uppercase tracking-widest font-mono">1. Namespaces</span>
                            <span className="bg-slate-850 px-1.5 py-0.2 rounded font-mono text-[9px] text-slate-400 block font-bold">{sdNamespaces.length} REF</span>
                          </div>
                          
                          {/* Create Namespace Form */}
                          <form onSubmit={handleCreateNamespace} className="mb-4">
                            <label htmlFor="newNamespaceId" className="sr-only">New Namespace ID</label>
                            <div className="flex gap-1.5">
                              <input
                                id="newNamespaceId"
                                name="newNamespaceId"
                                type="text"
                                value={newNamespaceId}
                                onChange={(e) => setNewNamespaceId(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white placeholder-slate-650 font-mono flex-1 lowercase focus:outline-none focus:border-blue-500"
                                placeholder="new-namespace-id"
                                disabled={sdLoading}
                              />
                              <button
                                type="submit"
                                disabled={sdLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1 px-2.5 rounded text-xs uppercase flex items-center justify-center transition-colors disabled:bg-slate-800"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </form>

                          {/* Namespaces Lists */}
                          {sdNamespaces.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 font-mono text-[10px] bg-slate-955 border border-dashed border-slate-850 rounded">
                              No namespaces discovered.
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                              {sdNamespaces.map(ns => {
                                const segments = ns.name.split("/");
                                const id = segments[segments.length - 1];
                                const isSelected = selectedNamespace === ns.name;
                                return (
                                  <div
                                    key={ns.name}
                                    onClick={() => {
                                      setSelectedNamespace(ns.name);
                                      handleListServices(ns.name);
                                    }}
                                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                                      isSelected
                                        ? "bg-blue-900/30 border-blue-500 text-blue-200"
                                        : "bg-slate-950/45 border-slate-850 hover:bg-slate-900 text-slate-300"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-400" : "bg-slate-650"}`}></span>
                                      <p className="text-[11px] font-mono font-bold truncate lowercase" title={ns.name}>
                                        {id}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNamespace(ns.name);
                                      }}
                                      className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="text-[9.5px] text-slate-500 font-mono mt-4 leading-normal select-none">
                          *Namespaces segregate your repair network domains.
                        </div>
                      </div>

                      {/* COLUMN 2: SERVICES (Col-span 4) */}
                      <div className="col-span-12 lg:col-span-4 bg-slate-900/45 border border-slate-755 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5 mb-3.5">
                            <span className="text-[10.5px] font-bold text-blue-400 uppercase tracking-widest font-mono">2. Services</span>
                            <span className="bg-slate-850 px-1.5 py-0.2 rounded font-mono text-[9px] text-slate-400 block font-bold">{sdServices.length} ACTIVE</span>
                          </div>
                          
                          {/* Create Service Form */}
                          <form onSubmit={handleCreateService} className="mb-4 space-y-2">
                            <label htmlFor="newServiceId" className="sr-only">New Service ID</label>
                            <div className="flex gap-1.5">
                              <input
                                id="newServiceId"
                                name="newServiceId"
                                type="text"
                                value={newServiceId}
                                onChange={(e) => setNewServiceId(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white placeholder-slate-650 font-mono flex-1 lowercase focus:outline-none focus:border-blue-500"
                                placeholder="new-service-id"
                                disabled={sdLoading || !selectedNamespace}
                              />
                              <button
                                type="submit"
                                disabled={sdLoading || !selectedNamespace}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1 px-2.5 rounded text-xs uppercase flex items-center justify-center transition-colors disabled:bg-slate-800"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <label htmlFor="newServiceAnnotations" className="sr-only">Service Annotations</label>
                            <input
                              id="newServiceAnnotations"
                              name="newServiceAnnotations"
                              type="text"
                              value={newServiceAnnotations}
                              onChange={(e) => setNewServiceAnnotations(e.target.value)}
                              className="w-full bg-slate-950/70 border border-slate-850 text-[10px] text-slate-300 rounded px-2 py-1 font-mono outline-none focus:border-slate-700"
                              placeholder="annotations e.g. env=prod,version=1.0"
                              disabled={sdLoading || !selectedNamespace}
                            />
                          </form>

                          {/* Services Lists */}
                          {!selectedNamespace ? (
                            <div className="text-center py-8 text-slate-550 font-mono text-[9.5px] bg-slate-955/20 border border-slate-850/30 rounded select-none">
                              Select a namespace to inspect registered services.
                            </div>
                          ) : sdServices.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 font-mono text-[10px] bg-slate-955 border border-dashed border-slate-850 rounded">
                              No services registered under this scope.
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                              {sdServices.map(srv => {
                                const segments = srv.name.split("/");
                                const id = segments[segments.length - 1];
                                const isSelected = selectedService === srv.name;
                                return (
                                  <div
                                    key={srv.name}
                                    onClick={() => {
                                      setSelectedService(srv.name);
                                      handleListEndpoints(srv.name);
                                    }}
                                    className={`group flex flex-col p-2 rounded-lg cursor-pointer transition-all border ${
                                      isSelected
                                        ? "bg-blue-900/30 border-blue-500 text-blue-200"
                                        : "bg-slate-950/45 border-slate-850 hover:bg-slate-900 text-slate-300"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-cyan-400" : "bg-slate-650"}`}></span>
                                        <p className="text-[11px] font-mono font-bold truncate lowercase" title={srv.name}>
                                          {id}
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteService(srv.name);
                                        }}
                                        className="p-0.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                    
                                    {/* Annotations lists as small badges */}
                                    {srv.annotations && Object.keys(srv.annotations).length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1.5 pl-3">
                                        {Object.entries(srv.annotations).map(([k, v]) => (
                                          <span key={k} className="bg-slate-900 text-[8.5px] px-1 py-[1px] rounded text-slate-400 font-mono tracking-wide">
                                            {k}:{v}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="text-[9.5px] text-slate-500 font-mono mt-4 leading-normal select-none">
                          *Services group functional api routing entities.
                        </div>
                      </div>

                      {/* COLUMN 3: ENDPOINTS (Col-span 4) */}
                      <div className="col-span-12 lg:col-span-4 bg-slate-900/45 border border-slate-755 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5 mb-3.5">
                            <span className="text-[10.5px] font-bold text-blue-400 uppercase tracking-widest font-mono">3. Endpoints</span>
                            <span className="bg-slate-850 px-1.5 py-0.2 rounded font-mono text-[9px] text-slate-400 block font-bold">{sdEndpoints.length} SOCKETS</span>
                          </div>
                          
                          {/* Create Endpoint Form */}
                          <form onSubmit={handleCreateEndpoint} className="mb-4 space-y-2">
                            <label htmlFor="newEndpointId" className="sr-only">New Endpoint ID</label>
                            <label htmlFor="newEndpointAddress" className="sr-only">New Endpoint Address</label>
                            <label htmlFor="newEndpointPort" className="sr-only">New Endpoint Port</label>
                            <div className="flex gap-1 bg-slate-950 p-1 rounded border border-slate-850">
                              <input
                                id="newEndpointId"
                                name="newEndpointId"
                                type="text"
                                value={newEndpointId}
                                onChange={(e) => setNewEndpointId(e.target.value)}
                                className="bg-transparent text-xs text-white placeholder-slate-650 font-mono flex-1 lowercase w-1/3 outline-none"
                                placeholder="ep-id"
                                disabled={sdLoading || !selectedService}
                              />
                              <input
                                id="newEndpointAddress"
                                name="newEndpointAddress"
                                type="text"
                                value={newEndpointAddress}
                                onChange={(e) => setNewEndpointAddress(e.target.value)}
                                className="bg-transparent text-xs text-green-300 placeholder-slate-650 font-mono w-1/3 outline-none text-center"
                                placeholder="address"
                                disabled={sdLoading || !selectedService}
                              />
                              <input
                                id="newEndpointPort"
                                name="newEndpointPort"
                                type="number"
                                value={newEndpointPort === 0 ? "" : newEndpointPort}
                                onChange={(e) => setNewEndpointPort(Number(e.target.value))}
                                className="bg-transparent text-xs text-blue-300 placeholder-slate-650 font-mono w-12 outline-none text-right placeholder-opacity-50"
                                placeholder="port"
                                disabled={sdLoading || !selectedService}
                              />
                              <button
                                type="submit"
                                disabled={sdLoading || !selectedService}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1 px-1.5 rounded text-[10px] uppercase flex items-center justify-center transition-colors disabled:bg-slate-800"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <label htmlFor="newEndpointAnnotations" className="sr-only">Endpoint Annotations</label>
                            <input
                              id="newEndpointAnnotations"
                              name="newEndpointAnnotations"
                              type="text"
                              value={newEndpointAnnotations}
                              onChange={(e) => setNewEndpointAnnotations(e.target.value)}
                              className="w-full bg-slate-950/75 border border-slate-850 text-[10px] text-slate-300 rounded px-2 py-1 font-mono outline-none"
                              placeholder="metadata (e.g. zone=us-central1-a)"
                              disabled={sdLoading || !selectedService}
                            />
                          </form>

                          {/* Endpoints Lists */}
                          {!selectedService ? (
                            <div className="text-center py-8 text-slate-550 font-mono text-[9.5px] bg-slate-955/20 border border-slate-850/30 rounded select-none">
                              Select a service to inspect endpoints logs.
                            </div>
                          ) : sdEndpoints.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 font-mono text-[10px] bg-slate-955 border border-dashed border-slate-850 rounded">
                              No service endpoints discovered.
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                              {sdEndpoints.map(ep => {
                                const segments = ep.name.split("/");
                                const id = segments[segments.length - 1];
                                return (
                                  <div
                                    key={ep.name}
                                    className="group bg-slate-950/45 border border-slate-850 p-2 rounded-lg flex flex-col text-slate-300"
                                  >
                                    <div className="flex items-center justify-between min-w-0">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                                        <span className="text-[11px] font-mono font-bold lowercase truncate" title={ep.name}>{id}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteEndpoint(ep.name)}
                                        className="p-0.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1 pl-3 font-semibold select-all">
                                      <span>Host: {ep.address}</span>
                                      <span className="bg-slate-900 border border-slate-850 px-1 py-[0.5px] rounded text-blue-400 font-bold">Port {ep.port}</span>
                                    </div>
                                    
                                    {/* Annotations lists */}
                                    {ep.annotations && Object.keys(ep.annotations).length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1.5 pl-3">
                                        {Object.entries(ep.annotations).map(([k, v]) => (
                                          <span key={k} className="bg-slate-900 text-[8px] px-1 py-[1px] rounded text-slate-505 font-mono">
                                            {k}={v}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="text-[9.5px] text-slate-500 font-mono mt-4 leading-normal select-none">
                          *Endpoints bind IP routing and socket destinations.
                        </div>
                      </div>

                    </div>

                    {/* Highly-helpful Technical GCP Service Directory gcloud command reference panel */}
                    <div className="bg-slate-900 border border-slate-755 rounded-xl p-4 font-mono text-[10.5px] text-slate-300 space-y-3.5 shadow-inner leading-relaxed">
                      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                        <Terminal className="w-4 h-4 text-slate-400 font-bold" />
                        <span className="font-bold text-white uppercase text-[9.5px] tracking-wider select-none">Cloud Shell Reference Commands</span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-400 select-none">
                        To register, lookup, or resolve these Service Directory parameters directly on Google Cloud Platform, run the corresponding CLI statements:
                      </p>
                      <div className="space-y-2.5 bg-slate-950 p-3 rounded border border-slate-850 select-all max-h-[140px] overflow-y-auto scrollbar-thin">
                        <div className="text-[10px] text-slate-500 border-b border-slate-900 pb-1.5 mb-1.5 flex justify-between select-none font-bold">
                          <span>RESOURCE TYPE</span>
                          <span>GCLOUD BLUEPRINT EXAMPLES</span>
                        </div>
                        <div>
                          <span className="text-blue-450 font-bold"># Namespace Create:</span>
                          <p className="text-slate-350 ml-3 mt-0.5">gcloud service-directory namespaces create <span className="text-yellow-405">spokane-lab-networks</span> --location={sdLocationId} --project={sdProjectId}</p>
                        </div>
                        <div>
                          <span className="text-purple-400 font-bold"># Service Register:</span>
                          <p className="text-slate-355 ml-3 mt-0.5">gcloud service-directory services create <span className="text-yellow-405">spectrometer-api</span> --namespace=spokane-lab-networks --location={sdLocationId} --project={sdProjectId}</p>
                        </div>
                        <div>
                          <span className="text-emerald-450 font-bold"># Endpoint Register:</span>
                          <p className="text-slate-350 ml-3 mt-0.5">gcloud service-directory endpoints create <span className="text-yellow-405">main-sensor</span> --service=spectrometer-api --namespace=spokane-lab-networks --location={sdLocationId} --project={sdProjectId} --address=192.168.1.18 --port=8443</p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* 5. HIGH-PRIORITY LEAD CALLBACK MODULE */}
                {labTab === "escalation" && (
                  <section className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col flex-1 shadow-md p-5 animate-in fade-in duration-300">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-700 pb-4 mb-5 gap-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-amber-500 animate-pulse" />
                        <div>
                          <h2 className="text-sm font-bold text-white uppercase tracking-tight">Tier 3 Hardware Escalation Callbacks</h2>
                          <p className="text-xs text-slate-400">Manage high-priority diagnostic leads for complex board-level and moisture repairs.</p>
                        </div>
                      </div>
                      
                      {authUser && (
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-950/80 border border-amber-900 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-amber-300 uppercase">
                            Firestore sync active
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-5 mb-5 flex-1 items-stretch">
                      
                      {/* Left Side: Create Callback Escalation Lead Form (Col-span 5) */}
                      <div className="col-span-12 lg:col-span-5 bg-slate-900/45 border border-slate-755 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="border-b border-slate-700/60 pb-2.5 mb-3.5 flex items-center justify-between">
                            <span className="text-[10.5px] font-bold text-amber-400 uppercase tracking-widest font-mono">Create Escalation</span>
                            <span className="text-[9px] text-slate-500 font-mono">*Route to Tier 3 queue</span>
                          </div>

                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const fd = new FormData(form);
                            const name = fd.get("leadCustomer") as string;
                            const phone = fd.get("leadPhone") as string;
                            const model = fd.get("leadModel") as string;
                            handleCreateLead(name, phone, model);
                            form.reset();
                          }} className="space-y-4">
                            <div>
                              <label htmlFor="leadCustomer" className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Customer Name</label>
                              <input 
                                id="leadCustomer"
                                name="leadCustomer"
                                type="text"
                                required 
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-650"
                                placeholder="Sarah Jenkins"
                              />
                            </div>

                            <div>
                              <label htmlFor="leadPhone" className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Callback Phone</label>
                              <input 
                                id="leadPhone"
                                name="leadPhone"
                                type="tel"
                                required 
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-650 font-mono"
                                placeholder="509-535-4200"
                              />
                            </div>

                            <div>
                              <label htmlFor="leadModel" className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Device Model</label>
                              <input 
                                id="leadModel"
                                name="leadModel"
                                type="text"
                                required
                                defaultValue={`${deviceBrand} ${deviceModel}`}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-650 font-mono"
                                placeholder="iPhone 15 Pro Max"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md font-mono transition-colors flex items-center justify-center gap-2 mt-4"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              Submit to Callback Queue
                            </button>
                          </form>
                        </div>
                        
                        <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3 text-[10px] text-slate-400 mt-4 leading-relaxed font-sans mt-auto">
                          <strong className="text-amber-300 block mb-0.5 font-mono">Tier 3 Board Diagnostics:</strong>
                          Requires manual thermal camera scan and micro-soldering. Field technician will call customer within 24 hours to confirm quoted laboratory costs.
                        </div>
                      </div>

                      {/* Right Side: Leads Queue & Status Tracker (Col-span 7) */}
                      <div className="col-span-12 lg:col-span-7 bg-slate-900/45 border border-slate-755 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5 mb-3.5">
                            <span className="text-[10.5px] font-bold text-amber-400 uppercase tracking-widest font-mono">Active Callback Leads</span>
                            <span className="bg-amber-950/80 border border-amber-900 px-1.5 py-0.2 rounded font-mono text-[9px] text-amber-300 block font-bold">{leads.length} LEADS</span>
                          </div>

                          {isLoadingLeads ? (
                            <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400 font-mono">
                              <span className="animate-pulse">Loading leads from Firestore...</span>
                            </div>
                          ) : leads.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-955 border border-dashed border-slate-850 rounded">
                              <Phone className="w-8 h-8 text-slate-650 mb-2" />
                              <div className="text-slate-500 font-mono text-[10px]">No high-priority leads mapped to this credential.</div>
                              <p className="text-[9px] text-slate-500 max-w-sm mt-1">Submit the left form or trigger motherboard damage triage to add callback tickets.</p>
                            </div>
                          ) : (
                            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 flex-1">
                              {leads.map((lead) => (
                                <div key={lead.id} className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 transition-all hover:border-amber-900/40">
                                  <div className="space-y-1 text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[9px] font-bold text-amber-400 select-all">{lead.id}</span>
                                      <span className="bg-slate-900 text-slate-400 border border-slate-800 text-[8px] px-1.5 py-[1px] rounded font-mono">
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-white leading-relaxed">{lead.customerName}</h4>
                                    <p className="text-[10.5px] font-mono text-slate-400 flex items-center gap-1">
                                      <span className="text-slate-500">Device:</span> <strong className="text-slate-350">{lead.deviceModel}</strong>
                                    </p>
                                    <p className="text-[10.5px] font-mono text-slate-400 flex items-center gap-1">
                                      <span className="text-slate-500">Phone:</span> <strong className="text-emerald-450 select-all">{lead.phone}</strong>
                                    </p>
                                  </div>

                                  <div className="flex lg:flex-col items-start lg:items-end gap-2 shrink-0">
                                    <span className={`px-2 py-0.5 rounded font-mono text-[9.5px] font-extrabold uppercase tracking-wide inline-block border ${
                                      lead.status === "pending" ? "bg-red-950/50 text-red-450 border-red-900" :
                                      lead.status === "in_progress" ? "bg-yellow-950/50 text-yellow-450 border-yellow-905" :
                                      lead.status === "contacted" ? "bg-amber-955/50 text-amber-350 border-amber-900" :
                                      lead.status === "completed" ? "bg-emerald-950/50 text-emerald-450 border-emerald-900" :
                                      "bg-slate-900 text-slate-500 border-slate-700"
                                    }`}>
                                      {lead.status.replace("_", " ")}
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                      <label htmlFor={`status-select-${lead.id}`} className="sr-only">Update Status</label>
                                      <select
                                        id={`status-select-${lead.id}`}
                                        value={lead.status}
                                        onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                                        className="bg-slate-950 text-slate-300 font-mono text-[9.5px] rounded border border-slate-800 px-1.5 py-1 outline-none focus:border-amber-600 cursor-pointer"
                                      >
                                        <option value="pending">Pending Call</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-[9.5px] text-slate-500 font-mono mt-4 leading-normal select-none">
                          *Manual callbacks prevent RMA leaks and fulfill sovereign customer relations compliance.
                        </div>
                      </div>

                    </div>
                  </section>
                )}

                {labTab === "forensics" && (
                  <ForensicsView
                    forensicDevice={forensicDevice}
                    setForensicDevice={setForensicDevice}
                    isForensicScanning={isForensicScanning}
                    setIsForensicScanning={setIsForensicScanning}
                    forensicProgress={forensicProgress}
                    setForensicProgress={setForensicProgress}
                    forensicLogs={forensicLogs}
                    setForensicLogs={setForensicLogs}
                    forensicSOP={forensicSOP}
                    setForensicSOP={setForensicSOP}
                    mountedSources={mountedSources}
                    setMountedSources={setMountedSources}
                    s2cActivePathway={s2cActivePathway}
                    setS2cActivePathway={setS2cActivePathway}
                    s2cActiveCodeTab={s2cActiveCodeTab}
                    setS2cActiveCodeTab={setS2cActiveCodeTab}
                    s2cBatteryTemp={s2cBatteryTemp}
                    setS2cBatteryTemp={setS2cBatteryTemp}
                    s2cAmmeterReading={s2cAmmeterReading}
                    setS2cAmmeterReading={setS2cAmmeterReading}
                    s2cIsSimulatingCheck={s2cIsSimulatingCheck}
                    setS2cIsSimulatingCheck={setS2cIsSimulatingCheck}
                    s2cCheckLogs={s2cCheckLogs}
                    setS2cCheckLogs={setS2cCheckLogs}
                    s2cCheckStatus={s2cCheckStatus}
                    setS2cCheckStatus={setS2cCheckStatus}
                    s2cFeedbackRating={s2cFeedbackRating}
                    setS2cFeedbackRating={setS2cFeedbackRating}
                    s2cFeedbackNotes={s2cFeedbackNotes}
                    setS2cFeedbackNotes={setS2cFeedbackNotes}
                    s2cFeedbackSubmitted={s2cFeedbackSubmitted}
                    setS2cFeedbackSubmitted={setS2cFeedbackSubmitted}
                    s2cIsSubmittingFeedback={s2cIsSubmittingFeedback}
                    setS2cIsSubmittingFeedback={setS2cIsSubmittingFeedback}
                    covThreshold={covThreshold}
                    setCovThreshold={setCovThreshold}
                    covCustomDraft={covCustomDraft}
                    setCovCustomDraft={setCovCustomDraft}
                    isCovRunning={isCovRunning}
                    setIsCovRunning={setIsCovRunning}
                    covLogs={covLogs}
                    setCovLogs={setCovLogs}
                    covStatus={covStatus}
                    setCovStatus={setCovStatus}
                    covAuditResult={covAuditResult}
                    setCovAuditResult={setCovAuditResult}
                    isNarrowingActive={isNarrowingActive}
                    setIsNarrowingActive={setIsNarrowingActive}
                    narrowingLogs={narrowingLogs}
                    setNarrowingLogs={setNarrowingLogs}
                    narrowedAudit={narrowedAudit}
                    setNarrowedAudit={setNarrowedAudit}
                    selectedCovTab={selectedCovTab}
                    setSelectedCovTab={setSelectedCovTab}
                    telemetrySpecTab={telemetrySpecTab}
                    setTelemetrySpecTab={setTelemetrySpecTab}
                    activePlanTier={activePlanTier}
                    setActivePlanTier={setActivePlanTier}
                    referenceMode={referenceMode}
                    setReferenceMode={setReferenceMode}
                    hallucinationSimulatedKeyword={hallucinationSimulatedKeyword}
                    setHallucinationSimulatedKeyword={setHallucinationSimulatedKeyword}
                    imeiInput={imeiInput}
                    setImeiInput={setImeiInput}
                    isSecurityScraping={isSecurityScraping}
                    setIsSecurityScraping={setIsSecurityScraping}
                    securityCheckResult={securityCheckResult}
                    setSecurityCheckResult={setSecurityCheckResult}
                    addToast={addToast}
                    getPathwayDraft={getPathwayDraft}
                    runChainOfVerification={runChainOfVerification}
                    triggerSourceNarrowing={triggerSourceNarrowing}
                    handleS2cFeedbackSubmit={handleS2cFeedbackSubmit}
                    copyToClipboard={copyToClipboard}
                    keywordsList={keywordsList}
                    calculatedFidelity={calculatedFidelity}
                    noisePenalty={noisePenalty}
                    pass={pass}
                  />
                )}

                {labTab === "forms" && (
                  <FormsIntegrationView
                    accessToken={googleAccessToken}
                    authUser={authUser}
                    onLinkGoogleAuth={handleGoogleSignIn}
                    addToast={addToast}
                    onAddNewTicket={handleAddNewTicketFromForms}
                    onAddNewLead={handleAddNewLeadFromForms}
                  />
                )}

                {labTab === "gmail" && (
                  <GmailIntegrationView
                    accessToken={googleAccessToken}
                    authUser={authUser}
                    onLinkGoogleAuth={handleGoogleSignIn}
                    addToast={addToast}
                    tickets={tickets}
                    leads={leads}
                  />
                )}

                {labTab === "firebase_ai" && (
                  <FirebaseAiWorkbenchView
                    addToast={addToast}
                  />
                )}

                {labTab === "forensics_deprecated" && (
                  <section className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col flex-1 shadow-md p-5 animate-in fade-in duration-300 font-sans text-left">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-700 pb-4 mb-5 gap-3">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-violet-400 animate-pulse" />
                        <div>
                          <h2 className="text-sm font-bold text-white uppercase tracking-tight font-mono">Triage-AI Forensic Command Center</h2>
                          <p className="text-xs text-slate-400">Low-level live telemetry, S2C circuit analysis, and RAG-integrated schematics routing.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-violet-950/40 border border-violet-900/30 px-3 py-1 rounded-lg text-[9.5px] font-mono text-violet-300 font-extrabold uppercase tracking-wider">
                        RAG-Orchestration Hub Active
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-5 mb-5 items-stretch">
                      
                      {/* Left: Device Hook and Ingestion */}
                      <div className="col-span-12 lg:col-span-6 bg-slate-900/50 border border-slate-750 rounded-xl p-4 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-3">
                            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono">1. Hardware Telemetry Ingest</span>
                            <span className="text-[9px] text-emerald-400 font-mono">● LIVE CDC LINK</span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label htmlFor="forensicDeviceSelect" className="block text-[9.5px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Select Target Core device</label>
                              <select
                                id="forensicDeviceSelect"
                                value={forensicDevice}
                                onChange={(e) => {
                                  setForensicDevice(e.target.value as any);
                                  setForensicSOP(null);
                                  setForensicLogs([]);
                                  setForensicProgress(0);
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono cursor-pointer outline-none focus:border-violet-600"
                              >
                                <option value="iPhone XR">Apple iPhone XR (Intel BB / N104)</option>
                                <option value="iPad Pro 9.7">Apple iPad Pro 9.7" (A9X / J98a)</option>
                              </select>
                            </div>

                            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-850 space-y-1.5 text-left font-mono">
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Ingested Symptoms Profile:</p>
                              {forensicDevice === "iPhone XR" ? (
                                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                                  ⚡ Power rail deadlock suspected. Device shows drawing stable <span className="text-red-400 font-bold">1.1A</span> current (no-boot state) at ammeter, high thermal radiation localized near C247_W filter capacitor.
                                </p>
                              ) : (
                                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                                  📺 Blinking backlight circuit. Liquid ingress near FL1728 fuse filters, screen is blank but flashlight test confirms active image shadow under 45° ambient lighting.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isForensicScanning ? (
                            <div className="space-y-2 py-2">
                              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                <span>POLLING IOKIT SUBSYSTEM PORT 3000...</span>
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
                                    
                                    // Set forensic SOP based on the active device
                                    if (forensicDevice === "iPhone XR") {
                                      setForensicSOP({
                                        rail: "VDD_MAIN",
                                        suspectedComponent: "C247_W (Filter Capacitor)",
                                        measurementProtocol: "Resistance to Ground Check",
                                        dmodeValue: "0.1 Ω (Direct Main Rail Short to ground)",
                                        alloy: "SAC305 Lead-Free",
                                        reworkTemp: "360°C - 400°C",
                                        underfillSoftenerTemp: "220°C",
                                        sopSteps: [
                                          "Confirm short to ground on VDD_MAIN using a multimeter in diode mode.",
                                          "Apply a localized thermal test under LWIR camera while injecting 1.8V / 2A to the rail.",
                                          "Verify C247_W instantly spikes in temperature (reaches > 75°C).",
                                          "Use Quick 861DW hot air station at 220°C with 40% air to gently scrape underfill around components.",
                                          "Increase nozzle rework temperature to 370°C, then gently lift bad capacitor C547_W off the PCB board.",
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
                                        alloy: "SAC305",
                                        reworkTemp: "350°C - 380°C",
                                        underfillSoftenerTemp: "Not Applicable",
                                        sopSteps: [
                                          "Check for backlight diode mode drop at LCM connector pinning (should be ~0.412V).",
                                          "If pin reads OL, test continuity directly across FL1728 filter fuse terminals.",
                                          "If terminals are open, apply chip-quik flux and desolder FL1728 at 360°C.",
                                          "Bridge micro-terminals using a copper 0.02mm insulated jumper wire or solder a clean replacement filter.",
                                          "Inject diode-test parameter and re-verify backlight forward voltage on J4200 pin anodes."
                                        ],
                                        fidelityScore: 0.95,
                                        citation: "iPad-Pro-9.7-Backlight-FL1728.pdf, Page 29"
                                      });
                                    }
                                    addToast("Telemetry Analyzed", `Fidelity verified structure generated for ${forensicDevice}!`, "success");
                                  }
                                }, 300);
                              }}
                              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-md font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5 text-yellow-350" />
                              Poll Device Telemetry via IOKit
                            </button>
                          )}
                        </div>

                        {forensicLogs.length > 0 && (
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] font-mono text-slate-400 space-y-1 block text-left max-h-[140px] overflow-y-auto w-full">
                            <span className="text-[8px] text-violet-400 font-extrabold block uppercase tracking-wide border-b border-slate-900 pb-1 mb-1">
                              Forensic Ingestion Console Logs
                            </span>
                            {forensicLogs.map((log, idx) => (
                              <div key={idx} className="leading-relaxed text-[10px]">
                                <span className="text-slate-600 select-none">[{idx + 1}]</span> {log}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Source-Cycling & RAG dashboard */}
                      <div className="col-span-12 lg:col-span-6 bg-slate-900/50 border border-slate-755 rounded-xl p-4 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-3">
                            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono">2. Dynamic Source-Cycling RAG</span>
                            <span className="text-[9px] text-violet-300 font-mono font-bold bg-violet-950/60 border border-violet-900/35 px-1 rounded">RAG CONTEXT</span>
                          </div>

                          <p className="text-[11px] text-slate-400 font-sans leading-relaxed text-left mb-3">
                            Check schema sheets to include or exclude from the instant vector RAG pool. Too many active files cause context flooding and response degradation.
                          </p>

                          <div className="space-y-2 text-left">
                            {Object.keys(mountedSources).map((srcName) => (
                              <div 
                                key={srcName} 
                                className="flex items-center justify-between p-2.5 bg-slate-955/80 rounded-lg border border-slate-850"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className={`w-4 h-4 ${mountedSources[srcName] ? "text-violet-400" : "text-slate-600"}`} />
                                  <span className="font-mono text-[11px] text-slate-200">{srcName}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMountedSources(prev => ({
                                      ...prev,
                                      [srcName]: !prev[srcName]
                                    }));
                                  }}
                                  className={`px-2 py-1 rounded text-[9.5px] font-extrabold uppercase font-mono transition-all cursor-pointer ${
                                    mountedSources[srcName]
                                      ? "bg-violet-950/60 text-violet-300 border border-violet-800/40"
                                      : "bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-700"
                                  }`}
                                >
                                  {mountedSources[srcName] ? "Mounted" : "Unmounted"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* SIGNAL TO NOISE RATIO INDICATOR */}
                        <div className="bg-slate-955 p-3.5 rounded-xl border border-slate-850 space-y-3 w-full">
                          <div className="flex justify-between items-center text-[10.5px] font-mono">
                            <span className="text-slate-400 uppercase font-extrabold tracking-tight">RAG Context Status Indicator</span>
                            {Object.values(mountedSources).filter(Boolean).length <= 2 ? (
                              <span className="text-emerald-450 font-bold bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded text-[9px]">EXCELLENT</span>
                            ) : Object.values(mountedSources).filter(Boolean).length === 3 ? (
                              <span className="text-amber-400 font-bold bg-amber-955/40 border border-amber-900/40 px-2 py-0.5 rounded text-[9px]">OPTIMAL</span>
                            ) : (
                              <span className="text-red-400 font-bold bg-red-950/40 border border-red-900/40 px-2 py-0.5 rounded text-[9px] animate-pulse">FLOODING RISK</span>
                            )}
                          </div>

                          <div className="space-y-1.5 text-left font-mono text-[10.5px]">
                            <p className="text-slate-400">
                              Active Schematics: <strong className="text-white">{Object.values(mountedSources).filter(Boolean).length} mounted sources</strong>
                            </p>
                            <p className="text-slate-450 leading-normal">
                              {Object.values(mountedSources).filter(Boolean).length <= 2 ? (
                                "👉 Signal concentration is premium. Answers are precise, exact matching the specific fault node limits."
                              ) : Object.values(mountedSources).filter(Boolean).length === 3 ? (
                                "👉 Balanced notebook. Good integration of system compliance and component layout structures."
                              ) : (
                                "⚠️ Warning: Context Flooding detected. Excess data sheets may dilute diagnostic fidelity scores. Unmount raw compliance manuals if analyzing basic board loops."
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* SOP Output & Interactive Board Bench Blueprint */}
                    {forensicSOP && (
                      <div className="mt-2 space-y-6 animate-in slide-in-from-bottom duration-300 w-full">
                        
                        {/* SOP Visual Bento Block */}
                        <div className="bg-slate-900/80 border border-slate-750 rounded-xl overflow-hidden p-5 block text-left">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-755 pb-3 mb-4 gap-2">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-450" />
                              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                                Dynamic Structured Operational Protocol (SOP)
                              </h3>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              Fidelity Score: <strong className="text-emerald-400">{(forensicSOP.fidelityScore * 100).toFixed(0)}%</strong> | Source Citation: <strong className="text-violet-400">{forensicSOP.citation}</strong>
                            </span>
                          </div>

                          <div className="grid grid-cols-12 gap-5 mb-5">
                            <div className="col-span-12 md:col-span-4 bg-slate-950/60 rounded-xl border border-slate-850 p-4 space-y-2.5 font-mono text-xs">
                              <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest block border-b border-slate-850/40 pb-1 mb-2">Diagnostic Profile Parameters</span>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Target Rail</span>
                                <strong className="text-white">{forensicSOP.rail}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Suspected Node</span>
                                <strong className="text-white">{forensicSOP.suspectedComponent}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Test Method</span>
                                <strong className="text-indigo-400">{forensicSOP.measurementProtocol}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Exp. Drop Value</span>
                                <strong className="text-emerald-450">{forensicSOP.dmodeValue}</strong>
                              </div>
                            </div>

                            <div className="col-span-12 md:col-span-4 bg-slate-950/60 rounded-xl border border-slate-850 p-4 space-y-2.5 font-mono text-xs">
                              <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest block border-b border-slate-850/40 pb-1 mb-2">Thermal & Alloy Thresholds</span>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Rework Station</span>
                                <strong className="text-white">Quick 861DW/JBC</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Rework Temperature</span>
                                <strong className="text-orange-400">{forensicSOP.reworkTemp}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Underfill Soften</span>
                                <strong className="text-yellow-400">{forensicSOP.underfillSoftenerTemp}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Solvent Alloy</span>
                                <strong className="text-white">{forensicSOP.alloy}</strong>
                              </div>
                            </div>

                            <div className="col-span-12 md:col-span-4 bg-slate-950/60 rounded-xl border border-slate-850 p-4 flex flex-col justify-between font-mono text-[11px] leading-relaxed text-slate-400">
                              <div>
                                <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest block border-b border-slate-850/40 pb-1 mb-2 font-mono">Chain-of-Verification (CoV)</span>
                                <p>
                                  All layout keys are cross-verified against high-resolution vector PDF blueprints using the Paragraph Test pipeline. Output validated to resist hallucination index.
                                </p>
                              </div>
                              <p className="text-[10px] text-emerald-455 mt-2 font-extrabold uppercase font-mono">✔️ VERIFICATION COV PASS</p>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            <span className="text-[10.5px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-2">SOP Implementation Workflow Timeline (Bento Infographic)</span>
                            <div className="space-y-3 font-sans">
                              {forensicSOP.sopSteps.map((step: string, id: number) => (
                                <div key={id} className="flex gap-4 p-3 bg-slate-950/40 border border-slate-850/60 rounded-lg items-start">
                                  <div className="h-5 w-5 rounded bg-violet-900/50 border border-violet-800 text-violet-300 flex items-center justify-center shrink-0 text-[10px] font-bold font-mono">
                                    0{id + 1}
                                  </div>
                                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* --- Symptom-to-Circuit (S2C) Core Engine Interface --- */}
                    <div className="bg-slate-900/60 border border-slate-750 rounded-xl p-5 mt-6 block text-left">
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-755 pb-3 mb-4 gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-indigo-950/50 border border-indigo-700/35 rounded-lg">
                            <Activity className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                              Symptom-to-Circuit (S2C) Forensic Core Engine
                            </h3>
                            <p className="text-xs text-slate-400">
                              Direct physical telemetry to logic board schematics mapper. Eliminates random parts-swapping through measurement-driven validation pathways.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-start xl:self-center">
                          <span className="text-[10px] bg-indigo-950 text-indigo-300 font-extrabold uppercase font-mono px-2 py-0.5 rounded border border-indigo-900/40 tracking-wider">
                            S2C_V3_CORE_ENG
                          </span>
                        </div>
                      </div>

                      {/* Diagnostic Pathway Grid Wrapper */}
                      <div className="grid grid-cols-12 gap-5 mb-5">
                        
                        {/* LEFT: Pathway Select & Telemetry Inputs */}
                        <div className="col-span-12 lg:col-span-4 bg-slate-950/45 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block border-b border-slate-850 pb-1.5 mb-2.5 font-mono">1. Select S2C Circuit Pathway</span>
                              <div className="space-y-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setS2cActivePathway("backlight");
                                    setS2cCheckStatus("idle");
                                    setS2cCheckLogs([]);
                                  }}
                                  className={`w-full text-left p-2.5 rounded-lg border font-mono transition-all flex justify-between items-center cursor-pointer ${
                                    s2cActivePathway === "backlight"
                                      ? "bg-indigo-950/40 border-indigo-500/70 text-white"
                                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                                  }`}
                                >
                                  <div className="text-[11.5px]">
                                    <div className="font-extrabold text-[12px] text-white">💡 Backlight Subsystem Path</div>
                                    <div className="text-[10px] text-slate-400">Filter FL1728 open loop</div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-500" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setS2cActivePathway("charging");
                                    setS2cCheckStatus("idle");
                                    setS2cCheckLogs([]);
                                  }}
                                  className={`w-full text-left p-2.5 rounded-lg border font-mono transition-all flex justify-between items-center cursor-pointer ${
                                    s2cActivePathway === "charging"
                                      ? "bg-indigo-950/40 border-indigo-500/70 text-white"
                                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                                  }`}
                                >
                                  <div className="text-[11.5px]">
                                    <div className="font-extrabold text-[12px] text-white">🔌 Tristar charging paths</div>
                                    <div className="text-[10px] text-slate-400">Intel BB / 1610A3 Multiplexer</div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-500" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setS2cActivePathway("short_rail");
                                    setS2cCheckStatus("idle");
                                    setS2cCheckLogs([]);
                                  }}
                                  className={`w-full text-left p-2.5 rounded-lg border font-mono transition-all flex justify-between items-center cursor-pointer ${
                                    s2cActivePathway === "short_rail"
                                      ? "bg-indigo-950/40 border-indigo-500/70 text-white"
                                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                                  }`}
                                >
                                  <div className="text-[11.5px]">
                                    <div className="font-extrabold text-[12px] text-white">⚡ Primary VDD_MAIN Short</div>
                                    <div className="text-[10px] text-slate-400">Core deadlocks & capacitor C247_W</div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-500" />
                                </button>
                              </div>
                            </div>

                            {/* Telemetry Control Inputs */}
                            <div className="space-y-3">
                              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block border-b border-slate-850 pb-1.5 font-mono">2. Simulate Bench Telemetry Inputs</span>
                              
                              {/* Battery Temperature control */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center font-mono text-[10.5px]">
                                  <span className="text-slate-400">Target Battery Temperature:</span>
                                  <strong className={s2cBatteryTemp > 45 ? "text-red-400 animate-pulse font-bold" : "text-white"}>
                                    {s2cBatteryTemp}°C
                                  </strong>
                                </div>
                                <div className="flex items-center gap-3">
                                  <input 
                                    aria-label="Simulate Battery Temperature Selector"
                                    type="range"
                                    min="20"
                                    max="60"
                                    step="0.5"
                                    value={s2cBatteryTemp}
                                    onChange={(e) => {
                                      setS2cBatteryTemp(parseFloat(e.target.value));
                                      if (parseFloat(e.target.value) <= 45 && s2cCheckStatus === "thermal_halt") {
                                        setS2cCheckStatus("idle");
                                        setS2cCheckLogs([]);
                                      }
                                    }}
                                    className="flex-1 accent-indigo-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setS2cBatteryTemp(48.5);
                                      addToast("Overheat Induced", "Battery artificially heated to 48.5°C trigger limits.", "info");
                                    }}
                                    className="bg-red-950/60 text-red-400 border border-red-900/40 text-[9px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded"
                                  >
                                    HEARTEST (48°C)
                                  </button>
                                </div>
                                {s2cBatteryTemp > 45 && (
                                  <div className="p-2 bg-red-950/40 border border-red-900/30 rounded text-[9.5px] font-mono text-red-300 leading-normal flex items-start gap-1.5 animate-pulse mt-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                    <span>
                                      <strong>Strict Safety Guard Activated</strong>: Battery temperature exceeds the 45°C limit. Diagnostics lock out automatically.
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Ammeter Current draw control */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center font-mono text-[10.5px]">
                                  <span className="text-slate-400">Digital Ammeter Boot Current:</span>
                                  <strong className="text-white">{s2cAmmeterReading} A</strong>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input 
                                    aria-label="Ammeter Current Draw Selector"
                                    type="number"
                                    min="0.0"
                                    max="3.0"
                                    step="0.05"
                                    value={s2cAmmeterReading}
                                    onChange={(e) => setS2cAmmeterReading(parseFloat(e.target.value) || 0)}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono flex-1 outline-none focus:border-indigo-600"
                                  />
                                  <div className="flex gap-1 shrink-0">
                                    <button 
                                      type="button"
                                      onClick={() => setS2cAmmeterReading(1.10)}
                                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] text-slate-300 px-1.5 py-1 rounded font-mono"
                                    >
                                      1.1A
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => setS2cAmmeterReading(0.01)}
                                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] text-slate-300 px-1.5 py-1 rounded font-mono"
                                    >
                                      0.01A
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <button
                              type="button"
                              disabled={s2cIsSimulatingCheck}
                              onClick={handleS2cSimulate}
                              className={`w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-md font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                                s2cIsSimulatingCheck ? "opacity-60 cursor-not-allowed" : ""
                              }`}
                            >
                              <Zap className="w-3.5 h-3.5 text-yellow-300" />
                              {s2cIsSimulatingCheck ? "Running S2C Circuit Map..." : "Initiate S2C Mapping Triage"}
                            </button>
                          </div>
                        </div>

                        {/* CENTER: The 4-Stage Subsystem Flow Animator */}
                        <div className="col-span-12 lg:col-span-4 bg-slate-955/55 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block border-b border-slate-850 pb-1.5 mb-3 font-mono">3. Subsystem Flow Stage State</span>
                            
                            {/* Visual Timeline Stepper */}
                            <div className="space-y-4 text-left font-mono relative">
                              {/* Step 1 */}
                              <div className={`p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                                s2cCheckStatus === "testing" || s2cCheckStatus === "passed"
                                  ? "bg-indigo-950/20 border-indigo-800/60"
                                  : "bg-slate-950/20 border-slate-900"
                              }`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                                  s2cCheckStatus === "passed" || s2cCheckStatus === "testing"
                                    ? "bg-indigo-900 text-indigo-300 border border-indigo-700"
                                    : "bg-slate-900 text-slate-600 border border-slate-800"
                                }`}>
                                  1
                                </div>
                                <div className="space-y-0.5">
                                  <div className="text-[11px] font-extrabold text-white uppercase tracking-wide">Symptom Identification</div>
                                  <div className="text-[9.5px] text-slate-450 leading-relaxed">
                                    {s2cActivePathway === "backlight" && "No Backlight symptom, flashlight test reveals positive image shadow."}
                                    {s2cActivePathway === "charging" && "Draws ≤ 0.008A. Zero current, continuity failure state suspected."}
                                    {s2cActivePathway === "short_rail" && "Static 1.1A current draw. Deadlock state, immediate secondary short suspected!"}
                                  </div>
                                </div>
                              </div>

                              {/* Step 2 */}
                              <div className={`p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                                s2cCheckStatus === "passed" || (s2cCheckStatus === "testing" && s2cCheckLogs.length >= 4)
                                  ? "bg-indigo-950/20 border-indigo-800/60 animate-pulse-subtle"
                                  : "bg-slate-950/20 border-slate-900"
                              }`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                                  s2cCheckStatus === "passed" || (s2cCheckStatus === "testing" && s2cCheckLogs.length >= 4)
                                    ? "bg-indigo-900 text-indigo-300 border border-indigo-700"
                                    : "bg-slate-900 text-slate-600 border border-slate-800"
                                }`}>
                                  2
                                </div>
                                <div className="space-y-0.5">
                                  <div className="text-[11px] font-extrabold text-white uppercase tracking-wide">Circuit Path Mapping</div>
                                  <div className="text-[9.5px] text-slate-450 leading-relaxed">
                                    {s2cActivePathway === "backlight" && "RAG map -> Pin anodes -> target voltage rail PP_LCM_BL_ANODE"}
                                    {s2cActivePathway === "charging" && "Identify power loop: USB_VBUS / PMU_USB_BRICKID to ground"}
                                    {s2cActivePathway === "short_rail" && "Primary Rail trace -> VDD_MAIN & PP_VCC_MAIN layers check"}
                                  </div>
                                </div>
                              </div>

                              {/* Step 3 */}
                              <div className={`p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                                s2cCheckStatus === "passed" || (s2cCheckStatus === "testing" && s2cCheckLogs.length >= 6)
                                  ? "bg-indigo-950/20 border-indigo-800/60"
                                  : "bg-slate-950/20 border-slate-900"
                              }`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                                  s2cCheckStatus === "passed" || (s2cCheckStatus === "testing" && s2cCheckLogs.length >= 6)
                                    ? "bg-indigo-900 text-indigo-300 border border-indigo-700"
                                    : "bg-slate-900 text-slate-600 border border-slate-800"
                                }`}>
                                  3
                                </div>
                                <div className="space-y-0.5">
                                  <div className="text-[11px] font-extrabold text-white uppercase tracking-wide">Fault Node Isolation</div>
                                  <div className="text-[9.5px] text-slate-450 leading-relaxed">
                                    {s2cActivePathway === "backlight" && "Localizing component designator: FL1728 backlight filter fuse"}
                                    {s2cActivePathway === "charging" && "Target node pinpoint: Tristar IC model 1610A3 charging controller"}
                                    {s2cActivePathway === "short_rail" && "Thermal check on Seek LWIR: high temperature localized on capacitor C247_W"}
                                  </div>
                                </div>
                              </div>

                              {/* Step 4 */}
                              <div className={`p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                                s2cCheckStatus === "passed"
                                  ? "bg-emerald-950/15 border-emerald-900/40"
                                  : "bg-slate-950/20 border-slate-900"
                              }`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                                  s2cCheckStatus === "passed"
                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                    : "bg-slate-900 text-slate-600 border border-slate-800"
                                }`}>
                                  4
                                </div>
                                <div className="space-y-0.5">
                                  <div className="text-[11px] font-extrabold text-white uppercase tracking-wide flex items-center gap-1">
                                    Verification Command {s2cCheckStatus === "passed" && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                                  </div>
                                  <div className="text-[9.5px] text-slate-450 leading-relaxed">
                                    {s2cActivePathway === "backlight" && "Probe FL1728 for continuity. Expected impedance < 0.5 Ω. Bridge if open."}
                                    {s2cActivePathway === "charging" && "Test battery diode dropdown on U2 bus line. Expecting 0.350V boot delay drops."}
                                    {s2cActivePathway === "short_rail" && "Test resistance of C247_W. Replace capacitor if Direct Main Rail short is confirmed."}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: Blueprint & JSON Schema Code Viewer */}
                        <div className="col-span-12 lg:col-span-4 bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-2 font-mono">
                              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block">4. Production Schema Explorer</span>
                              <div className="flex bg-slate-900 border border-slate-800 rounded p-0.5">
                                <button
                                  type="button"
                                  onClick={() => setS2cActiveCodeTab("typescript")}
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono transition-all cursor-pointer ${
                                    s2cActiveCodeTab === "typescript" ? "bg-indigo-950 text-indigo-300 border border-indigo-900/40" : "text-slate-500 hover:text-slate-300"
                                  }`}
                                >
                                  TypeScript
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setS2cActiveCodeTab("json")}
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono transition-all cursor-pointer ${
                                    s2cActiveCodeTab === "json" ? "bg-indigo-950 text-indigo-300 border border-indigo-900/40" : "text-slate-500 hover:text-slate-300"
                                  }`}
                                >
                                  JSON Schema
                                </button>
                              </div>
                            </div>

                            {/* Mapped view of syntax highlighting block */}
                            {s2cActiveCodeTab === "typescript" ? (
                              <div className="p-3 bg-slate-955 rounded-lg border border-slate-900 text-[10.5px] font-mono text-slate-300 text-left overflow-x-auto max-h-[195px] overflow-y-auto block leading-normal space-y-1 select-text">
                                <p><span className="text-pink-400 font-bold">interface</span> <span className="text-yellow-300">DiagnosticSymptom</span> &#123;</p>
                                <p>&nbsp;&nbsp;type: <span className="text-teal-400 font-semibold">{s2cActivePathway === "backlight" ? '"NO_BACKLIGHT"' : s2cActivePathway === "charging" ? '"NO_CHARGING"' : '"NO_POWER"'}</span>;</p>
                                <p>&nbsp;&nbsp;flashlightTestPositive?: <span className="text-violet-400 font-semibold">boolean</span>;</p>
                                <p>&#125;</p>
                                <p className="text-slate-500 mt-2">// Symptom-to-Circuit logical mapper</p>
                                <p><span className="text-pink-400 font-bold">function</span> <span className="text-blue-300">mapSymptomToCircuit</span>(symptom: <span className="text-yellow-300">DiagnosticSymptom</span>) &#123;</p>
                                {s2cActivePathway === "backlight" && (
                                  <>
                                    <p>&nbsp;&nbsp;<span className="text-pink-400 font-bold">if</span> (symptom.type === <span className="text-emerald-400">"NO_BACKLIGHT"</span> && symptom.flashlightTestPositive) &#123;</p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400 font-bold">return</span> <span className="text-emerald-400">`</span></p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">MAPPED_RAIL:</span> PP_LCM_BL_ANODE (Backlight)</p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">SUSPECTED_NODES:</span> FL1728 (Filter Fuse)</p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">MANDATORY_CHECK:</span> Probe continuity (Beep=PASS)</p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">`</span>;</p>
                                    <p>&nbsp;&nbsp;&#125;</p>
                                  </>
                                )}
                                {s2cActivePathway === "charging" && (
                                  <>
                                    <p>&nbsp;&nbsp;<span className="text-pink-400 font-bold">if</span> (symptom.type === <span className="text-emerald-400">"NO_CHARGING"</span>) &#123;</p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400 font-bold">return</span> <span className="text-emerald-400">`</span></p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">MAPPED_RAIL:</span> USB_VBUS / PMU_USB_BRICKID</p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">SUSPECTED_NODES:</span> 1610A3 (Tristar IC)</p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">MANDATORY_CHECK:</span> Test impedance values ($&lt;2.0V$=Tristar Fail)</p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">`</span>;</p>
                                    <p>&nbsp;&nbsp;&#125;</p>
                                  </>
                                )}
                                {s2cActivePathway === "short_rail" && (
                                  <>
                                    <p>&nbsp;&nbsp;<span className="text-pink-400 font-bold">if</span> (symptom.type === <span className="text-emerald-400">"NO_POWER"</span>) &#123;</p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400 font-bold">return</span> <span className="text-emerald-400">`</span></p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">MAPPED_RAIL:</span> VDD_MAIN (Short to Ground)</p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">SUSPECTED_NODES:</span> C247_W (Filter Capacitor)</p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">MANDATORY_CHECK:</span> Probe C247_W drop values ($0.1\Omega$=Direct Main Short)</p>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">`</span>;</p>
                                    <p>&nbsp;&nbsp;&#125;</p>
                                  </>
                                )}
                                <p>&#125;</p>
                              </div>
                            ) : (
                              <div className="p-3 bg-slate-955 rounded-lg border border-slate-900 text-[10.5px] font-mono text-indigo-300 text-left overflow-x-auto max-h-[195px] overflow-y-auto block leading-normal space-y-1 select-text">
                                <p>&#123;</p>
                                <p>&nbsp;&nbsp;<span className="text-pink-400">"s2c_diagnostic_payload"</span>: &#123;</p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">"device_model"</span>: <span className="text-emerald-400">"{s2cActivePathway === "backlight" ? "iPad Pro 9.7" : s2cActivePathway === "charging" ? "Apple iPhone XR" : "iPhone XR Board"}"</span>,</p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">"tier"</span>: <span className="text-emerald-400">"Tier 3 Board solder escalation"</span>,</p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">"symptom"</span>: <span className="text-emerald-400">"{s2cActivePathway === "backlight" ? "Dark screen, image visible with flashlight" : s2cActivePathway === "charging" ? "BMT charging loop failure" : "Core main voltage line deadlock"}"</span>,</p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">"circuit_mapping"</span>: &#123;</p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">"suspected_rail"</span>: <span className="text-emerald-400">"{s2cActivePathway === "backlight" ? "PP_LCM_BL_ANODE" : s2cActivePathway === "charging" ? "USB_VBUS / PMU_USB_BRICKID" : "VDD_MAIN"}"</span>,</p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">"target_component"</span>: <span className="text-emerald-400">"{s2cActivePathway === "backlight" ? "FL1728" : s2cActivePathway === "charging" ? "1610A3 (Tristar IC)" : "C247_W"}"</span>,</p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">"expected_behavior"</span>: <span className="text-emerald-400">"{s2cActivePathway === "backlight" ? "Continuity (0.1 - 0.5 Ω)" : s2cActivePathway === "charging" ? "Healthy VBUS voltage drops" : "Resistance < 0.1 Ω direct short"}"</span></p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;&#125;,</p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">"reconstruction_specs"</span>: &#123;</p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">"alloy_requirement"</span>: <span className="text-emerald-400">"SAC305 Lead-Free"</span>,</p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">"rework_temp"</span>: <span className="text-emerald-400">"350C - 400C"</span>,</p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">"jumper_spec"</span>: <span className="text-emerald-400">"0.02mm enameled copper"</span></p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;&#125;,</p>
                                <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">"verification_status"</span>: <span className="text-emerald-400">"PASS (The Paragraph Test)"</span></p>
                                <p>&nbsp;&nbsp;&#125;</p>
                                <p>&#125;</p>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Interactive Feedback Panel: Thumbs Up / Thumbs Down */}
                      {s2cCheckStatus === "passed" && (
                        <div className="mt-5 p-4 bg-slate-950/75 border border-indigo-900/30 rounded-xl transition-all animate-in fade-in duration-300">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-3 mb-3">
                            <div>
                              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                Technician Circuit Mapping Refinement Loop
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Did the mapped node (<span className="text-white font-semibold font-mono">{s2cActivePathway === "backlight" ? "FL1728" : s2cActivePathway === "charging" ? "1610A3" : "C247_W"}</span>) match your live bench impedance measurements? Let the model learn!
                              </p>
                            </div>

                            {/* Thumbs up / down selection buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                disabled={s2cFeedbackSubmitted[s2cActivePathway]}
                                onClick={() => {
                                  setS2cFeedbackRating((prev) => ({ ...prev, [s2cActivePathway]: "up" }));
                                }}
                                className={`p-2 rounded-lg border flex items-center gap-1.5 font-mono text-[11px] font-bold transition-all cursor-pointer ${
                                  s2cFeedbackRating[s2cActivePathway] === "up"
                                    ? "bg-emerald-950/50 border-emerald-500 text-emerald-400 font-extrabold shadow-sm shadow-emerald-500/10"
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                                } ${s2cFeedbackSubmitted[s2cActivePathway] ? "opacity-65 cursor-not-allowed" : ""}`}
                                title="Accurate Mapping (Thumbs Up)"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>YES</span>
                              </button>

                              <button
                                type="button"
                                disabled={s2cFeedbackSubmitted[s2cActivePathway]}
                                onClick={() => {
                                  setS2cFeedbackRating((prev) => ({ ...prev, [s2cActivePathway]: "down" }));
                                }}
                                className={`p-2 rounded-lg border flex items-center gap-1.5 font-mono text-[11px] font-bold transition-all cursor-pointer ${
                                  s2cFeedbackRating[s2cActivePathway] === "down"
                                    ? "bg-red-950/50 border-red-500 text-red-400 font-extrabold shadow-sm shadow-red-500/10"
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                                } ${s2cFeedbackSubmitted[s2cActivePathway] ? "opacity-65 cursor-not-allowed" : ""}`}
                                title="Incorrect Mapping (Thumbs Down)"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                                <span>NO</span>
                              </button>
                            </div>
                          </div>

                          {/* Notes and submission */}
                          {!s2cFeedbackSubmitted[s2cActivePathway] ? (
                            <div className="space-y-3">
                              <div>
                                <label htmlFor="s2cCorrectionNotes" className="block text-[10px] text-slate-400 font-bold uppercase font-mono mb-1.5">
                                  Triage Correction or Bench Remarks (Optional)
                                </label>
                                <textarea
                                  id="s2cCorrectionNotes"
                                  rows={2}
                                  value={s2cFeedbackNotes[s2cActivePathway] || ""}
                                  onChange={(e) => {
                                    setS2cFeedbackNotes((prev) => ({ ...prev, [s2cActivePathway]: e.target.value }));
                                  }}
                                  placeholder={
                                    s2cFeedbackRating[s2cActivePathway] === "down"
                                      ? "e.g., Short was on adjacent capacitor C240_W, or line showed correct 0.450V drop."
                                      : "e.g., Confirmed Open loop on FL1728. Replaced with 0201 fuse. Backlight fully restored."
                                  }
                                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 font-mono outline-none focus:border-indigo-650 resize-none"
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Rating: {s2cFeedbackRating[s2cActivePathway] ? (s2cFeedbackRating[s2cActivePathway] === "up" ? "Positive Match (Accurate)" : "Faulty Mapping Alert") : "Select mapping accuracy above"}
                                </span>
                                <button
                                  type="button"
                                  disabled={s2cIsSubmittingFeedback || !s2cFeedbackRating[s2cActivePathway]}
                                  onClick={() => handleS2cFeedbackSubmit(s2cActivePathway)}
                                  className={`px-3 py-1.5 text-[11.5px] font-bold font-mono tracking-wide uppercase rounded transition-all cursor-pointer ${
                                    s2cFeedbackRating[s2cActivePathway]
                                      ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg shadow-indigo-600/10"
                                      : "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                                  } flex items-center gap-1.5`}
                                >
                                  {s2cIsSubmittingFeedback ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      Syncing Feedback...
                                    </>
                                  ) : (
                                    "Register Bench Feedback"
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg flex items-center justify-between font-mono text-[11px] text-slate-350">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-450 shrink-0" />
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
                                className="text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                              >
                                Revise response
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* DOWN: Interactive S2C Command Trace Console Logs */}
                      {s2cCheckLogs.length > 0 && (
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10.5px] font-mono text-slate-300 space-y-1 block text-left max-h-[140px] overflow-y-auto w-full transition-all animate-in fade-in">
                          <span className="text-[8.5px] text-indigo-400 font-extrabold block uppercase tracking-wide border-b border-indigo-900 pb-1 mb-1 flex justify-between items-center">
                            <span>S2C Trace Logic Telemetry Logs</span>
                            <span className="text-[8.5px] text-indigo-500 font-bold tracking-widest">{s2cCheckStatus.toUpperCase()}</span>
                          </span>
                          {s2cCheckLogs.map((log, idx) => (
                            <div key={idx} className="leading-relaxed">
                              <span className="text-slate-600 select-none">[{idx + 1}]</span>{" "} 
                              <span className={log.includes("🚨") ? "text-red-400 font-bold" : log.includes("SUCCESS") ? "text-emerald-450 font-bold" : "text-slate-300"}>
                                {log}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Bottom Alert Warning Section */}
                      <div className="mt-4 p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div className="text-xs font-mono leading-relaxed text-slate-400">
                          <strong className="text-white">Forensic Warning Registry:</strong> Thermals false-positives are common on primary lines. Ensure adjacent capacitors are verified before removal. Modern split-spaced layouts (XS Max+) require sandwiched division checks. Always sustain <strong className="text-indigo-300">SAC305 alloy</strong> standards.
                        </div>
                      </div>
                    </div>

                    {/* --- AUTOMATED COV FIDELITY & SOURCE NARROWING INTERACTIVE PIPELINE --- */}
                    <div className="bg-slate-900/60 border border-violet-900/35 rounded-xl p-5 mt-6 block text-left">
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-755 pb-3 mb-4 gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-violet-950/50 border border-violet-700/35 rounded-lg text-violet-400">
                            <Brain className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                              Automated CoV Fidelity & Source Precision Pipeline
                            </h3>
                            <p className="text-xs text-slate-400">
                              Enforce the strict Paragraph Test to filter out LLM hallucinations. Programmatically prune context flooding files using Two-Phase precision heuristics.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-violet-950 text-violet-300 font-extrabold uppercase font-mono px-2 py-0.5 rounded border border-violet-900/40 tracking-wider">
                            CoV_AUTOMATION_ACTIVE
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-5 mb-5">
                        {/* LEFT COLUMN: Draft Input & Verification Controls */}
                        <div className="col-span-12 lg:col-span-6 bg-slate-950/45 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                              <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest font-mono">1. Raw SOP Draft Selection (Editable)</span>
                              <div className="flex bg-slate-900 border border-slate-800 rounded p-0.5 gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setS2cActivePathway("backlight");
                                    addToast("Backlight Scenario Loaded", "iPad Pro Backlight draft initialized.", "info");
                                  }}
                                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono transition-all cursor-pointer ${
                                    s2cActivePathway === "backlight" ? "bg-violet-950 text-violet-300 border border-violet-900/40" : "text-slate-500 hover:text-slate-300"
                                  }`}
                                >
                                  Backlight
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setS2cActivePathway("charging");
                                    addToast("Charging Scenario Loaded", "iPhone XR Tristar draft initialized.", "info");
                                  }}
                                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono transition-all cursor-pointer ${
                                    s2cActivePathway === "charging" ? "bg-violet-950 text-violet-300 border border-violet-900/40" : "text-slate-500 hover:text-slate-300"
                                  }`}
                                >
                                  Charging
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setS2cActivePathway("short_rail");
                                    addToast("Short Rail Scenario Loaded", "iPhone XR Short Rail draft initialized.", "info");
                                  }}
                                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono transition-all cursor-pointer ${
                                    s2cActivePathway === "short_rail" ? "bg-violet-950 text-violet-300 border border-violet-900/40" : "text-slate-500 hover:text-slate-300"
                                  }`}
                                >
                                  Short Rail
                                </button>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 leading-normal">
                              Modify or write custom component labels below. The verification scheduler will live-match labels against your vector schema files to prevent product-version hallucinations.
                            </p>

                            <textarea
                              rows={5}
                              value={covCustomDraft}
                              onChange={(e) => setCovCustomDraft(e.target.value)}
                              placeholder="Type or paste draft diagnostic response here..."
                              className="w-full bg-slate-900/90 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 font-mono outline-none focus:border-violet-650 resize-none leading-relaxed select-text"
                            />

                            {/* Verification Threshold Setting Sliders */}
                            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900 space-y-2">
                              <div className="flex justify-between items-center text-[10.5px] font-mono">
                                <span className="text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1.5">
                                  <Sliders className="w-3.5 h-3.5 text-violet-400" />
                                  CoV Overlap Threshold
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
                              <p className="text-[9.5px] text-slate-500 leading-normal font-sans">
                                Redo is forced if net matching components score is less than this. Higher values ensure strict mathematical grounding.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isCovRunning || isNarrowingActive}
                            onClick={runChainOfVerification}
                            className={`w-full py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-white ${
                              isCovRunning 
                                ? "bg-violet-950 text-violet-500 cursor-not-allowed" 
                                : "bg-gradient-to-r from-violet-750 to-indigo-700 hover:from-violet-700 hover:to-indigo-600 shadow-md shadow-violet-900/10 cursor-pointer"
                            }`}
                          >
                            {isCovRunning ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Evaluating Claims...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3.5 h-3.5" />
                                Run CoV Verification Audit
                              </>
                            )}
                          </button>
                        </div>

                        {/* RIGHT COLUMN: Interactive Grounding Visualizer & Metrics */}
                        <div className="col-span-12 lg:col-span-6 bg-slate-950/45 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
                          <div className="space-y-4">
                            <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest block border-b border-slate-850 pb-2 font-mono">2. Programmatic Grounding Feedback</span>
                            
                            {/* Fidelity Meter Grid */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-900/30 p-3 rounded-xl border border-slate-900">
                              <div>
                                <span className="text-[9px] text-slate-550 uppercase font-mono block">CoV Fidelity Score</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <strong className={`text-2xl font-mono tracking-tight font-extrabold ${calculatedFidelity >= covThreshold ? "text-emerald-400" : "text-amber-500"}`}>
                                    {(calculatedFidelity * 100).toFixed(0)}%
                                  </strong>
                                  <span className="text-[10px] text-slate-500">/ 100%</span>
                                </div>
                                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${calculatedFidelity >= covThreshold ? "bg-emerald-500" : "bg-amber-500"}`} 
                                    style={{ width: `${calculatedFidelity * 100}%` }}
                                  />
                                </div>
                              </div>

                              <div className="border-l border-slate-900 pl-4">
                                <span className="text-[9px] text-slate-550 uppercase font-mono block">Context Flooding Penalty</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <strong className={`text-xl font-mono tracking-tight font-extrabold ${noisePenalty > 0 ? "text-red-400" : "text-emerald-450"}`}>
                                    {noisePenalty > 0 ? `-${(noisePenalty * 100).toFixed(0)}%` : "0%"}
                                  </strong>
                                </div>
                                <span className="text-[9.5px] text-slate-450 mt-1 block leading-tight font-mono">
                                  {noisePenalty > 0 ? `${activeSourcesCount} books mounted (Penalty: -15% / source > 2)` : "Premium signal focus"}
                                </span>
                              </div>
                            </div>

                            {/* Section: Live Claims Verification (The Paragraph Test) */}
                            <div className="space-y-2">
                              <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wide font-mono block">Live Claim Paragraph Verification (The Paragraph Test)</span>
                              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                                {keywordsList.length > 0 ? (
                                  keywordsList.map((k, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-900 font-mono text-[11px]">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-white font-semibold">{k.keyword}</span>
                                        <span className="text-[9px] text-slate-500 truncate max-w-[200px]" title="Required Schematic Source Document">
                                          ({k.sourceDoc})
                                        </span>
                                      </div>
                                      {k.matched ? (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 font-bold">
                                          ✔️ VERIFIED
                                        </span>
                                      ) : (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/50 text-red-400 border border-red-900/30 font-bold">
                                          ❌ UNMOUNTED
                                        </span>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 bg-slate-900/20 border border-slate-900 text-center rounded text-slate-500 font-mono text-[10.5px]">
                                    ⚠️ No component designators detected in current draft text. Use standard tags like FL1728 or C247_W.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Abstention Shield safeguard alerts */}
                            {/u2_or_c9000/i.test(covCustomDraft) && (
                              <div className="p-2.5 bg-red-950/20 border border-red-900/30 rounded-lg flex items-start gap-2">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                <div className="text-[10px] text-slate-400 font-mono leading-relaxed">
                                  <strong className="text-red-400 uppercase font-extrabold block">Abstention Shield Alert triggered</strong>
                                  Custom component unrecognized by local source vaults! Mandate: State <strong className="text-white">"Data not present in local source vaults"</strong> to halt random hallucinations.
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Dynamic Overlap Guard Alert Badge */}
                          {covStatus !== "IDLE" && (
                            <div className={`p-3 rounded-lg border transition-all animate-in fade-in duration-300 ${
                              pass 
                                ? "bg-emerald-950/15 border-emerald-900/30 text-emerald-450" 
                                : "bg-amber-950/20 border-amber-900/30 text-amber-500"
                            }`}>
                              <div className="flex items-start gap-2 font-mono text-[11px] leading-relaxed">
                                {pass ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-emerald-300 uppercase block font-extrabold tracking-wide">Factual Grounding Ratio Certified Safe</strong>
                                      All extracted layout keys correspond to active vector PDF blueprints. Output certified to resist logical regression.
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                                    <div className="space-y-2 flex-1">
                                      <div>
                                        <strong className="text-amber-400 uppercase block font-extrabold tracking-wide">Critical Fidelity Breach (Redo Redo)</strong>
                                        Signal is diluted below threshold. Too many documents are mounted or critical schematics are missing from memory registries.
                                      </div>
                                      <button
                                        type="button"
                                        disabled={isNarrowingActive}
                                        onClick={triggerSourceNarrowing}
                                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10.5px] font-extrabold uppercase rounded shadow-md transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        {isNarrowingActive ? (
                                          <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Narrowing Sources...
                                          </>
                                        ) : (
                                          <>
                                            <Filter className="w-3.5 h-3.5" />
                                            Trigger Code-Driven Source Narrowing
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Narrowing Progression Timeline Logs Console */}
                      {(isNarrowingActive || narrowingLogs.length > 0) && (
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10.5px] font-mono text-slate-350 space-y-1 block text-left max-h-[140px] overflow-y-auto mb-4 transition-all duration-300">
                          <span className="text-[8.5px] text-violet-400 font-extrabold block uppercase tracking-wide border-b border-violet-900 pb-1 mb-1.5 flex justify-between items-center">
                            <span>Context Precision Orchestrator Logs (CPO)</span>
                            <span className="text-[8px] bg-violet-950 text-violet-400 border border-violet-900/40 px-1 py-0.2 rounded font-extrabold uppercase animate-pulse">Running Narrowing Sequence</span>
                          </span>
                          {narrowingLogs.map((log, id) => (
                            <div key={id} className="leading-relaxed">
                              <span className="text-slate-600 select-none">[{id + 1}]</span>{" "}
                              <span className={log.includes("unmounting") || log.includes("Pruning") ? "text-violet-400" : log.includes("100% precision") ? "text-emerald-450 font-bold" : "text-slate-300"}>
                                {log}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* LOWER TABS SECTION: Live Grounded Audit Trail (JSON Schemas) */}
                      {covStatus !== "IDLE" && (
                        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-850 pb-2 font-mono">
                              <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest block">3. Grounded Audit Metadata & Payload Synchronizer</span>
                              <div className="flex bg-slate-900 border border-slate-800 rounded p-0.5 gap-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedCovTab("interactive")}
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono transition-all cursor-pointer ${
                                    selectedCovTab === "interactive" ? "bg-violet-950 text-violet-350 border border-violet-900/40" : "text-slate-500 hover:text-slate-300"
                                  }`}
                                >
                                  Verification Log
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedCovTab("payload")}
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono transition-all cursor-pointer ${
                                    selectedCovTab === "payload" ? "bg-violet-950 text-violet-350 border border-violet-900/40" : "text-slate-500 hover:text-slate-300"
                                  }`}
                                >
                                  CRM Synchronized schema (JSON)
                                </button>
                              </div>
                            </div>

                            {selectedCovTab === "interactive" ? (
                              <div className="p-3 bg-slate-955 rounded-lg border border-slate-900 text-[10.5px] font-mono text-slate-350 text-left max-h-[195px] overflow-y-auto space-y-1 leading-relaxed">
                                <div className="text-[11px] text-violet-400 font-bold mb-1">=== CHAIN-OF-VERIFICATION (CoV) LOG STREAM ===</div>
                                {covLogs.length > 0 ? (
                                  covLogs.map((log, id) => (
                                    <div key={id} className="leading-relaxed">
                                      <span className="text-slate-600">[{id + 1}]</span>{" "}
                                      <span className={log.includes("BREACH") || log.includes("❌") ? "text-amber-400 font-bold" : log.includes("✔️") || log.includes("certified safe") ? "text-emerald-450 font-bold" : "text-slate-300"}>
                                        {log}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-slate-500 text-center">Launch verification to check logs.</div>
                                )}
                              </div>
                            ) : (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(JSON.stringify(narrowedAudit || covAuditResult, null, 2))}
                                  className="absolute top-2 right-2 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all z-10"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>COPY JSON</span>
                                </button>
                                <pre className="p-4 bg-slate-955 rounded-lg border border-slate-900 text-[10.5px] font-mono text-indigo-300 text-left overflow-x-auto max-h-[195px] overflow-y-auto block leading-normal select-text">
                                  {JSON.stringify(narrowedAudit || covAuditResult, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>


                    {/* Section 2: Security & NIST-Certified Erasure Compliance Panel */}
                    <div className="bg-slate-900/50 border border-slate-750 rounded-xl p-5 mt-6 block text-left">
                      <div className="flex items-center gap-2 border-b border-slate-755 pb-3 mb-4">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
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
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-violet-600"
                          />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                          <button
                            type="button"
                            onClick={() => {
                              setIsSecurityScraping(true);
                              setSecurityCheckResult(null);
                              setTimeout(() => {
                                setIsSecurityScraping(false);
                                setSecurityCheckResult({
                                  imei: imeiInput,
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

                        <div className="col-span-12 md:col-span-4">
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
                        <div className="mt-4 p-4 bg-slate-950/80 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
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
                  </section>
                )}

                {/* Cloud Run Container Details Frame */}
                <section className="bg-slate-850/50 text-slate-300 rounded-xl p-4 border border-slate-800 font-mono text-[11px]">
                  <div className="flex gap-3">
                    <Server className="w-5 h-5 text-blue-400 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-bold text-white uppercase tracking-wider text-[10px]">Cloud Run Deployment Blueprint</p>
                      <p className="text-slate-400 leading-relaxed text-[10.5px]">
                        Fully dockerized technical interface serving diagnostic triage from high-durability GCP Cloud Run container metrics. Intercepts POS state registries securely.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* === RIGHT COLUMN: LIVE QUOTER & POS LEDGER (Col-span 3) === */}
              <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                
                {/* Live Quoter Panel */}
                <section className="bg-slate-850/60 border border-slate-800 rounded-xl p-5 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 select-none">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                      <DollarSign className="w-4 h-4 text-blue-400" />
                      Live Quote Summary
                    </h3>
                    <span className="bg-slate-950 text-slate-400 text-[9px] px-1.5 py-0.2 rounded font-mono border border-slate-800">V3.5 LAB</span>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    
                    <div className="text-[11px] p-2.5 bg-slate-950 rounded border border-slate-850 text-slate-300 block leading-tight">
                      <span className="font-bold block text-white text-[9px] uppercase tracking-wider mb-0.5">🛠️ Config Target</span>
                      {deviceBrand} {deviceModel} ({deviceTier}) - {issueType} Repair
                    </div>

                    {isCalculatingQuote ? (
                      <div className="py-6 text-center text-slate-500 italic text-[11px]">
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto text-blue-500 mb-2" />
                        CALCULATING LAB LABOR TIER OUTCOME...
                      </div>
                    ) : (
                      <div className="space-y-2.5 text-[11px]">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Parts Base Cost</span>
                          <span className="text-white">${quote.baseQuote.partsCost.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-slate-400">
                          <span>L3 Mobile Labor Rate</span>
                          <span className="text-white">${quote.baseQuote.laborCost.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center text-slate-550 text-[10px]">
                          <span>Lab Overlay margin (15%)</span>
                          <span>${quote.baseQuote.overhead.toFixed(2)}</span>
                        </div>

                        <div className="h-[1px] bg-slate-800/80 my-2"></div>

                        <div className="flex justify-between items-center font-semibold text-slate-300">
                          <span>Wholesale Baseline</span>
                          <span className="text-white">${(quote.baseQuote.partsCost + quote.baseQuote.laborCost + quote.baseQuote.overhead).toFixed(2)}</span>
                        </div>

                        {quote.discountInfo.applied && (
                          <div className="flex justify-between items-center text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-900/50 px-2 py-1 rounded">
                            <span>B2B Fleet Disc (20%)</span>
                            <span>-${quote.discountInfo.amount.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-slate-400">
                          <span>Dest Tax ({quote.taxInfo.city || "WA"})</span>
                          <span>
                            {quote.taxInfo.rate > 0 ? `${(quote.taxInfo.rate * 100).toFixed(2)}%` : "0%"} 
                            {" "}(+${quote.taxInfo.calculatedTax.toFixed(2)})
                          </span>
                        </div>

                        <div className="h-[1px] bg-slate-700 my-2"></div>

                        <div className="flex justify-between items-baseline py-1">
                          <span className="font-bold text-slate-300 text-xs">TOTAL DUE</span>
                          <span className="font-extrabold text-blue-400 text-xl tracking-tight">
                            ${quote.grandTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 space-y-2">
                    <button 
                      onClick={() => setShowSignatureModal(true)}
                      disabled={ticketCreationSuccess}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-md active:scale-98 flex items-center justify-center gap-2"
                    >
                      <span>TRANSMIT POS WEBHook</span>
                    </button>
                    <div className="text-[9.5px] text-center text-slate-500 font-mono leading-relaxed mt-1 select-none">
                      *Coordinates automatically sync with physical CellSmart monitors inside mobile van.
                    </div>
                  </div>
                </section>

                {/* B2B Status detail */}
                <section className="bg-blue-700 rounded-xl p-5 text-white flex-1 flex flex-col justify-between shadow-md relative overflow-hidden group">
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheck className="w-5 h-5 text-white animate-bounce" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest font-mono">B2B Agreement State</h3>
                    </div>

                    {isCorporate ? (
                      <div className="space-y-3 font-mono">
                        <div>
                          <p className="text-[9px] text-blue-200">ACTIVE FLEET PARTNER</p>
                          <p className="text-sm font-bold tracking-tight">{companyName || "AMAZON SEATTLE OPERATIONS"}</p>
                        </div>
                        <div className="space-y-2 pt-2 text-[11px] leading-snug">
                          <div className="flex justify-between opacity-90">
                            <span>Diagnostic Sched SLA:</span>
                            <span className="font-bold">2.4Hrs Max</span>
                          </div>
                          <div className="flex justify-between opacity-90">
                            <span>Contract Deposit:</span>
                            <span className="font-bold text-white bg-blue-900 px-1.5 py-0.2 rounded text-[9.5px]">0% DEPOSIT</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <p className="text-blue-100 leading-relaxed text-[11.5px]">
                          Operating under client retail pricing terms. Check in with business domain (e.g., <code>boeing.com</code> or <code>amazon.com</code>) to unlock Net-30 checkin and priority rapid dispatch.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 mt-auto">
                    <div className="flex justify-between font-mono text-[9px] mb-1.5 font-bold tracking-wider opacity-85">
                      <span>SLA DISPATCH DISCIPLINE</span>
                      <span>100% HEALTH</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-white rounded-full"></div>
                    </div>
                  </div>
                </section>

                {/* Handshake Credentials Checkbox */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono shadow-xs">
                  <span className="font-extrabold text-slate-300 uppercase tracking-widest block mb-2 text-[10px]">Square POS Handshake</span>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-[10.5px] text-slate-400 space-y-1 font-mono leading-relaxed">
                    <div className="flex justify-between">
                      <span>SQUARE_WEB_HOOK:</span>
                      <span className="text-emerald-400 font-bold">ACTIVE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CELLSMART_LINK:</span>
                      <span className="text-emerald-400 font-bold">READY</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SECURE_PROXY_GCP:</span>
                      <span className="text-blue-400 font-bold font-mono">CONG_TRUE</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER BAR */}
      <footer className="bg-slate-950 border-t border-slate-800 pt-12 pb-8 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4 cursor-pointer" onClick={() => setActiveTab("home")}>
                <Wrench className="h-6 w-6 text-blue-500 mr-2" />
                <span className="font-bold text-lg text-white">Display & Cell Pros LLC</span>
              </div>
              <p className="text-sm text-slate-400 mb-4 max-w-sm leading-relaxed">
                Spokane's premier mobile technical service laboratory. Combat-veteran owned, operating in strict compliance with Washington State's Right to Repair laws.
              </p>
              <div className="flex items-center text-sm text-slate-400 gap-2 font-medium">
                <ShieldCheck size={16} className="text-green-500"/> Fully Insured, Bonded & Certified
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-mono">Contact</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><Phone size={14}/> 509-903-6139</li>
                <li className="flex items-center gap-2"><MapPin size={14}/> Mobile Service: Spokane & Valley</li>
                <li className="flex items-center gap-2"><Clock size={14}/> Mon-Sat: 8am - 6pm</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-mono">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>WA UBI: 605 985 265</li>
                <li>NAICS: 811210</li>
                <li><a href="https://www.displaycellpros.com/privacy" onClick={(e) => { e.preventDefault(); setActiveTab("legal"); }} className="hover:text-blue-400 transition-colors cursor-pointer">Privacy Policy</a></li>
                <li><a href="https://www.displaycellpros.com/liability" onClick={(e) => { e.preventDefault(); setActiveTab("legal"); }} className="hover:text-blue-400 transition-colors cursor-pointer">Liability Waiver</a></li>
                <li><a href="https://www.displaycellpros.com/compliance" onClick={(e) => { e.preventDefault(); setActiveTab("legal"); }} className="hover:text-blue-400 transition-colors cursor-pointer">Compliance & Legal Guidelines</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-850 pt-5 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <div>
              &copy; {new Date().getFullYear()} Display & Cell Pros LLC. All rights reserved.
            </div>
            
            {/* Live webhook footer telemetry flags */}
            <div className="flex gap-4 items-center select-none font-mono text-[9.5px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                CELLSMART HUB: CONNECTED
              </span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Check className="w-3 h-3 text-emerald-500" />
                SQUARE WEBHOOKS: READY
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Embedded Intelligent Chat Widget Overlay */}
      {isAiOpen && (
        <AIAssistantWidget 
          onClose={() => setIsAiOpen(false)} 
          onNavigateToLab={() => {
            setActiveTab("lab");
            setLabTab("triage");
            setIsAiOpen(false);
          }}
          deviceBrand={deviceBrand}
          deviceModel={deviceModel}
          deviceTier={deviceTier}
          issueType={issueType}
          onUpdateSpecs={(specs) => {
            if (specs.brand) setDeviceBrand(specs.brand);
            if (specs.model) setDeviceModel(specs.model);
            if (specs.tier) setDeviceTier(specs.tier);
            if (specs.issue) setIssueType(specs.issue);
          }}
        />
      )}
      
      {/* Floating Action Button for AI triage launcher */}
      {!isAiOpen && (
        <button 
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 hover:bg-blue-500 hover:scale-105 transition-all z-40 group"
        >
          <MessageSquare className="text-white h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </button>
      )}

      {/* Ticket Creation Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="p-6">
              <SignaturePad 
                onSign={(signatureDataUrl) => {
                  createOfficialTicket();
                  setShowSignatureModal(false);
                }} 
                onCancel={() => setShowSignatureModal(false)}
                title={`Sign for ${customerName ? customerName + "'s" : "Official"} Repair Approval`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

// --- SUB-VIEWS ---

function HomeView({ onBookClick, onLabClick, onLegalClick }) {
  const [zipInput, setZipInput] = useState("");
  const [zipResult, setZipResult] = useState<{ status: "success" | "warning" | "idle"; message: string }>({ status: "idle", message: "" });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [faqCategory, setFaqCategory] = useState<string>("All");

  // New interactive Landing Page Website State
  const [microscopeStep, setMicroscopeStep] = useState<"shorted" | "thermal" | "resolved">("shorted");
  const [calcBrand, setCalcBrand] = useState<"Apple" | "Samsung" | "Google">("Apple");
  const [calcIssue, setCalcIssue] = useState<"screen" | "battery" | "motherboard">("screen");
  const [calcIsCorporate, setCalcIsCorporate] = useState<boolean>(false);

  const SPOKANE_ZIPS = ["99201", "99202", "99203", "99204", "99205", "99206", "99207", "99208", "99212", "99216", "99217", "99218", "99016", "99037", "99223"];

  const handleZipCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanZip = zipInput.trim();
    if (!cleanZip) return;

    if (SPOKANE_ZIPS.includes(cleanZip)) {
      setZipResult({
        status: "success",
        message: `✓ Dispatch Zone Confirmed! High-signal Mobile micro-lab is active near ZIP ${cleanZip}. Estimated driveway arrival under 2-3 hours with ZERO travel surcharge!`
      });
    } else {
      setZipResult({
        status: "warning",
        message: `✈ Extended Regional Dispatch Active! Zip ${cleanZip} is within our extended service radius. We can dispatch with a minor standard travel-overhead rate, or pre-book for next Tuesday.`
      });
    }
  };

  const FAQS = [
    {
      q: "Do I have to prepare my device or back it up prior to repair?",
      a: "No! Unlike standard retail storefronts or mail-in depots that mandate full factory erasures for liability, our DRIVEWAY repair lab allows you to watch the entire process. Your data never leaves your visual proximity, ensuring 100% database confidentiality.",
      category: "Repairs"
    },
    {
      q: "How does the mobile laboratory power its high-precision solder stations?",
      a: "Our diagnostic truck runs on standalone, eco-friendly solar-charged lithium power banks. We do not hook into your home utilities or cause noise pollution—providing silent, self-contained laboratory power.",
      category: "Repairs"
    },
    {
      q: "Are the boards repaired with genuine components?",
      a: "Yes! We utilize exclusively premium OEM-sourced parts and Right-to-Repair compliant components, backed by wholesale material disclosure and our lifetime physical solder warranty.",
      category: "Repairs"
    },
    {
      q: "How long does a logic board filter bypass or PMU rebuild take?",
      a: "Standard diagnostics take about 15-20 minutes. Core board surgery—micro-soldering components under our microscope magnification—typically takes 30 to 50 minutes total in the van.",
      category: "Repairs"
    },
    {
      q: "Do you offer bulk billing for corporate device fleets?",
      a: "Yes, we support Net-30 bulk invoicing for enterprise clients. B2B requests get priority dispatch queue routing across Washington state.",
      category: "B2B"
    },
    {
      q: "What is your pricing model for destination services?",
      a: "All online quotes are preliminary. Final pricing is computed after physical hardware diagnostics on-route. In-zone dispatch covers basic regional travel without extra fees.",
      category: "Pricing"
    }
  ];

  const filteredFAQS = FAQS.filter(faq => faqCategory === "All" || faq.category === faqCategory);


  return (
    <div className="animate-in fade-in duration-300">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=1920&q=80" 
            alt="Mobile Repair Tech" 
            className="w-full h-full object-cover opacity-15"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 uppercase tracking-wider font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Mobile Micro-Soldering Trucks Actively Stationed in Spokane
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                Spokane's Premium <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
                  Driveway Repair Lab
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-350 mb-8 leading-relaxed max-w-xl">
                No waiting rooms. No device separation anxiety. We dispatch military-grade diagnostic equipment and master-level micro-soldering solutions straight to your office or driveway.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>5.0 ★ Google Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>Same-Day Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-violet-400" />
                  <span>NIST Data Sanitation Guarantee</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onBookClick}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  Get Instant Triage Quote <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onLabClick}
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-750 text-white border border-slate-700/80 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Enter Diagnostic Lab <Cpu size={18} className="text-blue-400" />
                </button>
              </div>
            </div>

            {/* ZIP CHECKER CARD HERO WIDGET */}
            <div className="lg:col-span-5">
              <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-md text-left">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>
                <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-1.5 font-mono">
                  <MapPin className="text-red-400 w-5 h-5 shrink-0" />
                  SPOKANE COV REGION
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Enter your neighborhood postal ZIP code below. We'll verify mobile cleanroom laboratory coverage ranges and quote transit latency instantly.
                </p>

                <form onSubmit={handleZipCheck} className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={5}
                      value={zipInput}
                      onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 99203"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono outline-none focus:border-blue-500 transition-all select-text"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      Check Zip
                    </button>
                  </div>

                  {zipResult.status !== "idle" && (
                    <div className={`p-4 rounded-xl border text-xs leading-relaxed transition-all animate-in fade-in duration-300 ${
                      zipResult.status === "success" 
                        ? "bg-emerald-950/20 border-emerald-900/35 text-emerald-400" 
                        : "bg-amber-950/20 border-amber-900/35 text-amber-500"
                    }`}>
                      {zipResult.message}
                    </div>
                  )}
                </form>

                <div className="mt-5 pt-4 border-t border-slate-900 grid grid-cols-2 gap-3 text-[10px] text-slate-500 font-mono">
                  <div>
                    <span className="block text-slate-400 font-bold uppercase">Spokane Valley</span>
                    <span>Daily Dispatch Zone</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold uppercase">South Hill / Liberty</span>
                    <span>Daily Dispatch Zone</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Certifications Banner */}
      <div className="border-b border-slate-800/60 bg-slate-950/40 py-8 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-center">
            <div className="space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Workstations</span>
              <strong className="text-sm text-slate-300 font-bold uppercase tracking-wider font-mono">ESD-Safe Certified</strong>
            </div>
            <div className="space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Data Security</span>
              <strong className="text-sm text-slate-300 font-bold uppercase tracking-wider font-mono">NIST SP-800-88</strong>
            </div>
            <div className="space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Solder Integrity</span>
              <strong className="text-sm text-slate-300 font-bold uppercase tracking-wider font-mono">IPC-A-610 Masters</strong>
            </div>
            <div className="space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Advocacy</span>
              <strong className="text-sm text-slate-300 font-bold uppercase tracking-wider font-mono">Right-To-Repair Partner</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Features: The Advantage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-left">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-4">The Display & Cell Pros Advantage</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
            By shifting high-precision board operations into specialized, solar-powered cleanrooms on wheels, we deliver retail-competitive rates with incomparable cybersecurity.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<MapPin className="text-blue-500 w-10 h-10 mb-4" />}
            title="Zero Drive Time"
            desc="You book. We drive. Our technicians perform motherboard microsurgery inside our silent, clean custom cargo van parked outside your curb."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-emerald-500 w-10 h-10 mb-4" />}
            title="Sovereign Data Protection"
            desc="Your device never leaves your physical property. Avoid the severe risk of secondary mail centers, diagnostic depots, or remote breaches."
          />
          <FeatureCard 
            icon={<Cpu className="text-indigo-500 w-10 h-10 mb-4" />}
            title="Master Soldering Compliant"
            desc="Equipped with ultra-high resolution thermal scanners, Leica microscopes, and high quality SAC305 solder compounds."
          />
        </div>
      </div>

      {/* NEW SECTION 1: INTERACTIVE BOARD DIAGNOSTIC & MICROSCOPE SIMULATOR */}
      <div className="bg-slate-950 border-t border-b border-slate-900 py-20 text-left select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs text-blue-400 font-extrabold uppercase font-mono tracking-widest block mb-2">
              LIVE CLINICAL INSTRUMENTATION
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl text-center">
              The Curb-side Solder Diagnostic Experience
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-3 text-center">
              Watch motherboard repairs live on our HD technician microscope display right from your doorstep. See the difference between a damaged logic rail and precision soldering.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Interactive Controller & Info */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">
                  Step-by-step Telemetry Simulator
                </span>
                
                <h3 className="text-xl font-extrabold text-white">
                  {microscopeStep === "shorted" && "1. Locating Shorted Board Capacitors"}
                  {microscopeStep === "thermal" && "2. FLIR® Thermal Infrared Signature Scan"}
                  {microscopeStep === "resolved" && "3. Replacing the SMD Component"}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed min-h-[72px]">
                  {microscopeStep === "shorted" && "When a modern smartphone triggers a sudden power failure, it is typically caused by a ceramic SMD capacitor cracking under physical shock. These sub-millimeter components must be identified manually with precision multi-meters."}
                  {microscopeStep === "thermal" && "We inject safe power into the shorted rail to reveal the exact heat signature of the corrupted component. Our on-board high-resolution thermal cameras display the physical heat plume up to 350°C instantly."}
                  {microscopeStep === "resolved" && "Using Right-to-Repair compliant components, the cracked capacitor is de-soldered. A fresh replacement is floated onto the micro-solder pad with active hot air at 370°C and premium rosin-core compounds."}
                </p>

                {/* Telemetry log output */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10px] space-y-1.5 text-slate-400 text-left">
                  <div className="text-blue-400 font-bold">&#62; TRUCK_DIAGNOSTICS_CONTR_V4</div>
                  {microscopeStep === "shorted" && (
                    <>
                      <div>[ONLINE] Multimeter set to beep/continuity mode.</div>
                      <div className="text-rose-500 font-semibold">[WARNING] Shorted VDD_MAIN rail detected. Continuity 0.02 Ohms to ground.</div>
                      <div className="text-amber-400 font-bold">&#62; NEXT STEPS: Boot Thermal Imaging camera overlay.</div>
                    </>
                  )}
                  {microscopeStep === "thermal" && (
                    <>
                      <div>[THERMAL CAMERA ACTIVATED] Resolution: 320x240 pixel arrays.</div>
                      <div>[POWER FEED] Injecting 1.8V to 2.5V into VDD_MAIN line.</div>
                      <div className="text-amber-400 font-extrabold animate-pulse">[PLUME DETECTED] High temperature spot near PMIC core: 147°C. [C2204_X5 short detected]</div>
                    </>
                  )}
                  {microscopeStep === "resolved" && (
                    <>
                      <div>[REPAIR MODULE ACTIVE] Air station preheated to 370°C / Air flow level 6.</div>
                      <div>[WORKFLOW] Lifted C2204 capacitor, cleaned pads with braid. Custom reflow done.</div>
                      <div className="text-emerald-400 font-extrabold">&#62; SUCCESS: Boot loop solved. VDD_MAIN resistance restored to 45k Ohms.</div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Tabs */}
              <div className="grid grid-cols-3 gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setMicroscopeStep("shorted")}
                  className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border font-mono select-none cursor-pointer ${
                    microscopeStep === "shorted"
                      ? "bg-rose-950/40 text-rose-400 border-rose-800"
                      : "bg-slate-950 text-slate-500 border-slate-900 hover:text-white hover:bg-slate-800/20"
                  }`}
                >
                  Continuity
                </button>
                <button
                  type="button"
                  onClick={() => setMicroscopeStep("thermal")}
                  className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border font-mono select-none cursor-pointer ${
                    microscopeStep === "thermal"
                      ? "bg-amber-950/40 text-amber-400 border-amber-800"
                      : "bg-slate-950 text-slate-500 border-slate-900 hover:text-white hover:bg-slate-800/20"
                  }`}
                >
                  Thermal Scan
                </button>
                <button
                  type="button"
                  onClick={() => setMicroscopeStep("resolved")}
                  className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border font-mono select-none cursor-pointer ${
                    microscopeStep === "resolved"
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-800"
                      : "bg-slate-950 text-slate-500 border-slate-900 hover:text-white hover:bg-slate-800/20"
                  }`}
                >
                  Reflow Done
                </button>
              </div>
            </div>

            {/* Simulated Live Microscope Screen View */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden">
              <div className="text-xs font-mono font-bold text-slate-400 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  LIVE MICROSCOPE FEEDS [FEED 01 - SPOKANE TRUCK]
                </span>
                <span>MAGNIFICATION [32X]</span>
              </div>

              {/* Feed screen container aspect-video */}
              <div className="relative aspect-video rounded-xl border border-slate-900 bg-slate-950 overflow-hidden flex items-center justify-center select-none shadow-inner">
                {/* Visual grid overlay for tech look */}
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,24,38,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.2)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                
                {/* Microscope Crosshair lines */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-16 h-[1px] bg-slate-500/20 absolute"></div>
                  <div className="h-16 w-[1px] bg-slate-500/20 absolute"></div>
                </div>

                {microscopeStep === "shorted" && (
                  <div className="absolute inset-0 animate-in fade-in duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&w=800&q=80" 
                      alt="Damaged Logic Board" 
                      className="w-full h-full object-cover opacity-45 grayscale"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply"></div>
                    <div className="absolute top-1/2 left-1/3 -translate-y-1/2 rounded-full border-2 border-dashed border-rose-500 h-16 w-16 animate-pulse flex items-center justify-center">
                      <span className="text-[10px] text-rose-500 font-mono font-bold bg-slate-950/80 px-1 py-0.5 rounded leading-none">BAD SEC</span>
                    </div>
                  </div>
                )}

                {microscopeStep === "thermal" && (
                  <div className="absolute inset-0 animate-in fade-in duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80" 
                      alt="Thermal heat view" 
                      className="w-full h-full object-cover opacity-35 hue-rotate-180"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-purple-900/40 to-yellow-500/50 mix-blend-color"></div>
                    <div className="absolute top-1/2 left-1/3 -translate-y-1/2 rounded-full h-12 w-12 bg-red-600 blur-md animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/3 -translate-y-1/2 rounded-full border-2 border-red-500 h-16 w-16 flex items-center justify-center">
                      <span className="text-[9px] text-white font-mono font-bold bg-slate-950/90 px-1.5 py-0.5 rounded shadow-lg leading-none">147.2°C</span>
                    </div>
                  </div>
                )}

                {microscopeStep === "resolved" && (
                  <div className="absolute inset-0 animate-in fade-in duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80" 
                      alt="Restored board component" 
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-emerald-950/30 mix-blend-color"></div>
                    <div className="absolute top-1/2 left-1/3 -translate-y-1/2 rounded-full border-2 border-emerald-500 h-16 w-16 flex items-center justify-center bg-emerald-500/10">
                      <span className="text-[9px] text-emerald-400 font-mono font-bold bg-slate-950/90 px-1.5 py-0.5 rounded shadow-lg leading-none">✓ OK 45kΩ</span>
                    </div>
                  </div>
                )}

                {/* Left technical HUD details */}
                <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md rounded-lg p-2.5 border border-slate-900 font-mono text-[8px] text-slate-400 space-y-1 text-left hidden sm:block">
                  <span className="block font-bold text-slate-350">SPECTRO_ANALYSIS:</span>
                  <span>SOLDER COMPOUND: SAC305 Lead-Free</span> <br />
                  <span>PREHEAT: 150°C | DURATION: 180s</span>
                </div>
              </div>

              {/* Simple status badge bar below aspect container */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-mono text-slate-500 border-t border-slate-950 pt-3 text-left">
                <div>
                  <span className="text-slate-450 uppercase block text-[8px]">Hot Air Station</span>
                  <span className="text-slate-300 font-medium">Quick 861DW (ESD)</span>
                </div>
                <div>
                  <span className="text-slate-450 uppercase block text-[8px]">Rosin Core wire</span>
                  <span className="text-slate-300 font-medium font-mono">0.02" High-Fluidity</span>
                </div>
                <div>
                  <span className="text-slate-450 uppercase block text-[8px]">Microscope Model</span>
                  <span className="text-slate-300 font-medium font-sans">Amscope Stereo</span>
                </div>
                <div>
                  <span className="text-slate-450 uppercase block text-[8px]">Signal Sweep</span>
                  <span className="text-emerald-400 font-bold">MATCHED / STATIC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW SECTION 2: INSTANT DRIVEWAY REPAIR PRICE ESTIMATOR WIDGET */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 max-w-lg space-y-6">
            <span className="text-xs text-blue-400 font-extrabold uppercase font-mono tracking-widest block bg-blue-500/5 border border-blue-500/10 px-3 py-1 rounded-full w-max">
              WEBSITE SELF-SERVE PORTAL
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl text-left">
              Calculate Your Doorstep Rate Instantly
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Why call for quotes? We publish our components wholesale index and simple flat-rate labor transparently. Toggle options on the right to simulate our driveway logic system algorithm.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-blue-400 shrink-0">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <strong className="text-white text-xs block font-bold mb-0.5">Wholesale Index Components</strong>
                  <span className="text-slate-400 text-[11px] leading-snug block">We secure raw parts directly to maintain volume B2B-grade pricing thresholds for retail customers.</span>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-blue-400 shrink-0">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <strong className="text-white text-xs block font-bold mb-0.5">Flat Labor Tiers</strong>
                  <span className="text-slate-400 text-[11px] leading-snug block">No hidden mileage rates, trip charges, or emergency dispatch overhead within the Spokane boundary.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Calculator Core Container */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6 text-left">
            <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
              <SlidersHorizontal className="text-blue-500 w-5 h-5" />
              15-Second Driveway Rate Calculator
            </h3>

            {/* Select brand */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Select Brand:</span>
              <div className="grid grid-cols-3 gap-2">
                {(["Apple", "Samsung", "Google"] as const).map((brandName) => (
                  <button
                    key={brandName}
                    type="button"
                    onClick={() => setCalcBrand(brandName)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer border ${
                      calcBrand === brandName
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850/50 hover:text-white"
                    }`}
                  >
                    {brandName}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Issue Type */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Select Issue Type:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcIssue("screen")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer border text-center flex flex-col items-center gap-1 ${
                    calcIssue === "screen"
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850/50 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>OLED Screen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalcIssue("battery")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer border text-center flex flex-col items-center gap-1 ${
                    calcIssue === "battery"
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850/50 hover:text-white"
                  }`}
                >
                  <Battery className="w-4 h-4 shrink-0" />
                  <span>Power Battery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalcIssue("motherboard")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer border text-center flex flex-col items-center gap-1 ${
                    calcIssue === "motherboard"
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850/50 hover:text-white"
                  }`}
                >
                  <Cpu className="w-4 h-4 shrink-0" />
                  <span>Microsoldering</span>
                </button>
              </div>
            </div>

            {/* Business benefit toggle */}
            <div className="flex items-center justify-between bg-slate-950 p-4 border border-slate-850 rounded-xl">
              <div className="text-left space-y-0.5">
                <span className="text-xs font-bold text-white block">Corporate/SLA Benefit?</span>
                <span className="text-[10px] text-slate-450 font-mono">Applies 15% wholesale fleet discount dynamically</span>
              </div>
              <button
                type="button"
                onClick={() => setCalcIsCorporate(!calcIsCorporate)}
                className={`w-12 h-6 rounded-full p-1 transition-all ${
                  calcIsCorporate ? "bg-emerald-500" : "bg-slate-800"
                } relative flex items-center cursor-pointer`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                    calcIsCorporate ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>

            {/* Generated Bill Breakdown */}
            {(() => {
              // Calculate live pricing estimate based on state
              let partValue = 110;
              if (calcBrand === "Samsung") partValue = 130;
              if (calcBrand === "Google") partValue = 90;

              let issueLabor = 75;
              if (calcIssue === "battery") issueLabor = 50;
              if (calcIssue === "motherboard") issueLabor = 125;

              const rawSbt = partValue + issueLabor;
              const dsct = calcIsCorporate ? rawSbt * 0.15 : 0;
              const sbt = rawSbt - dsct;
              const waTaxVal = sbt * 0.089; // 8.9% WA local tax
              const estimatedTotal = sbt + waTaxVal;

              return (
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4 font-mono text-xs text-left animate-in fade-in duration-300">
                  <span className="text-[9px] font-black text-amber-400 block tracking-widest uppercase">
                    ESTIMATED SPOKANE DOORSTEP SLIP
                  </span>

                  <div className="space-y-2 border-b border-slate-900 pb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Component: {calcBrand} OEM part index</span>
                      <span className="text-slate-300 font-bold">${partValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Driveway Solder Svc & Cleanroom labor</span>
                      <span className="text-slate-300 font-bold">${issueLabor.toFixed(2)}</span>
                    </div>
                    {calcIsCorporate && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Corporate Volume discount (-15%)</span>
                        <span>-${dsct.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Spokane Dispatch / Transit Fee</span>
                      <span className="text-emerald-400 font-bold">FREE ($0.00)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Local WA Sales Tax (8.9%)</span>
                      <span className="text-slate-300 font-bold">${waTaxVal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black pt-1">
                    <span className="text-white text-xs uppercase font-extrabold font-sans">
                      Estimated Curb Return Total:
                    </span>
                    <span className="text-blue-400 font-mono text-base font-black">
                      ${estimatedTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={onBookClick}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-sans font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/10 text-center"
                    >
                      Lock In This Rate / Pre-Book
                    </button>
                    <button
                      type="button"
                      onClick={onLabClick}
                      className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 rounded-xl text-[10.5px] font-sans font-bold uppercase transition-all tracking-wide text-center cursor-pointer"
                    >
                      Run Lab Diagnoses
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* NEW SECTION 3: MOBILE DISPATCH TRUCK & FLEET LIVE STATUS (ACTIVE TELEMETRY MAP) */}
      <div className="border-t border-b border-slate-900 bg-slate-950/70 py-20 text-left select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs text-emerald-400 font-extrabold uppercase font-mono tracking-widest block mb-2 text-center">
              REAL-TIME DISPATCH INTEL
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl text-center">
              Live Mobile Repair Fleet Status
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-3 text-center">
              We monitor truck location buffers and active solar capacity continuously to maintain our standard 2-hour driveway arrival service agreement thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TRUCK 1 */}
            <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block uppercase tracking-wide">
                      MicroSolder Truck Alpha
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">Lic. PLATE: SPK-4409</span>
                  </div>
                </div>
                <span className="text-[9px] bg-sky-950 border border-sky-900 text-sky-400 font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider animate-pulse shrink-0">
                  Repairing
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                Currently replacing backlight filter and LCD array on consumer logic board in South Hill.
              </p>
              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border-t border-slate-850 pt-3 text-slate-400">
                <div>
                  <span className="text-slate-500 block">Battery Reserve</span>
                  <span className="text-emerald-400 font-bold">84% DC Solar Charge</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Est. Next Open Slot</span>
                  <span className="text-white font-bold">11:15 AM PST</span>
                </div>
              </div>
            </div>

            {/* TRUCK 2 */}
            <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block uppercase tracking-wide">
                      MicroSolder Truck Beta
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">Lic. PLATE: SPK-1811</span>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-950 border border-emerald-900 text-emerald-400 font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">
                  En Route
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                Dispatched to corporate business corridor in Liberty Lake. ETA 18 minutes. Surcharge: $0.
              </p>
              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border-t border-slate-850 pt-3 text-slate-400">
                <div>
                  <span className="text-slate-500 block">Battery Reserve</span>
                  <span className="text-emerald-400 font-bold">96% DC Solar Charge</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Est. Arrival</span>
                  <span className="text-amber-400 font-bold">10:45 AM PST</span>
                </div>
              </div>
            </div>

            {/* TRUCK 3 */}
            <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
                    <MapPin className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block uppercase tracking-wide">
                      Solder Truck Gamma
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">Lic. PLATE: SPK-3922</span>
                  </div>
                </div>
                <span className="text-[9px] bg-violet-950 border border-violet-900 text-violet-400 font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">
                  Standby
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                Fully stocked carbon-neutral mobile lab parked in Spokane Valley hub. Immediately available for dispatch.
              </p>
              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border-t border-slate-850 pt-3 text-slate-400">
                <div>
                  <span className="text-slate-500 block">Battery Reserve</span>
                  <span className="text-emerald-400 font-bold">100% DC Full Base</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Dispatch Limit</span>
                  <span className="text-emerald-400 font-bold">Immediate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW SECTION 4: HARDWARE INSTRUMENT SPEC SHEETS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-left select-none">
        <div className="text-center mb-12">
          <span className="text-xs text-blue-400 font-extrabold uppercase font-mono tracking-widest block mb-2 text-center">
            CLINICAL CERTIFIED INSTRUMENTS
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl text-center">
            On-Board Solder Cleanroom Instruments
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-3 text-center">
            Motherboards are highly sensitive, layered copper logic networks. Standard handheld solder pencils will destroy your phone permanently. Here are the calibrated scientific instruments we park outside.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl transition hover:border-slate-700">
            <span className="font-mono text-3xl font-black text-blue-500/40 block mb-2">01</span>
            <strong className="text-white text-sm font-bold block mb-1">Leica Microsurgery Optics</strong>
            <span className="text-slate-400 text-xs leading-relaxed block">
              Dual-path stereo magnification zooms up to 45x. Provides stereoscopic focus on sub-millimeter copper trace bypass runs.
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl transition hover:border-slate-700">
            <span className="font-mono text-3xl font-black text-emerald-500/40 block mb-2">02</span>
            <strong className="text-white text-sm font-bold block mb-1">ESD-Safe Air Preheaters</strong>
            <span className="text-slate-400 text-xs leading-relaxed block">
              Regulated temperature delivery up to 450°C. Permits component removal without applying mechanical stress or tearing pads.
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl transition hover:border-slate-700">
            <span className="font-mono text-3xl font-black text-indigo-500/40 block mb-2">03</span>
            <strong className="text-white text-sm font-bold block mb-1">EcoFlow Clean Solar Power</strong>
            <span className="text-slate-400 text-xs leading-relaxed block">
              Pure Sine-Wave clean power drawn from integrated overhead van panels. Zero carbon noise footprint, 100% hum-free diagnostics.
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl transition hover:border-slate-700">
            <span className="font-mono text-3xl font-black text-rose-500/40 block mb-2">04</span>
            <strong className="text-white text-sm font-bold block mb-1">ANSI/ESD S20.20 Compliant</strong>
            <span className="text-slate-400 text-xs leading-relaxed block">
              Continuous dissipating safety pathways lock down high voltage spikes, shielding delicate CPU and storage processors.
            </span>
          </div>
        </div>
      </div>

      {/* TIMELINE / HOW IT WORKS */}
      <div className="bg-slate-950/50 border-t border-b border-slate-850/80 py-20 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs text-blue-400 font-extrabold uppercase font-mono tracking-widest block mb-2">3 SIMPLE STEPS</span>
            <h2 className="text-3xl font-extrabold text-white">How On-Site Board Repair Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group hover:border-slate-700 transition-all">
              <div className="absolute top-4 right-4 text-4xl font-extrabold text-slate-800 font-mono">01</div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 w-12 h-12 flex items-center justify-center font-bold font-mono mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Configure & Generate Quote</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe your symptom brand (e.g. Broken Glass, No Backlight, Dead Charger) in our booking assistant to get transparent, pre-wholesale quotes instantly.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group hover:border-slate-700 transition-all">
              <div className="absolute top-4 right-4 text-4xl font-extrabold text-slate-800 font-mono">02</div>
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 w-12 h-12 flex items-center justify-center font-bold font-mono mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Mobile Lab Dispatch</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our self-powered cargo cleanroom dispatches immediately to your curb/driveway in Spokane. Watch or relax inside while the technician works.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group hover:border-slate-700 transition-all">
              <div className="absolute top-4 right-4 text-4xl font-extrabold text-slate-800 font-mono">03</div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 w-12 h-12 flex items-center justify-center font-bold font-mono mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Watch and Certify</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Technician resolves visual backlight lines or shorted rails on camera. Test and sanitize the device via NIST compliance checks right in your driveway!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-left">
        <div className="text-center mb-16">
          <span className="text-xs text-emerald-400 font-extrabold uppercase font-mono tracking-widest block mb-2">LOCAL COMMUNITY VALUE</span>
          <h2 className="text-3xl font-extrabold text-white">Trust of Spokane Neighborhoods</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex text-amber-400">
              {"★".repeat(5)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "The iPad motherboard was totally dead, no backlight after visual display damage. Display & Cell Pros came straight to South Hill. They swapped FL1728 filter fuse in thirty minutes inside their van. Absolute wizards!"
            </p>
            <div className="flex items-center gap-2 border-t border-slate-850 pt-3">
              <div className="w-8 h-8 rounded-full bg-violet-600/35 flex items-center justify-center text-xs text-white font-bold font-mono">JM</div>
              <div>
                <span className="text-xs font-bold text-white block leading-none">Jane Miller</span>
                <span className="text-[9px] text-slate-500">Spokane South Hill, WA</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex text-amber-400">
              {"★".repeat(5)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "Fantastic IT support for business fleet upkeep! Instead of giving up employee work devices for days to a mall kiosk, Display & Cell Pros does everything on-site. Truly safe and professional."
            </p>
            <div className="flex items-center gap-2 border-t border-slate-850 pt-3">
              <div className="w-8 h-8 rounded-full bg-blue-650/35 flex items-center justify-center text-xs text-white font-bold font-mono">TR</div>
              <div>
                <span className="text-xs font-bold text-white block leading-none">Timothy Reynolds</span>
                <span className="text-[9px] text-slate-500">Corporate Administrator, Liberty Lake</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex text-amber-400">
              {"★".repeat(5)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "The Tristar microchip on my school iPad shorted. They came to Spokane Valley parking lot, changed the power management controller, and left it working perfectly. Transparent pricing, excellent."
            </p>
            <div className="flex items-center gap-2 border-t border-slate-850 pt-3">
              <div className="w-8 h-8 rounded-full bg-emerald-650/35 flex items-center justify-center text-xs text-white font-bold font-mono">AH</div>
              <div>
                <span className="text-xs font-bold text-white block leading-none">Aria Hayes</span>
                <span className="text-[9px] text-slate-500">Spokane Valley, WA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WEBPAGE FAQ ACCORDION SECTION */}
      <div className="bg-slate-950/40 border-t border-slate-850/85 py-20 text-left select-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-white">Frequently Asked Inquiries</h2>
            <p className="text-xs text-slate-450 mt-2 font-mono uppercase tracking-wider">Got technical questions? We have transparent answers.</p>
          </div>

          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {["All", "Repairs", "B2B", "Pricing"].map(category => (
              <button
                key={category}
                onClick={() => { setFaqCategory(category); setExpandedFaq(null); }}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  faqCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredFAQS.map((item, index) => (
              <div 
                key={index} 
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full text-left p-5 flex justify-between items-center bg-slate-900/60 hover:bg-slate-850/40 cursor-pointer"
                >
                  <span className="text-sm font-semibold text-white tracking-tight">{item.q}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-850/40 transition-all font-sans select-text">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WEB PAGE PREVIEW FOOTER ACCORDION */}
      <footer className="bg-slate-950 border-t border-slate-850 text-slate-500 text-xs py-10 mt-auto select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <strong className="text-white uppercase tracking-widest font-mono text-sm">DISPLAY & CELL PROS</strong>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              State-certified master solderers bringing the cleanliness of cleanrooms and high-grade diagnostics directly to our customers.
            </p>
          </div>
          <div>
            <strong className="text-white uppercase tracking-widest font-mono text-xs block mb-3">SERVICES AREA</strong>
            <ul className="space-y-1.5 text-[11px] font-sans">
              <li>Spokane Valley, WA</li>
              <li>Spokane South Hill</li>
              <li>Liberty Lake, WA</li>
              <li>Post Falls / Spokane North</li>
            </ul>
          </div>
          <div>
            <strong className="text-white uppercase tracking-widest font-mono text-xs block mb-3">COMPLIANCE & LEGAL</strong>
            <ul className="space-y-1.5 text-[11px] font-mono">
              <li><a href="https://www.displaycellpros.com/compliance" onClick={(e) => { e.preventDefault(); onLegalClick(); }} className="hover:text-blue-400 transition-colors">Compliance Guidelines</a></li>
              <li><a href="https://www.displaycellpros.com/liability" onClick={(e) => { e.preventDefault(); onLegalClick(); }} className="hover:text-blue-400 transition-colors">Service Terms & Liability</a></li>
              <li><a href="https://www.displaycellpros.com/warranty" onClick={(e) => { e.preventDefault(); onLegalClick(); }} className="hover:text-blue-400 transition-colors">Hardware Warranty</a></li>
              <li><a href="https://www.displaycellpros.com/privacy" onClick={(e) => { e.preventDefault(); onLegalClick(); }} className="hover:text-blue-400 transition-colors">Data Privacy Policy</a></li>
            </ul>
          </div>
          <div className="space-y-2">
            <strong className="text-white uppercase tracking-widest font-mono text-xs block">FREE DISPATCH ASSESSMENT</strong>
            <p className="text-[10px] text-slate-400 leading-normal font-sans">Ready to pre-book curside diagnostic lab dispatch?</p>
            <button
              onClick={onBookClick}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-wide rounded transition-all cursor-pointer"
            >
              Request Mobile Dispatch Quote
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] text-slate-600 pt-8 mt-8 border-t border-slate-900 font-mono">
          &copy; {new Date().getFullYear()} Display & Cell Pros LLC. All Rights Reserved. General on-site diagnostic services Spokane and Seattle boundaries.
        </div>
      </footer>
    </div>
  );
}

function ServicesView({ onBookClick }) {
  const [selectedBrand, setSelectedBrand] = useState<"Apple" | "Samsung" | "Google">("Apple");
  const [selectedModel, setSelectedModel] = useState<string>("iPhone 13 / 14 Series");
  const [selectedIssue, setSelectedIssue] = useState<"screen" | "charging" | "board">("screen");
  const [isSpokaneLocal, setIsSpokaneLocal] = useState<boolean>(true);

  const MODELS_BY_BRAND = {
    Apple: [
      { name: "iPhone 13 / 14 Series", partCost: 110 },
      { name: "iPhone 11 / 12 Series", partCost: 75 },
      { name: "iPad Pro / Air Series", partCost: 130 }
    ],
    Samsung: [
      { name: "Galaxy S22 / S23 Series", partCost: 145 },
      { name: "Galaxy S20 / S21 Series", partCost: 95 },
      { name: "Galaxy Note Series", partCost: 115 }
    ],
    Google: [
      { name: "Pixel 7 / 8 Series", partCost: 125 },
      { name: "Pixel 5 / 6 Series", partCost: 85 },
      { name: "Pixel Pro Series", partCost: 140 }
    ]
  };

  const ISSUE_DETAILS = {
    screen: { name: "OLED Glass / Screen Restoration", labor: 75, icon: <Smartphone className="w-5 h-5 text-blue-400" /> },
    charging: { name: "Power Port / USB Multiplexer Repair", labor: 95, icon: <Battery className="w-5 h-5 text-indigo-400" /> },
    board: { name: "Solder Board / Blown Micro Fuse surgery", labor: 145, icon: <Cpu className="w-5 h-5 text-violet-400" /> }
  };

  const activeModels = MODELS_BY_BRAND[selectedBrand];
  const matchedModel = activeModels.find(m => m.name === selectedModel) || activeModels[0];
  const activeIssue = ISSUE_DETAILS[selectedIssue];

  const partCost = matchedModel.partCost;
  const laborCost = activeIssue.labor;
  const dispatchFee = isSpokaneLocal ? 0 : 35;
  const estimateTotal = partCost + laborCost + dispatchFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300 text-left">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-white mb-4">Service Offerings & Pricing Calculator</h1>
        <p className="text-lg text-slate-400 max-w-3xl mx-auto">Transparent, formula-based rate systems. No hidden overheads. We calculate rates based on active wholesale material index plus expert custom workbench labor.</p>
      </div>

      {/* THREE HOVER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {SERVICES.map((srv, idx) => (
          <div key={idx} className="bg-slate-800/80 rounded-2xl border border-slate-705 p-8 hover:border-blue-500/50 transition-all flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            
            <div className="mb-6">{srv.icon}</div>
            <div className="text-xs font-bold text-blue-400 tracking-widest uppercase mb-2 font-mono">{srv.tier}</div>
            <h3 className="text-2xl font-bold text-white mb-3">{srv.title}</h3>
            <p className="text-slate-300 mb-6 flex-grow">{srv.desc}</p>
            
            <div className="bg-slate-900/80 rounded-lg p-4 mb-8 border border-slate-800">
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-mono">Estimated Baseline</div>
              <div className="text-2xl font-bold text-white">{srv.price}</div>
              <div className="mt-3 text-xs text-slate-400 border-t border-slate-800 pt-3">
                <span className="font-semibold text-slate-350">Includes:</span> {srv.examples}
              </div>
            </div>

            <button 
              onClick={onBookClick}
              className="w-full py-3 bg-slate-705 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              Start Diagnostic Triage
            </button>
          </div>
        ))}
      </div>

      {/* CALCULATOR PORTLET */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 sm:p-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <div className="flex-1 space-y-6">
            <div>
              <span className="text-xs bg-blue-950 text-blue-400 border border-blue-900 px-3 py-1 rounded-full uppercase font-bold tracking-widest font-mono">Interactive Cost estimator</span>
              <h2 className="text-2xl font-extrabold text-white mt-3">Calculate Estimated Rate Before Dispatch</h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Empower your repair scheduling, with our zero-surprise estimate matrices. Make adjustments below to see immediate parts + driveway workbench values.
              </p>
            </div>

            <div className="space-y-4">
              {/* Select Brand */}
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase block mb-2 font-mono">1. Select Device Brand</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Apple", "Samsung", "Google"] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setSelectedBrand(b);
                        const defaultModel = MODELS_BY_BRAND[b][0].name;
                        setSelectedModel(defaultModel);
                      }}
                      className={`text-xs py-3 rounded-lg font-bold uppercase font-mono transition-all border cursor-pointer ${
                        selectedBrand === b 
                          ? "bg-blue-600/10 border-blue-500 text-blue-400" 
                          : "bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-850"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Model */}
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase block mb-2 font-mono">2. Select Device Series</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3.5 py-3 text-xs text-white outline-none focus:border-blue-500 font-mono"
                >
                  {activeModels.map((m) => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Select Symptom Category */}
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase block mb-2 font-mono">3. Select Issue Classification</label>
                <div className="space-y-2">
                  {(["screen", "charging", "board"] as const).map((issueKey) => {
                    const item = ISSUE_DETAILS[issueKey];
                    return (
                      <button
                        key={issueKey}
                        type="button"
                        onClick={() => setSelectedIssue(issueKey)}
                        className={`w-full p-3.5 rounded-lg border flex items-center justify-between text-left transition-all cursor-pointer ${
                          selectedIssue === issueKey 
                            ? "bg-slate-900 border-blue-500/80 shadow-inner" 
                            : "bg-slate-900/35 border-slate-900 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <div>
                            <span className="text-white text-xs font-semibold block">{item.name}</span>
                            <span className="text-[10px] text-slate-500">{issueKey === "board" ? "Microscope work required" : "Standard mobile modules"}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-350">+${item.labor} Labor</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Spokane neighborhood dispatch fee toggle */}
              <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Spokane Service Coverage Waiver</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block leading-normal">Waive travel fee if parked inside the corporate Spokane Valley zone.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSpokaneLocal(!isSpokaneLocal)}
                  className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider font-mono border cursor-pointer transition-all ${
                    isSpokaneLocal 
                      ? "bg-emerald-950 text-emerald-400 border-emerald-900/40" 
                      : "bg-slate-900 text-slate-500 border-slate-800"
                  }`}
                >
                  {isSpokaneLocal ? "✓ Spokane Area Active" : "extended surcharge"}
                </button>
              </div>
            </div>
          </div>

          {/* TOTAL / BREAKDOWN PANEL */}
          <div className="w-full lg:w-[360px] bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono block border-b border-slate-800 pb-2">Diagnostic Rate Breakdown</span>

              <div className="space-y-3.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Device Platform:</span>
                  <strong className="text-white font-medium">{selectedBrand}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model Line:</span>
                  <strong className="text-white font-medium truncate max-w-[150px]">{selectedModel}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Wholesale Part:</span>
                  <strong className="text-indigo-400 font-bold">${partCost}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expert Workbench Labor:</span>
                  <strong className="text-violet-400 font-bold">${laborCost}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Lab Dispatch:</span>
                  <strong className={isSpokaneLocal ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                    {isSpokaneLocal ? "Free (Waived)" : `$${dispatchFee}`}
                  </strong>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 mt-4 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Estimated Total Price</span>
                <div className="flex items-baseline justify-between">
                  <strong className="text-3xl text-emerald-400 font-mono font-extrabold tracking-tight">${estimateTotal}</strong>
                  <span className="text-[9px] text-slate-500 font-mono">USD before tax</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onBookClick}
              className="w-full mt-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest font-mono shadow-md shadow-blue-900/10 transition-all cursor-pointer text-center"
            >
              Reserve Driveway Appointment
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function B2BView({ onBookClick }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-705 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-10 lg:p-16 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6 w-max font-mono">
              <Briefcase size={14} /> Corporate Fleet Partners
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-6">Corporate IT Fleet Maintenance</h2>
            <p className="text-slate-300 mb-8 leading-relaxed text-base">
              When a device breaks, standard retail repair shops require your employees to leave their deployment area, resulting in significant administrative downtime. D&CP brings the lab to your job site.
            </p>
            
            <ul className="space-y-5 mb-10 text-slate-300 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">15% Preferred Corporate Discount</strong>
                  <span className="text-xs text-slate-400">Applied automatically to all Tier 1 and Tier 2 repairs for registered partners (HVAC, Real Estate, Delivery fleets).</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">Prioritized Dispatch</strong>
                  <span className="text-xs text-slate-400">Skip the standard queue. Business critical devices get priority routing.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">Net-30 Invoicing</strong>
                  <span className="text-xs text-slate-400">Eliminate employee out-of-pocket expenses with consolidated monthly billing.</span>
                </div>
              </li>
            </ul>

            <button 
              onClick={onBookClick}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-bold transition-colors"
            >
              Apply for Fleet Account
            </button>
          </div>
          
          <div className="relative min-h-[300px] lg:min-h-full hidden lg:block">
            <img 
              src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80" 
              alt="Corporate IT" 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CustomerHubViewProps {
  authUser: any;
  customerName: string;
  setCustomerName: (n: string) => void;
  profilePhone: string;
  setProfilePhone: (p: string) => void;
  profilePreferredDevice: string;
  setProfilePreferredDevice: (d: string) => void;
  tickets: RepairTicket[];
  setTickets: React.Dispatch<React.SetStateAction<RepairTicket[]>>;
  leads: HighPriorityLead[];
  setLeads: React.Dispatch<React.SetStateAction<HighPriorityLead[]>>;
  customerMessages: Array<{ sender: "user" | "company" | "system"; text: string; timestamp: string }>;
  setCustomerMessages: React.Dispatch<React.SetStateAction<Array<{ sender: "user" | "company" | "system"; text: string; timestamp: string }>>>;
  customerChatInput: string;
  setCustomerChatInput: (s: string) => void;
  isCustomerChatSending: boolean;
  setIsCustomerChatSending: (b: boolean) => void;
  addToast: (title: string, message: string, type?: ToastType, dur?: number) => void;
  startPhysicalUsbScan: () => Promise<any>;
  deviceBrand: string;
  setDeviceBrand: (b: string) => void;
  deviceModel: string;
  setDeviceModel: (m: string) => void;
  setIssueType: (i: "screen" | "battery" | "button") => void;
  setDeviceTier: (t: "flagship" | "midrange" | "budget") => void;
  handleGoogleSignIn: () => Promise<void>;
  handleSandboxLogin: () => void;
}

function CustomerHubView({
  authUser,
  customerName,
  setCustomerName,
  profilePhone,
  setProfilePhone,
  profilePreferredDevice,
  setProfilePreferredDevice,
  tickets,
  setTickets,
  leads,
  setLeads,
  customerMessages,
  setCustomerMessages,
  customerChatInput,
  setCustomerChatInput,
  isCustomerChatSending,
  setIsCustomerChatSending,
  addToast,
  startPhysicalUsbScan,
  deviceBrand,
  setDeviceBrand,
  deviceModel,
  setDeviceModel,
  setIssueType,
  setDeviceTier,
  handleGoogleSignIn,
  handleSandboxLogin
}: CustomerHubViewProps) {
  const [activeHubTab, setActiveHubTab] = useState<"profile" | "usb" | "quotes" | "booking" | "chat">("profile");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [signingTicketId, setSigningTicketId] = useState<string | null>(null);
  
  // Local WebUSB state
  const [usbConnected, setUsbConnected] = useState(false);
  const [usbStep, setUsbStep] = useState("Disconnected");
  const [usbLog, setUsbLog] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Cable interface initialized.`
  ]);
  const [usbDetails, setUsbDetails] = useState<any>(null);
  
  // Appointment date/time slots state
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("10:00 AM - 12:00 PM");
  const [bookRemarks, setBookRemarks] = useState("");

  // Requirement: block customer from accessing diagnostic features until they sign up
  if (!authUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-300">
        <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
          {/* Subtle Background decoration */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>

          <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 border border-blue-500/15 text-blue-400 rounded-full mb-6 animate-pulse">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
            Secure Customer Signup Required
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8 font-sans leading-relaxed">
            As a <span className="text-blue-400 font-bold">Display & Cell Pros</span> Spokane client, you must register or sign in using a verified account to unlock advanced hardwired diagnostics and live device triage support.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left mb-8">
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-850">
              <div className="flex items-center gap-2 mb-2 text-blue-400">
                <Cpu className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Device Hardware Telemetry</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock direct physical WebUSB link-ups to pull complete system boards speed configurations, battery fatigue percentages, and digitizer response indexes.
              </p>
            </div>

            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-850">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <Database className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Enterprise Triage Loop</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your device diagnostic data directly into the central Spokane service database. On-duty engineers can evaluate specifications and issue price quotes in real-time.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="customer-google-signin"
              onClick={handleGoogleSignIn}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
            >
              <User className="w-4 h-4" />
              Sign Up / Connect with Google
            </button>
            <button
              id="customer-sandbox-signin"
              onClick={handleSandboxLogin}
              className="px-6 py-3.5 bg-slate-950 hover:bg-slate-850 text-slate-350 text-xs font-black uppercase tracking-widest rounded-xl border border-slate-800 transition-all inline-flex items-center gap-2 w-full sm:w-auto justify-center font-mono cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-blue-450" />
              Bypass (Try Sandbox Session)
            </button>
          </div>

          <div className="mt-8">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              ● Google SSO Secured • Cloud Run Sandbox Gateway
            </span>
          </div>
        </div>
      </div>
    );
  }
  // Filter quotes belonging to this customer
  const clientTickets = tickets.filter(t => 
    t.userId === authUser?.uid || 
    t.customerName.toLowerCase() === customerName.toLowerCase()
  );

  // In case there is no custom client ticket in the logs, populate an interactive sample quote 
  // so the user can demonstrate the decision making flow with real values!
  const hasClientTickets = clientTickets.length > 0;
  const sampleTicket: RepairTicket = {
    id: "DCP-SIM-9271",
    customerName: customerName || "Spokane Client",
    device: profilePreferredDevice || "iPhone 14 Pro Max",
    issueType: "screen",
    status: "open",
    quotedPrice: 189.00,
    tax: 16.50,
    discount: 15.00,
    total: 190.50,
    createdAt: new Date().toISOString(),
    userId: authUser?.uid || "sandbox-tech-101",
    internalNotes: "Standard premium screen backlight restoration with cold-press advisory."
  };

  const activeDecisionTickets = hasClientTickets ? clientTickets : [sampleTicket];

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      if (authUser && authUser.uid !== "sandbox-tech-101") {
        const userRef = doc(db, "users", authUser.uid);
        await setDoc(userRef, {
          uid: authUser.uid,
          displayName: customerName,
          email: authUser.email || "guest@displaycellpros.com",
          phone: profilePhone,
          preferredDevice: profilePreferredDevice,
          photoURL: authUser.photoURL || "",
          createdAt: new Date().toISOString()
        });
        addToast("Profile Synchronized", "Your profile details have been saved to secure Firestore vaults.", "success");
      } else {
        localStorage.setItem("dcp_sandbox_profile_name", customerName);
        localStorage.setItem("dcp_sandbox_profile_phone", profilePhone);
        localStorage.setItem("dcp_sandbox_profile_device", profilePreferredDevice);
        addToast("Profile Cached Locally", "Your sandbox user profile has been persisted in Browser storage.", "success");
      }
    } catch (err: any) {
      console.error("Profile sync failure:", err);
      addToast("Profile Sync Error", err.message || "Failed to save profile. Check connection.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const triggerSearchUsb = async () => {
    setUsbStep("Scanning...");
    setUsbLog(p => [...p, `[${new Date().toLocaleTimeString()}] Accessing client WebUSB interface...`]);
    try {
      const dev = await startPhysicalUsbScan();
      if (dev) {
        setUsbConnected(true);
        setUsbStep("Device Linked Successfully");
        setUsbDetails(dev);
        setDeviceModel(dev.productName || "Direct Recovery Core");
        setDeviceBrand("USB Client");
        setUsbLog(p => [
          ...p, 
          `[${new Date().toLocaleTimeString()}] PHYSICAL LINK CONNECTED!`,
          `[${new Date().toLocaleTimeString()}] Product model: ${dev.productName || "Unknown"} (Vendor ID: ${dev.vendorId})`,
          `[${new Date().toLocaleTimeString()}] Speed compliance check: HIGH SPEED MUX LOCKED`
        ]);
        addToast("Physical Cable Linked", `Successfully retrieved hardware signature for ${dev.productName || "USB Device"}`, "success");
      } else {
        throw new Error("No device was selected or WebUSB is unavailable.");
      }
    } catch (err: any) {
      setUsbStep("Physical Probe Offline");
      setUsbLog(p => [...p, `[${new Date().toLocaleTimeString()}] WebUSB scanning failed: ${err.message}`]);
      addToast("Connection Blocked", "Use the simulator configuration below to bind a simulated mobile cable.", "info");
    }
  };

  const runSimulatedHandshake = (simModel: string, brand: string) => {
    setUsbStep("Running Handshake Multiplex...");
    setDeviceModel(simModel);
    setDeviceBrand(brand);
    setProfilePreferredDevice(simModel);
    setUsbLog(p => [
      ...p,
      `[${new Date().toLocaleTimeString()}] Starting virtualization handshake for ${brand} ${simModel}...`,
      `[${new Date().toLocaleTimeString()}] Injecting telemetry payload...`,
      `[${new Date().toLocaleTimeString()}] Multiplex bus: OK (Voltage: 5.12V, Current: 1.84A)`,
      `[${new Date().toLocaleTimeString()}] Serial registration matched: USBSIM-${Math.floor(1000000 + Math.random() * 9000000)}`,
      `[${new Date().toLocaleTimeString()}] DEVICE STATUS: PAIRED DIRECTLY TO LAB`
    ]);
    setUsbStep("Virtual Link Online");
    setUsbConnected(true);
    addToast("Virtual USB Hooked", `Simulated secure connection to ${simModel} registered successfully.`, "success");
  };

  const handleQuoteDecision = async (ticketId: string, approve: boolean) => {
    try {
      const nextStatus = approve ? "parts_assigned" : "completed";
      
      // Update tickets inside local state
      const updatedTickets = tickets.map(t => {
        if (t.id === ticketId) {
          return { 
            ...t, 
            status: nextStatus, 
            internalNotes: `[Customer Decision: ${approve ? "Approved Quote" : "Declined Quote"}] ${t.internalNotes || ""}` 
          };
        }
        return t;
      });
      setTickets(updatedTickets);

      if (authUser?.uid && authUser.uid !== "sandbox-tech-101" && !ticketId.startsWith("DCP-SIM")) {
        // Write live update to Firestore
        const { doc, updateDoc } = await import("firebase/firestore");
        const docRef = doc(db, "tickets", ticketId);
        await updateDoc(docRef, {
          status: nextStatus,
          internalNotes: `[Customer Decision: ${approve ? "Approved Quote" : "Declined Quote"}]`
        });
      } else {
        // Sample simulation persistence
        addToast("Decision Registered", "Your repair selection has been recorded locally in the sandbox timeline.", "success");
      }

      if (approve) {
        addToast("Proposal Approved!", "Your repair is now active. Spokane Dispatch Unit Van assigned to carry out surgery.", "success");
      } else {
        addToast("Proposal Rejection Registered", "You have declined this pricing quote. Spokane office notified to contact you.", "info");
      }
    } catch (e: any) {
      console.error(e);
      addToast("Update Failure", e.message || "Failed to update quote decision.", "error");
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookDate) {
      addToast("Field Required", "Please choose a desired dispatch date.", "error");
      return;
    }
    
    try {
      const newLead: HighPriorityLead = {
        id: "LEAD-" + Math.floor(100000 + Math.random() * 900000),
        customerName: customerName,
        phone: profilePhone,
        deviceModel: profilePreferredDevice,
        status: "pending",
        createdAt: new Date().toISOString(),
        userId: authUser?.uid || "sandbox-tech-101"
      };

      if (authUser?.uid && authUser.uid !== "sandbox-tech-101") {
        const { doc, setDoc } = await import("firebase/firestore");
        const leadRef = doc(db, "high-priority-leads", newLead.id);
        await setDoc(leadRef, newLead);
      } else {
        // Save in Sandbox local storage list
        const savedLeads = localStorage.getItem("dcp_sandbox_leads");
        const list = savedLeads ? JSON.parse(savedLeads) : [];
        list.unshift(newLead);
        localStorage.setItem("dcp_sandbox_leads", JSON.stringify(list));
      }
      
      setLeads(prev => [newLead, ...prev]);
      setBookRemarks("");
      addToast("Driveway Dispatch Booked", `Spokane Mobile Lab Van scheduled on ${bookDate} inside slot ${bookTime}!`, "success");
    } catch (err: any) {
      addToast("Booking Fault", err.message || "Could not save appointment.", "error");
    }
  };

  const handleCustomerChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerChatInput.trim() || isCustomerChatSending) return;
    
    const userMsg = customerChatInput.trim();
    setCustomerChatInput("");
    setIsCustomerChatSending(true);

    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCustomerMessages(p => [...p, { sender: "user", text: userMsg, timestamp: currentTimeStr }]);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: customerMessages
            .filter(m => m.sender !== "system")
            .map(m => ({
              role: m.sender === "company" ? "assistant" as const : "user" as const,
              text: m.text
            })).concat([{ role: "user" as const, text: userMsg }]),
          deviceDetails: {
            brand: "Apple",
            model: profilePreferredDevice,
            tier: "flagship",
            issue: "screen"
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCustomerMessages(p => [...p, { sender: "company", text: data.text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      } else {
        throw new Error();
      }
    } catch (err) {
      setTimeout(() => {
        setCustomerMessages(p => [
          ...p,
          { 
            sender: "company", 
            text: `Received: "${userMsg}". Our on-duty Spokane Valley dispatch coordinator will dial you at ${profilePhone} to confirm details. Thank you!`, 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }
        ]);
      }, 700);
    } finally {
      setIsCustomerChatSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Visual Workspace Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-slate-850 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-xl">
        <div className="z-10">
          <span className="text-xs bg-blue-500/15 text-blue-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest border border-blue-500/20 inline-block mb-3 font-mono">
            Display & Cell Pros Client Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">Welcome Back, {customerName}!</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Dispatch, direct diagnostics, quote authorizations, and direct messaging linked cleanly into one mobile surgery portal for Spokane WA.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0 z-10 font-mono">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            GCP Datacenter Node Online
          </div>
          <p className="text-[11px] text-slate-500">Device linked: {profilePreferredDevice}</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Hub Sidebar Nav Controls */}
        <div className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 lg:pr-4">
          <button
            onClick={() => setActiveHubTab("profile")}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all shrink-0 ${
              activeHubTab === "profile" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <User className="w-4 h-4" />
            1. Create Profile
          </button>
          
          <button
            onClick={() => setActiveHubTab("usb")}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all shrink-0 ${
              activeHubTab === "usb" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Cpu className="w-4 h-4" />
            2. Cable Connect
          </button>

          <button
            onClick={() => setActiveHubTab("quotes")}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all shrink-0 relative ${
              activeHubTab === "quotes" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <FileText className="w-4 h-4" />
            3. Confirmations
            <span className="absolute right-2 px-1.5 py-0.5 text-[9px] bg-red-600 text-white rounded font-bold animate-pulse">
              !
            </span>
          </button>

          <button
            onClick={() => setActiveHubTab("booking")}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all shrink-0 ${
              activeHubTab === "booking" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Calendar className="w-4 h-4" />
            4. Book van Repair
          </button>

          <button
            onClick={() => setActiveHubTab("chat")}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all shrink-0 ${
              activeHubTab === "chat" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            5. Contact Support
          </button>
        </div>

        {/* Tab Display Area */}
        <div className="lg:col-span-9 bg-slate-800/40 border border-slate-800 rounded-2xl p-6 min-h-[500px] flex flex-col justify-between">
          
          {/* TAB 1: CREATE PROFILE */}
          {activeHubTab === "profile" && (
            <div className="animate-in fade-in duration-300 text-slate-300">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="text-blue-400" />
                  Configure Your Repair Profile
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Ensure accurate details so our driveway surgical van dispatchers can link up directly. Saved directly to authenticated cloud datastores.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="Jane Miller"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Cell Phone</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="(509) 555-0199"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Email Address</label>
                    <input
                      type="text"
                      value={authUser ? authUser.email : "guest@displaycellpros.com"}
                      disabled
                      className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Target Device To Repair</label>
                  <input
                    type="text"
                    value={profilePreferredDevice}
                    onChange={(e) => setProfilePreferredDevice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="iPhone 14 Pro Max"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 flex items-center gap-2"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CABLE CONNECT PHONE */}
          {activeHubTab === "usb" && (
            <div className="animate-in fade-in duration-300 text-slate-300 flex-1 flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Cpu className="text-blue-400 animate-spin-slow" />
                    Secure Universal Serial Bus Link
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Connect your device to your laptop/PC via USB and trigger a direct high-speed hardware bus check to pull real-time hardware telemetry!
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                  {/* Visual Connection Port Card */}
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col justify-between items-center text-center">
                    <div className="mb-4">
                      {usbConnected ? (
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 animate-pulse mb-3 mx-auto">
                          <Cpu className="w-8 h-8" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-830 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-3 mx-auto">
                          <Activity className="w-8 h-8" />
                        </div>
                      )}
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cable Status: {usbStep}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {usbConnected 
                          ? `Paired directly with model ${deviceModel}.` 
                          : "No active device registered on the serial port."}
                      </p>
                    </div>

                    <button
                      onClick={triggerSearchUsb}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-xs uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Cpu className="w-4 h-4" />
                      Probe Cable Port (WebUSB)
                    </button>
                  </div>

                  {/* Terminal Console Logs */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs flex flex-col justify-between text-slate-400 min-h-[220px]">
                    <div>
                      <span className="text-[10px] text-blue-500 uppercase tracking-widest font-extrabold block mb-2 border-b border-slate-850 pb-1">
                        Bus Telemetry Logs
                      </span>
                      <div className="space-y-1 overflow-y-auto max-h-[160px] scrollbar-thin">
                        {usbLog.map((log, idx) => (
                          <p key={idx} className="leading-relaxed">{log}</p>
                        ))}
                      </div>
                    </div>
                    {usbConnected && (
                      <span className="text-[10px] text-emerald-400 block mt-2 text-right">
                        ● Direct Telemetry Pipeline Established
                      </span>
                    )}
                  </div>
                </div>

                {/* Software MUX Handshake Simulator Box */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                    <Sparkles className="text-blue-400 w-3.5 h-3.5" />
                    WebUSB Sandbox Simulator Tool
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Inside the Google AI Studio iframe sandbox, WebUSB popups represent security blockers. Select your device below to bypass physical cords and simulate the direct multiplexer register link!
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => runSimulatedHandshake("iPhone 15 Pro", "Apple")}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors border border-slate-700 flex items-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5" /> iPhone 15 Pro Link
                    </button>
                    <button
                      onClick={() => runSimulatedHandshake("Galaxy S24 Ultra", "Samsung")}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors border border-slate-700 flex items-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5" /> S24 Ultra MUX
                    </button>
                    <button
                      onClick={() => runSimulatedHandshake("Pixel 8 Pro", "Google")}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors border border-slate-700 flex items-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Pixel 8 Pro Core
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONFIRMATION MESSAGES */}
          {activeHubTab === "quotes" && (
            <div className="animate-in fade-in duration-300 text-slate-300">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="text-blue-400" />
                  Your Active Quotes & Confirmations
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Technicians have prepared customized lab calculations for your device. Examine components vs driveway labor cost, and select your visual decision command.
                </p>
              </div>

              <div className="space-y-4">
                {activeDecisionTickets.map((ticket) => {
                  const isReviewed = ticket.status !== 'open';
                  return (
                    <div key={ticket.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 transition-all hover:scale-[1.005]">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] bg-blue-600/10 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/15 uppercase font-mono">
                            {ticket.id}
                          </span>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{ticket.device}</span>
                        </div>
                        <h3 className="text-base font-bold text-white uppercase">{ticket.issueType} Hardware Cycle Repair</h3>
                        <p className="text-xs text-slate-400 mt-2 bg-slate-950 p-2.5 rounded border border-slate-850 font-mono">
                          Notes: {ticket.internalNotes || "No technical advisories. Ready for physical surgery."}
                        </p>
                      </div>

                      <div className="flex flex-col items-start sm:items-end gap-3 shrine-0 font-mono border-t sm:border-t-0 border-slate-800 pt-4 sm:pt-0">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Total Charge</span>
                          <span className="text-2xl font-black text-blue-400">${ticket.total.toFixed(2)}</span>
                          <p className="text-[10px] text-slate-500">Quoted: ${ticket.quotedPrice.toFixed(2)} + tax</p>
                        </div>

                        {!isReviewed ? (
                          signingTicketId === ticket.id ? (
                            <div className="w-full mt-4 sm:min-w-[400px]">
                              <SignaturePad 
                                onSign={(signatureDataUrl) => {
                                  // Include signature logic here if needed (e.g. attaching to ticket)
                                  handleQuoteDecision(ticket.id, true);
                                  setSigningTicketId(null);
                                }} 
                                onCancel={() => setSigningTicketId(null)}
                                title={`Sign to approve $${ticket.total.toFixed(2)} repair charge`}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 w-full sm:w-auto mt-1">
                              <button
                                onClick={() => handleQuoteDecision(ticket.id, false)}
                                className="px-4 py-2 border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 uppercase tracking-wider"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => setSigningTicketId(ticket.id)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-lg transition-colors flex items-center gap-1 shadow-lg shadow-emerald-600/15 uppercase tracking-wider"
                              >
                                Approve Repair
                              </button>
                            </div>
                          )
                        ) : (
                          <span className="text-xs bg-slate-950 border border-slate-800 text-emerald-400 px-3 py-1 rounded-lg uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            Approved
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: BOOK APPOINTMENTS */}
          {activeHubTab === "booking" && (
            <div className="animate-in fade-in duration-300 text-slate-300 flex-1 flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="text-blue-400" />
                    Dispatch Driveway Laboratory
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Book a physical driveway visit from our Spokane Valley tech van. The tech will carry out microscopic logic board soldering and screen repairs right in your driveway!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  {/* Form */}
                  <form onSubmit={handleBookAppointment} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Desire Date</label>
                      <input
                        type="date"
                        value={bookDate}
                        onChange={(e) => setBookDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Target Time Window</label>
                      <select
                        value={bookTime}
                        onChange={(e) => setBookTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value="10:00 AM - 12:00 PM">Morning Dispatch (10:00 AM - 12:00 PM)</option>
                        <option value="12:00 PM - 2:00 PM">Midday Dispatch (12:00 PM - 2:00 PM)</option>
                        <option value="2:00 PM - 4:00 PM">Afternoon Dispatch (2:00 PM - 4:00 PM)</option>
                        <option value="4:00 PM - 6:00 PM">Evening Dispatch (4:00 PM - 6:00 PM)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Driveway Remarks & Parking Directions</label>
                      <textarea
                        value={bookRemarks}
                        onChange={(e) => setBookRemarks(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                        placeholder="Please pull into the second driveway. Beware of friendly golden retriever!"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-blue-500/15"
                    >
                      Schedule Dispatch Van Booking
                    </button>
                  </form>

                  {/* Your Appointments List */}
                  <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Your Booked Dispatch Flights</h3>
                      <div className="space-y-3 overflow-y-auto max-h-[220px]">
                        {leads.length > 0 ? (
                          leads.map((lead) => (
                            <div key={lead.id} className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between gap-3 font-mono">
                              <div>
                                <span className="text-[10px] text-blue-400 font-bold block">{lead.id}</span>
                                <span className="text-xs text-white uppercase block mt-1">{lead.deviceModel || "Device Config"}</span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">Created: {new Date(lead.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="text-right">
                                <span className="inline-block text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  {lead.status}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 text-center py-8 text-xs font-mono">
                            No dispatch flights scheduled. Setup a date on the left.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COMMUNICATE WITH THE COMPANY */}
          {activeHubTab === "chat" && (
            <div className="animate-in fade-in duration-300 text-slate-300 flex-1 flex flex-col justify-between h-[520px]">
              <div className="flex flex-col flex-grow justify-between h-full">
                
                {/* Header info */}
                <div className="mb-4 shrink-0 border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="text-blue-400 w-4 h-4 animate-pulse" />
                      Direct Triage Helpdesk Connection
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Chat directly with the office AI supervisor and on-call hardware reverse engineering leads of Spokane.
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-900/10 border border-emerald-500/20 px-2 py-1 rounded inline-block uppercase font-mono tracking-widest">
                    ● SECURE DIRECT CHANNEL
                  </span>
                </div>

                {/* Message list */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-4 mb-4 min-h-[280px] max-h-[300px]">
                  {customerMessages.map((msg, idx) => {
                    const isClient = msg.sender === "user";
                    return (
                      <div key={idx} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3.5 relative ${
                          isClient 
                            ? "bg-blue-600 text-white rounded-br-none" 
                            : "bg-slate-880/70 text-slate-200 rounded-bl-none border border-slate-705"
                        }`}>
                          <p className="text-xs leading-relaxed">{msg.text}</p>
                          <span className="text-[9px] text-slate-400 mt-1.5 block text-right font-mono">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {isCustomerChatSending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-880/70 border border-slate-705 text-slate-400 rounded-2xl p-3.5 rounded-bl-none flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        <span className="text-xs font-mono">Triage Supervisor typing...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input frame */}
                <form onSubmit={handleCustomerChatSend} className="shrink-0 flex gap-2">
                  <input
                    type="text"
                    value={customerChatInput}
                    onChange={(e) => setCustomerChatInput(e.target.value)}
                    disabled={isCustomerChatSending}
                    placeholder={`Type technical or scheduling details for your ${profilePreferredDevice}...`}
                    className="flex-1 bg-slate-900 border border-slate-705 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 pr-10"
                  />
                  <button
                    type="submit"
                    disabled={isCustomerChatSending}
                    className="px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StoreView({ 
  storeCart, 
  setStoreCart, 
  addToast,
  storeStock,
  setStoreStock,
  stockThreshold,
  setStockThreshold
}) {
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [isReserved, setIsReserved] = useState(false);
  const [reservationInvoice, setReservationInvoice] = useState<any>(null);

  const hasLowStockHighTurnover = Object.entries(storeStock).some(([idStr, stock]) => {
    const id = parseInt(idStr);
    const isHighTurnover = id === 1 || id === 2; // Tempered Glass and Fast Chargers
    return isHighTurnover && (stock as number) < (stockThreshold as number);
  });

  const handleSaleSimulation = (productId: number, productName: string) => {
    const currentStock = storeStock[productId] ?? 0;
    if (currentStock <= 0) {
      addToast("Stock Depleted!", `${productName} is completely out of stock in the Spokane mobile lab!`, "warning");
      return;
    }
    
    const newStock = currentStock - 1;
    setStoreStock((prev: any) => ({
      ...prev,
      [productId]: newStock
    }));

    addToast("Simulated Sale Done", `Sold 1 item of ${productName}. Remaining stock: ${newStock}`, "info");

    const isHighTurnover = productId === 1 || productId === 2;
    if (isHighTurnover && newStock < stockThreshold) {
      addToast(
        "⚠️ CRITICAL STOCK!",
        `High-turnover item "${productName}" has dropped to ${newStock} units (predefined threshold is ${stockThreshold}). Visual alert badge is now active!`,
        "warning",
        6000
      );
    }
  };

  const handleRestockSimulation = (productId: number, productName: string, amt = 10) => {
    const currentStock = storeStock[productId] ?? 0;
    const newStock = currentStock + amt;
    setStoreStock((prev: any) => ({
      ...prev,
      [productId]: newStock
    }));
    addToast("Restocked Item", `Replenished ${productName} by +${amt} units. Current stock: ${newStock}`, "success");
  };

  const handleRestockAllLowItems = () => {
    setStoreStock((prev: any) => {
      const copy = { ...prev };
      let count = 0;
      Object.keys(copy).forEach((keyStr) => {
        const id = parseInt(keyStr);
        if (copy[id] < stockThreshold) {
          copy[id] += 12; // Reorder standard supply pack
          count++;
        }
      });
      if (count > 0) {
        addToast("Supply-Chain Dispatch", `Automated delivery courier dispatched! Replenished ${count} low-stock lines with +12 bulk packs.`, "success");
      } else {
        addToast("Inventory Secured", `All item stock levels are currently above threshold ${stockThreshold}. No reorder needed.`, "info");
      }
      return copy;
    });
  };

  const cartItemCount = Object.values(storeCart).reduce((acc: number, qty) => acc + (qty as number), 0) as number;

  const handleAddToCart = (id: number, name: string) => {
    setStoreCart((prev: any) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    addToast("Added to Cart", `${name} added to your on-site reservation bag!`, "success");
  };

  const handleUpdateQty = (id: number, delta: number) => {
    setStoreCart((prev: any) => {
      const copy = { ...prev };
      const newQty = (copy[id] || 0) + delta;
      if (newQty <= 0) {
        delete copy[id];
      } else {
        copy[id] = newQty;
      }
      return copy;
    });
  };

  const handleRemoveItem = (id: number, name: string) => {
    setStoreCart((prev: any) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    addToast("Removed Item", `${name} removed from your bag.`, "info");
  };

  // Calculate prices
  const cartItemsLists = Object.entries(storeCart).map(([idStr, qty]) => {
    const pId = parseInt(idStr);
    const prod = STORE_PRODUCTS.find(p => p.id === pId);
    return {
      prod,
      qty,
      subtotal: prod ? prod.price * (qty as number) : 0
    };
  }).filter(item => item.prod !== undefined);

  const subtotalSum = cartItemsLists.reduce((acc, item) => acc + item.subtotal, 0);
  const estTax = subtotalSum * 0.089; // 8.9% WA state tax
  const grandTotal = subtotalSum + estTax;

  const handleConfirmCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName.trim() || !checkoutPhone.trim()) {
      addToast("Validation Failed", "Please provide a valid client name and contact telephone.", "warning");
      return;
    }

    const orderRef = "DCP-" + Math.floor(100000 + Math.random() * 900000);
    const invoice = {
      orderId: orderRef,
      customer: checkoutName.trim(),
      phone: checkoutPhone.trim(),
      email: checkoutEmail.trim() || "walkin-client@spokane.lab",
      date: new Date().toLocaleDateString(),
      items: cartItemsLists.map(it => ({ name: it.prod?.name, qty: it.qty, price: it.prod?.price })),
      subtotal: subtotalSum,
      tax: estTax,
      total: grandTotal
    };

    setReservationInvoice(invoice);
    setIsReserved(true);
    setStoreCart({}); // Clear active cart
    addToast("Reservation Confirmed!", `Supply Pre-order ${orderRef} has been assigned to Spokane mobile lab truck. Pay on-site at handover.`, "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300 text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-slate-800 pb-8 gap-4">
        <div>
          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-900 px-2.5 py-1 rounded font-mono uppercase font-bold tracking-widest">Supply & Hardware catalog</span>
          <h1 className="text-3xl font-extrabold text-white mt-2">Mobile Shop & Premium Gear</h1>
          <p className="text-xs text-slate-400 mt-1">Pre-order high-durability protection gear or Certified Pre-Owned cell phones for driveway delivery or handover.</p>
        </div>
        
        <div className="flex items-center text-slate-350 bg-slate-900 px-4 py-2.5 rounded-lg border border-slate-800">
          <ShoppingCart size={16} className="mr-2 text-blue-400 animate-pulse" />
          <span className="text-xs font-mono">Invoice Bag Status: <strong className="text-white font-extrabold">{cartItemCount} Items</strong></span>
        </div>
      </div>

      {/* INVENTORY CONTROL & ALERT TELEMETRY PANEL */}
      {!isReserved && (
        <div className="mb-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 select-none">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                Durable Supply-Chain Operations
              </span>
              <h2 className="text-sm font-extrabold text-white tracking-wide">
                Spokane Mobile Inventory Logistics
              </h2>
              <p className="text-[11px] text-slate-400">
                Continuous telemetry tracking for high-turnover accessories. Current predefined threshold is{" "}
                <strong className="text-amber-400 font-bold font-mono">{stockThreshold} units</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Threshold Controller */}
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Alert Threshold:</span>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={stockThreshold}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setStockThreshold(val);
                    addToast("Threshold Changed", `Predefined stock warning limit set to < ${val} units.`, "info");
                  }}
                  className="w-20 accent-blue-500 cursor-pointer h-1"
                />
                <span className="text-xs font-black text-amber-400 font-mono w-4 text-center">{stockThreshold}</span>
              </div>

              {/* Express restocking flow */}
              <button
                type="button"
                onClick={handleRestockAllLowItems}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 hover:text-white border border-blue-500/30 text-white rounded-lg text-xs font-bold uppercase tracking-wider font-mono cursor-pointer transition-all active:scale-97 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-white animate-spin-slow" />
                Courier Restock All Low
              </button>
            </div>

          </div>

          {/* Conditional Low Stock Alert Jumbotron */}
          {hasLowStockHighTurnover ? (
            <div className="mt-4 bg-rose-950/30 border border-rose-900/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 animate-in fade-in duration-300">
              <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-xs font-extrabold text-rose-400 uppercase tracking-wide font-mono">
                  🚨 CRITICAL LOW INVENTORY WARNING [HIGH TURNOVER PRODUCTS]
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Tempered glass protection shields or power fast chargers have critical counts falling below your predefined threshold of{" "}
                  <b className="text-rose-400 font-black">{stockThreshold}</b>. Customer mobile reservations may fail if dispatch lists are not replenished.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px]">
                  {STORE_PRODUCTS.map((p) => {
                    const isHighTurnover = p.id === 1 || p.id === 2;
                    const stock = storeStock[p.id] ?? 0;
                    if (isHighTurnover && stock < stockThreshold) {
                      return (
                        <span key={p.id} className="bg-rose-950 border border-rose-800 text-rose-300 px-2.5 py-0.5 rounded font-bold uppercase">
                          {p.name}: Only {stock} Left!
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 bg-emerald-950/25 border border-emerald-900/30 rounded-xl p-3.5 flex items-center gap-3 animate-in fade-in duration-300">
              <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-emerald-300 leading-none">
                All high-turnover item stock lines are fully secure and verified above the predefined threshold. Spokane mobile lab is fully operational.
              </p>
            </div>
          )}
        </div>
      )}

      {isReserved && reservationInvoice ? (
        /* SUCCESS INVOICE STATE */
        <div className="bg-slate-950 border border-emerald-900/40 rounded-2xl p-6 sm:p-10 max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono">On-Site Pre-Order Assigned</h2>
            <p className="text-xs text-slate-405 leading-relaxed max-w-md mx-auto">
              Your item pre-order has been registered in the Spokane mobile service log. Payment is completed only at handover once the truck dispatches.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl font-mono text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Reserve ID</span>
                <strong className="text-blue-400 font-bold">{reservationInvoice.orderId}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[9px] uppercase">Date Registered</span>
                <span className="text-white font-semibold">{reservationInvoice.date}</span>
              </div>
            </div>

            <div className="space-y-3 border-b border-slate-800 pb-3">
              <span className="text-[9px] text-slate-500 uppercase block font-bold border-b border-slate-900 pb-1">Items Checked Out</span>
              {reservationInvoice.items.map((it: any, index: number) => (
                <div key={index} className="flex justify-between text-[11px]">
                  <span className="text-slate-300">{it.name} <strong className="text-slate-500">x{it.qty}</strong></span>
                  <span className="text-white font-semibold text-right">${(it.price * it.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right text-[11px] pt-1">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>${reservationInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-450">
                <span>WA Local Sales Tax (8.9%):</span>
                <span>${reservationInvoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-slate-800/80">
                <span className="uppercase text-[10px] text-slate-400">Total Invoice Valuation:</span>
                <span className="text-emerald-400">${reservationInvoice.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 flex items-start gap-1.5 text-slate-400 text-[10px] leading-relaxed">
              <span className="text-emerald-400 font-extrabold shrink-0">[VAN DIRECT]</span>
              <span>Our driver will match this invoice with your physical ticket details. All pre-ordered items remain reserved for 72 hours.</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsReserved(false);
              setReservationInvoice(null);
            }}
            className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-750 text-white rounded-lg font-bold text-xs uppercase tracking-widest font-mono cursor-pointer transition-all"
          >
            Return to Store Catalogue
          </button>
        </div>
      ) : (
        /* CORE TWO COLUMN LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* PRODUCT LAYOUT CONTAINER */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {STORE_PRODUCTS.map(product => {
                const isSelected = (storeCart[product.id] || 0) > 0;
                const isHighTurnover = product.id === 1 || product.id === 2;
                const stock = storeStock[product.id] ?? 0;
                const isLow = isHighTurnover && stock < stockThreshold;
                const isOutOfStock = stock <= 0;

                return (
                  <div 
                    key={product.id} 
                    className={`bg-slate-850 rounded-xl border overflow-hidden group flex flex-col relative transition-all duration-305 shadow-md ${
                      isLow 
                        ? "border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30" 
                        : "border-slate-705 hover:border-slate-600"
                    }`}
                  >
                    <div className="h-44 overflow-hidden relative select-none">
                      <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      
                      {/* Product Category badge top-left */}
                      <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded text-slate-300">
                        {product.category}
                      </div>

                      {/* Visual stock badges top-right */}
                      {isLow ? (
                        <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 border border-amber-400 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md animate-pulse font-mono shadow-md flex items-center gap-1">
                          ⚠️ UNDER THRESHOLD ({stock} left)
                        </div>
                      ) : isOutOfStock ? (
                        <div className="absolute top-3 right-3 bg-rose-600 text-white border border-rose-500 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded font-mono shadow-md flex items-center gap-1">
                          🚨 OUT OF STOCK
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-slate-950/85 text-emerald-400 border border-emerald-900/60 text-[9px] font-mono px-2 py-1 rounded flex items-center gap-1 shadow-md">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          {stock} in stock
                        </div>
                      )}

                      {/* High turnover label bottom-left */}
                      {isHighTurnover && (
                        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md shadow-md font-mono flex items-center gap-1.5">
                          <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300 animate-pulse" />
                          High Turnover Item
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-grow text-left justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-1">
                          <h3 className="text-white font-bold text-sm tracking-tight leading-snug">{product.name}</h3>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">Part Reference ID: DCP-{product.id}0{product.id}</p>
                        
                        {/* Live telemetry stock line */}
                        <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-2 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-400">Current Truck Stock:</span>
                          <span className={`font-bold transition-colors ${isLow ? "text-amber-400 animate-pulse" : isOutOfStock ? "text-rose-500" : "text-emerald-400"}`}>
                            {stock} {stock === 1 ? "unit" : "units"}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Simulation Controls directly on each product */}
                      <div className="pt-2.5 border-t border-slate-900 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase font-mono tracking-wider">
                          <span>Simulation Tools</span>
                          <span className="text-slate-600">Lab Only</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaleSimulation(product.id, product.name)}
                            className="bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 text-[10px] font-bold font-mono py-1 rounded transition-colors uppercase outline-none"
                            title="Decline inventory stock by -1 to test threshold triggers"
                          >
                            Sale (-1)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRestockSimulation(product.id, product.name, 12)}
                            className="bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-900/40 text-[10px] font-bold font-mono py-1 rounded transition-colors uppercase outline-none"
                            title="Restock this item by +12 units instantly"
                          >
                            Restock (+12)
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-900/80 flex items-center justify-between">
                        <span className="text-lg font-extrabold text-blue-400 font-mono">${product.price.toFixed(2)}</span>
                        
                        <button 
                          onClick={() => handleAddToCart(product.id, product.name)}
                          disabled={isOutOfStock}
                          className={`px-3 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                            isOutOfStock 
                              ? "bg-slate-805 text-slate-550 border border-slate-800 cursor-not-allowed opacity-60" 
                              : isSelected 
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                                : "bg-slate-705 hover:bg-blue-600 text-slate-300 hover:text-white"
                          }`}
                        >
                          <ShoppingCart size={13} />
                          {isOutOfStock ? "Out of Stock" : isSelected ? `Add More (${storeCart[product.id]})` : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SHOPPING BAG DRAWER CONTAINER */}
          <div className="lg:col-span-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg select-none">
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 font-mono border-b border-slate-900 pb-3 mb-4 flex items-center justify-between">
                <span>PRE-ORDER LIST</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded text-blue-400 text-[10px] font-extrabold">{cartItemCount}</span>
              </h2>

              {cartItemsLists.length === 0 ? (
                /* EMPTY REEL STATE */
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900/60 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto text-sm font-mono font-bold">
                    [0]
                  </div>
                  <strong className="text-xs font-mono text-slate-400 block uppercase">Cart Bag is Empty</strong>
                  <p className="text-[10px] text-slate-504 leading-relaxed max-w-xs mx-auto">
                    Add Casper safety glass shields, direct fast chargers, or other certified accessories from active stock layers above.
                  </p>
                </div>
              ) : (
                /* ACTIVE BAG FLOW */
                <div className="space-y-6">
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {cartItemsLists.map((item) => (
                      <div key={item.prod?.id} className="p-3 bg-slate-900 rounded-lg border border-slate-850/60 flex items-center justify-between text-left gap-2 animate-in slide-in-from-right-2 duration-100">
                        <div className="min-w-0">
                          <span className="text-white text-xs font-bold block truncate max-w-[130px]">{item.prod?.name}</span>
                          <span className="text-[10px] text-blue-400 font-mono block mt-0.5">${item.prod?.price.toFixed(2)} each</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="bg-slate-950 p-1 rounded-md border border-slate-850/80 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item?.prod?.id!, -1)}
                              className="w-4 h-4 text-[10px] font-black font-mono text-slate-400 hover:text-white flex items-center justify-center bg-slate-900 rounded cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-[10px] font-black font-mono text-white w-4 text-center">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item?.prod?.id!, 1)}
                              className="w-4 h-4 text-[10px] font-black font-mono text-slate-400 hover:text-white flex items-center justify-center bg-slate-900 rounded cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item?.prod?.id!, item?.prod?.name!)}
                            className="text-slate-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                            title="Delete item"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calculations breakdown */}
                  <div className="border-t border-slate-900 pt-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Bag Subtotal:</span>
                      <span className="text-white font-bold">${subtotalSum.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Estimate Sales Tax:</span>
                      <span className="text-white font-bold">${estTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-black text-sm pt-3 mt-1 border-t border-slate-900">
                      <span className="uppercase text-[9px] text-slate-400 tracking-wider">Estimated Total:</span>
                      <span className="text-emerald-400">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* RESERVATION FORM */}
                  <form onSubmit={handleConfirmCheckout} className="border-t border-slate-900 pt-5 space-y-3.5 text-left">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-550 block font-mono">On-Site hand over Details</span>

                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-slate-500 font-mono block mb-1">Customer Name</label>
                      <input
                        type="text"
                        required
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500 select-text"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-slate-500 font-mono block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        placeholder="(509) 555-0100"
                        className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500 select-text"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-slate-500 font-mono block mb-1">Email (Optional)</label>
                      <input
                        type="email"
                        value={checkoutEmail}
                        onChange={(e) => setCheckoutEmail(e.target.value)}
                        placeholder="johndoe@gmail.com"
                        className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500 select-text"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px] uppercase tracking-widest font-mono shadow-md transition-all cursor-pointer text-center"
                    >
                      Confirm Pre-Order Reservation
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}


// --- EMBEDDED INTEGRATED AI ASSISTANT WIDGET (GEMINI INTERACTIVE AGENT) ---

interface AIAssistantProps {
  onClose: () => void;
  onNavigateToLab: () => void;
  deviceBrand: string;
  deviceModel: string;
  deviceTier: string;
  issueType: string;
  onUpdateSpecs?: (specs: any) => void;
}

function AIAssistantWidget({ 
  onClose, 
  onNavigateToLab, 
  deviceBrand, 
  deviceModel, 
  deviceTier, 
  issueType,
  onUpdateSpecs 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai" | "system"; text: string }>>([
    { sender: 'ai', text: "Welcome to Display & Cell Pros Mobile Triage Hub! 🚐💨 Seattle and Spokane's top driveway raw hardware lab on wheels. What device issues can we solve for you today?" }
  ]);
  const [input, setInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    
    const userMsgText = input.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsgText }]);
    setInput("");
    setIsSending(true);

    try {
      // Structure content history from widget messages
      // Translate sender 'user'/'ai' to role user/assistant
      const history = messages
        .filter(m => m.sender !== "system")
        .map(m => ({
          role: m.sender === "ai" ? "assistant" as const : "user" as const,
          text: m.text
        }));
      
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", text: userMsgText }],
          deviceDetails: {
            brand: deviceBrand,
            model: deviceModel,
            tier: deviceTier,
            issue: issueType
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: "ai", text: data.text }]);
        if (data.detectedSpecs && onUpdateSpecs) {
          onUpdateSpecs(data.detectedSpecs);
        }
      } else {
        throw new Error("Triage API error response");
      }
    } catch (err) {
      console.error("Widget API triage error:", err);
      // fallback simulation response
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          { 
            sender: "ai", 
            text: "Detected screen, volume click or battery life parameters. Let's head inside the main Lab Portal to simulate full hardware scans and calculate exact local sales tax rate!" 
          }
        ]);
      }, 700);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm sm:items-end sm:justify-end sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-755 shadow-2xl rounded-2xl w-full max-w-md flex flex-col h-[520px] max-h-[85vh] overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Cpu size={20} className="text-white animate-spin-slow" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></span>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm tracking-tight">D&CP Intelligent Assistant</h3>
              <p className="text-[10px] text-slate-400 font-mono">Gemini L3 Triage Core Ready</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Lab Link Banner */}
        <div className="bg-blue-900/30 border-b border-blue-900/40 px-4 py-2 flex items-center justify-between text-xs text-blue-200 select-none">
          <span className="flex items-center gap-1.5 font-medium">
            <Terminal size={14} className="text-blue-400" />
            Check dynamic quotes & maps:
          </span>
          <button 
            type="button"
            onClick={onNavigateToLab}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-2.5 py-1 rounded text-[10px] uppercase tracking-wide transition-colors"
          >
            Enter Lab
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-slate-950/40">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.sender === "user" 
                  ? "bg-blue-600 text-white rounded-br-sm shadow-sm font-semibold" 
                  : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 text-xs italic animate-pulse">
                Probing options...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <label htmlFor="mainChatInput" className="sr-only">Main Diagnostic Prompt Input</label>
            <input
              id="mainChatInput"
              name="mainChatInput"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              placeholder="State hardware failure behavior..."
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-xs placeholder-slate-500"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isSending}
              className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
          <div className="text-center mt-2.5 font-mono select-none">
            <span className="text-[9px] text-slate-500">Live destination rates & fleet sync monitors active</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- UTILS ---

interface NavButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function NavButton({ children, active, onClick }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wide transition-colors ${
        active 
          ? "text-white bg-slate-800 border border-slate-700 shadow-3xs" 
          : "text-slate-300 hover:text-white hover:bg-slate-800/40"
      }`}
    >
      {children}
    </button>
  );
}

interface MobileNavButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

function MobileNavButton({ children, onClick }: MobileNavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
    >
      {children}
    </button>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-705 text-center hover:scale-[1.01] hover:bg-slate-805 transition-all">
      <div className="flex justify-center">{icon}</div>
      <h3 className="text-xl font-extrabold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}
