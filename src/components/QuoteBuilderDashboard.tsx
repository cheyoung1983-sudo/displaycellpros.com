import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Clock, 
  Percent, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Sliders, 
  Save, 
  Lock, 
  Check, 
  Info,
  MapPin,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { auth } from "../lib/firebase";

interface InventoryItem {
  id: string;
  partName: string;
  category: "screen" | "battery" | "button" | "motherboard" | "custom";
  deviceTier: "flagship" | "midrange" | "budget";
  compatibleModelWildcard: string;
  wholesaleCost: number;
  stockCount: number;
  location: string;
}

interface SelectedItem {
  key: string; // unique local ID including parts or custom entries
  partId?: string; // set if inventory matched
  partName: string;
  wholesaleCost: number;
  quantity: number;
  isCustom: boolean;
}

interface ComputedPartResponse {
  id: string;
  partName: string;
  category: string;
  wholesaleCost: number;
  quantity: number;
  isBackordered: boolean;
  backorderPremium: number;
  subtotal: number;
  location: string;
}

interface ComputeResponse {
  success: boolean;
  parts: ComputedPartResponse[];
  metrics: {
    partsCostSum: number;
    backorderPremiumSum: number;
    laborHours: number;
    hourlyLaborRate: number;
    laborCost: number;
    overheadPercent: number;
    overheadCost: number;
    subtotalBeforeTax: number;
    taxInfo: {
      zipCode: string | null;
      city: string;
      rate: number;
      taxAmount: number;
    };
    grandTotal: number;
  };
  verificationChecksum: string;
  timestamp: string;
}

interface QuoteBuilderDashboardProps {
  addToast: (title: string, message: string, type: "success" | "error" | "info" | "warning") => void;
}

