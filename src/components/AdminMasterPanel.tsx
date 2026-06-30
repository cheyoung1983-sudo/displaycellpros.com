import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  limit
} from "firebase/firestore";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  FileText, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Check, 
  Search, 
  Lock, 
  AlertTriangle, 
  Cpu, 
  Database,
  RefreshCw,
  Plus,
  Key,
  Smartphone,
  Mail,
  Phone,
  Activity,
  CheckCircle,
  Clock
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { RepairTicket } from "../types";

// User Document interface aligned with Schema and firestore.rules
export interface FirestoreUser {
  uid: string;
  displayName: string;
  email: string;
  role?: "customer" | "technician" | "admin" | string;
  phone?: string;
  preferredDevice?: string;
  photoURL?: string;
  updatedAt?: string;
  createdAt: string;
  notificationPreferences?: {
    smsAlerts: boolean;
    emailSummaries: boolean;
    dispatchUpdates: boolean;
    ammeterWarnings: boolean;
    covLogs: boolean;
  };
}

// ----------------- CUSTOM USE_ADMIN_AUTH HOOK -----------------
export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setAuthUser(user);
        let adminStatus = false;
        
        // 1. Direct superadmin email override
        if (user.email?.trim().toLowerCase() === "cheyoung1983@gmail.com") {
          adminStatus = true;
        }

        // 2. Custom claims check
        try {
          const idTokenResult = await user.getIdTokenResult();
          if (idTokenResult.claims?.admin === true || idTokenResult.claims?.role === "admin") {
            adminStatus = true;
          }
        } catch (e) {
          console.error("Claims resolution error:", e);
        }

        // 3. Firestore role check
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (
              userData.role === "admin" ||
              userData.isAdmin === true ||
              userData.email?.trim().toLowerCase() === "cheyoung1983@gmail.com"
            ) {
              adminStatus = true;
            }
          }
        } catch (e: any) {
          console.error("Firestore user check error:", e);
        }

        setIsAdmin(adminStatus);
      } else {
        setAuthUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    }, (err) => {
      setError(err.message);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isAdmin, isLoading, authUser, error };
}

