import React, { useState } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  FileText, 
  Play, 
  Eye, 
  Cpu, 
  Code,
  Layers,
  Database,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { GoogleVerificationWizard } from "./GoogleVerificationWizard";

interface CspManualProps {
  addToast: (title: string, message: string, type: "success" | "warning" | "info") => void;
}

export function CspManualView({ addToast }: CspManualProps) {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "directives" | "inline-eval" | "reporting" | "playground" | "verification">("overview");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Playground state
  const [selectedPreset, setSelectedPreset] = useState<string>("basic");
  const [customCspHeader, setCustomCspHeader] = useState<string>("default-src 'self'; script-src 'self' https://apis.google.com");
  const [testScriptUrl, setTestScriptUrl] = useState<string>("https://apis.google.com/js/plusone.js");
  const [testInlineCode, setTestInlineCode] = useState<string>("alert('Hello, World!');");
  const [playgroundResults, setPlaygroundResults] = useState<Array<{ type: "success" | "error" | "warn"; msg: string }>>([
    { type: "warn", msg: "Simulator initialized. Modify the CSP Header and run target simulations." }
  ]);

  const PRESETS: Record<string, string> = {
    basic: "default-src 'self'; script-src 'self' https://apis.google.com",
    strict: "default-src 'none'; script-src 'self'; img-src 'self' data:; style-src 'self'",
    lockdown: "default-src 'none'; script-src https://cdn.mybank.net; style-src https://cdn.mybank.net; img-src https://cdn.mybank.net; connect-src https://api.mybank.com; child-src 'self'",
    loose_unsafe: "default-src *; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
  };

  const handleSelectPreset = (pKey: string) => {
    setSelectedPreset(pKey);
    setCustomCspHeader(PRESETS[pKey]);
    addToast("Policy Loaded", `Preset '${pKey}' successfully loaded into telemetry terminal!`, "info");
  };

  const runSimulation = () => {
    const results: Array<{ type: "success" | "error" | "warn"; msg: string }> = [];
    results.push({ type: "info" as any, msg: `Evaluating simulated network packet against CSP headers...` });

    // 1. Parsing directives
    const directives: Record<string, string[]> = {};
    const parts = customCspHeader.split(";").map(s => s.trim()).filter(Boolean);
    parts.forEach(part => {
      const tokens = part.split(/\s+/);
      if (tokens.length > 0) {
        const head = tokens[0];
        const sources = tokens.slice(1);
        directives[head] = sources;
      }
    });

    results.push({ type: "success", msg: `Successfully parsed ${parts.length} security directives.` });

    // Helper to check standard directive fallbacks
    const checkAllowed = (directiveName: string, targetSource: string, isInline = false) => {
      let sources = directives[directiveName];
      if (!sources && directiveName.endsWith("-src")) {
        sources = directives["default-src"];
      }

      if (!sources) {
        // No restriction is set, unless specified
        const unrestrictDefaults = ["base-uri", "form-action", "frame-ancestors", "plugin-types", "report-uri"];
        if (unrestrictDefaults.includes(directiveName)) {
          return { allowed: true, via: "default-open (no fallback)" };
        }
        return { allowed: true, via: "browser permissive fallback (no default-src)" };
      }

      if (sources.includes("'none'")) {
        return { allowed: false, via: `${directiveName} 'none' mandate` };
      }

      if (isInline) {
        const hasKeyword = sources.includes("'unsafe-inline'");
        return { allowed: hasKeyword, via: hasKeyword ? `'unsafe-inline' approval` : `no 'unsafe-inline' token` };
      }

      // Basic origin check
      if (sources.includes("*")) {
        return { allowed: true, via: "universal wildcard '*'" };
      }
      if (sources.includes("'self'")) {
        if (targetSource === "host" || targetSource.startsWith(window.location.origin)) {
          return { allowed: true, via: "'self' keyword matched" };
        }
      }

      // Check URL prefixes
      const allowedUrl = sources.some(src => {
        if (src.startsWith("http") && targetSource.startsWith(src)) return true;
        if (targetSource.includes(src)) return true;
        return false;
      });

      return { allowed: allowedUrl, via: allowedUrl ? `explicit white-list source '${sources.find(s => targetSource.includes(s))}'` : `no matching rule in ${directiveName}` };
    };

    // Test URL-based External Script
    if (testScriptUrl) {
      const res = checkAllowed("script-src", testScriptUrl);
      if (res.allowed) {
        results.push({ 
          type: "success", 
          msg: `✓ Loaded external script '${testScriptUrl}' successfully. Allowed via: ${res.via}.` 
        });
      } else {
        results.push({ 
          type: "error", 
          msg: `❌ Refused to load script '${testScriptUrl}' because it violates CSP directive. Blocked via: ${res.via}.` 
        });
      }
    }

    // Test Inline Script
    if (testInlineCode) {
      const res = checkAllowed("script-src", "inline", true);
      if (res.allowed) {
        results.push({ 
          type: "warn", 
          msg: `⚠ Inline script execution ALLOWED. Via: ${res.via}. Warning: Vulnerable to XSS injection!` 
        });
      } else {
        results.push({ 
          type: "success", 
          msg: `✓ Blocked potentially malicious inline script execution safely. Via: ${res.via}.` 
        });
      }
    }

    // Connect-src simulation warning
    const connectRes = checkAllowed("connect-src", "https://api.mybank.com");
    if (!connectRes.allowed) {
      results.push({ type: "warn", msg: `ℹ Restrictive fallback applies: XMLHttpRequests connected to API origins are blocked unless whitelisted.` });
    }

    setPlaygroundResults(results);
    addToast("Simulation Run Complete", "Calculated standard browser behavior metrics for the input policy string.", "success");
  };

  const handleCopyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    addToast("Copied to Clipboard", "Code snippet successfully transferred to your local paste storage.", "success");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300 text-left select-none">
      
      {/* Title Header Hero */}
      <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-widest bg-blue-950/40 border border-blue-900/30 px-2 py-0.5 rounded">
              Sec-Ops Security Standard Reference
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Content Security Policy (CST) Web.dev Standard</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            A comprehensive implementation of Joe Medley & Mike West's Web.dev guide. Learn how to mitigate Cross-Site Scripting (XSS) risks systematically through structured browser headers.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <a
            href="https://developer.mozilla.org/docs/Web/HTTP/Reference/Headers/Content-Security-Policy"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs rounded-xl font-bold uppercase tracking-wider font-sans transition-all flex items-center gap-1.5"
          >
            MDN Spec Docs
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Tabbed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Rail Left */}
        <div className="col-span-1 lg:col-span-3 space-y-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("overview")}
            className={`w-full text-left px-4 py-3.5 rounded-xl border text-xs font-bold transition-all uppercase tracking-wider font-sans flex items-center gap-3 cursor-pointer ${
              activeSubTab === "overview"
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/15"
                : "bg-slate-900 text-slate-400 border-slate-850 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>01. Introduction & Security Model</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("directives")}
            className={`w-full text-left px-4 py-3.5 rounded-xl border text-xs font-bold transition-all uppercase tracking-wider font-sans flex items-center gap-3 cursor-pointer ${
              activeSubTab === "directives"
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/15"
                : "bg-slate-900 text-slate-400 border-slate-850 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>02. Source Allowlist Directives</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("inline-eval")}
            className={`w-full text-left px-4 py-3.5 rounded-xl border text-xs font-bold transition-all uppercase tracking-wider font-sans flex items-center gap-3 cursor-pointer ${
              activeSubTab === "inline-eval"
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/15"
                : "bg-slate-900 text-slate-400 border-slate-850 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <Code className="w-4 h-4" />
            <span>03. Avoid Inline Code & Eval()</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("reporting")}
            className={`w-full text-left px-4 py-3.5 rounded-xl border text-xs font-bold transition-all uppercase tracking-wider font-sans flex items-center gap-3 cursor-pointer ${
              activeSubTab === "reporting"
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/15"
                : "bg-slate-900 text-slate-400 border-slate-850 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>04. Report Policy Violations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("verification")}
            className={`w-full text-left px-4 py-3.5 rounded-xl border text-xs font-bold transition-all uppercase tracking-wider font-sans flex items-center gap-3 cursor-pointer ${
              activeSubTab === "verification"
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/15"
                : "bg-slate-900 text-slate-400 border-slate-850 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>05. Google Verification Hub</span>
          </button>

          <div className="pt-4 border-t border-slate-850/80">
            <button
              type="button"
              onClick={() => setActiveSubTab("playground")}
              className={`w-full text-left px-4 py-3.5 rounded-xl border text-xs font-black transition-all uppercase tracking-wider font-mono flex items-center gap-3 cursor-pointer bg-gradient-to-r ${
                activeSubTab === "playground"
                  ? "from-amber-600 to-amber-700 text-white border-amber-500 shadow-lg shadow-amber-600/15 animate-pulse"
                  : "from-slate-950 to-slate-900 text-amber-400 border-amber-950 hover:border-amber-900 hover:text-amber-300"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Interactive CSP Telemetry</span>
            </button>
          </div>
        </div>

        {/* Content Display Right */}
        <div className="col-span-1 lg:col-span-9 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xs text-left min-h-[500px]">
          
          {/* 1. OVERVIEW SUBTAB */}
          {activeSubTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wide font-sans">The Enterprise Web Security Model</h2>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                Browser core security relies explicitly on a <strong className="text-blue-400 font-bold">Same-Origin Policy (SOP)</strong>. Under strict SOP guidelines, executable code downloaded from <code className="bg-slate-950 text-emerald-400 px-1 rounded text-xs font-mono">https://mybank.com</code> has sandbox permissions targeting ONLY resources located on <code className="bg-slate-950 text-emerald-400 px-1 rounded text-xs font-mono">https://mybank.com</code>. This prevents third-party attackers at <code className="bg-slate-950 text-rose-400 px-1 rounded text-xs font-mono">https://evil.example.com</code> from compromising secure customer session payloads.
              </p>

              <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 flex gap-3 text-slate-300">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs space-y-1">
                  <strong className="text-white block font-bold">The Cross-Site Scripting (XSS) Threat:</strong>
                  <span>Attackers bypass SOP mechanisms by injecting malicious scripts directly into trusted web assets. The browser accepts all received blocks as legitimate elements of the page's original domain security origin. The XSS Filter Evasion Cheat Sheet (developed by OWASP) illustrates this extreme vulnerability.</span>
                </div>
              </div>

              {/* Author Info */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://web.dev/images/authors/joemedley.jpg" 
                    referrerPolicy="no-referrer"
                    alt="Joe Medley" 
                    className="w-10 h-10 rounded-full border border-slate-800 shadow-md shrink-0" 
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Joe Medley & Mike West</span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wide">Original Authors | Document Security Engineers</span>
                  </div>
                </div>
                <div className="flex gap-2 font-mono text-[9px]">
                  <a href="https://github.com/jpmedley" target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-900 rounded border border-slate-800 text-slate-300 hover:text-white">Githubjp</a>
                  <a href="https://twitter.com/mikewest" target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-900 rounded border border-slate-800 text-slate-300 hover:text-white">X/West</a>
                </div>
              </div>

              {/* Browser Support Table */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Compliant User-Agent Matrices:</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Chrome: 25+</span>
                    <span className="text-[9.5px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Fully Compliant</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Edge: 14+</span>
                    <span className="text-[9.5px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Fully Compliant</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Firefox: 23+</span>
                    <span className="text-[9.5px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Fully Compliant</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Safari: 7+</span>
                    <span className="text-[9.5px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Fully Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. DIRECTIVES SUBTAB */}
          {activeSubTab === "directives" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Layers className="w-6 h-6 text-emerald-400 shrink-0" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wide font-sans">Source Allowlist Directives Map</h2>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                CSP's <code className="bg-slate-950 text-blue-400 px-1 rounded text-xs font-mono">Content-Security-Policy</code> headers declare a custom permit index of secure resource channels, directing browser kernels to skip non-registered scripts.
              </p>

              {/* Directives cheat table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1 */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1.5">
                  <h4 className="font-mono text-blue-400 font-bold block">base-uri</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Restricts target location origins permitted inside HTML base reference href tags.
                  </p>
                </div>
                {/* 2 */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1.5">
                  <h4 className="font-mono text-blue-400 font-bold block">child-src</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Controls target destinations for workers and inline iframe embeds (e.g. YouTube frames).
                  </p>
                </div>
                {/* 3 */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1.5">
                  <h4 className="font-mono text-blue-400 font-bold block">connect-src</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Specifies permitted channels for Axios, superagents, XHR requests, WebSockets, and events.
                  </p>
                </div>
                {/* 4 */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1.5">
                  <h4 className="font-mono text-blue-400 font-bold block">font-src</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Defines accepted providers for design typography web-fonts (e.g. Google Fonts CDN link).
                  </p>
                </div>
                {/* 5 */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1.5">
                  <h4 className="font-mono text-blue-400 font-bold block">img-src</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Specifies secure origin parameters from which images can be safely visual-rendered.
                  </p>
                </div>
                {/* 6 */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1.5">
                  <h4 className="font-mono text-blue-400 font-bold block">style-src</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Regulates css design sheet stylesheets download locations.
                  </p>
                </div>
              </div>

              {/* Special fallback discussion */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-xs font-bold text-white uppercase font-sans">The default-src Fallback Engine</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The <code className="text-emerald-400 font-mono font-bold bg-slate-900 px-1 py-0.5 rounded">default-src</code> directive defines default limits for any unassigned -src directive. If you set <code className="text-white">default-src https://example.com</code> and omit <code className="text-white">font-src</code>, user agents strictly download web typography ONLY from correct example.com channels.
                </p>
              </div>

              {/* Copy Syntax Block */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black text-slate-400 font-mono block uppercase">Sample Enterprise Directive Syntax:</span>
                <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-850 p-4">
                  <button 
                    onClick={() => handleCopyContent("Content-Security-Policy: default-src 'self' https://cdn.example.net; child-src 'none'; object-src 'none'", "syntax-1")}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                    title="Copy Directive Header"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <code className="text-xs font-mono text-blue-400 block pr-8 leading-relaxed whitespace-pre-wrap">
                    Content-Security-Policy: default-src 'self' https://cdn.example.net; child-src 'none'; object-src 'none'
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* 3. AVOID INLINE AND EVAL SUBTAB */}
          {activeSubTab === "inline-eval" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Code className="w-6 h-6 text-emerald-400 shrink-0" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wide font-sans">Banning Inline Elements & Eval()</h2>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                Allowlists alone do not solve line-level script injection risks. If an attacker injects a raw tag snippet like <code className="bg-slate-950 text-rose-400 px-1 rounded text-xs font-mono">&lt;script&gt;stealSecureCookies()&lt;/script&gt;</code>, the browser cannot verify its legitimacy. Therefore, <strong className="text-amber-400">CSP policies disable inline scripts by default</strong>.
              </p>

              {/* Comparison Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-mono text-[11px]">
                {/* Vuln before */}
                <div className="space-y-2">
                  <span className="text-rose-400 font-bold uppercase tracking-wider block">❌ VULNERABLE INLINE PATTERN</span>
                  <div className="bg-slate-950 border border-rose-950/40 rounded-xl p-4 text-slate-400 space-y-2">
                    <pre className="overflow-x-auto">
{`<!-- Inline script and event handler -->
<script>
  function doAmazingThings() {
    alert('YOU ARE AMAZING!');
  }
</script>
<button onclick='doAmazingThings();'>
  Am I amazing?
</button>`}
                    </pre>
                  </div>
                </div>

                {/* Secure after */}
                <div className="space-y-2">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider block">✓ SECURE DECOUPLED COMPONENT</span>
                  <div className="bg-slate-950 border border-emerald-950/40 rounded-xl p-4 text-slate-350 space-y-2">
                    <pre className="overflow-x-auto">
{`<!-- Separated script asset -->
<script src='amazing.js'></script>
<button id='amazing'>Am I amazing?</button>

// amazing.js
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('amazing')
    .addEventListener('click', () => {
      alert('YOU ARE AMAZING!');
    });
});`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Nonces block */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-white block uppercase tracking-wide">Cryptographic Nonces Usage</span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  If you absolutely require inline script blocks, you must implement a dynamic single-use token tag (<strong className="text-blue-400">nonce</strong>) generated on each unique request.
                </p>
                <div className="bg-slate-900 rounded-lg p-3 font-mono text-[11.5px] text-blue-400 space-y-1">
                  <div>Header: <code className="text-amber-400">script-src 'nonce-RAND456TOKEN'</code></div>
                  <div>Script tag: <code className="text-white">&lt;script nonce="RAND456TOKEN"&gt;...&lt;/script&gt;</code></div>
                </div>
              </div>

              {/* Eval warning */}
              <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-xl text-xs flex gap-3 text-slate-300">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <strong className="text-white font-bold block mb-0.5">The eval() Security Hazard:</strong>
                  <span>CSP completely blocks text-to-JavaScript translators like <code className="text-rose-400 font-mono bg-slate-950 px-1 rounded text-[11px]">eval()</code>, <code className="text-stone-300 font-mono">new Function()</code>, or setTimeout parameter strings. Use modern standard <code className="text-emerald-400 font-mono bg-slate-950 px-1 rounded text-[11px]">JSON.parse()</code> and arrow event triggers instead.</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. REPORTING PROTOCOLS */}
          {activeSubTab === "reporting" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Terminal className="w-6 h-6 text-emerald-400 shrink-0" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wide font-sans">Policy Violation & Telemetry Reporting</h2>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                Never deploy strict CSP policies blindly. Utilize the <code className="bg-slate-950 text-blue-400 px-1 rounded text-xs font-mono">report-uri</code> directive to configure secure POST JSON pipelines that capture and log policy violations before enforcement.
              </p>

              {/* JSON Logger block */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black text-slate-400 font-mono block uppercase">Sample Violation Report JSON Payload:</span>
                <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-850 p-4 font-mono text-xs text-blue-400 leading-relaxed max-h-[350px] overflow-y-auto">
                  <button 
                    onClick={() => handleCopyContent(`{
  "csp-report": {
    "document-uri": "http://example.org/page.html",
    "referrer": "http://evil.example.com/",
    "blocked-uri": "http://evil.example.com/evil.js",
    "violated-directive": "script-src 'self' https://apis.google.com",
    "original-policy": "script-src 'self' https://apis.google.com; report-uri http://example.org/my_amazing_csp_report_parser"
  }
}`, "json-report")}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                    title="Copy Report JSON"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <pre className="overflow-x-auto whitespace-pre-wrap">{`{
  "csp-report": {
    "document-uri": "http://example.org/page.html",
    "referrer": "http://evil.example.com/",
    "blocked-uri": "http://evil.example.com/evil.js",
    "violated-directive": "script-src 'self' https://apis.google.com",
    "original-policy": "script-src 'self' https://apis.google.com; report-uri http://example.org/my_amazing_csp_report_parser"
  }
}`}</pre>
                </div>
              </div>

              {/* Report dry mode */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-white uppercase font-sans">The Content-Security-Policy-Report-Only Dry Run</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  To test a new rule without breaking user experience, send the <code className="text-yellow-400 font-mono bg-slate-900 px-1 py-0.5 rounded">Content-Security-Policy-Report-Only</code> header. The browser evaluates, gathers alerts, generates POST violation tickets, but permits code execution without blocking.
                </p>
              </div>
            </div>
          )}

          {/* 5. INTERACTIVE SIMULATION PLAYGROUND */}
          {activeSubTab === "playground" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <Cpu className="w-6 h-6 text-amber-500 shrink-0" />
                  <h2 className="text-xl font-bold text-white uppercase tracking-wide font-sans">CSP Telemetry & Policy Sandbox</h2>
                </div>
                <span className="text-[9px] bg-amber-950 border border-amber-900/65 text-amber-400 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-widest animate-pulse">
                  ACTIVE HYPOTHETICAL SIMULATION
                </span>
              </div>

              <p className="text-slate-350 text-xs">
                Design a custom header string below or load an enterprise template preset. Run the simulator to verify if the browser core would block or permit external URLs and inline tags under that configuration.
              </p>

              {/* Presets and controller block */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                
                {/* Controller Left */}
                <div className="md:col-span-5 bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3 text-left">
                    <span className="text-[10px] font-bold text-slate-450 uppercase font-mono tracking-wider block">Load Telemetry Presets:</span>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectPreset("basic")}
                        className={`text-[10.5px] font-bold py-1.5 px-2.5 rounded text-left transition-colors border flex items-center justify-between cursor-pointer ${
                          selectedPreset === "basic"
                            ? "bg-blue-900/30 text-blue-400 border-blue-800"
                            : "bg-slate-900 text-slate-400 border-slate-850 hover:bg-slate-800"
                        }`}
                      >
                        <span>Basic Web.dev</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleSelectPreset("strict")}
                        className={`text-[10.5px] font-bold py-1.5 px-2.5 rounded text-left transition-colors border flex items-center justify-between cursor-pointer ${
                          selectedPreset === "strict"
                            ? "bg-blue-900/30 text-blue-400 border-blue-800"
                            : "bg-slate-900 text-slate-400 border-slate-850 hover:bg-slate-800"
                        }`}
                      >
                        <span>Strict Defaults</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPreset("lockdown")}
                        className={`text-[10.5px] font-bold py-1.5 px-2.5 rounded text-left transition-colors border flex items-center justify-between cursor-pointer ${
                          selectedPreset === "lockdown"
                            ? "bg-blue-900/30 text-blue-400 border-blue-800"
                            : "bg-slate-900 text-slate-400 border-slate-850 hover:bg-slate-800"
                        }`}
                      >
                        <span>CDNs & Secure APIs</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPreset("loose_unsafe")}
                        className={`text-[10.5px] font-bold py-1.5 px-2.5 rounded text-left transition-colors border flex items-center justify-between cursor-pointer ${
                          selectedPreset === "loose_unsafe"
                            ? "bg-rose-950/20 text-rose-400 border-rose-900/40"
                            : "bg-slate-900 text-slate-400 border-slate-850 hover:bg-slate-800"
                        }`}
                      >
                        <span>Permissive / Vulnerable</span>
                        <ChevronRight className="w-3 h-3 text-rose-500/40" />
                      </button>
                    </div>

                    {/* Header Input */}
                    <div className="space-y-1 pt-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide block">Edit Custom CSP Header:</span>
                      <textarea
                        value={customCspHeader}
                        onChange={(e) => {
                          setCustomCspHeader(e.target.value);
                          setSelectedPreset("custom");
                        }}
                        className="w-full h-24 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg p-2.5 outline-none border border-slate-800 focus:border-amber-500 transition-colors"
                        placeholder="Content-Security-Policy: default-src 'self'..."
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={runSimulation}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold uppercase text-[10.5px] tracking-widest font-mono rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 shrink-0 active:scale-97"
                  >
                    <Play className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                    Trigger CSP Simulation
                  </button>
                </div>

                {/* Simulated Results Console Right */}
                <div className="md:col-span-7 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
                  
                  <div className="space-y-4">
                    {/* Simulator Input Parameters */}
                    <div className="space-y-2.5 text-xs text-left border-b border-slate-900 pb-3.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider block">Set simulated code vectors:</span>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {/* URL script trigger */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] text-slate-400 font-mono block">Load external script URL:</label>
                          <input
                            type="text"
                            value={testScriptUrl}
                            onChange={(e) => setTestScriptUrl(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs py-1.5 px-2.5 rounded font-mono outline-none"
                            placeholder="https://apis.google.com/js/plusone.js"
                          />
                        </div>

                        {/* Inline script block trigger */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] text-slate-400 font-mono block">Trigger simulated inline code:</label>
                          <input
                            type="text"
                            value={testInlineCode}
                            onChange={(e) => setTestInlineCode(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs py-1.5 px-2.5 rounded font-mono outline-none"
                            placeholder="alert('Secure code run!');"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Console Logger lines */}
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider block">Console Telemetry Output Log:</span>
                      <div className="bg-slate-900 border border-slate-850/80 rounded-lg p-3 max-h-[160px] overflow-y-auto space-y-2 font-mono text-[10px]">
                        {playgroundResults.map((line, idx) => (
                          <div 
                            key={idx} 
                            className={`leading-relaxed border-l-2 pl-2 ${
                              line.type === "success" 
                                ? "text-emerald-400 border-emerald-500/60" 
                                : line.type === "error" 
                                  ? "text-rose-450 border-rose-500" 
                                  : "text-amber-400 border-amber-500"
                            }`}
                          >
                            &#62; {line.msg}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-500 mt-3 font-mono leading-snug">
                    *Simulation parameters adhere to CSP level 2 rules recursively, evaluating wildcard scopes and self-origin policies dynamically.
                  </p>

                </div>

              </div>

            </div>
          )}

          {activeSubTab === "verification" && (
            <GoogleVerificationWizard addToast={addToast} />
          )}

        </div>

      </div>

    </div>
  );
}
