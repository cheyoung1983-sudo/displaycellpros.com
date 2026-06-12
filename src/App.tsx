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
  Zap
} from "lucide-react";
import { RepairTicket, POSLog, QuoteResponse } from "./types";
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
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
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // --- DIAGNOSTIC HUB STATES ---
  const [labTab, setLabTab] = useState<"triage" | "pos" | "tax">("triage");
  
  // Active Customer & Device Details
  const [customerName, setCustomerName] = useState<string>("Jane Miller");
  const [deviceBrand, setDeviceBrand] = useState<string>("Apple");
  const [deviceModel, setDeviceModel] = useState<string>("iPhone 14 Pro Max");
  const [deviceTier, setDeviceTier] = useState<"flagship" | "midrange" | "budget">("flagship");
  const [issueType, setIssueType] = useState<"screen" | "battery" | "button">("screen");
  
  // Device Hardware Scan state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [scanProgress, setScanProgress] = useState<number>(0);

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
      userId: authUser.uid
    };

    try {
      setFirestoreError(null);
      const docRef = doc(db, "tickets", ticketId);
      await setDoc(docRef, newTicket);
      setTicketCreationSuccess(true);
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

  const handleGoogleSignIn = async () => {
    try {
      setFirestoreError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || "Spokane Client",
        email: user.email || "",
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Google login failed:", err);
      setFirestoreError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAuthUser(null);
      setFirestoreTickets([]);
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  // Firebase Auth Observer subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (user) {
        fetchFirestoreTickets(user.uid);
      } else {
        setFirestoreTickets([]);
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
  const [chatInput, setChatInput] = useState<string>("Screen touch lag and horizontal pink lines");
  const [isChatSending, setIsChatSending] = useState<boolean>(false);

  // POS Tickets and Live Synchronization Logs
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [posLogs, setPosLogs] = useState<POSLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [ticketCreationSuccess, setTicketCreationSuccess] = useState<boolean>(false);

  // Washington Preset ZIP Clicker
  const WA_ZIP_PRESETS = [
    { zip: "98101", city: "Seattle", rate: "10.35%" },
    { zip: "98004", city: "Bellevue", rate: "10.1%" },
    { zip: "98402", city: "Tacoma", rate: "10.3%" },
    { zip: "98052", city: "Redmond", rate: "10.1%" },
    { zip: "98201", city: "Everett", rate: "9.9%" },
    { zip: "98501", city: "Olympia", rate: "9.5%" }
  ];

  // Fetch Sync Logs & Tickets on Mount
  useEffect(() => {
    fetchPOSLogs();
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
        setTaxRate(data.rate);
        setTaxCity(data.city);
        setTaxVerifiedMessage(data.message);
        setIsValidZip(data.valid);
      }
    } catch (err) {
      console.error("Tax lookup API failed:", err);
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
    setScanProgress(0);
    setScanStep("Initializing lab device diagnostic interface...");
    
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

        setIsScanning(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30 flex flex-col justify-between">
      
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
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <NavButton active={activeTab === "home"} onClick={() => setActiveTab("home")}>Home</NavButton>
                <NavButton active={activeTab === "services"} onClick={() => setActiveTab("services")}>Services</NavButton>
                <NavButton active={activeTab === "b2b"} onClick={() => setActiveTab("b2b")}>B2B Fleet</NavButton>
                <NavButton active={activeTab === "store"} onClick={() => setActiveTab("store")}>Store</NavButton>
                
                {/* Diagnostics Embedded Laboratory Link */}
                <button
                  id="tab-diagnostics-lab"
                  onClick={() => setActiveTab("lab")}
                  className={`px-3 py-2 rounded-md text-sm font-bold tracking-wide transition-all uppercase flex items-center gap-1.5 relative group ${
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
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-2"
                >
                  <MessageSquare size={18} />
                  Book / Quote
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
          <div className="md:hidden bg-slate-800 border-b border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <MobileNavButton onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}>Home</MobileNavButton>
              <MobileNavButton onClick={() => { setActiveTab("services"); setMobileMenuOpen(false); }}>Services</MobileNavButton>
              <MobileNavButton onClick={() => { setActiveTab("b2b"); setMobileMenuOpen(false); }}>B2B Fleet</MobileNavButton>
              <MobileNavButton onClick={() => { setActiveTab("store"); setMobileMenuOpen(false); }}>Store</MobileNavButton>
              
              <button 
                  onClick={() => { setActiveTab("lab"); setMobileMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-2 block px-3 py-3 rounded-md text-base font-bold text-blue-400 bg-slate-900 border border-slate-755 mb-2"
                >
                  <Cpu size={18} /> Diagnostics Lab Portal (Beta)
              </button>

              <button 
                  onClick={() => { setIsAiOpen(true); setMobileMenuOpen(false); }}
                  className="w-full text-left block px-3 py-3 rounded-md text-base font-medium text-white bg-blue-600"
                >
                  Book Repair / Get Quote
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* CORE CONTENT ROUTING AREA */}
      <main className="flex-1 pb-16">
        {activeTab === "home" && <HomeView onBookClick={() => setIsAiOpen(true)} onLabClick={() => setActiveTab("lab")} />}
        {activeTab === "services" && <ServicesView onBookClick={() => setIsAiOpen(true)} />}
        {activeTab === "b2b" && <B2BView onBookClick={() => setIsAiOpen(true)} />}
        {activeTab === "store" && <StoreView />}
        
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
                    {authUser && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wider font-extrabold border border-emerald-500/30">SECURE LINK LOCKED</span>}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {authUser 
                      ? `Synchronized with user credential ${authUser.email}. Backing up active Spokane WA tickets.` 
                      : "Login with Google to securely store repair tickets and private quote backups on durable Firestore vaults."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {authUser ? (
                  <button 
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-600 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button 
                    onClick={handleGoogleSignIn}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md flex items-center gap-2 transition-colors border border-blue-500/20"
                  >
                    Connect with Google (SSO)
                  </button>
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
                    <div className="pb-3 border-b border-slate-800/80">
                      <button
                        type="button"
                        id="btn-simulate-scan"
                        disabled={isScanning}
                        onClick={startHardwareScan}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-750 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:scale-[1.02] active:scale-98 transition-all"
                      >
                        <Zap className={`w-3.5 h-3.5 fill-current ${isScanning ? "animate-spin text-yellow-400" : ""}`} />
                        {isScanning ? "PROBING CONNECTIONS..." : "Simulate Hardware Scan"}
                      </button>
                      
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
                    </div>

                    {/* Customer details input */}
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Customer Name</label>
                      <input 
                        type="text" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors uppercase font-sans"
                        placeholder="E.g. Jane Miller"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Brand</label>
                        <select 
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
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">Model Name</label>
                        <input
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
                    <input 
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
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-[10.5px] uppercase tracking-wider rounded-md font-mono transition-all"
                    >
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      Login to Back up
                    </button>
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
                            <input 
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
                            <span>Google Grounded live query mode active. Spokane-focused local indexes applied.</span>
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
                          <label className="block text-[10px] text-slate-450 uppercase font-bold font-mono tracking-wider">Troubleshooting directive</label>
                          <textarea
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
                            <input
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
                  <section className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col flex-1 shadow-md p-5">
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
                          onClick={createOfficialTicket}
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
                          <button
                            onClick={handleGoogleSignIn}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-[10.5px] font-bold uppercase tracking-wider rounded-lg shadow-md font-mono inline-flex items-center gap-1.5"
                          >
                            Connect to Firestore via Google Sign-In
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sync logs console */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-mono">
                        <Terminal className="w-4 h-4 text-slate-400" />
                        POS Webhook Transaction Logs
                      </h3>
                      
                      <div className="bg-slate-950 text-slate-300 font-mono text-[10.5px] p-3.5 rounded-xl border border-slate-800 space-y-2 max-h-[150px] overflow-y-auto shadow-inner leading-relaxed">
                        {posLogs.map((log, idx) => (
                          <div key={idx} className="flex gap-2 hover:bg-slate-900 rounded p-1 transition-colors">
                            <span className="text-slate-500 text-[9px]">
                              [{new Date(log.timestamp).toLocaleTimeString()}]
                            </span>
                            <span className={`font-extrabold text-[8.5px] px-1 rounded uppercase ${
                              log.source === "Square" ? "bg-pink-950/80 text-pink-350 border border-pink-905" : 
                              log.source === "CellSmart" ? "bg-purple-950/80 text-purple-350 border border-purple-905" : "bg-emerald-950 text-emerald-350"
                            }`}>
                              {log.source}
                            </span>
                            <span className={`font-bold ${
                              log.level === "ERROR" ? "text-red-400" : log.level === "SUCCESS" ? "text-emerald-400" : "text-blue-300"
                            }`}>
                              [{log.level}]
                            </span>
                            <span className="text-slate-350">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
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
                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 font-mono">WA DESTINATION ZIP</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                maxLength={5}
                                value={zipInput} 
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  setZipInput(val);
                                  if (val.length === 5) {
                                    handleTaxLookup(val);
                                  }
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
                                  handleTaxLookup(preset.zip);
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
                      onClick={createOfficialTicket}
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
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Liability Waiver</a></li>
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
    </div>
  );
}

// --- SUB-VIEWS ---

function HomeView({ onBookClick, onLabClick }) {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 border-b border-slate-850">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=1920&q=80" 
            alt="Mobile Repair Tech" 
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Mobile Lab Currently Deploying in Spokane
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              We bring the repair lab <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">to your driveway.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed">
              Don't waste your day in a waiting room. Display & Cell Pros delivers military-grade, Right-to-Repair compliant technical restorations directly to your home or office.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onBookClick}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                Get an Instant Quote <ChevronRight size={20} />
              </button>
              <button 
                onClick={onLabClick}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                Open Lab Portal <Cpu size={20} className="text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">The D&CP Advantage</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">We combine premium parts with unparalleled convenience, operating entirely out of our mobile diagnostic laboratory.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<MapPin className="text-blue-400 w-10 h-10 mb-4" />}
            title="Zero Travel Time"
            desc="You book. We drive. Our technicians perform the surgery securely inside our mobile workshop parked outside your location."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-blue-400 w-10 h-10 mb-4" />}
            title="Data Security Guarantee"
            desc="Your device never leaves your sight. Avoid the massive cybersecurity risks associated with mail-in or drop-off retail repairs."
          />
          <FeatureCard 
            icon={<Cpu className="text-blue-400 w-10 h-10 mb-4" />}
            title="Right-to-Repair Compliant"
            desc="We use only genuine-sourced and premium aftermarket components, backed by strict quality control and a robust warranty."
          />
        </div>
      </div>
    </div>
  );
}

function ServicesView({ onBookClick }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-white mb-4">Our Service Architecture</h1>
        <p className="text-lg text-slate-400 max-w-3xl mx-auto">Transparent, formula-based pricing. No hidden fees. We calculate costs based on wholesale part prices plus professional mobile labor overhead.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              className="w-full py-3 bg-slate-700 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Start Diagnostic Triage
            </button>
          </div>
        ))}
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

function StoreView() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-12 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Logistics & Supply</h1>
          <p className="text-slate-400 mt-2">Premium Gear & Certified Pre-Owned Devices</p>
        </div>
        <div className="hidden sm:flex items-center text-slate-400 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <ShoppingCart size={18} className="mr-2 text-blue-400" />
          <span className="text-sm font-semibold">Cart (0)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STORE_PRODUCTS.map(product => (
          <div key={product.id} className="bg-slate-800 rounded-xl border border-slate-705 overflow-hidden group flex flex-col">
            <div className="h-48 overflow-hidden relative">
              <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-xs font-bold px-2 py-1 rounded text-slate-300">
                {product.category}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-white mb-2 leading-tight">{product.name}</h3>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-blue-400">${product.price.toFixed(2)}</span>
                <button className="bg-slate-700 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors">
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
}

function AIAssistantWidget({ onClose, onNavigateToLab, deviceBrand, deviceModel, deviceTier }: AIAssistantProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai" | "system"; text: string }>>([
    { sender: 'ai', text: "Hi there! Welcome to Display & Cell Pros. 🚐💨 We bring the raw hardware repair lab directly to your Spokane driveway! What device issues can we help you solve today?" }
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
            tier: deviceTier
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: "ai", text: data.text }]);
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
            <input
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
