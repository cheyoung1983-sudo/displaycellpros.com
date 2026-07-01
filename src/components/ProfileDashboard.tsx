import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firebase-errors";
import { RepairTicket } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Mail,
  Phone,
  Activity,
  History,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  Bell,
  Check,
  Cpu
} from "lucide-react";

interface ProfileDashboardProps {
  authUser: any;
  customerName: string;
  setCustomerName: (n: string) => void;
  profilePhone: string;
  setProfilePhone: (p: string) => void;
  profilePreferredDevice: string;
  setProfilePreferredDevice: (d: string) => void;
  tickets: RepairTicket[];
  addToast: (title: string, message: string, type?: "success" | "error" | "info" | "warning") => void;
}

interface NotificationPreferences {
  smsAlerts: boolean;
  emailSummaries: boolean;
  dispatchUpdates: boolean;
  ammeterWarnings: boolean;
  covLogs: boolean;
}

export default function ProfileDashboard({
  authUser,
  customerName,
  setCustomerName,
  profilePhone,
  setProfilePhone,
  profilePreferredDevice,
  setProfilePreferredDevice,
  tickets,
  addToast
}: ProfileDashboardProps) {
  // Local states to store input values within component state
  const [localCustomerName, setLocalCustomerName] = useState(customerName);
  const [localPhone, setLocalPhone] = useState(profilePhone);
  const [localPreferredDevice, setLocalPreferredDevice] = useState(profilePreferredDevice);

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    smsAlerts: true,
    emailSummaries: true,
    dispatchUpdates: true,
    ammeterWarnings: false,
    covLogs: true
  });

  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isFetchingPrefs, setIsFetchingPrefs] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  // Synchronize local states when the underlying props change
  useEffect(() => {
    setLocalCustomerName(customerName);
  }, [customerName]);

  useEffect(() => {
    setLocalPhone(profilePhone);
  }, [profilePhone]);

  useEffect(() => {
    setLocalPreferredDevice(profilePreferredDevice);
  }, [profilePreferredDevice]);

  // Filter repair tickets for this specific authenticated user
  const clientTickets = tickets.filter(
    (t) =>
      t.userId === authUser?.uid ||
      t.customerName.toLowerCase() === customerName.toLowerCase()
  );

  // Load preferences and profile details from Firestore user document when the user logs in
  useEffect(() => {
    if (!authUser?.uid) return;

    const fetchUserProfileAndPrefs = async () => {
      setIsFetchingPrefs(true);
      const docPath = `users/${authUser.uid}`;
      try {
        const userDocRef = doc(db, "users", authUser.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const data = userSnapshot.data();
          
          // 1. Load notification preferences
          if (data.notificationPreferences) {
            setNotificationPrefs({
              smsAlerts: data.notificationPreferences.smsAlerts ?? true,
              emailSummaries: data.notificationPreferences.emailSummaries ?? true,
              dispatchUpdates: data.notificationPreferences.dispatchUpdates ?? true,
              ammeterWarnings: data.notificationPreferences.ammeterWarnings ?? false,
              covLogs: data.notificationPreferences.covLogs ?? true
            });
          }
          
          // 2. Automatically load and pre-fill fields from Firestore, storing in the component state
          if (data.displayName) {
            setLocalCustomerName(data.displayName);
            setCustomerName(data.displayName);
          }
          if (data.phone) {
            setLocalPhone(data.phone);
            setProfilePhone(data.phone);
          }
          if (data.preferredDevice) {
            setLocalPreferredDevice(data.preferredDevice);
            setProfilePreferredDevice(data.preferredDevice);
          }
        }
      } catch (err: any) {
        console.error("Failed to load user profile from Firestore:", err);
        // We log and throw Firestore permission errors using standardized auditor framework
        try {
          handleFirestoreError(err, OperationType.GET, docPath);
        } catch (auditedError) {
          // Swallow to prevent crashing, but log to terminal
        }
      } finally {
        setIsFetchingPrefs(false);
      }
    };

    fetchUserProfileAndPrefs();
  }, [authUser?.uid]);

  // Synchronize main profile details
  const handleSaveProfileDetails = async () => {
    if (!localCustomerName.trim()) {
      addToast("Validation Fault", "Display Name cannot be blank.", "warning");
      return;
    }

    setIsSavingDetails(true);
    const docPath = `users/${authUser?.uid || "guest"}`;
    try {
      // Set parent states
      setCustomerName(localCustomerName);
      setProfilePhone(localPhone);
      setProfilePreferredDevice(localPreferredDevice);

      if (authUser?.uid) {
        const userRef = doc(db, "users", authUser.uid);
        // Preserve previous values while updating details
        const userSnapshot = await getDoc(userRef);
        const prevData = userSnapshot.exists() ? userSnapshot.data() : {};

        await setDoc(userRef, {
          ...prevData,
          uid: authUser.uid,
          displayName: localCustomerName,
          email: authUser.email || "ryan@displaycellpros.com",
          phone: localPhone,
          preferredDevice: localPreferredDevice,
          photoURL: authUser.photoURL || "",
          updatedAt: new Date().toISOString()
        });

        addToast(
          "Telemetry Profile Updated",
          "Forensic identifier values synchronized with secure cloud datastores.",
          "success"
        );
      } else {
        addToast(
          "Profile Updated",
          "Local sandbox profile changes applied to browser registry.",
          "success"
        );
      }
    } catch (err: any) {
      console.error("Profile detail sync error:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      } catch (auditedError) {
        addToast(
          "Audit Exception",
          "Profile persistence rejected. Check firestore.rules security gates.",
          "error"
        );
      }
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Synchronize notification preferences
  const handleSaveNotificationPrefs = async () => {
    setIsSavingPrefs(true);
    const docPath = `users/${authUser?.uid || "guest"}`;
    try {
      if (authUser?.uid) {
        const userRef = doc(db, "users", authUser.uid);
        const userSnapshot = await getDoc(userRef);
        const prevData = userSnapshot.exists() ? userSnapshot.data() : {};

        await setDoc(userRef, {
          ...prevData,
          notificationPreferences: notificationPrefs,
          updatedAt: new Date().toISOString()
        });

        addToast(
          "Notification Protocol Locked",
          "Forensic alarm limits and status broadcast channels successfully locked.",
          "success"
        );
      } else {
        localStorage.setItem("dcp_sandbox_notif_prefs", JSON.stringify(notificationPrefs));
        addToast(
          "Local Protocol Saved",
          "Notification preferences cached locally in the sandbox container.",
          "success"
        );
      }
    } catch (err: any) {
      console.error("Preferences sync error:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      } catch (auditedError) {
        addToast(
          "Audit Exception",
          "Notification configuration rejected by active Firestore security rules.",
          "error"
        );
      }
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return {
          bg: "bg-blue-500/10",
          text: "text-blue-400",
          border: "border-blue-500/20",
          label: "OPEN FOR TRIAGE"
        };
      case "parts_assigned":
        return {
          bg: "bg-teal-500/10",
          text: "text-teal-400",
          border: "border-teal-500/20",
          label: "PARTS ASSIGNED & MOBILIZED"
        };
      case "technician_working":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-500",
          border: "border-amber-500/20",
          label: "BOARD FORENSICS ACTIVE"
        };
      case "quality_check":
        return {
          bg: "bg-purple-500/10",
          text: "text-purple-400",
          border: "border-purple-500/20",
          label: "COV VALIDATION CHECK"
        };
      case "completed":
        return {
          bg: "bg-emerald-500/10",
          text: "text-emerald-400",
          border: "border-emerald-500/20",
          label: "COMPLETED & SANITIZED"
        };
      default:
        return {
          bg: "bg-slate-500/10",
          text: "text-slate-400",
          border: "border-slate-500/20",
          label: status.toUpperCase()
        };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* SECTION 1: USER DETAILS */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-4">
            {authUser?.photoURL ? (
              <img
                src={authUser.photoURL}
                alt={localCustomerName}
                className="w-14 h-14 rounded-full border-2 border-teal-500 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-850 border-2 border-teal-500 flex items-center justify-center text-teal-400">
                <User className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white leading-none">{localCustomerName || "Spokane Client"}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2 py-0.5 rounded font-mono font-extrabold uppercase">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  {authUser?.uid === "sandbox-tech-101" ? "SANDBOX SIMULATION" : "AUTHENTICATED IDP"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 font-mono">{authUser?.email || "anonymous@displaycellpros.com"}</p>
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-500">
            <span className="block">USER_ID: {authUser?.uid || "unregistered_client"}</span>
            <span className="block mt-1">VERIFIED_EMAIL: {authUser?.emailVerified ? "TRUE" : "FALSE"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Display Name</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={localCustomerName}
                onChange={(e) => setLocalCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="Client Name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Cell Phone</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-500">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="(509) XXX-XXXX"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Repair Target</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-500">
                <Smartphone className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={localPreferredDevice}
                onChange={(e) => setLocalPreferredDevice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="iPhone 14 Pro Max"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={handleSaveProfileDetails}
            disabled={isSavingDetails}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-teal-500/10 flex items-center gap-2 cursor-pointer"
          >
            {isSavingDetails ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Syncing Telemetry...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Update Profile Details
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 2: FORENSIC NOTIFICATION PREFERENCES */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6">
        <div className="mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-400" />
            Forensic Broadcast & Alert Parameters
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Configure system alert boundaries. Updates are synchronized with the central Spokane S2C Diagnostic Engine.
          </p>
        </div>

        <div className="space-y-4 max-w-3xl">
          {/* Toggle 1 */}
          <div className="flex items-start justify-between gap-4 p-4 bg-slate-950/40 rounded-lg border border-slate-850">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">SMS Repair Journey Broadcast</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Transmit live cell alerts as the Driveway Dispatch van changes coordinates or advances milestones.
              </p>
            </div>
            <button
              onClick={() => togglePreference("smsAlerts")}
              className={`w-10 h-6 rounded-full p-1 transition-all duration-200 focus:outline-none shrink-0 ${
                notificationPrefs.smsAlerts ? "bg-teal-600" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 transform ${
                  notificationPrefs.smsAlerts ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-start justify-between gap-4 p-4 bg-slate-950/40 rounded-lg border border-slate-850">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">Secure Cryptographic COE Delivery</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Automatically dispatch an email detailing NIST SP 800-88 R1 sanitization certificates upon completing drive clears.
              </p>
            </div>
            <button
              onClick={() => togglePreference("emailSummaries")}
              className={`w-10 h-6 rounded-full p-1 transition-all duration-200 focus:outline-none shrink-0 ${
                notificationPrefs.emailSummaries ? "bg-teal-600" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 transform ${
                  notificationPrefs.emailSummaries ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle 3 */}
          <div className="flex items-start justify-between gap-4 p-4 bg-slate-950/40 rounded-lg border border-slate-850">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">S2C Circuit Pathway Signals</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Receive active mapping analysis when on-bench microscopes locate anomalies (e.g. Tristar 1610A3 fault).
              </p>
            </div>
            <button
              onClick={() => togglePreference("dispatchUpdates")}
              className={`w-10 h-6 rounded-full p-1 transition-all duration-200 focus:outline-none shrink-0 ${
                notificationPrefs.dispatchUpdates ? "bg-teal-600" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 transform ${
                  notificationPrefs.dispatchUpdates ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle 4 */}
          <div className="flex items-start justify-between gap-4 p-4 bg-slate-950/40 rounded-lg border border-slate-850">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Ammeter Draw Safety Alarms</h4>
                <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                  Telemetry Triggered
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Raise terminal alerts if continuous bench ammeter load exceeds 1.8A static draw during physical USB diagnostics.
              </p>
            </div>
            <button
              onClick={() => togglePreference("ammeterWarnings")}
              className={`w-10 h-6 rounded-full p-1 transition-all duration-200 focus:outline-none shrink-0 ${
                notificationPrefs.ammeterWarnings ? "bg-teal-600" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 transform ${
                  notificationPrefs.ammeterWarnings ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle 5 */}
          <div className="flex items-start justify-between gap-4 p-4 bg-slate-950/40 rounded-lg border border-slate-850">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">Chain-of-Verification (CoV) Audit Trail</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Receive interactive schema blueprints and verification digests directly on your profile view.
              </p>
            </div>
            <button
              onClick={() => togglePreference("covLogs")}
              className={`w-10 h-6 rounded-full p-1 transition-all duration-200 focus:outline-none shrink-0 ${
                notificationPrefs.covLogs ? "bg-teal-600" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 transform ${
                  notificationPrefs.covLogs ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={handleSaveNotificationPrefs}
            disabled={isSavingPrefs}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-teal-500/10 flex items-center gap-2 cursor-pointer"
          >
            {isSavingPrefs ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Encrypting Rules...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 3: DRIVEWAY REPAIR & SURGERY HISTORY */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <History className="w-4 h-4 text-teal-400" />
              S2C Diagnostic Repair History
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Access the secure list of physical logic board repairs, bench measurements, and certified erase cycles.
            </p>
          </div>
          <span className="text-[10px] bg-slate-950 border border-slate-850 px-2.5 py-1 text-slate-500 rounded font-mono font-bold uppercase tracking-wider">
            Total Logged: {clientTickets.length} Cycles
          </span>
        </div>

        {clientTickets.length === 0 ? (
          <div className="bg-slate-950/40 border border-slate-850 rounded-lg p-10 text-center">
            <Activity className="w-8 h-8 text-slate-600 mx-auto mb-3 animate-pulse" />
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Active Board Records Found</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              We found no cloud-backed tickets registered under this credential. Trigger a diagnostic quote or plug in a WebUSB link to initialize telemetry logs.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {clientTickets.map((ticket) => {
              const badge = getStatusColor(ticket.status);
              const isExpanded = expandedTicketId === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className="border border-slate-850 bg-slate-950/60 rounded-xl overflow-hidden transition-all duration-250"
                >
                  {/* Ticket Header Bar */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] bg-teal-500/10 border border-teal-500/25 text-teal-400 font-mono px-2 py-0.5 rounded font-extrabold uppercase">
                          {ticket.id}
                        </span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          {ticket.device}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white uppercase">
                        {ticket.issueType} Physical Architecture Sweep
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 font-mono text-right">
                      <div className="hidden sm:block">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Estimated Total</span>
                        <span className="text-lg font-extrabold text-teal-400">${ticket.total.toFixed(2)}</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                      <button
                        onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                        className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Toggle Diagnostic Details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Details Area */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-850 bg-slate-950/80 overflow-hidden"
                      >
                        <div className="p-5 space-y-6 font-sans">
                          {/* Top row summaries */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-slate-400">
                            <div className="p-3.5 bg-slate-900/50 rounded-lg border border-slate-850">
                              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-extrabold mb-1">
                                📅 Telemetry Created
                              </span>
                              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                              <span className="block text-[10px] text-slate-600 mt-1">
                                {new Date(ticket.createdAt).toLocaleTimeString()}
                              </span>
                            </div>

                            <div className="p-3.5 bg-slate-900/50 rounded-lg border border-slate-850">
                              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-extrabold mb-1">
                                🔧 Diagnostic Cost Breakdown
                              </span>
                              <span>Price: ${ticket.quotedPrice.toFixed(2)}</span>
                              <span className="block text-[10px] text-slate-600 mt-1">
                                Tax: ${ticket.tax.toFixed(2)} | Discount: ${ticket.discount.toFixed(2)}
                              </span>
                            </div>

                            <div className="p-3.5 bg-slate-900/50 rounded-lg border border-slate-850">
                              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-extrabold mb-1">
                                🔒 Secure Data Clearing
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                                <span className="text-[11px] text-teal-400 font-extrabold">
                                  NIST SP 800-88 CLEAR READY
                                </span>
                              </div>
                              <span className="block text-[9px] text-slate-600 mt-1 font-mono">
                                HASH_SIGNATURE: APPROVED
                              </span>
                            </div>
                          </div>

                          {/* Technical Logs / Notes */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-teal-400" />
                              Technical Bench Advisories
                            </span>
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-850 font-mono text-xs text-slate-300 leading-relaxed">
                              {ticket.internalNotes || "No active technical notes. Circuit pathways ready for high-precision driveway triage."}
                            </div>
                          </div>

                          {/* Silicon Forensic Metadata details */}
                          <div className="border-t border-slate-850 pt-4 font-mono text-[10px] text-slate-500 space-y-2 leading-relaxed">
                            <div className="flex flex-col sm:flex-row justify-between gap-1">
                              <span>MDF_TRACE_LINK: APPROVED // SECURE_USB_SPEED_REGISTRATION</span>
                              <span>STATUS_CODE: {ticket.status.toUpperCase()}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between gap-1">
                              <span>INTEGRITY_INDEX: CoV_OK (Chain-of-Verification locked)</span>
                              <span>CLIENT_ID_BINDING: {ticket.userId || "unauthenticated"}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