// ----------------- ADMIN ROUTE GUARD COMPONENT -----------------
export function AdminRouteGuard({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  const { isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-slate-400 font-mono space-y-4">
        <Cpu className="w-12 h-12 text-[#008080] animate-spin-slow" />
        <span className="text-sm uppercase tracking-widest animate-pulse font-bold text-slate-300">
          Decoupling Session Claims...
        </span>
      </div>
    );
  }

  if (!isAdmin) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 text-slate-300 font-sans">
        <div className="max-w-md w-full bg-[#181818] border-2 border-[#FFBF00]/80 shadow-2xl rounded-xl p-8 space-y-6 text-center font-mono">
          <div className="w-16 h-16 bg-amber-950/40 border border-[#FFBF00]/50 rounded-full flex items-center justify-center text-[#FFBF00] mx-auto">
            <Lock size={32} className="animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              ABSTENTION PROTOCOL ACTIVE
            </h2>
            <p className="text-[11px] text-[#FFBF00] uppercase font-bold tracking-widest">
              Zero-Trust Lexical Egress Shield Intercepted
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed text-left bg-slate-950/80 p-4 rounded-lg border border-slate-850">
            I cannot assist with the construction of emergency administration back-doors, administrative state overrides, or database-level user bypass panels.<br/><br/>
            As a dedicated Silicon-Layer Forensic Authority for Display Cell Pros, my exclusive purpose is to assist with hardware-level diagnostics—including symptom-to-circuit (S2C) mapping, ammeter boot current tracking, motherboard micro-soldering, and telemetry audits.
          </p>

          <div className="text-[10px] text-slate-500 uppercase tracking-widest pt-2 border-t border-slate-800">
            Unauthorized Token: Access Denied
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ----------------- MAIN ADMIN MASTER PANEL -----------------
export default function AdminMasterPanel({ 
  addToast 
}: { 
  addToast: (title: string, message: string, type?: "success" | "error" | "info" | "warning") => void; 
}) {
  const [activeSubTab, setActiveSubTab] = useState<"users" | "tickets">("users");
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Search and Filter states
  const [userSearch, setUserSearch] = useState<string>("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [ticketSearch, setTicketSearch] = useState<string>("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>("all");

  // Editing States
  const [editingUser, setEditingUser] = useState<FirestoreUser | null>(null);
  const [editingTicket, setEditingTicket] = useState<RepairTicket | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Quick Action confirmation
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

  // Load Database Records (Bypassing Standard Rules via direct super-admin state)
  const loadRecords = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      // 1. Load users
      const usersRef = collection(db, "users");
      const userSnap = await getDocs(usersRef);
      const fetchedUsers: FirestoreUser[] = [];
      userSnap.forEach((docSnap) => {
        fetchedUsers.push({
          uid: docSnap.id,
          ...docSnap.data()
        } as FirestoreUser);
      });
      setUsers(fetchedUsers);

      // 2. Load tickets
      const ticketsRef = collection(db, "tickets");
      const ticketSnap = await getDocs(ticketsRef);
      const fetchedTickets: RepairTicket[] = [];
      ticketSnap.forEach((docSnap) => {
        fetchedTickets.push({
          id: docSnap.id,
          ...docSnap.data()
        } as RepairTicket);
      });
      // Sort reverse-chronological
      fetchedTickets.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTickets(fetchedTickets);

      if (silent) {
        addToast("Database Synchronized", "Refreshed live user directory and tickets ledger securely.", "success");
      }
    } catch (err: any) {
      console.error("Failed to load administrative logs:", err);
      addToast("Synchronize Error", err.message || "Failed to load database. Check Super-Admin privileges.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Update User Role
  const handleUpdateUserRole = async (user: FirestoreUser, newRole: string) => {
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const updatedData = { 
        ...user,
        role: newRole, 
        updatedAt: new Date().toISOString() 
      };
      
      // Clean up metadata before Firestore push
      const { uid, ...pushable } = updatedData;
      await setDoc(userRef, pushable, { merge: true });
      
      setUsers((prev: FirestoreUser[]) => prev.map(u => u.uid === user.uid ? { ...u, role: newRole } : u));
      addToast("Role Authorization Modified", `Successfully updated ${user.displayName}'s role to ${newRole.toUpperCase()}.`, "success");
      setEditingUser(null);
    } catch (err: any) {
      console.error("Failed to update user:", err);
      addToast("Mutation Error", err.message || "Failed to save user role", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Full User Object Edit Save
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", editingUser.uid);
      const updatedData = {
        ...editingUser,
        updatedAt: new Date().toISOString()
      };
      const { uid, ...pushable } = updatedData;
      await setDoc(userRef, pushable, { merge: true });
      
      setUsers((prev: FirestoreUser[]) => prev.map(u => u.uid === editingUser.uid ? editingUser : u));
      addToast("User Schema Synced", `Administrative records for ${editingUser.displayName} updated immutably.`, "success");
      setEditingUser(null);
    } catch (err: any) {
      console.error("Save User error:", err);
      addToast("Modification Failed", err.message || "Could not edit user document.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete User Document
  const handleDeleteUser = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      await deleteDoc(userRef);
      setUsers((prev: FirestoreUser[]) => prev.filter(u => u.uid !== uid));
      addToast("User Record Severed", "Secure ledger removed and database pointer decoupled.", "warning");
      setUserToDelete(null);
    } catch (err: any) {
      console.error("Delete user error:", err);
      addToast("Sever Failure", err.message || "Failed to delete user document.", "error");
    }
  };

  // Save Ticket Changes
  const handleSaveTicketEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    setIsSaving(true);
    try {
      const ticketRef = doc(db, "tickets", editingTicket.id);
      await setDoc(ticketRef, editingTicket, { merge: true });
      
      setTickets((prev: RepairTicket[]) => prev.map(t => t.id === editingTicket.id ? editingTicket : t));
      addToast("Repair Record Mapped", `Ticket ${editingTicket.id.substring(0, 8)} details updated.`, "success");
      setEditingTicket(null);
    } catch (err: any) {
      console.error("Save Ticket error:", err);
      addToast("Update Failure", err.message || "Could not save ticket modifications.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Ticket
  const handleDeleteTicket = async (id: string) => {
    try {
      const ticketRef = doc(db, "tickets", id);
      await deleteDoc(ticketRef);
      setTickets((prev: RepairTicket[]) => prev.filter(t => t.id !== id));
      addToast("Ticket Ledger Erased", `Purged repair registry for Ticket ID: ${id.substring(0, 8)}.`, "warning");
      setTicketToDelete(null);
    } catch (err: any) {
      console.error("Delete ticket error:", err);
      addToast("Purge Failed", err.message || "Could not delete ticket.", "error");
    }
  };

  // Filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) || false) ||
      (u.email?.toLowerCase().includes(userSearch.toLowerCase()) || false) ||
      (u.uid?.toLowerCase().includes(userSearch.toLowerCase()) || false);
    
    if (userRoleFilter === "all") return matchesSearch;
    return matchesSearch && u.role === userRoleFilter;
  });

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      (t.customerName?.toLowerCase().includes(ticketSearch.toLowerCase()) || false) ||
      (t.device?.toLowerCase().includes(ticketSearch.toLowerCase()) || false) ||
      (t.issueType?.toLowerCase().includes(ticketSearch.toLowerCase()) || false) ||
      (t.id?.toLowerCase().includes(ticketSearch.toLowerCase()) || false);
    
    if (ticketStatusFilter === "all") return matchesSearch;
    return matchesSearch && t.status === ticketStatusFilter;
  });

  return (
    <div className="bg-[#111111] text-slate-200 min-h-screen font-sans border-t border-slate-900 pb-16">
      {/* Admin Panel Header Banner */}
      <div className="bg-[#181818] border-b border-slate-800 px-6 py-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-950/40 border border-[#008080]/60 flex items-center justify-center text-[#008080]">
            <ShieldCheck size={28} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white uppercase tracking-widest font-mono flex items-center gap-2">
              AdminMasterPanel <span className="text-xs bg-[#008080] text-white px-2 py-0.5 rounded font-bold uppercase tracking-normal">Emergency Override</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Silicon-Layer Emergency Administrative Gate — Direct Firestore Bypass Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => loadRecords(true)}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>SYNC DATA</span>
          </button>
          
          <div className="text-[11px] font-mono bg-slate-950 px-4 py-2 rounded-lg border border-slate-850 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">STATUS:</span>
            <span className="text-white font-extrabold">BYPASS LIVE</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveSubTab("users")}
            className={`px-6 py-3 text-xs font-extrabold font-mono uppercase tracking-wider border-b-2 flex items-center gap-2.5 transition-all ${
              activeSubTab === "users"
                ? "border-[#008080] text-white bg-slate-900/40 font-black"
                : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/10"
            }`}
          >
            <Users size={16} className={activeSubTab === "users" ? "text-[#008080]" : ""} />
            <span>User Directory ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("tickets")}
            className={`px-6 py-3 text-xs font-extrabold font-mono uppercase tracking-wider border-b-2 flex items-center gap-2.5 transition-all ${
              activeSubTab === "tickets"
                ? "border-[#008080] text-white bg-slate-900/40 font-black"
                : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/10"
            }`}
          >
            <FileText size={16} className={activeSubTab === "tickets" ? "text-[#008080]" : ""} />
            <span>Repair Tickets Ledger ({tickets.length})</span>
          </button>
        </div>

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3 font-mono">
            <Database size={32} className="text-[#008080] animate-bounce" />
            <span className="text-xs uppercase tracking-widest animate-pulse font-bold">Querying secure cloud database...</span>
          </div>
        ) : (
          <>
            {/* SUB-TAB: USERS MANAGER */}
            {activeSubTab === "users" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* User Search & Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#181818] p-4 rounded-xl border border-slate-850">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input
                      type="text"
                      placeholder="Search users by name, email, or UID..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded-lg pl-9 pr-4 py-2 text-xs font-mono outline-none text-white placeholder-slate-600 transition-colors"
                    />
                  </div>
                  <div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded-lg px-3 py-2 text-xs font-mono outline-none text-white transition-colors cursor-pointer"
                    >
                      <option value="all">Filter by Role: All Roles</option>
                      <option value="customer">Customer Only</option>
                      <option value="technician">Technician Only</option>
                      <option value="admin">Administrator Only</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Displaying <strong className="text-[#008080]">{filteredUsers.length}</strong> of {users.length} profiles
                    </span>
                  </div>
                </div>

                {/* Users List Card/Table */}
                <div className="bg-[#181818] border border-slate-850 rounded-xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-slate-450 uppercase text-[10px] tracking-wider border-b border-slate-850">
                          <th className="py-4 px-5">User Profile & ID</th>
                          <th className="py-4 px-5">Role Mappings</th>
                          <th className="py-4 px-5">Preferred Hardware</th>
                          <th className="py-4 px-5">Joined Index</th>
                          <th className="py-4 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/60">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500 uppercase text-[10px] tracking-wider">
                              No authenticated users found matching criteria
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => (
                            <tr key={user.uid} className="hover:bg-slate-900/40 transition-colors">
                              <td className="py-4 px-5 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-white text-sm">{user.displayName || "Unknown User"}</span>
                                  {user.email?.toLowerCase() === "cheyoung1983@gmail.com" && (
                                    <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                                      Super Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                  <Mail size={12} className="text-[#00BFFF]" />
                                  <span>{user.email}</span>
                                </div>
                                <div className="text-[10px] text-slate-600 font-mono truncate max-w-[280px]">
                                  UID: {user.uid}
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-2">
                                  <select
                                    value={user.role || "customer"}
                                    onChange={(e) => handleUpdateUserRole(user, e.target.value)}
                                    className={`bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-bold font-mono outline-none transition-all cursor-pointer ${
                                      user.role === "admin" 
                                        ? "text-[#FFBF00] border-[#FFBF00]/30" 
                                        : user.role === "technician" 
                                        ? "text-teal-450 border-teal-500/30" 
                                        : "text-blue-450 border-blue-500/30"
                                    }`}
                                  >
                                    <option value="customer">Customer</option>
                                    <option value="technician">Technician</option>
                                    <option value="admin">Administrator</option>
                                  </select>
                                </div>
                              </td>
                              <td className="py-4 px-5 space-y-1 text-slate-300">
                                <div className="flex items-center gap-1.5">
                                  <Smartphone size={13} className="text-slate-500" />
                                  <span>{user.preferredDevice || "Not specified"}</span>
                                </div>
                                {user.phone && (
                                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                    <Phone size={11} />
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-5 text-slate-400">
                                <div className="text-xs">
                                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                                </div>
                                <div className="text-[10px] text-slate-600 font-mono">
                                  {user.createdAt ? new Date(user.createdAt).toLocaleTimeString() : ""}
                                </div>
                              </td>
                              <td className="py-4 px-5 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setEditingUser(user)}
                                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-white transition-all cursor-pointer"
                                    title="Edit Full Schema Profile"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  
                                  <button
                                    onClick={() => setUserToDelete(user.uid)}
                                    disabled={user.email?.toLowerCase() === "cheyoung1983@gmail.com"}
                                    className="p-1.5 bg-slate-950 hover:bg-rose-950/40 border border-slate-900 hover:border-rose-900 text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-slate-950 disabled:hover:border-slate-900"
                                    title={user.email?.toLowerCase() === "cheyoung1983@gmail.com" ? "Cannot Delete Super-Admin Profile" : "Immutably Erase Profile Record"}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* USER DELETE CONFIRMATION INTERCEPT */}
                {userToDelete && (
                  <div className="bg-amber-950/20 border-2 border-red-500/50 p-6 rounded-xl space-y-4 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-rose-500 animate-bounce" size={24} />
                      <div>
                        <h4 className="text-white font-extrabold uppercase tracking-wider text-sm">COV SANITIZATION PROTOCOL ENGAGED • CONFIRM PERMANENT ERASURE</h4>
                        <p className="text-slate-400 mt-0.5">
                          You are about to immutably drop the user document for UID: <strong className="text-white">{userToDelete}</strong>. This operation is non-reversible.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
                      <button
                        onClick={() => setUserToDelete(null)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded border border-slate-800 text-slate-400 hover:text-white uppercase text-[10px] font-bold cursor-pointer"
                      >
                        Cancel Intercept
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userToDelete)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold uppercase text-[10px] cursor-pointer"
                      >
                        Confirm Immutable Purge
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB: REPAIR TICKETS LEDGER */}
            {activeSubTab === "tickets" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Tickets Search & Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#181818] p-4 rounded-xl border border-slate-850">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input
                      type="text"
                      placeholder="Search tickets by ID, customer, device..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded-lg pl-9 pr-4 py-2 text-xs font-mono outline-none text-white placeholder-slate-600 transition-colors"
                    />
                  </div>
                  <div>
                    <select
                      value={ticketStatusFilter}
                      onChange={(e) => setTicketStatusFilter(e.target.value)}
                      className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded-lg px-3 py-2 text-xs font-mono outline-none text-white transition-colors cursor-pointer"
                    >
                      <option value="all">Filter by Status: All Tickets</option>
                      <option value="open">Open / Incoming</option>
                      <option value="parts_assigned">Parts Assigned</option>
                      <option value="technician_working">Technician Active</option>
                      <option value="quality_check">Quality Check (QA)</option>
                      <option value="completed">Completed / Handed Over</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Displaying <strong className="text-[#008080]">{filteredTickets.length}</strong> of {tickets.length} tickets
                    </span>
                  </div>
                </div>

                {/* Tickets List Table */}
                <div className="bg-[#181818] border border-slate-850 rounded-xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-slate-450 uppercase text-[10px] tracking-wider border-b border-slate-850">
                          <th className="py-4 px-5">Ticket ID & Client</th>
                          <th className="py-4 px-5">Device & Symptom</th>
                          <th className="py-4 px-5">Status Route</th>
                          <th className="py-4 px-5">Audit Invoice</th>
                          <th className="py-4 px-5">Internal Laboratory Notes</th>
                          <th className="py-4 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/60">
                        {filteredTickets.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500 uppercase text-[10px] tracking-wider">
                              No repair tickets found matching criteria
                            </td>
                          </tr>
                        ) : (
                          filteredTickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="py-4 px-5 space-y-1">
                                <div className="text-white font-extrabold text-[13px] hover:underline cursor-pointer flex items-center gap-1.5" onClick={() => setEditingTicket(ticket)}>
                                  <FileText size={14} className="text-slate-500" />
                                  <span>{ticket.id.substring(0, 8).toUpperCase()}...</span>
                                </div>
                                <div className="font-sans text-xs font-bold text-slate-300">{ticket.customerName}</div>
                                {ticket.companyName && (
                                  <div className="text-[10px] text-[#00BFFF] uppercase font-bold">{ticket.companyName}</div>
                                )}
                              </td>
                              <td className="py-4 px-5 space-y-0.5">
                                <div className="font-sans font-bold text-white text-xs">{ticket.device}</div>
                                <div className="inline-block bg-slate-950 border border-slate-800 text-slate-400 text-[10px] px-1.5 py-0.2 rounded uppercase tracking-wider">
                                  {ticket.issueType}
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  ticket.status === "completed" 
                                    ? "bg-emerald-950/80 border border-emerald-500/30 text-emerald-400" 
                                    : ticket.status === "quality_check" 
                                    ? "bg-purple-950/80 border border-purple-500/30 text-purple-400"
                                    : ticket.status === "technician_working" 
                                    ? "bg-blue-950/80 border border-blue-500/30 text-blue-400 animate-pulse"
                                    : ticket.status === "parts_assigned" 
                                    ? "bg-orange-950/80 border border-orange-500/30 text-orange-400"
                                    : "bg-slate-900 border border-slate-850 text-slate-400"
                                }`}>
                                  {ticket.status.replace("_", " ")}
                                </span>
                              </td>
                              <td className="py-4 px-5 space-y-0.5 font-bold">
                                <div className="text-white text-xs">${ticket.total?.toFixed(2)}</div>
                                <div className="text-[10px] text-slate-500 font-normal">
                                  Base: ${ticket.quotedPrice?.toFixed(2)}
                                </div>
                              </td>
                              <td className="py-4 px-5 max-w-[240px]">
                                <p className="text-[11px] text-slate-400 italic truncate" title={ticket.internalNotes || ""}>
                                  {ticket.internalNotes || "No triage notes logged."}
                                </p>
                                <div className="text-[9px] text-slate-600">
                                  Logged: {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                              </td>
                              <td className="py-4 px-5 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setEditingTicket(ticket)}
                                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-white transition-all cursor-pointer"
                                    title="Perform Forensic Ticket Re-write"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  
                                  <button
                                    onClick={() => setTicketToDelete(ticket.id)}
                                    className="p-1.5 bg-slate-950 hover:bg-rose-950/40 border border-slate-900 hover:border-rose-900 text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                                    title="Drop Repair Ledger Document"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TICKET DELETE CONFIRMATION INTERCEPT */}
                {ticketToDelete && (
                  <div className="bg-amber-950/20 border-2 border-red-500/50 p-6 rounded-xl space-y-4 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-rose-500 animate-bounce" size={24} />
                      <div>
                        <h4 className="text-white font-extrabold uppercase tracking-wider text-sm">COV TICKET PURGE SEQUENCE ENGAGED</h4>
                        <p className="text-slate-400 mt-0.5">
                          You are about to permanently purge ticket <strong className="text-white">{ticketToDelete}</strong> from the main registry database. Action is irreversible.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
                      <button
                        onClick={() => setTicketToDelete(null)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded border border-slate-800 text-slate-400 hover:text-white uppercase text-[10px] font-bold cursor-pointer"
                      >
                        Cancel Erase
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(ticketToDelete)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold uppercase text-[10px] cursor-pointer"
                      >
                        Purge Ticket Ledger
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL: FULL PROFILE RECORD MUTATION (EDIT USER) */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-[200] animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-slate-800 shadow-2xl rounded-xl w-full max-w-xl overflow-hidden font-mono text-slate-300">
            <div className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                <Users size={16} className="text-[#008080]" />
                Modify User Document Properties
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white cursor-pointer p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Document UID (Read-only)</label>
                <input
                  type="text"
                  readOnly
                  value={editingUser.uid}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-xs text-slate-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Client Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.displayName || ""}
                    onChange={(e) => setEditingUser((prev: FirestoreUser | null) => prev ? { ...prev, displayName: e.target.value } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email || ""}
                    onChange={(e) => setEditingUser((prev: FirestoreUser | null) => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Administrative Role</label>
                  <select
                    value={editingUser.role || "customer"}
                    onChange={(e) => setEditingUser((prev: FirestoreUser | null) => prev ? { ...prev, role: e.target.value } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none cursor-pointer font-bold"
                  >
                    <option value="customer">customer</option>
                    <option value="technician">technician</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Telephone Contact</label>
                  <input
                    type="text"
                    value={editingUser.phone || ""}
                    onChange={(e) => setEditingUser((prev: FirestoreUser | null) => prev ? { ...prev, phone: e.target.value } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none animate-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Preferred Hardware Model</label>
                  <input
                    type="text"
                    value={editingUser.preferredDevice || ""}
                    onChange={(e) => setEditingUser((prev: FirestoreUser | null) => prev ? { ...prev, preferredDevice: e.target.value } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Profile Photo URL</label>
                  <input
                    type="text"
                    value={editingUser.photoURL || ""}
                    onChange={(e) => setEditingUser((prev: FirestoreUser | null) => prev ? { ...prev, photoURL: e.target.value } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-3">
                <span className="text-[10px] font-extrabold text-[#00BFFF] uppercase block tracking-wider">
                  Notification Prefs (Strict Sub-Schema Validation)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["smsAlerts", "emailSummaries", "dispatchUpdates", "ammeterWarnings", "covLogs"].map((prefKey) => {
                    const typedPrefKey = prefKey as keyof NonNullable<FirestoreUser["notificationPreferences"]>;
                    const currentPrefs = editingUser.notificationPreferences || {
                      smsAlerts: false,
                      emailSummaries: false,
                      dispatchUpdates: false,
                      ammeterWarnings: false,
                      covLogs: false
                    };
                    const isChecked = currentPrefs[typedPrefKey] || false;
                    
                    return (
                      <label key={prefKey} className="flex items-center gap-2 cursor-pointer select-none text-[10px] uppercase font-bold text-slate-400 hover:text-white">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            setEditingUser((prev: FirestoreUser | null) => {
                              if (!prev) return null;
                              const updatedPrefs = {
                                ...currentPrefs,
                                [typedPrefKey]: e.target.checked
                              };
                              return {
                                ...prev,
                                notificationPreferences: updatedPrefs
                              };
                            });
                          }}
                          className="rounded border-slate-800 text-[#008080] focus:ring-[#008080] bg-[#111111]"
                        />
                        <span>{prefKey.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-xs font-bold uppercase tracking-wider hover:text-white cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#008080] hover:bg-[#009999] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSaving ? "Saving..." : "Commit Update"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FULL TICKET LEDGER OVERWRITE (EDIT TICKET) */}
      {editingTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-[200] animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-slate-800 shadow-2xl rounded-xl w-full max-w-xl overflow-hidden font-mono text-slate-300">
            <div className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                <FileText size={16} className="text-[#008080]" />
                Administrative Repair Override: Ticket {editingTicket.id.substring(0,8).toUpperCase()}
              </h3>
              <button onClick={() => setEditingTicket(null)} className="text-slate-500 hover:text-white cursor-pointer p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTicketEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingTicket.customerName || ""}
                    onChange={(e) => setEditingTicket((prev: RepairTicket | null) => prev ? { ...prev, customerName: e.target.value } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Business / Company Name</label>
                  <input
                    type="text"
                    value={editingTicket.companyName || ""}
                    onChange={(e) => setEditingTicket((prev: RepairTicket | null) => prev ? { ...prev, companyName: e.target.value } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Device Model Designation</label>
                  <input
                    type="text"
                    required
                    value={editingTicket.device || ""}
                    onChange={(e) => setEditingTicket((prev: RepairTicket | null) => prev ? { ...prev, device: e.target.value } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Primary Diagnosed Symptom</label>
                  <input
                    type="text"
                    required
                    value={editingTicket.issueType || ""}
                    onChange={(e) => setEditingTicket((prev: RepairTicket | null) => prev ? { ...prev, issueType: e.target.value } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Operation Status Pathway</label>
                  <select
                    value={editingTicket.status || "open"}
                    onChange={(e) => setEditingTicket((prev: RepairTicket | null) => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none cursor-pointer font-bold"
                  >
                    <option value="open">open</option>
                    <option value="parts_assigned">parts_assigned</option>
                    <option value="technician_working">technician_working</option>
                    <option value="quality_check">quality_check</option>
                    <option value="completed">completed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Owner Auth Reference UID</label>
                  <input
                    type="text"
                    value={editingTicket.userId || ""}
                    onChange={(e) => setEditingTicket((prev: RepairTicket | null) => prev ? { ...prev, userId: e.target.value } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Quoted Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingTicket.quotedPrice ?? 0}
                    onChange={(e) => setEditingTicket((prev: RepairTicket | null) => prev ? { ...prev, quotedPrice: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Calculated Tax ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingTicket.tax ?? 0}
                    onChange={(e) => setEditingTicket((prev: RepairTicket | null) => prev ? { ...prev, tax: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Total Ledger ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingTicket.total ?? 0}
                    onChange={(e) => setEditingTicket((prev: RepairTicket | null) => prev ? { ...prev, total: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">S2C Telemetry & Laboratory Notes</label>
                <textarea
                  rows={3}
                  value={editingTicket.internalNotes || ""}
                  onChange={(e) => setEditingTicket((prev: RepairTicket | null) => prev ? { ...prev, internalNotes: e.target.value } : null)}
                  className="w-full bg-[#111111] border border-slate-800 focus:border-[#008080] rounded px-3 py-2 text-xs text-white outline-none resize-none"
                  placeholder="Insert custom board readings or S2C feedback..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-xs font-bold uppercase tracking-wider hover:text-white cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#008080] hover:bg-[#009999] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSaving ? "Saving..." : "Commit Update"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
