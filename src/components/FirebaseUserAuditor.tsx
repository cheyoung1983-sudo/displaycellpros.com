import React, { useState, useEffect } from "react";
import { User, UserInfo } from "firebase/auth";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Terminal, 
  Activity, 
  RefreshCw, 
  Loader2, 
  Trash2, 
  Copy, 
  ExternalLink,
  Lock,
  Mail,
  User as UserIcon,
  Calendar
} from "lucide-react";

interface FirebaseUserAuditorProps {
  user: User;
  addToast: (msg: string, desc: string, type: "success" | "error" | "info" | "warning") => void;
  onLogout: () => void;
}

export function FirebaseUserAuditor({ user, addToast, onLogout }: FirebaseUserAuditorProps) {
  const [rawJwt, setRawJwt] = useState<string>("");
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [tokenClaims, setTokenClaims] = useState<any>(null);
  const [isFetchingClaims, setIsFetchingClaims] = useState<boolean>(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState<boolean>(false);
  const [purgeKeyInput, setPurgeKeyInput] = useState<string>("");

  // Auto-fetch JWT and Claims on load
  useEffect(() => {
    fetchCurrentJwt();
    fetchCurrentClaims();
  }, [user]);

  const fetchCurrentJwt = async (force: boolean = false) => {
    setIsRotating(true);
    try {
      const token = await user.getIdToken(force);
      setRawJwt(token);
      if (force) {
        addToast(
          "JWT Token Rotated",
          "Synchronous token rotation successful. A fresh cryptographic session token has been acquired.",
          "success"
        );
      }
    } catch (err: any) {
      console.error("Forensic Token Retrieval Error:", err);
      addToast("Token Audit Failure", err.message || "Failed to fetch session JWT.", "error");
    } finally {
      setIsRotating(false);
    }
  };

  const fetchCurrentClaims = async () => {
    setIsFetchingClaims(true);
    try {
      const tokenResult = await user.getIdTokenResult();
      setTokenClaims(tokenResult);
    } catch (err: any) {
      console.error("Forensic Claims Parsing Error:", err);
      addToast("Claims Parse Failure", err.message || "Failed to parse JWT claims.", "error");
    } finally {
      setIsFetchingClaims(false);
    }
  };

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await user.reload();
      addToast(
        "Session State Refreshed",
        "Successfully reloaded user state from Firebase servers.",
        "success"
      );
      fetchCurrentClaims();
    } catch (err: any) {
      console.error("Session Reload Error:", err);
      addToast("State Reload Failure", err.message || "Failed to reload user state.", "error");
    } finally {
      setIsReloading(false);
    }
  };

  const handlePurgeAccount = async () => {
    if (purgeKeyInput !== "PURGE_NIST_800_88") {
      addToast(
        "Access Key Mismatch",
        "Please type PURGE_NIST_800_88 exactly to bypass logic safety gates.",
        "error"
      );
      return;
    }

    setIsDeleting(true);
    try {
      await user.delete();
      addToast(
        "Account Purged",
        "Your verified credentials have been deleted and securely purged from active workspace SSO directories.",
        "success"
      );
      onLogout();
    } catch (err: any) {
      console.error("Credential Deletion Error:", err);
      if (err.code === "auth/requires-recent-login") {
        addToast(
          "Action Blocked (Timeout)",
          "Security Protocol: Re-authentication is required before deprovisioning active credentials.",
          "warning"
        );
      } else {
        addToast("Purge Error", err.message || "Account deprovisioning failed.", "error");
      }
    } finally {
      setIsDeleting(false);
      setShowPurgeConfirm(false);
      setPurgeKeyInput("");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast("Copied to Clipboard", `${label} copied successfully.`, "info");
  };

  // Helper to slice JWT into forensic blocks for display
  const getSlicedToken = (token: string) => {
    if (!token) return "Initializing secure token storage...";
    return `${token.substring(0, 24)}...[${token.substring(token.length - 24)}]`;
  };

  return (
    <div className="mt-8 border border-slate-800 bg-slate-950 p-6 rounded-xl animate-in fade-in duration-500 font-sans" id="forensic-auth-auditor">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            🔐 Forensic Firebase Credential Auditor
          </h3>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            REGISTRY_STATE: SECURE_IN_MEMORY_SESSION // VERIFIED: {user.emailVerified ? "TRUE" : "FALSE"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            disabled={isReloading}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-300 rounded-md transition-all flex items-center gap-1.5"
            title="Reload user state"
          >
            {isReloading ? <Loader2 className="w-3 h-3 animate-spin text-teal-500" /> : <RefreshCw className="w-3 h-3 text-slate-400" />}
            Reload State
          </button>

          <button
            onClick={() => setShowPurgeConfirm(true)}
            className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/55 border border-rose-900/30 text-[10px] font-bold uppercase tracking-wider text-rose-400 rounded-md transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3 h-3 text-rose-500" />
            Purge Credentials
          </button>
        </div>
      </div>

      {/* Grid of properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Left Column: Properties */}
        <div className="space-y-3 bg-slate-900/40 p-4 rounded-lg border border-slate-850">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-300">Identity Properties</h4>
          </div>

          {/* UID */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">user.uid</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-300 text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {user.uid}
              </span>
              <button 
                onClick={() => copyToClipboard(user.uid, "UID")}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                title="Copy UID"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Email Verified */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">user.emailVerified</span>
            {user.emailVerified ? (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                Verified Secure
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-3 h-3 text-amber-500" />
                Unverified
              </span>
            )}
          </div>

          {/* Anonymous */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">user.isAnonymous</span>
            <span className="font-mono text-slate-300 text-[11px]">
              {user.isAnonymous ? "True (Temporary Sandbox)" : "False (Federated SSO)"}
            </span>
          </div>

          {/* TenantId */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">user.tenantId</span>
            <span className="font-mono text-slate-300 text-[11px] truncate max-w-[180px]">
              {user.tenantId || "Default Project (Parent)"}
            </span>
          </div>
        </div>

        {/* Right Column: Temporal Metadata */}
        <div className="space-y-3 bg-slate-900/40 p-4 rounded-lg border border-slate-850">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-300">Temporal Integrity</h4>
          </div>

          {/* Creation Time */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">metadata.creationTime</span>
            <span className="font-mono text-slate-300 text-[11px]">
              {user.metadata.creationTime || "Unknown"}
            </span>
          </div>

          {/* Last Sign-In Time */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">metadata.lastSignInTime</span>
            <span className="font-mono text-slate-300 text-[11px]">
              {user.metadata.lastSignInTime || "Unknown"}
            </span>
          </div>

          {/* Provider Id */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">userInfo.providerId</span>
            <span className="font-mono text-teal-400 text-[11px] bg-teal-500/5 px-1.5 py-0.5 rounded border border-teal-500/10">
              {user.providerId || "google.com"}
            </span>
          </div>
        </div>
      </div>

      {/* JWT Token & Rotation Console */}
      <div className="bg-slate-900/60 border border-slate-850 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              Active JWT Token Inspect Console
            </h4>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchCurrentJwt(true)}
              disabled={isRotating}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[9px] font-bold uppercase tracking-wider text-teal-400 hover:text-teal-300 rounded flex items-center gap-1.5 transition-colors"
            >
              {isRotating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />}
              Rotate JWT Token
            </button>
            <button
              onClick={() => copyToClipboard(rawJwt, "Active JWT Token")}
              disabled={!rawJwt}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[9px] font-bold uppercase tracking-wider text-slate-300 rounded flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-2.5 h-2.5" />
              Copy Token
            </button>
          </div>
        </div>

        {/* Display raw token hash */}
        <div className="font-mono text-[10px] text-slate-400 bg-slate-950 border border-slate-850 p-2.5 rounded break-all leading-normal max-h-16 overflow-y-auto mb-3 scrollbar-thin">
          {getSlicedToken(rawJwt)}
        </div>

        {/* Parsed Claims Area */}
        <div className="mt-3">
          <button
            onClick={() => {
              if (tokenClaims) {
                setTokenClaims(null);
              } else {
                fetchCurrentClaims();
              }
            }}
            className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            {tokenClaims ? "[-] Collapse Token Claims" : "[+] Inspect Decoded JWT Claims"}
            {isFetchingClaims && <Loader2 className="w-2.5 h-2.5 animate-spin ml-1 text-teal-400" />}
          </button>

          {tokenClaims && (
            <div className="mt-2.5 bg-slate-950 border border-slate-850 p-3 rounded font-mono text-[10px] space-y-1.5 text-slate-400 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 gap-1 border-b border-slate-900 pb-1.5 mb-1.5">
                <span className="text-slate-500">Claim Key</span>
                <span className="text-slate-500">Claim Value / Descriptor</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span className="text-blue-400">authTime</span>
                <span className="text-slate-300">{tokenClaims.authTime || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span className="text-blue-400">issuedAtTime</span>
                <span className="text-slate-300">{tokenClaims.issuedAtTime || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span className="text-blue-400">expirationTime</span>
                <span className="text-slate-300">{tokenClaims.expirationTime || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span className="text-blue-400">signInProvider</span>
                <span className="text-slate-300">{tokenClaims.signInProvider || "google.com"}</span>
              </div>
              {tokenClaims.claims && Object.keys(tokenClaims.claims).length > 0 ? (
                Object.entries(tokenClaims.claims).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-slate-900/50 pb-1">
                    <span className="text-emerald-400">{key}</span>
                    <span className="text-slate-300">{String(val)}</span>
                  </div>
                ))
              ) : (
                <div className="text-[9px] text-slate-600 uppercase tracking-widest text-center py-1">
                  No custom claims found inside session payload.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Federated Identity Provider Profiles (providerData) */}
      {user.providerData && user.providerData.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-850 rounded-lg p-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
            <UserIcon className="w-3.5 h-3.5 text-blue-400" />
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              Linked Federated SSO Identity Profiles ({user.providerData.length})
            </h4>
          </div>

          <div className="space-y-3">
            {user.providerData.map((prov: UserInfo, idx: number) => (
              <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950 p-3 rounded border border-slate-850">
                <div className="flex items-center gap-3">
                  {prov.photoURL ? (
                    <img 
                      src={prov.photoURL} 
                      alt={prov.displayName || "Federated User"} 
                      className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold font-mono">
                      {prov.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {prov.displayName || "Federated Identity"}
                      <span className="text-[9px] font-mono text-teal-400 bg-teal-500/10 px-1 py-0.5 rounded">
                        {prov.providerId}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-600" />
                      {prov.email || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-600 font-mono text-left sm:text-right">
                  <div>Federated User ID:</div>
                  <div className="text-slate-400 select-all">{prov.uid}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purge Safety Lock Overlay Panel */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
          <div className="bg-slate-950 border-2 border-rose-900/40 p-6 rounded-2xl max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4 mx-auto animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-center text-white uppercase tracking-wider">
              NIST 800-88 De-Provisioning Protocol
            </h3>
            <p className="text-slate-400 text-xs text-center mt-2 leading-relaxed">
              You are about to completely <span className="text-rose-400 font-bold">PURGE and ERASE</span> this authenticated repair credential. This action is irreversible and conforms to DoD/NIST sanitization norms.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 text-center">
                  To proceed, type the safety clearance bypass key below:
                </label>
                <input
                  type="text"
                  value={purgeKeyInput}
                  onChange={(e) => setPurgeKeyInput(e.target.value)}
                  className="w-full bg-slate-900 border border-rose-900/30 rounded-lg p-2.5 text-xs font-mono text-center text-rose-300 focus:outline-none focus:border-rose-500 uppercase placeholder:text-slate-700"
                  placeholder="PURGE_NIST_800_88"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPurgeConfirm(false);
                    setPurgeKeyInput("");
                  }}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel Protocol
                </button>
                <button
                  onClick={handlePurgeAccount}
                  disabled={isDeleting}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md shadow-rose-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Erasing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Sanitize & Purge
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
