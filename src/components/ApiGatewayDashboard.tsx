import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Settings, 
  Terminal, 
  Server, 
  Key, 
  Activity, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Sliders,
  Play, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Copy, 
  Info,
  Layers,
  ArrowRight
} from "lucide-react";
import { RepairTicket } from "../types";

export interface GatewayKey {
  name: string;
  key: string;
  status: "ACTIVE" | "REVOKED";
  requestsCount: number;
}

export interface GatewayLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  apiKeyUsed: string;
  tokenValidated: boolean;
  status: number;
  error: string;
  clientIp: string;
}

interface ApiGatewayDashboardProps {
  tickets: RepairTicket[];
}

export function ApiGatewayDashboard({ tickets }: ApiGatewayDashboardProps) {
  // Gateway states
  const [enforceGateway, setEnforceGateway] = useState<boolean>(true);
  const [rateLimitLimit, setRateLimitLimit] = useState<number>(10);
  const [activeKeys, setActiveKeys] = useState<GatewayKey[]>([]);
  const [logs, setLogs] = useState<GatewayLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState<boolean>(false);

  // Key creation inputs
  const [newKeyName, setNewKeyName] = useState<string>("");
  const [newKeyValue, setNewKeyValue] = useState<string>("");

  // Sandbox mock request client states
  const [selectedEndpoint, setSelectedEndpoint] = useState<"/api/triage" | "/api/generate-quote">("/api/triage");
  const [authPreset, setAuthPreset] = useState<"no-auth" | "valid-token" | "valid-api-key" | "invalid-api-key">("valid-api-key");
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [mockRequestBody, setMockRequestBody] = useState<string>("");

  // Sandbox mock response output states
  const [testResponseStatus, setTestResponseStatus] = useState<number | null>(null);
  const [testResponseHeaders, setTestResponseHeaders] = useState<Record<string, string>>({});
  const [testResponseBody, setTestResponseBody] = useState<any>(null);
  const [isExecutingTest, setIsExecutingTest] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // YAML source code template viewer tab
  const [viewingYaml, setViewingYaml] = useState<boolean>(false);

  // Fetch settings & logs on mount
  const fetchGatewayData = async () => {
    setIsLoading(true);
    try {
      const resSettings = await fetch("/api/gateway/settings");
      if (resSettings.ok) {
        const settings = await resSettings.json();
        setEnforceGateway(settings.enforceGateway);
        setRateLimitLimit(settings.rateLimitLimit);
        setActiveKeys(settings.activeKeys || []);
      }

      await refreshLogs();
    } catch (err) {
      console.error("Error loading API Gateway state:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLogs = async () => {
    setIsRefreshingLogs(true);
    try {
      const resLogs = await fetch("/api/gateway/logs");
      if (resLogs.ok) {
        const data = await resLogs.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error loading logs:", err);
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  useEffect(() => {
    fetchGatewayData();
    // Default request bodies based on endpoint
    resetDefaultRequestBody();
  }, [selectedEndpoint]);

  const resetDefaultRequestBody = () => {
    if (selectedEndpoint === "/api/triage") {
      setMockRequestBody(JSON.stringify({
        messages: [{ role: "user", text: "My iPhone 14 Pro display has rapid horizontal flickering grid lines." }],
        deviceDetails: { brand: "Apple", model: "iPhone 14 Pro", tier: "flagship" }
      }, null, 2));
    } else {
      setMockRequestBody(JSON.stringify({
        issueType: "screen",
        deviceTier: "flagship",
        zipCode: "98101",
        isCorporate: false,
        modelName: "iPhone 14 Pro"
      }, null, 2));
    }
  };

  // Synchronize Settings to express backend
  const updateGatewaySettings = async (updates: { enforce?: boolean; newLimit?: number }) => {
    try {
      const res = await fetch("/api/gateway/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const next = await res.json();
        setEnforceGateway(next.enforceGateway);
        setRateLimitLimit(next.rateLimitLimit);
      }
    } catch (err) {
      console.error("Failed to update gateway rules:", err);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyValue) return;

    try {
      const res = await fetch("/api/gateway/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-key",
          name: newKeyName,
          key: newKeyValue
        })
      });
      if (res.ok) {
        const next = await res.json();
        setActiveKeys(next.activeKeys || []);
        setNewKeyName("");
        setNewKeyValue("");
        refreshLogs();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create key");
      }
    } catch (err) {
      console.error("Key allocation failure:", err);
    }
  };

  const handleUpdateKeyStatus = async (key: string, nextStatus: "ACTIVE" | "REVOKED") => {
    try {
      const res = await fetch("/api/gateway/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-key-status",
          key,
          status: nextStatus
        })
      });
      if (res.ok) {
        const next = await res.json();
        setActiveKeys(next.activeKeys || []);
        refreshLogs();
      }
    } catch (err) {
      console.error("Key status update error:", err);
    }
  };

  const handleDeleteKey = async (key: string) => {
    try {
      const res = await fetch("/api/gateway/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-key",
          key
        })
      });
      if (res.ok) {
        const next = await res.json();
        setActiveKeys(next.activeKeys || []);
        refreshLogs();
      }
    } catch (err) {
      console.error("Key deletion error:", err);
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch("/api/gateway/logs/clear", { method: "POST" });
      if (res.ok) {
        setLogs([]);
      }
    } catch (err) {
      console.error("Failed to clear logs:", err);
    }
  };

  const generateRandomKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
    let generated = "DCP_GW_";
    for (let i = 0; i < 20; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewKeyValue(generated);
  };

  // Perform a test request incorporating the selected headers
  const handleExecuteSandboxTest = async () => {
    setIsExecutingTest(true);
    setTestResponseStatus(null);
    setTestResponseHeaders({});
    setTestResponseBody(null);

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    let targetUrl = selectedEndpoint;

    // Apply Auth Presets
    if (authPreset === "valid-token") {
      headers["Authorization"] = "Bearer Simulated_Firebase_JWT_DCP_Enterprise_2026";
    } else if (authPreset === "valid-api-key") {
      const firstActiveKey = activeKeys.find(k => k.status === "ACTIVE")?.key || "DCP_GATEWAY_MOBILE_APP_KEY_2026";
      headers["x-api-key"] = firstActiveKey;
    } else if (authPreset === "invalid-api-key") {
      headers["x-api-key"] = "BAD_OR_REVOKED_GATEWAY_KEY_ILLEGAL";
    }

    try {
      let parsedBody = {};
      try {
        parsedBody = JSON.parse(mockRequestBody);
      } catch (err) {
        parsedBody = {};
      }

      const startTime = performance.now();
      const res = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(parsedBody)
      });
      const duration = (performance.now() - startTime).toFixed(1);

      setTestResponseStatus(res.status);
      
      // Capture rate limit or gateway headers
      const resHeaders: Record<string, string> = {
        "Content-Type": res.headers.get("content-type") || "application/json",
        "X-RateLimit-Limit": res.headers.get("X-RateLimit-Limit") || "N/A",
        "X-RateLimit-Remaining": res.headers.get("X-RateLimit-Remaining") || "N/A",
        "X-RateLimit-Reset-After": res.headers.get("X-RateLimit-Reset-After") || "N/A",
        "X-Response-Time": `${duration}ms`
      };
      setTestResponseHeaders(resHeaders);

      const body = await res.json();
      setTestResponseBody(body);
      
      // Auto refresh log ledger to show visual change
      await refreshLogs();
    } catch (err: any) {
      setTestResponseStatus(0);
      setTestResponseBody({ error: "Network stream closed or failed gateway transit hook.", details: err.message });
    } finally {
      setIsExecutingTest(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const apiGatewayYaml = `# GCP API Gateway OpenAPI 2.0 Specification
swagger: "2.0"
info:
  title: "Triage-AI Secure API Gateway"
  description: "Secure, rate-limited entrance for Triage-AI mobile hardware Diagnostics."
  version: "1.0.0"

host: "triage-gateway-dcp-101.nw.gateway.dev"
schemes:
  - "https"

x-google-endpoints:
  - name: "triage-gateway-dcp-101.nw.gateway.dev"
    allowCors: true

securityDefinitions:
  api_key:
    type: "apiKey"
    name: "key"
    in: "query"
  
  firebase_auth:
    type: "oauth2"
    authorizationUrl: ""
    flow: "implicit"
    x-google-issuer: "https://securetoken.google.com/c2e2eafb-3cb1-4649-b652-71711906b516"
    x-google-jwks_uri: "https://www.googleapis.com/service_accounts/v1/metadata/x509/securetoken@system.gserviceaccount.com"
    x-google-audiences: "c2e2eafb-3cb1-4649-b652-71711906b516"

paths:
  /api/triage:
    post:
      summary: "AI Triage Assistant"
      operationId: "routeAiTriage"
      produces:
        - "application/json"
      security:
        - api_key: []
        - firebase_auth: []
      x-google-backend:
        address: "https://ais-dev-qaarbg7eivxlz2dpis24f5-367327296310.us-west2.run.app"
        path_translation: "APPEND_PATH_TO_ADDRESS"

  /api/generate-quote:
    post:
      summary: "Dynamic Repair Quote Optimizer"
      operationId: "routeGenerateQuote"
      produces:
        - "application/json"
      security:
        - api_key: []
      x-google-backend:
        address: "https://ais-dev-qaarbg7eivxlz2dpis24f5-367327296310.us-west2.run.app"
        path_translation: "APPEND_PATH_TO_ADDRESS"`;

  return (
    <div className="flex flex-col flex-1 gap-6 animate-in fade-in duration-300">
      
      {/* Upper Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-widest">
              Protection Active
            </span>
            <span className={`h-2.5 w-2.5 rounded-full ${enforceGateway ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">
                {enforceGateway ? "ENFORCED" : "BYPASSED"}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1">GCP API Gateway routing status</p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-widest">
              Rate Limit Ceiling
            </span>
            <Settings className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-blue-450">
                {rateLimitLimit}
              </span>
              <span className="text-xs text-slate-400 uppercase font-mono font-bold">reqs/min</span>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1 font-sans">Token Bucket window threshold</p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-widest">
              Preapproved API Keys
            </span>
            <Key className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-400">
                {activeKeys.filter(k => k.status === "ACTIVE").length}
              </span>
              <span className="text-xs text-slate-400 uppercase font-mono font-bold">
                / {activeKeys.length} total
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1">Authenticating dispatch devices</p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-widest">
              Transaction Audit Trail
            </span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-cyan-400">
                {logs.length}
              </span>
              <span className="text-xs text-slate-400 uppercase font-mono font-bold">Logged</span>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1">Retained transaction logs</p>
          </div>
        </div>
      </div>

      {/* Main Splits */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Architecture, Config, Rules */}
        <section className="col-span-12 xl:col-span-5 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-md flex flex-col space-y-6">
          <div className="flex justify-between items-center border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-tight">API Gateway Architecture</h2>
                <p className="text-xs text-slate-400">Security mapping and network compliance</p>
              </div>
            </div>
            <button
              onClick={() => setViewingYaml(!viewingYaml)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-700 hover:bg-slate-950 text-[10px] font-bold text-slate-350 uppercase rounded font-mono transition-colors"
            >
              <Terminal className="w-3 h-3 text-cyan-405" />
              {viewingYaml ? "View Schemas" : "View OpenAPI YAML"}
            </button>
          </div>

          {viewingYaml ? (
            <div className="flex flex-col flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">gcp-api-gateway.yaml</span>
                <button
                  onClick={() => copyToClipboard(apiGatewayYaml)}
                  className="text-[10px] text-slate-450 hover:text-white flex items-center gap-1 font-mono transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedKey === apiGatewayYaml ? "Copied!" : "Copy Yaml"}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 border border-slate-850 rounded-lg text-[10px] leading-relaxed text-slate-300 font-mono overflow-auto max-h-[450px] whitespace-pre shadow-inner">
                {apiGatewayYaml}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col flex-1 space-y-5">
              {/* Topologies Card */}
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-750 flex flex-col items-center">
                <span className="text-[9px] text-emerald-400 font-extrabold uppercase font-mono tracking-widest mb-3 select-none">
                  [NETWORK PATHWAY ANALYSIS]
                </span>
                
                <div className="w-full text-center font-mono text-[10.5px] leading-snug space-y-2 text-slate-300 select-none">
                  {/* Styled block representing mobile apps */}
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded mx-auto max-w-[280px]">
                    📱 Dispatch Client App / Tablet IP
                    <div className="text-[9px] text-slate-550 select-none">Headers: api-key | Jwt token</div>
                  </div>
                  
                  {/* Downward Connector arrow */}
                  <div className="text-slate-500 text-lg font-bold">⬇</div>
                  
                  {/* Styled block representing gateway boundary */}
                  <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-lg mx-auto max-w-[340px] relative">
                    <div className="absolute -top-2 left-3 bg-slate-800 border border-emerald-800 px-1.5 py-0.2 rounded text-[8px] font-extrabold text-emerald-400 font-mono uppercase tracking-wider">
                      Secured Border
                    </div>
                    🛡️ GCP API GATEWAY PROXY
                    <div className="text-[9px] text-slate-400 mt-1 leading-normal">
                      • Rate Limiter Thresholds Enforced<br/>
                      • CORS Strict Headers Injected<br/>
                      • Firebase JWT Identity Decrypted
                    </div>
                  </div>
                  
                  {/* Downward Connector arrow */}
                  <div className="text-slate-500 text-lg font-bold">⬇</div>
                  
                  {/* Styled block representing backend targets */}
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded mx-auto max-w-[280px]">
                    🚀 Server Cloud Run Backend
                    <div className="text-[9px] text-blue-450 font-bold font-mono">/api/triage or /api/generate-quote</div>
                  </div>
                </div>
              </div>

              {/* Security settings adjustment panel */}
              <div className="bg-slate-900/30 border border-slate-750 rounded-xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">API Gateway Guard Controls</h3>
                
                <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">Enforce API Gateway rules</span>
                    <span className="text-[10px] text-slate-450">Intercept /api paths immediately when disabled</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={enforceGateway} 
                      onChange={(e) => updateGatewaySettings({ enforce: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Rate Limiting Adjuster slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Rate Limit Windows:</span>
                    <span className="text-semibold text-blue-400 font-mono">{rateLimitLimit} requests/min</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="60" 
                    value={rateLimitLimit}
                    onChange={(e) => setRateLimitLimit(parseInt(e.target.value))}
                    onMouseUp={() => updateGatewaySettings({ newLimit: rateLimitLimit })}
                    onTouchEnd={() => updateGatewaySettings({ newLimit: rateLimitLimit })}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-semibold uppercase tracking-wider font-mono">
                    <span>2 (Strict)</span>
                    <span>30 (Balanced)</span>
                    <span>60 (High Capacity)</span>
                  </div>
                </div>
              </div>

              {/* Explanatory notes detailing architectural & security benefits */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">Gateway Protection Benefits</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed text-slate-350">
                  <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-slate-205 mb-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      JWT Integrity
                    </div>
                    Decodes Firebase authentication tokens directly at the Edge. No illegal execution or unauthenticated traffic reaches internal processing layers.
                  </div>

                  <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-slate-205 mb-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      DDoS Mitigations
                    </div>
                    Integrates perfectly with Google Cloud Armor filtering rules. Guards against brute-force, web scrapers, and slowloris exhaustion.
                  </div>

                  <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-slate-205 mb-1.5">
                      <Layers className="w-3.5 h-3.5 text-pink-400" />
                      Decoupled Billing
                    </div>
                    Rate-limits high-cost AI operations (Gemini groundings, structural analyses) protecting dispatch databases from catastrophic financial overrun.
                  </div>

                  <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-slate-205 mb-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Unified Analytics
                    </div>
                    Inspect and analyze traffic loads from multiple retail and corporate dispatch accounts via Google Cloud Logger dashboards seamlessly.
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right Columns: API Key Manager & Testing Suite */}
        <div className="col-span-12 xl:col-span-7 flex flex-col space-y-6">
          
          {/* API Keys Management Area */}
          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-md">
            <h2 className="text-sm font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              API Credentials Allocation Registry
            </h2>

            <div className="space-y-4">
              {/* Create Key Form */}
              <form onSubmit={handleCreateKey} className="bg-slate-900 p-4 border border-slate-750 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                <div className="md:col-span-4 space-y-1.5">
                  <label htmlFor="keyLabel" className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide">Device Owner Name / Label</label>
                  <input 
                    id="keyLabel"
                    type="text" 
                    placeholder="e.g., Spokane Service iPad" 
                    value={newKeyName} 
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-5 space-y-1.5">
                  <label htmlFor="keyBody" className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide">API Key String ID</label>
                  <div className="relative">
                    <input 
                      id="keyBody"
                      type="text" 
                      placeholder="Custom or autogenerated ID" 
                      value={newKeyValue} 
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 text-slate-200 rounded-lg p-2 pr-16 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                    <button 
                      type="button"
                      onClick={generateRandomKey}
                      className="absolute right-1 text-[10px] bg-emerald-950 hover:bg-emerald-850 text-emerald-400 font-extrabold uppercase py-1 px-2.5 rounded top-1 transition-colors"
                    >
                      Gen
                    </button>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Approve Client
                  </button>
                </div>
              </form>

              {/* Active Keys Database Table */}
              <div className="border border-slate-700/85 rounded-lg overflow-hidden bg-slate-900 shadow-inner max-h-[195px] overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-955/90 text-slate-400 font-mono text-[9px] uppercase tracking-wider border-b border-slate-700 select-none">
                    <tr>
                      <th className="p-2.5">Owner Client Device</th>
                      <th className="p-2.5">Gateway Token Key ID</th>
                      <th className="p-2.5 text-center">Requests</th>
                      <th className="p-2.5">Gateway Security Policy</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px] leading-relaxed">
                    {activeKeys.map((k) => (
                      <tr key={k.key} className="hover:bg-slate-800/20 group">
                        <td className="p-2.5 font-bold text-slate-205 font-sans">{k.name}</td>
                        <td className="p-2.5 font-mono select-all text-blue-400 font-bold">{k.key}</td>
                        <td className="p-2.5 text-center font-bold text-[10px] text-slate-350">{k.requestsCount}</td>
                        <td className="p-2.5">
                          {k.status === "ACTIVE" ? (
                            <span className="bg-emerald-950/70 text-emerald-400 border border-emerald-900 text-[10px] px-2 py-0.5 rounded font-extrabold select-none">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="bg-red-950/70 text-red-400 border border-red-900 text-[10px] px-2 py-0.5 rounded font-extrabold select-none">
                              REVOKED
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right whitespace-nowrap space-x-1.5">
                          {k.status === "ACTIVE" ? (
                            <button
                              onClick={() => handleUpdateKeyStatus(k.key, "REVOKED")}
                              className="text-[9px] bg-slate-950 border border-red-900 text-red-400 hover:bg-red-950 px-2 py-1 rounded tracking-wider uppercase font-bold transition-colors"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateKeyStatus(k.key, "ACTIVE")}
                              className="text-[9px] bg-slate-950 border border-emerald-900 text-emerald-400 hover:bg-emerald-950 px-2 py-1 rounded tracking-wider uppercase font-bold transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteKey(k.key)}
                            className="text-slate-450 hover:text-white p-1 hover:bg-slate-950 rounded transition-colors inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {activeKeys.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500 font-mono uppercase tracking-widest text-xs">
                          [No active or revoked API Keys allocated]
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Secure API Sandbox interactive client suite */}
          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-md flex-1 flex flex-col">
            <h2 className="text-sm font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Gateway Request Testing Sandbox Suite
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
              {/* Input details */}
              <div className="lg:col-span-6 flex flex-col space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="endpointSelect" className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">Target API Route</label>
                  <select 
                    id="endpointSelect"
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="/api/triage">POST /api/triage (AI Triage Assistant)</option>
                    <option value="/api/generate-quote">POST /api/generate-quote (Quote Optimizer)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Auth Simulation Presets</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthPreset("no-auth")}
                      className={`py-2 text-[10.5px] rounded-lg tracking-wider uppercase border text-center font-bold font-mono transition-colors ${
                        authPreset === "no-auth" 
                          ? "bg-amber-950 text-amber-400 border-amber-800 shadow-md font-extrabold" 
                          : "bg-slate-900 hover:bg-slate-950 border-slate-750 text-slate-400 hover:text-white"
                      }`}
                    >
                      ⚠️ No Auth
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthPreset("valid-api-key")}
                      className={`py-2 text-[10.5px] rounded-lg tracking-wider uppercase border text-center font-bold font-mono transition-colors ${
                        authPreset === "valid-api-key" 
                          ? "bg-slate-700 text-emerald-400 border-emerald-500 shadow-md font-extrabold" 
                          : "bg-slate-900 hover:bg-slate-950 border-slate-750 text-slate-400 hover:text-white"
                      }`}
                    >
                      🔑 API Key
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthPreset("valid-token")}
                      className={`py-2 text-[10.5px] rounded-lg tracking-wider uppercase border text-center font-bold font-mono transition-colors ${
                        authPreset === "valid-token" 
                          ? "bg-slate-700 text-blue-450 border-blue-500 shadow-md font-extrabold" 
                          : "bg-slate-900 hover:bg-slate-950 border-slate-750 text-slate-400 hover:text-white"
                      }`}
                    >
                      🛡️ Bearer JWT
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthPreset("invalid-api-key")}
                      className={`py-2 text-[10.5px] rounded-lg tracking-wider uppercase border text-center font-bold font-mono transition-colors ${
                        authPreset === "invalid-api-key" 
                          ? "bg-red-950 text-red-405 border-red-900 shadow-md font-extrabold" 
                          : "bg-slate-900 hover:bg-slate-950 border-slate-750 text-slate-400 hover:text-white"
                      }`}
                    >
                      ❌ Invalid Key
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center">
                    <label htmlFor="payloadBody" className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">Payload Body (JSON)</label>
                    <button 
                      type="button"
                      onClick={resetDefaultRequestBody}
                      className="text-[9px] text-slate-500 hover:text-white font-mono uppercase tracking-wider font-extrabold"
                    >
                      Reset Payload
                    </button>
                  </div>
                  <textarea 
                    id="payloadBody"
                    value={mockRequestBody}
                    onChange={(e) => setMockRequestBody(e.target.value)}
                    rows={6}
                    className="w-full flex-1 bg-slate-950 border border-slate-750 text-slate-200 rounded-lg p-3 text-[10px] font-mono leading-relaxed focus:ring-1 focus:ring-cyan-500 focus:outline-none shadow-inner"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExecuteSandboxTest}
                  disabled={isExecutingTest}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold uppercase rounded-lg shadow-lg flex items-center justify-center gap-2 tracking-widest select-none transition-transform active:scale-99"
                >
                  {isExecutingTest ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>PROBING GATEWAY AUTH LAYER...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                      <span>TRANSMIT TEST GATEWAY PAYLOAD</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output Response Monitor */}
              <div className="lg:col-span-6 bg-slate-900 rounded-xl p-4 border border-slate-750 flex flex-col justify-between min-h-[350px]">
                <div className="space-y-3.5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Gateway Output Monitor</span>
                    {testResponseStatus !== null && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-slate-450 font-bold font-mono">Status:</span>
                        <span className={`text-[11px] font-extrabold font-mono rounded px-2 py-0.5 border ${
                          testResponseStatus === 200 
                            ? "bg-emerald-950 text-emerald-400 border-emerald-900" 
                            : testResponseStatus === 429
                            ? "bg-red-950 text-red-400 border-red-900 animate-pulse"
                            : "bg-amber-950 text-amber-400 border-amber-900"
                        }`}>
                          {testResponseStatus} {testResponseStatus === 200 ? "OK" : testResponseStatus === 429 ? "EXHAUSTED" : "BLOCKED"}
                        </span>
                      </div>
                    )}
                  </div>

                  {testResponseStatus === null ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-550 select-none">
                      <Terminal className="w-10 h-10 mb-2.5 opacity-40 shrink-0" />
                      <p className="text-[11px] font-bold uppercase tracking-widest font-mono">[Terminal output state idle]</p>
                      <p className="text-[10.5px] text-slate-500 mt-1 max-w-[200px]">Send a mock JSON transaction above to verify authentication, security headers, and rate-limiting loops.</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col space-y-3">
                      {/* Headers */}
                      <div>
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase font-mono tracking-wider">Gateway Response Headers</span>
                        <div className="bg-slate-950 p-2 border border-slate-850 rounded text-[9.5px] font-mono leading-relaxed text-slate-400 grid grid-cols-1 md:grid-cols-2 gap-1 mt-1 shadow-inner">
                          {Object.entries(testResponseHeaders).map(([k, v]) => (
                            <div key={k} className="truncate">
                              <span className="text-slate-550 mr-1 select-none">{k}:</span>
                              <span className="text-slate-300 font-bold">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Response Body */}
                      <div className="flex-1 flex flex-col min-h-0 select-all">
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase font-mono tracking-wider">Response Payload Complex</span>
                        <pre className="flex-1 bg-slate-950 p-3 border border-slate-850 rounded-lg text-[10px] leading-relaxed text-slate-300 font-mono overflow-auto max-h-[220px] mt-1 shadow-inner whitespace-pre-wrap">
                          {JSON.stringify(testResponseBody, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/70 rounded-lg border border-slate-850 p-2.5 text-[9.5px] leading-relaxed text-slate-450 mt-4 flex items-start gap-1.5 font-mono select-none">
                  <Info className="w-3.5 h-3.5 text-blue-450 shrink-0 mt-0.5" />
                  <span>
                    💡 <span className="font-bold text-slate-300">Stress Test:</span> Select a valid API Key and hit the submit button 11 times quickly. The Gateway token-bucket counts exceed settings limits and throw automatic HTTP 429 status code blocks!
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Lower Audit logs list */}
      <section className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4 select-none">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight">Real-time Gateway Sync Ledger Logs</h2>
              <p className="text-xs text-slate-400">Verifying secure traffic transit down live workstation logic boards</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={refreshLogs}
              disabled={isRefreshingLogs}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-950 text-slate-300 hover:text-white text-xs font-semibold rounded transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLogs ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-red-900/60 hover:bg-slate-950 text-red-405 text-xs font-semibold rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Trail
            </button>
          </div>
        </div>

        <div className="border border-slate-700/85 rounded-lg overflow-hidden bg-slate-900 shadow-inner max-h-[290px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-955/90 text-slate-400 font-mono text-[9px] uppercase tracking-wider border-b border-slate-700 select-none">
              <tr>
                <th className="p-3">Log UID</th>
                <th className="p-3">Sustained Time</th>
                <th className="p-3">Method</th>
                <th className="p-3">Gateway Bound Path</th>
                <th className="p-3">Client Host IP</th>
                <th className="p-3">Credential / API Key</th>
                <th className="p-3">Security Level</th>
                <th className="p-3">Response Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono text-[10.5px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/10 transition-colors">
                  <td className="p-3 text-cyan-400 font-bold">{log.id}</td>
                  <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3 font-semibold text-slate-300">{log.method}</td>
                  <td className="p-3 font-bold text-slate-205">{log.path}</td>
                  <td className="p-3 text-slate-450">{log.clientIp}</td>
                  <td className="p-3 text-blue-400 font-bold">{log.apiKeyUsed}</td>
                  <td className="p-3">
                    {log.tokenValidated ? (
                      <span className="text-light text-blue-450 font-bold text-[9px] bg-blue-950/40 px-1.5 py-0.2 rounded border border-blue-900/30">
                        FIREBASE JWT
                      </span>
                    ) : log.apiKeyUsed !== "(none)" ? (
                      <span className="text-light text-emerald-400 font-bold text-[9px] bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-900/30">
                        API KEY AUTH
                      </span>
                    ) : (
                      <span className="text-light text-amber-500 font-bold text-[9px] bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-900/30">
                        ANONYMOUS
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {log.status === 200 ? (
                      <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-900 text-[10px] px-2 py-0.5 rounded font-extrabold select-none">
                        200 OK
                      </span>
                    ) : log.status === 429 ? (
                      <span className="bg-red-950/80 text-red-400 border border-red-900 text-[10px] px-2 py-0.5 rounded font-extrabold select-none">
                        429 LIMIT
                      </span>
                    ) : (
                      <span className="bg-amber-950/80 text-amber-500 border border-amber-900 text-[10px] px-2 py-0.5 rounded font-extrabold select-none">
                        {log.status} BLOCKED
                      </span>
                    )}
                    {log.error && (
                      <span className="block text-[9.5px] text-red-305 mt-1 font-sans leading-normal leading-relaxed">{log.error}</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-mono uppercase tracking-widest text-xs select-none">
                    [Audit stream is empty. Launch test queries in the sandbox above to populate logs]
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
