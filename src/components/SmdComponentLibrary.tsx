import React, { useState, useMemo } from "react";
import { Search, Filter, Cpu, Zap, Activity, BookOpen, ChevronRight, Triangle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SmdComponent {
  id: string;
  name: string;
  category: 'Capacitor' | 'Fuse' | 'IC' | 'Resistor' | 'Inductor' | 'Filter';
  footprint: string;
  expectedDiodeDrop: string;
  tolerance: string;
  schematicSymbol: "CAP" | "RES" | "IND" | "IC" | "FUSE" | "FL";
  description: string;
}

const SMD_DATABASE: SmdComponent[] = [
  {
    id: "U4001",
    name: "Tristar 1610A3 (USB Mux)",
    category: "IC",
    footprint: "WLCSP-36",
    expectedDiodeDrop: "0.450V - 0.520V",
    tolerance: "±5%",
    schematicSymbol: "IC",
    description: "USB logic and charging multiplexer. Handles handshake and accessory protocol."
  },
  {
    id: "FL1728",
    name: "Backlight Anode Filter",
    category: "Filter",
    footprint: "0201",
    expectedDiodeDrop: "0.550V",
    tolerance: "±10%",
    schematicSymbol: "FL",
    description: "EMI filter on the main backlight anode line. Prone to burning out during improper screen removal."
  },
  {
    id: "C247_W",
    name: "VCC_MAIN Decoupling Cap",
    category: "Capacitor",
    footprint: "0402",
    expectedDiodeDrop: "0.320V",
    tolerance: "±20%",
    schematicSymbol: "CAP",
    description: "Main power rail decoupling capacitor. Often fails short when subjected to voltage spikes."
  },
  {
    id: "F3000",
    name: "Battery VBUS Fuse",
    category: "Fuse",
    footprint: "0603",
    expectedDiodeDrop: "0.001V (Continuity)",
    tolerance: "N/A",
    schematicSymbol: "FUSE",
    description: "Fast-acting protection fuse on the battery input line."
  },
  {
    id: "Tigris_U3300",
    name: "Tigris SN2400 (Charging IC)",
    category: "IC",
    footprint: "BGA-42",
    expectedDiodeDrop: "0.380V - 0.410V",
    tolerance: "±5%",
    schematicSymbol: "IC",
    description: "Main battery charge management IC. Works in conjunction with Tristar."
  },
  {
    id: "R1200",
    name: "I2C Pull-Up Resistor",
    category: "Resistor",
    footprint: "01005",
    expectedDiodeDrop: "0.650V",
    tolerance: "±1%",
    schematicSymbol: "RES",
    description: "2.2K pull-up resistor for I2C data lines (SDA/SCL)."
  }
];

export const SmdComponentLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(SMD_DATABASE.map(c => c.category)))];

  const filteredComponents = useMemo(() => {
    return SMD_DATABASE.filter(comp => {
      const matchesSearch = 
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        comp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || comp.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getSchematicIcon = (symbol: string) => {
    switch (symbol) {
      case "IC": return <Cpu className="w-8 h-8 text-blue-400" strokeWidth={1} />;
      case "CAP": return <div className="w-8 h-8 flex flex-col justify-center items-center gap-1 opacity-70"><div className="w-6 h-0.5 bg-cyan-400"></div><div className="w-6 h-0.5 bg-cyan-400"></div></div>;
      case "RES": return <Activity className="w-8 h-8 text-amber-500" strokeWidth={1.5} />;
      case "FUSE": return <Zap className="w-8 h-8 text-red-500" strokeWidth={1.5} />;
      case "FL": return <Filter className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />;
      default: return <Cpu className="w-8 h-8 text-slate-400" strokeWidth={1} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#090d16] text-slate-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-teal-500" />
          <h1 className="text-xl font-bold text-white tracking-tight">SMD Component Forensics Library</h1>
          <span className="ml-auto px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold bg-teal-950/50 text-teal-400 border border-teal-900">
            NIST SP 800-88 R1
          </span>
        </div>
        <p className="text-sm text-slate-400">
          Searchable reference for typical diode-drop voltages and footprint dimensions of common logic board surface-mount components.
        </p>

        {/* Controls */}
        <div className="flex gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by designator (e.g., U4001) or description..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-white placeholder-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat 
                    ? "bg-slate-800 text-teal-400 border border-teal-900/50" 
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {filteredComponents.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-500 gap-3 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            <ShieldAlert className="w-8 h-8 opacity-50" />
            <p className="text-sm">Data not present in local source vaults</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredComponents.map((comp, idx) => (
                <motion.div
                  key={comp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="group bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col hover:border-teal-900/50 hover:bg-slate-800/50 transition-colors relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    {getSchematicIcon(comp.schematicSymbol)}
                  </div>
                  
                  <div className="flex items-start justify-between mb-3 z-10 w-full">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        {comp.id}
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-950 text-slate-400 border border-slate-800 uppercase">
                          {comp.category}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{comp.name}</p>
                    </div>
                  </div>

                  <div className="bg-[#040608] rounded-lg p-3 border border-slate-800/60 font-mono text-xs space-y-2 mb-3 z-10">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-slate-500">Diode Drop</span>
                      <span className="text-blue-400 font-semibold">{comp.expectedDiodeDrop}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-slate-500">Footprint</span>
                      <span className="text-slate-300">{comp.footprint}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Tolerance</span>
                      <span className="text-slate-300">{comp.tolerance}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed z-10 mt-auto">
                    {comp.description}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