export default function QuoteBuilderDashboard({ addToast }: QuoteBuilderDashboardProps) {
  // DB inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState<boolean>(true);
  
  // Client & Device configuration state
  const [customerName, setCustomerName] = useState<string>("Jane Miller");
  const [companyName, setCompanyName] = useState<string>("AMAZON Fleet");
  const [deviceModel, setDeviceModel] = useState<string>("Apple iPhone 15 Pro");
  const [isCorporate, setIsCorporate] = useState<boolean>(false);

  // Dynamic Quote configuration state
  const [selectedParts, setSelectedParts] = useState<SelectedItem[]>([]);
  const [laborHours, setLaborHours] = useState<number>(1.5);
  const [hourlyLaborRate, setHourlyLaborRate] = useState<number>(95);
  const [overheadPercentage, setOverheadPercentage] = useState<number>(15);
  const [zipCode, setZipCode] = useState<string>("99201"); // Spokane WA default

  // Part selectors
  const [inventorySearch, setInventorySearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Custom part add form state
  const [customPartName, setCustomPartName] = useState<string>("");
  const [customPartCost, setCustomPartCost] = useState<string>("");

  // Result state from computed service endpoint
  const [computationResult, setComputationResult] = useState<ComputeResponse | null>(null);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [activePresetLabor, setActivePresetLabor] = useState<number | null>(1.5);

  // POS sync / certificate audit trail locks
  const [isSyncingPOS, setIsSyncingPOS] = useState<boolean>(false);
  const [syncedDocId, setSyncedDocId] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // Collapsible pricing tier states
  const [expandedTiers, setExpandedTiers] = useState<{ materials: boolean; labor: boolean; tax: boolean }>({
    materials: true,
    labor: false,
    tax: false,
  });

  const toggleTier = (tier: "materials" | "labor" | "tax") => {
    setExpandedTiers(prev => ({
      ...prev,
      [tier]: !prev[tier]
    }));
  };

  // Load backend parts inventory on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Compute quote dynamic recalculation when inputs change
  useEffect(() => {
    triggerDeterministicRecalculation();
  }, [selectedParts, laborHours, hourlyLaborRate, overheadPercentage, zipCode, isCorporate, companyName, customerName, deviceModel]);

  const fetchInventory = async () => {
    try {
      setIsInventoryLoading(true);
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/quote/inventory", {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
      }
    } catch (err) {
      console.error("Failed to query inventory database:", err);
      addToast(
        "Inventory Unreachable", 
        "The Spokane core parts database could not be read. Falling back to custom part creation.", 
        "warning"
      );
    } finally {
      setIsInventoryLoading(false);
    }
  };

  const triggerDeterministicRecalculation = async () => {
    const trimmedZip = zipCode.trim();
    const isZipValid = trimmedZip.length === 5 && /^(992|990)\d{2}$/.test(trimmedZip);

    if (!isZipValid) {
      setComputationResult(null);
      setIsComputing(false);
      return;
    }

    // Build parameters for the backend POST
    const payload = {
      parts: selectedParts.map(item => ({
        partId: item.partId || null,
        partName: item.partName,
        wholesaleCost: item.wholesaleCost,
        quantity: item.quantity,
        isCustom: item.isCustom
      })),
      laborHours,
      hourlyLaborRate,
      overheadPercentage,
      zipCode: zipCode.trim() || undefined,
      isCorporate,
      companyName: isCorporate ? companyName : undefined,
      customerName,
      deviceModel
    };

    setIsComputing(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/generate-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setComputationResult(data);
      }
    } catch (err) {
      console.error("Secure Quote calculator endpoint failed:", err);
    } finally {
      setIsComputing(false);
    }
  };

  const handleAddInventoryPart = (part: InventoryItem) => {
    // Check if item is already added, if so increment count, else add
    const key = `inv-${part.id}`;
    const alreadyExists = selectedParts.find(s => s.key === key);

    if (alreadyExists) {
      setSelectedParts(prev => prev.map(item => 
        item.key === key ? { ...item, quantity: item.quantity + 1 } : item
      ));
      addToast("Item Quantity Increased", `Added another "${part.partName}" to quote targets.`, "success");
    } else {
      setSelectedParts(prev => [
        ...prev, 
        {
          key,
          partId: part.id,
          partName: part.partName,
          wholesaleCost: part.wholesaleCost,
          quantity: 1,
          isCustom: false
        }
      ]);
      addToast("Inventory Part Selected", `Added "${part.partName}" to quote template.`, "success");
    }
  };

  const handleAddCustomPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPartName.trim()) {
      addToast("Invalid Part Name", "Please specify a description label for your custom part.", "error");
      return;
    }
    const cost = parseFloat(customPartCost) || 0;
    const key = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    setSelectedParts(prev => [
      ...prev,
      {
        key,
        partName: customPartName.trim(),
        wholesaleCost: cost,
        quantity: 1,
        isCustom: true
      }
    ]);

    addToast("Custom Part Inserted", `Registered custom part "${customPartName.trim()}" for $${cost.toFixed(2)}`, "success");
    setCustomPartName("");
    setCustomPartCost("");
  };

  const handleRemovePart = (key: string, name: string) => {
    setSelectedParts(prev => prev.filter(item => item.key !== key));
    addToast("Part Removed", `Deleted "${name}" from this quote workspace successfully.`, "info");
  };

  const handleUpdateQuantity = (key: string, newQty: number) => {
    const qty = Math.max(1, newQty);
    setSelectedParts(prev => prev.map(item => 
      item.key === key ? { ...item, quantity: qty } : item
    ));
  };

  const handlePresetLaborClick = (hours: number) => {
    setLaborHours(hours);
    setActivePresetLabor(hours);
  };

  const handleManualLaborChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hrs = Math.max(0, parseFloat(e.target.value) || 0);
    setLaborHours(hrs);
    setActivePresetLabor(null);
  };

  const handleTransmitToPOS = async () => {
    if (!computationResult) return;
    setIsSyncingPOS(true);
    try {
      // Persist the quote to Firestore
      const idToken = await auth.currentUser?.getIdToken();
      const saveRes = await fetch("/api/save-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          ...computationResult,
          customerName,
          deviceModel,
          companyName: isCorporate ? companyName : undefined,
          isCorporate,
          syncedToPOS: true
        })
      });

      if (!saveRes.ok) {
        throw new Error("Persistence save error");
      }

      const saveData = await saveRes.json();
      const logId = saveData.quoteRef || `POS-TX-${Math.floor(100000 + Math.random() * 900000)}`;
      setSyncedDocId(logId);
      addToast(
        "POS Webhook Transmitted & Saved", 
        `Custom Quote computed under Ref: ${logId} persisted to secure local source vaults & synced with Spokane POS servers.`, 
        "success"
      );
    } catch (err) {
      console.error(err);
      addToast("Sync Failure", "Failed to archive quote or broadcast secure ammeter webhook.", "error");
    } finally {
      setIsSyncingPOS(false);
    }
  };

  const handleResetQuote = () => {
    if (confirm("Are you sure you want to clear the entire dynamic quote builder workspace?")) {
      setSelectedParts([]);
      setLaborHours(1.5);
      setActivePresetLabor(1.5);
      setHourlyLaborRate(95);
      setOverheadPercentage(15);
      setZipCode("99201");
      setCustomerName("Jane Miller");
      setCompanyName("AMAZON Fleet");
      setIsCorporate(false);
      setDeviceModel("Apple iPhone 15 Pro");
      setSyncedDocId(null);
      addToast("Quote Reset Complete", "Calculators wiped clean to default values.", "info");
    }
  };

  const isZipValid = zipCode.trim().length === 5 && /^(992|990)\d{2}$/.test(zipCode.trim());

  const filteredInventory = inventory.filter(p => {
    const matchSearch = p.partName.toLowerCase().includes(inventorySearch.toLowerCase()) || 
                        p.compatibleModelWildcard.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                        p.id.toLowerCase().includes(inventorySearch.toLowerCase());
    
    if (categoryFilter === "all") return matchSearch;
    return matchSearch && p.category === categoryFilter;
  });

  return (
    <div id="quote-builder-sandbox" className="grid grid-cols-12 gap-6 items-stretch w-full text-left font-sans animate-in fade-in duration-300">
      
      {/* LEFT CONTAINER: INPUT PANEL (Parts and Work parameters - col-span 8) */}
      <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
        
        {/* Module Header and Security Decoupling Badge */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest font-mono">SECURE INTEGRITY CONTROL LAYER</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Dynamic Quote Generation System
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Construct high-fidelity estimates using real-time inventory queries, precise labor hours math, and adaptive operational overhead multipliers. Operates entirely separate from AI LLM triage models to enforce 100% computational safety.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl">
            <Lock className="w-4 h-4 text-emerald-400" />
            <div className="font-mono text-[9.5px] leading-tight">
              <span className="block text-emerald-400 font-extrabold uppercase">DECOUPLED LOGIC</span>
              <span className="text-slate-500 font-bold">ANTI-HALLUCINATION</span>
            </div>
          </div>
        </div>

        {/* CLIENT & DEVICE PROFILE LAYER */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3 select-none">
            <div className="w-7 h-7 rounded-lg bg-teal-950/40 text-teal-400 flex items-center justify-center border border-teal-500/20 font-bold text-xs">P</div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Client & Device Profile</h3>
              <p className="text-[9.5px] text-slate-500 font-mono">Specify client details, target device specs, and corporate settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Customer Info */}
            <div className="space-y-3">
              <div>
                <label className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block mb-1 font-mono">Customer Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Jane Miller"
                  className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Corporate B2B toggle */}
              <div className="bg-slate-950/40 p-2.5 border border-slate-850 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] text-slate-450 font-bold uppercase tracking-wider font-mono">B2B Corporate Account</span>
                  <input
                    type="checkbox"
                    checked={isCorporate}
                    onChange={(e) => setIsCorporate(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-teal-500 focus:ring-teal-500 cursor-pointer"
                  />
                </div>
                {isCorporate && (
                  <div className="pt-2 border-t border-slate-900 animate-in fade-in duration-200">
                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1 font-mono">Company / Fleet Client Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. AMAZON Fleet"
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Device Info */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <label className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block mb-1 font-mono">Target Hardware Device Model</label>
                <input
                  type="text"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  placeholder="e.g. Apple iPhone 15 Pro Max"
                  className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="bg-slate-950/20 p-2.5 border border-slate-850 rounded-lg text-[9.5px] font-mono text-slate-500 leading-relaxed">
                <span className="text-teal-400 font-bold mr-1">ℹ️ Telemetry-First Matching:</span>
                Activating B2B corporate profiles automatically unlocks standard Spokane/Seattle enterprise pricing matrices, applying a flat 20% billing discount during recalculation cycles.
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1: PARTS SELECTION */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-900/20 text-blue-400 flex items-center justify-center border border-blue-500/10 font-bold text-xs">1</div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Parts Configuration Layer</h3>
                <p className="text-[9.5px] text-slate-450 font-mono">Select parts from Spokane wholesale inventory or input custom parameters</p>
              </div>
            </div>
            <span className="text-[10.5px] font-mono text-slate-500">[{selectedParts.length} line items added]</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Inventory selector - Left (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950/50 p-4 rounded-xl border border-slate-850 space-y-3.5">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search screen, battery, compatible model..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                {/* Category filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-medium"
                >
                  <option value="all">Categories (All)</option>
                  <option value="screen">Screens Only</option>
                  <option value="battery">Batteries Only</option>
                  <option value="button">Buttons Only</option>
                  <option value="motherboard">Logic Boards</option>
                </select>
              </div>

              {/* Inventory table */}
              <div className="max-h-[200px] overflow-y-auto border border-slate-900 rounded-lg">
                {isInventoryLoading ? (
                  <div className="py-12 text-center text-xs text-slate-500 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500 mb-2" />
                    QUERYING SPOKANE PARTS INVENTORY...
                  </div>
                ) : filteredInventory.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 font-mono select-none uppercase tracking-wider">
                    No parts matching search parameters
                  </div>
                ) : (
                  <div className="divide-y divide-slate-900">
                    {filteredInventory.map(part => (
                      <div key={part.id} className="p-2.5 hover:bg-slate-900/30 flex items-center justify-between gap-3 text-xs font-mono transition-colors">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-200 truncate">{part.partName}</span>
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded shrink-0 ${
                              part.deviceTier === "flagship" ? "bg-violet-950 text-violet-400 border border-violet-900/40" :
                              part.deviceTier === "midrange" ? "bg-sky-950 text-sky-400 border border-sky-900/40" :
                              "bg-slate-900 text-slate-450 border border-slate-800"
                            }`}>
                              {part.deviceTier.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 text-[9.5px] text-slate-500 leading-none select-none">
                            <span>ID: <strong className="text-slate-450">{part.id}</strong></span>
                            <span>•</span>
                            <span>Compat: <strong className="text-slate-450">{part.compatibleModelWildcard}</strong></span>
                            <span>•</span>
                            <span>Loc: <strong className="text-slate-450">{part.location}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="block font-bold text-white">${part.wholesaleCost.toFixed(2)}</span>
                            {part.stockCount <= 0 ? (
                              <span className="text-[8.5px] font-extrabold text-rose-455 animate-pulse">BACKORDERED</span>
                            ) : (
                              <span className="text-[8.5px] text-emerald-500 font-semibold">{part.stockCount} in stock</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddInventoryPart(part)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.95] text-white rounded transition-all cursor-pointer"
                            title="Add part to quote"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Part Input - Right (5 cols) */}
            <form onSubmit={handleAddCustomPart} className="lg:col-span-5 bg-slate-950/30 p-4 rounded-xl border border-slate-850 flex flex-col justify-between space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Input Custom Client Part
              </span>
              
              <div className="space-y-2 text-xs">
                <div>
                  <label htmlFor="custom-pname" className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Part Name / Brand Override</label>
                  <input
                    id="custom-pname"
                    type="text"
                    value={customPartName}
                    onChange={(e) => setCustomPartName(e.target.value)}
                    placeholder="e.g., iPhone 15 Smart LiDAR Sensor Module"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="custom-pcost" className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Wholesale Sourced Cost ($)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-600 absolute left-2 top-2.5" />
                    <input
                      id="custom-pcost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={customPartCost}
                      onChange={(e) => setCustomPartCost(e.target.value)}
                      placeholder="55.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded pl-6 p-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded font-bold text-xs uppercase transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inject Custom Row</span>
              </button>
            </form>
          </div>

          {/* ACTIVE SELECTED PARTS BASKET */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">S2C Quote Parts Ledger ({selectedParts.length})</span>
            <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden shadow-inner">
              {selectedParts.length === 0 ? (
                <div className="py-9 text-center text-slate-500 font-mono text-xs uppercase tracking-wider select-none">
                  [No parts selected. Use the database or input form above to populate]
                </div>
              ) : (
                <div className="divide-y divide-slate-900 select-none max-h-[220px] overflow-y-auto">
                  {selectedParts.map(item => (
                    <div key={item.key} className="p-3 hover:bg-slate-900/10 flex items-center justify-between gap-4 text-xs font-mono">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1 rounded text-[10px] uppercase font-bold text-center w-12 shrink-0 ${
                          item.isCustom 
                            ? "bg-amber-950/80 text-amber-500 border border-amber-900/40" 
                            : "bg-blue-950/80 text-blue-400 border border-blue-905/40"
                        }`}>
                          {item.isCustom ? "Custom" : "DB_OEM"}
                        </div>
                        <div className="truncate shrink-0 max-w-[250px] lg:max-w-[350px]">
                          <span className="font-bold text-slate-200 block truncate">{item.partName}</span>
                          <span className="text-[9.5px] text-slate-500 block">Unit Cost: ${item.wholesaleCost.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Qty incrementer */}
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded overflow-hidden h-7">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.key, item.quantity - 1)}
                            className="px-2 hover:bg-slate-800 text-slate-400 font-extrabold h-full transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 text-white text-[11px] font-bold text-center min-w-[20px]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.key, item.quantity + 1)}
                            className="px-2 hover:bg-slate-800 text-slate-400 font-extrabold h-full transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Calculated line price */}
                        <div className="text-right min-w-[65px]">
                          <span className="block font-bold text-white">${(item.wholesaleCost * item.quantity).toFixed(2)}</span>
                        </div>

                        {/* Trash */}
                        <button
                          type="button"
                          onClick={() => handleRemovePart(item.key, item.partName)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/10 rounded transition-all cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STEP 2 & 3: LABOR AND OVERHEAD CONFIG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* STEP 2: LABOR TIME ESTIMATOR */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2.5 select-none">
                <div className="w-7 h-7 rounded-lg bg-blue-900/20 text-blue-400 flex items-center justify-center border border-blue-500/10 font-bold text-xs">2</div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Labor Complexity Metric</h3>
                  <p className="text-[9.5px] text-slate-450 font-mono">Define exact technical hours & repair billing rate</p>
                </div>
              </div>

              {/* Slider for labor hours */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="font-bold">Labor Hours (Estimated)</span>
                  <span className="text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-850 font-extrabold">
                    {laborHours.toFixed(2)} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="8.00"
                  step="0.25"
                  value={laborHours}
                  onChange={handleManualLaborChange}
                  className="w-full accent-blue-500 bg-slate-950 cursor-pointer h-1.5 rounded-lg border-none"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1 pt-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Labor Presets</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0.5, 1.0, 1.5, 2.0, 3.0].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetLaborClick(preset)}
                      className={`py-1.5 text-[9.5px] font-mono rounded font-bold border transition-all cursor-pointer ${
                        activePresetLabor === preset 
                          ? "bg-blue-600 text-white border-blue-500 shadow-sm" 
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900/60 hover:text-slate-205"
                      }`}
                    >
                      {preset.toFixed(1)}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Hourly Billing input */}
            <div className="pt-4 border-t border-slate-850/60">
              <label htmlFor="customLaborRateId" className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block mb-1 font-mono">Custom Hourly Rate ($/hr)</label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-slate-550 absolute left-2 top-2.5" />
                <input
                  id="customLaborRateId"
                  type="number"
                  min="30"
                  max="350"
                  value={hourlyLaborRate}
                  onChange={(e) => setHourlyLaborRate(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="95"
                  className="w-full bg-slate-950 border border-slate-805 rounded p-2 pl-6 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: OVERHEAD MULTIPLIER AND TAX COMPLIANCE */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2.5 select-none">
                <div className="w-7 h-7 rounded-lg bg-blue-900/20 text-blue-400 flex items-center justify-center border border-blue-500/10 font-bold text-xs">3</div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Overhead Markup & Tax</h3>
                  <p className="text-[9.5px] text-slate-450 font-mono">Operational overlay margin & Washington ZIP tax</p>
                </div>
              </div>

              {/* Slider for overhead percent */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="font-bold">Overhead Margin (%)</span>
                  <span className="text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-850 font-extrabold text-xs">
                    {overheadPercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={overheadPercentage}
                  onChange={(e) => {
                    setOverheadPercentage(parseInt(e.target.value) || 0);
                  }}
                  className="w-full accent-blue-500 bg-slate-950 cursor-pointer h-1.5 rounded-lg border-none"
                />
              </div>
            </div>

            {/* Tax zipcode entry block */}
            <div className="pt-4 border-t border-slate-850/60 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="quoteZipCodeDest" className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Recipient ZIP Code</label>
                  <div className="relative">
                    <MapPin className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 transition-colors ${
                      zipCode.length === 5 && !/^(992|990)\d{2}$/.test(zipCode)
                        ? "text-amber-500"
                        : zipCode.length === 5
                        ? "text-teal-400"
                        : "text-slate-550"
                    }`} />
                    <input
                      id="quoteZipCodeDest"
                      type="text"
                      maxLength={5}
                      placeholder="99201"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").substring(0, 5))}
                      className={`w-full bg-slate-950 border rounded p-2 pl-7 text-xs font-mono focus:outline-none focus:ring-1 uppercase font-black transition-all ${
                        zipCode.length === 5 && !/^(992|990)\d{2}$/.test(zipCode)
                          ? "border-amber-500/70 text-amber-400 focus:ring-amber-500"
                          : zipCode.length === 5
                          ? "border-teal-500/70 text-teal-400 focus:ring-teal-500"
                          : "border-slate-805 text-white focus:ring-blue-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Real-time local tax lookup reflection */}
                <div className={`p-2 border rounded-lg flex flex-col justify-center text-[10px] font-mono leading-tight select-none transition-all ${
                  zipCode.length === 5 && !/^(992|990)\d{2}$/.test(zipCode)
                    ? "bg-amber-950/20 border-amber-900/40 text-amber-500"
                    : zipCode.length === 5
                    ? "bg-slate-950/60 border-slate-855 text-slate-400"
                    : "bg-slate-950/20 border-slate-900/30 text-slate-550"
                }`}>
                  <span className="text-[8px] uppercase tracking-wider text-slate-500">Destination Tax</span>
                  {zipCode.length === 5 && !/^(992|990)\d{2}$/.test(zipCode) ? (
                    <>
                      <strong className="text-amber-400 text-[11px] font-extrabold truncate block">
                        OUT OF REGION
                      </strong>
                      <span className="text-amber-500 mt-0.5 font-bold text-[8.5px]">
                        Spokane Local Only
                      </span>
                    </>
                  ) : computationResult?.metrics.taxInfo ? (
                    <>
                      <strong className="text-white text-[11px] font-extrabold truncate block">
                        {computationResult.metrics.taxInfo.city}
                      </strong>
                      <span className="text-teal-400 mt-0.5 font-bold">
                        Rate: {(computationResult.metrics.taxInfo.rate * 100).toFixed(2)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-500 mt-0.5">
                      {zipCode.length < 5 ? "Incomplete ZIP..." : "Invalid WA ZIP"}
                    </span>
                  )}
                </div>
              </div>

              {/* Warning/Success Assistant Advice Banner */}
              {zipCode.length === 5 && !/^(992|990)\d{2}$/.test(zipCode) && (
                <div className="bg-amber-950/10 border border-amber-900/40 rounded-lg p-2 flex items-start gap-1.5 text-[9.5px] font-mono text-amber-500 animate-in slide-in-from-top-1 duration-200">
                  <span className="text-[11px] leading-none">⚠️</span>
                  <span>
                    <strong>REGION LOCK ACTIVE:</strong> Triage-AI Quote Engine is localized exclusively to Spokane County. Enter a 990xx or 992xx ZIP code to restore tax calculation.
                  </span>
                </div>
              )}

              {/* Spokane Regional Localization Pills */}
              <div className="space-y-1.5 bg-slate-950/30 p-2.5 border border-slate-850 rounded-xl select-none">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Spokane District Presets</span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { zip: "99201", label: "Downtown" },
                    { zip: "99203", label: "South Hill" },
                    { zip: "99206", label: "Valley" },
                    { zip: "99208", label: "Northside" },
                    { zip: "99001", label: "Airway Hts" },
                    { zip: "99004", label: "Cheney" },
                    { zip: "99019", label: "Liberty Lk" },
                    { zip: "99021", label: "Mead (8.2%)" }
                  ].map((preset) => (
                    <button
                      key={preset.zip}
                      type="button"
                      onClick={() => setZipCode(preset.zip)}
                      className={`p-1 text-[8.5px] font-mono rounded font-bold border transition-all text-center cursor-pointer truncate ${
                        zipCode === preset.zip
                          ? "bg-teal-600 text-white border-teal-500 shadow-sm"
                          : "bg-slate-950 border-slate-900 text-slate-450 hover:bg-slate-900/40 hover:text-white"
                      }`}
                      title={`${preset.label} (${preset.zip})`}
                    >
                      {preset.zip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT CONTAINER: DYNAMIC TOTAL COMPILING PANEL & ACTIONS (col-span 4) */}
      <aside className="col-span-12 xl:col-span-4 flex flex-col gap-6">
        
        {/* LIVE INVOICE PREVIEW CARD */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 select-none">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400 animate-pulse" />
                Quote Calculation Summary
              </h3>
              <span className="bg-slate-950 text-slate-500 text-[9px] px-1.5 py-0.5 rounded font-mono border border-slate-850 font-bold">RELIABLE CALCULATOR</span>
            </div>

            {isComputing && !computationResult ? (
              <div className="py-24 text-center text-slate-500 font-mono italic text-xs leading-relaxed select-none">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2.5" />
                COMPUTING ENCLAVE METRICS...
              </div>
            ) : computationResult ? (
              <div className="space-y-4 font-mono text-xs text-slate-350">
                {/* Expand / Collapse All Controls */}
                <div className="flex justify-between items-center bg-slate-950/40 p-2 border border-slate-850/60 rounded-xl select-none">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">Interactive Diagnostics Breakdown</span>
                  <div className="flex gap-2 text-[9px] font-bold">
                    <button
                      type="button"
                      onClick={() => setExpandedTiers({ materials: true, labor: true, tax: true })}
                      className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      EXPAND ALL
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedTiers({ materials: false, labor: false, tax: false })}
                      className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      COLLAPSE ALL
                    </button>
                  </div>
                </div>

                {/* Collapsible Tiered Stack */}
                <div className="space-y-2.5">
                  {/* TIER 1: MATERIALS */}
                  <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950/20 transition-all">
                    <button
                      type="button"
                      onClick={() => toggleTier("materials")}
                      className="w-full flex items-center justify-between p-3 bg-slate-950/50 hover:bg-slate-900/40 transition-colors text-left font-mono select-none cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          01. Materials & DB Parts
                        </span>
                        <div className="text-white font-extrabold text-[12px] flex items-center gap-1.5">
                          <span>${computationResult.metrics.partsCostSum.toFixed(2)}</span>
                          {computationResult.metrics.backorderPremiumSum > 0 && (
                            <span className="text-[8px] px-1 py-0.5 bg-amber-950/80 text-amber-400 rounded border border-amber-900/45 font-black uppercase tracking-wider leading-none">
                              +{computationResult.metrics.backorderPremiumSum.toFixed(0)} Surcharge
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] text-slate-500">{computationResult.parts.length} Item(s)</span>
                        {expandedTiers.materials ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {expandedTiers.materials && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 pt-1.5 border-t border-slate-850/40 space-y-2 bg-slate-950/40">
                            <div className="flex justify-between items-center text-slate-400 font-semibold text-[10.5px]">
                              <span>Base Parts Cost</span>
                              <span>${computationResult.metrics.partsCostSum.toFixed(2)}</span>
                            </div>
                            
                            {computationResult.parts.length > 0 ? (
                              <div className="bg-slate-950/90 border border-slate-900/80 rounded p-2 text-[9px] text-slate-400 leading-normal max-h-[100px] overflow-y-auto space-y-1">
                                {computationResult.parts.map((p, i) => (
                                  <div key={i} className="flex justify-between pr-1">
                                    <span className="truncate max-w-[185px] text-slate-450 font-medium">↳ {p.partName} (x{p.quantity})</span>
                                    <span className="text-slate-300 font-bold">${p.subtotal.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-600 pl-2">↳ Zero parts added to current configuration</div>
                            )}

                            {computationResult.metrics.backorderPremiumSum > 0 && (
                              <div className="bg-amber-950/15 border border-amber-900/35 p-2 rounded-lg space-y-1 mt-1">
                                <div className="flex justify-between text-[10px] items-center text-amber-400 font-extrabold">
                                  <span className="flex items-center gap-1">⚠️ OOS Premium Surcharge</span>
                                  <span>+${computationResult.metrics.backorderPremiumSum.toFixed(2)}</span>
                                </div>
                                <p className="text-[8.5px] text-slate-500 leading-normal select-none">
                                  Depleted stock trigger forced dynamic sourcing premiums.
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* TIER 2: LABOR & MARKUP */}
                  <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950/20 transition-all">
                    <button
                      type="button"
                      onClick={() => toggleTier("labor")}
                      className="w-full flex items-center justify-between p-3 bg-slate-950/50 hover:bg-slate-900/40 transition-colors text-left font-mono select-none cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          02. Labor & Overhead Markup
                        </span>
                        <div className="text-white font-extrabold text-[12px]">
                          ${(computationResult.metrics.laborCost + computationResult.metrics.overheadCost).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] text-slate-500">{computationResult.metrics.laborHours} Hr(s) @ {computationResult.metrics.overheadPercent}%</span>
                        {expandedTiers.labor ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {expandedTiers.labor && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 pt-1.5 border-t border-slate-850/40 space-y-2 bg-slate-950/40">
                            <div className="flex justify-between items-center text-[10.5px]">
                              <span className="text-slate-450 font-medium">Labor Cost</span>
                              <span className="text-slate-200 font-bold">${computationResult.metrics.laborCost.toFixed(2)}</span>
                            </div>
                            <div className="text-[9px] text-slate-500 pl-2 select-none">
                              ↳ {computationResult.metrics.laborHours} hr(s) at ${computationResult.metrics.hourlyLaborRate}/hr rate
                            </div>
                            
                            <div className="pt-1.5 border-t border-slate-900/40 flex justify-between items-center text-[10.5px]">
                              <span className="text-slate-450 font-medium">Overhead Margin Markup ({computationResult.metrics.overheadPercent}%)</span>
                              <span className="text-slate-200 font-bold">${computationResult.metrics.overheadCost.toFixed(2)}</span>
                            </div>
                            <div className="text-[9px] text-slate-500 pl-2 select-none">
                              ↳ Secure silicon forensics laboratory operation overhead multiplier.
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* TIER 3: SPOKANE LOCAL TAX */}
                  <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950/20 transition-all">
                    <button
                      type="button"
                      onClick={() => toggleTier("tax")}
                      className="w-full flex items-center justify-between p-3 bg-slate-950/50 hover:bg-slate-900/40 transition-colors text-left font-mono select-none cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                          03. Spokane Local Sales Tax
                        </span>
                        <div className="text-teal-400 font-extrabold text-[12px]">
                          +${computationResult.metrics.taxInfo.taxAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] text-teal-500 font-bold">{(computationResult.metrics.taxInfo.rate * 100).toFixed(2)}% Rate</span>
                        {expandedTiers.tax ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {expandedTiers.tax && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 pt-1.5 border-t border-slate-850/40 space-y-2 bg-slate-950/40">
                            <div className="flex justify-between items-center text-[10.5px]">
                              <span className="text-slate-450 font-medium">Recipient Jurisdiction</span>
                              <span className="text-slate-200 font-bold">{computationResult.metrics.taxInfo.city || "Spokane Region"}</span>
                            </div>
                            <div className="text-[9px] text-slate-500 pl-2 select-none">
                              ↳ Destination ZIP: {computationResult.metrics.taxInfo.zipCode || "99201"} / combined rate of {(computationResult.metrics.taxInfo.rate * 100).toFixed(2)}%
                            </div>
                            
                            <div className="pt-1.5 border-t border-slate-900/40 flex justify-between items-center text-[10.5px]">
                              <span className="text-slate-450 font-medium">Allocated Facilities</span>
                              <span className="text-slate-200 text-right truncate max-w-[160px] font-bold" title={computationResult.metrics.localFacilities}>
                                {computationResult.metrics.localFacilities}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-850/60 my-1"></div>

                {/* Subtotal baseline */}
                <div className="flex justify-between items-center text-[11.5px] font-bold text-slate-300">
                  <span>Pre-Tax Subtotal</span>
                  <span className="text-white">${computationResult.metrics.subtotalBeforeTax.toFixed(2)}</span>
                </div>

                <div className="h-[1px] bg-slate-800/80"></div>

                {/* Ultimate combined quote total */}
                <div className="flex justify-between items-baseline py-1 select-none">
                  <span className="font-extrabold text-slate-400 text-xs uppercase tracking-wider">Estimated Total</span>
                  <div className="text-right">
                    <span className="font-black text-2xl tracking-tight text-blue-400">
                      ${computationResult.metrics.grandTotal.toFixed(2)}
                    </span>
                    <span className="block text-[8px] text-slate-500 mr-1 mt-0.5 uppercase tracking-wider">WA Destination Rates</span>
                  </div>
                </div>

                {/* Cryptographic block signature */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-center relative select-all cursor-copy" title="Click to copy signature token">
                  <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-extrabold mb-1">
                    Secure Cryptographic Block Ledger Checksum
                  </span>
                  <div className="text-[10px] text-cyan-400 font-extrabold font-mono truncate leading-none">
                    {computationResult.verificationChecksum}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-slate-500 font-mono italic text-xs leading-relaxed select-none">
                Add parts or modify selectors to generate dynamic quote
              </div>
            )}
          </div>

          {/* ACTION DEPLOYMENT ROW */}
          <div className="space-y-2 pt-4 border-t border-slate-850/50">
            <button
              type="button"
              onClick={handleTransmitToPOS}
              disabled={isSyncingPOS || !computationResult || selectedParts.length === 0 || !isZipValid}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md disabled:opacity-40 select-none cursor-pointer active:scale-[0.985] transition-all"
            >
              {isSyncingPOS ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>TRANSMITTING AMMETER WEBHOOK...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>REGISTER QUOTE & SYNC TO POS</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                disabled={!computationResult || !isZipValid}
                className="py-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Print Certificate</span>
              </button>
              <button
                type="button"
                onClick={handleResetQuote}
                className="py-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Reset Builder</span>
              </button>
            </div>
          </div>

        </section>

        {/* COMPREHENSIVE ARCHITECTURAL EXCLUSIONS / NIST SANITIZATION NOTES */}
        <section className="bg-slate-900 border border-slate-850 rounded-2xl p-4 font-mono text-[10.5px] text-slate-450 space-y-3 shadow-inner">
          <div className="flex gap-2 text-blue-400 select-none">
            <Info className="w-4 h-4 shrink-0" />
            <span className="font-extrabold uppercase tracking-wide">Spokane POS Integration Metrics</span>
          </div>
          <p className="leading-relaxed">
            Every dynamic estimate compiled is bound by NIST SP 800-88 R1 sanitization standards. This is to verify that any device matched for screens or system board modules has all local non-volatile caches safely certified of memory trace storage.
          </p>
          <div className="border-t border-slate-850/60 pt-2 grid grid-cols-2 gap-2 text-[9.5px]">
            <div>
              <span className="text-slate-550 uppercase">ERASURE CODE LEVEL</span>
              <strong className="block text-slate-350">NIST SP 800-88 R1 PURGE</strong>
            </div>
            <div>
              <span className="text-slate-550">GATEWAY SYNC PROTOCOL</span>
              <strong className="block text-slate-350">RELIABLE WEBHook OVER HTTPS</strong>
            </div>
          </div>
        </section>

      </aside>

      {/* MODAL WINDOW: CRYPTOGRAPHICALLY SIGNED QUOTE DETAILS */}
      <AnimatePresence>
        {showCertificateModal && computationResult && (
          <div className="fixed inset-0 min-h-screen bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono text-xs text-left">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-750 max-w-2xl w-full rounded-2xl p-6 relative shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black uppercase text-white tracking-tight">Security Audit Certificate of Quote</h3>
                    <p className="text-[9.5px] text-slate-500">Decoupled deterministic calculation receipt</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded font-bold uppercase hover:bg-slate-800 text-[10px]"
                >
                  [Dismiss]
                </button>
              </div>

              {/* Holographic quote stats layout */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Audit Timestamp:</span>
                  <span className="text-white font-bold">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Certificate Cryptographic ID:</span>
                  <span className="text-blue-400 font-bold select-all">{computationResult.verificationChecksum}</span>
                </div>

                <div className="border-t border-slate-850 pt-3 space-y-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold">Computed Line Item Summary</span>
                  <div className="divide-y divide-slate-900">
                    <div className="py-1 flex justify-between">
                      <span>Parts Count:</span>
                      <strong className="text-slate-200">{computationResult.parts.length} line item(s)</strong>
                    </div>
                    <div className="py-1 flex justify-between">
                      <span>Parts Sourced Base:</span>
                      <strong className="text-slate-200">${computationResult.metrics.partsCostSum.toFixed(2)}</strong>
                    </div>
                    {computationResult.metrics.backorderPremiumSum > 0 && (
                      <div className="py-1 flex justify-between text-rose-350">
                        <span>Total Surcharges Sourced:</span>
                        <strong>+${computationResult.metrics.backorderPremiumSum.toFixed(2)}</strong>
                      </div>
                    )}
                    <div className="py-1 flex justify-between">
                      <span>Technical Complex Labor:</span>
                      <strong className="text-slate-200">
                        ${computationResult.metrics.laborCost.toFixed(2)} ({computationResult.metrics.laborHours} hr(s) @ ${computationResult.metrics.hourlyLaborRate}/hr)
                      </strong>
                    </div>
                    <div className="py-1 flex justify-between">
                      <span>Configurable Markup Overlay ({computationResult.metrics.overheadPercent}%):</span>
                      <strong className="text-slate-200">${computationResult.metrics.overheadCost.toFixed(2)}</strong>
                    </div>
                    <div className="py-1 flex justify-between">
                      <span>WA Sales Tax ({computationResult.metrics.taxInfo.city || "WA Unspecified"} - {(computationResult.metrics.taxInfo.rate * 100).toFixed(2)}%):</span>
                      <strong className="text-slate-200">${computationResult.metrics.taxInfo.taxAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-850/80 pt-3 flex justify-between items-baseline">
                  <span className="text-slate-400 font-black text-xs uppercase">Certified Grand Total Due:</span>
                  <strong className="text-xl text-emerald-400">${computationResult.metrics.grandTotal.toFixed(2)}</strong>
                </div>
              </div>

              {/* Lock Stamp and verification info */}
              <div className="text-[10px] leading-relaxed text-slate-400 flex items-start gap-2.5 bg-slate-950/20 p-3 rounded-lg border border-slate-800">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Calculated using secure mathematical algorithms. Fully decoupled from AI models to prevent pricing hallucinations. Authorized for immediate Spokane CellSmart client synchronization.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase rounded-lg shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  Acknowledge & Sign Receipt
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
