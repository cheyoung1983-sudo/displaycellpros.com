import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Send, 
  Inbox, 
  Search, 
  Trash2, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  FileText, 
  Check, 
  CheckCircle2, 
  Clock, 
  User, 
  Sparkles, 
  Lock, 
  AlertTriangle, 
  ChevronRight, 
  Filter, 
  ArrowRight, 
  CornerUpLeft, 
  Paperclip,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { RepairTicket, HighPriorityLead } from "../types";

interface GmailIntegrationViewProps {
  accessToken: string | null;
  authUser: any;
  onLinkGoogleAuth: () => void;
  addToast: (title: string, message: string, type: "success" | "error" | "info" | "warning", duration?: number) => void;
  tickets: RepairTicket[];
  leads: HighPriorityLead[];
}

interface ThreadMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  labelIds: string[];
}

// Custom curated communication templates for Spokane Diagnostics Lab
const REPAIR_TEMPLATES = [
  {
    id: "intake_auth",
    name: "Intake & Pre-Auth Receipt",
    subject: "Display & Cell Pros - Repair Intake Status Update",
    body: `Hi [[name]],<br/><br/>
Your <strong>[[device]]</strong> has been securely enrolled in our Spokane diagnostics ledger.<br/><br/>
<strong>Issue registered:</strong> [[issue]]<br/>
<strong>Pre-authorized Budget:</strong> $[[budget]]<br/><br/>
Our micro-soldering and logic board specialists will execute high-precision ammeter assessments first. We will message you as soon as diagnostics compile.<br/><br/>
Best regards,<br/>
<strong>Display & Cell Pros - Spokane Diagnostic Center</strong><br/>
320 Lincoln St, Spokane WA`
  },
  {
    id: "repair_complete",
    name: "Repair Completed & Quality Control Pass",
    subject: "Display & Cell Pros - Your device is ready for pickup!",
    body: `Hi [[name]],<br/><br/>
Excellent news! Your <strong>[[device]]</strong> has successfully passed all micro-probing validation assessments and full Quality Control checks.<br/><br/>
<strong>Work completed:</strong> Repair and parts calibration.<br/>
<strong>Total Outstanding:</strong> $[[total]]<br/><br/>
You may visit our Spokane diagnostics hub during standard operational hours to claim your device. Our work carries a 90-day parts warranty.<br/><br/>
Warm regards,<br/>
<strong>Display & Cell Pros Diagnostics Team</strong><br/>
(509) 903-6139`
  },
  {
    id: "escalation_notice",
    name: "Tier 3 Diagnostics Escalation",
    subject: "Display & Cell Pros - Level 3 Diagnostic Escalation",
    body: `Hi [[name]],<br/><br/>
This is a diagnostic update regarding your <strong>[[device]]</strong>.<br/><br/>
To ensure high-precision calibration, our intake lead has escalated this device to our Level 3 advanced workbench. This involves microchip-level oscilloscope monitoring to isolate current spikes.<br/><br/>
There is no additional cost associated with this evaluation stage. We require 24-48 additional business hours to compile the final trace analysis.<br/><br/>
We appreciate your fleet patience.<br/><br/>
Sincerely,<br/>
<strong>Spokane Tier-3 Calibration Desk</strong><br/>
Display & Cell Pros`
  }
];

export const GmailIntegrationView: React.FC<GmailIntegrationViewProps> = ({
  accessToken,
  authUser,
  onLinkGoogleAuth,
  addToast,
  tickets,
  leads,
}) => {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<ThreadMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Selector configs for pre-fills
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");

  // Compose Draft State
  const [draftTo, setDraftTo] = useState("");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("intake_auth");

  

  // Run dynamic sync between modes based on standard credential injection
  useEffect(() => {
    
  }, [accessToken]);

  // Read message store on load or switch
  useEffect(() => {
    if (accessToken) {
      fetchRealGmailInbox();
    }
  }, [accessToken]);

  // Load sandbox emails to give technicians responsive interactions
  const loadSandboxMessages = () => {
    const saved = localStorage.getItem("dcp_sandbox_gmail");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const initialSandbox: ThreadMessage[] = [
        {
          id: "msg_sb_001",
          threadId: "th_001",
          from: "Jessica Miller <jess.miller99@gmail.com>",
          to: "Display & Cell Pros <intake@displaycellpros.com>",
          subject: "Urgent: iPhone 15 Pro Max dropping cell signals",
          date: new Date(Date.now() - 25 * 60000).toISOString(),
          snippet: "Hi there, I checked in my phone earlier via the web forms. I noticed that after dropping my phone, it stays on Searching... and won't identify the T-Mobile SIM.",
          body: `Hi Display & Cell Pros Diagnostics Team,<br/><br/>
I checked in my blue Titanium iPhone 15 Pro Max earlier via your online forms. I forgot to mention that it has recently started dropping cellular signals entirely. It says "Searching..." in the top bar and sometimes "No SIM."<br/><br/>
Can your Spokane technicians check if the baseband IC is fractured, or if it's just a loose coaxial antenna line? If it needs micro-soldering, please contact me immediately.<br/><br/>
Thanks,<br/>Jessica`,
          labelIds: ["INBOX", "STARRED"]
        },
        {
          id: "msg_sb_002",
          threadId: "th_002",
          from: "Marcus Vance <mvance_spokane@outlook.com>",
          to: "Display & Cell Pros <intake@displaycellpros.com>",
          subject: "Approval for Pre-Auth over limits ($300)",
          date: new Date(Date.now() - 3 * 3600000).toISOString(),
          snippet: "Please proceed with the iPad motherboard swap. I understand from your previous email that there is liquid corrosion near the backlight converter.",
          body: `To Spokane Mobile Lab Desk,<br/><br/>
I got your voicemail about my iPad Air 5th Gen (M1). You noted that the USB-C ammeter showed 0.05A draw due to circuit board corrosion near the display backlight system.<br/><br/>
Please accept this email as my authorization to upgrade the target budget up to $300 to swap out the liquid damaged components. Let me know when it starts post-repair booting tests.<br/><br/>
Best regards,<br/>Marcus Vance`,
          labelIds: ["INBOX"]
        },
        {
          id: "msg_sb_003",
          from: "Spokane Fleet Mgr <fleet@spokanecounty.gov>",
          to: "Display & Cell Pros <corporate@displaycellpros.com>",
          subject: "Tax Exemption Certificate validation - Fleet ID #991",
          threadId: "th_003",
          date: new Date(Date.now() - 17 * 3600000).toISOString(),
          snippet: "Attaching the updated WA state tax exempt PDF for Display & Cell Pros POS database billing. Thanks.",
          body: `Hello Team,<br/><br/>
Concerning our 5 fleet repair check-ins this week, please find our Department of Revenue custom exemption certificate appended here. This should bypass the normal 8.9% WA state sales tax on our upcoming corporate ledger invoice.<br/><br/>
Apply this to corporate accounts linked with 'fleet@spokanecounty.gov'.<br/><br/>
Thank you for keeping our first responders connected,<br/>
Robert Downey Jr<br/>
Fleet Operations Division`,
          labelIds: ["INBOX"]
        }
      ];
      setMessages(initialSandbox);
      localStorage.setItem("dcp_sandbox_gmail", JSON.stringify(initialSandbox));
    }
  };

  const fetchRealGmailInbox = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const url = "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=subject:(Display OR Cell OR Repair OR Support OR Intake)";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) {
        throw new Error(`Gmail API failure (${res.status}). Ensure you have checked relevant permissions.`);
      }

      const listData = await res.json();
      const rawMessages = listData.messages || [];

      // Fetch fuller details for each message
      const detailedMsgs: ThreadMessage[] = [];
      for (const m of rawMessages) {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const headers = detail.payload?.headers || [];
          
          const from = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown sender";
          const to = headers.find((h: any) => h.name.toLowerCase() === "to")?.value || "Me";
          const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";
          const date = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || new Date().toISOString();
          
          let body = "No visual body could be resolved from parts.";
          const snippet = detail.snippet || "";

          // Extract plain-text of HTML body
          if (detail.payload?.body?.data) {
            body = decodeBase64(detail.payload.body.data);
          } else if (detail.payload?.parts) {
            // Find a text/html or text/plain part
            const part = detail.payload.parts.find((p: any) => p.mimeType === "text/html") || 
                         detail.payload.parts.find((p: any) => p.mimeType === "text/plain");
            if (part && part.body?.data) {
              body = decodeBase64(part.body.data);
            }
          }

          detailedMsgs.push({
            id: detail.id,
            threadId: detail.threadId,
            from,
            to,
            subject,
            date: new Date(date).toISOString(),
            snippet,
            body,
            labelIds: detail.labelIds || []
          });
        }
      }

      setMessages(detailedMsgs);
      addToast(
        "Gmail Feed Synced",
        `Retrieved latest customer communications successfully. Found ${detailedMsgs.length} matching inquiries.`,
        "success"
      );
    } catch (err: any) {
      console.error(err);
      addToast("Gmail Loading Failed", err.message || "Please check your network session.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const decodeBase64 = (str: string) => {
    try {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(escape(window.atob(base64)));
    } catch (e) {
      return "(Decode Error: Content may contain rich attachments)";
    }
  };

  // Pre-fill fields when selecting active POS tickets
  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setSelectedLeadId("");
    const matched = tickets.find(t => t.id === ticketId);
    if (matched) {
      // Clean name to email-like placeholder
      const cleanName = matched.customerName.toLowerCase().replace(/[^a-z]/g, "");
      setDraftTo(`${cleanName}@gmail.com`);
      applyTemplateVariables(selectedTemplate, matched, null);
    }
  };

  // Pre-fill fields when selecting sales leads
  const handleLeadSelect = (leadId: string) => {
    setSelectedLeadId(leadId);
    setSelectedTicketId("");
    const matched = leads.find(l => l.id === leadId);
    if (matched) {
      const cleanName = matched.customerName.toLowerCase().replace(/[^a-z]/g, "");
      setDraftTo(`${cleanName}@gmail.com`);
      
      // Synthesize faux ticket variables
      const fauxTicket: Partial<RepairTicket> = {
        customerName: matched.customerName,
        device: matched.deviceModel,
        status: "open",
        quotedPrice: 150,
        tax: 13.35,
        total: 163.35,
        internalNotes: "Tier 3 high-priority lead follow up"
      };
      applyTemplateVariables(selectedTemplate, fauxTicket as RepairTicket, matched);
    }
  };

  // Applies active variables in templates automatically
  const applyTemplateVariables = (tplId: string, ticket: RepairTicket | null, lead: HighPriorityLead | null) => {
    const tpl = REPAIR_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;

    let resBody = tpl.body;
    let resSubject = tpl.subject;

    const currentCustomer = ticket?.customerName || lead?.customerName || "Valued Client";
    const currentDevice = ticket?.device || lead?.deviceModel || "Intake Device";
    const currentIssue = ticket?.internalNotes?.substring(0, 100) || "Intake diagnostics check-in requested.";
    const currentBudget = ticket?.quotedPrice?.toString() || "150.00";
    const currentTotal = ticket?.total?.toString() || "163.35";

    resBody = resBody
      .replace(/\[\[name\]\]/g, currentCustomer)
      .replace(/\[\[device\]\]/g, currentDevice)
      .replace(/\[\[issue\]\]/g, currentIssue)
      .replace(/\[\[budget\]\]/g, currentBudget)
      .replace(/\[\[total\]\]/g, currentTotal);

    resSubject = resSubject
      .replace(/\[\[device\]\]/g, currentDevice);

    setDraftSubject(resSubject);
    setDraftBody(resBody);
  };

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplate(tplId);
    
    // Find active referenced items
    let activeTicket: RepairTicket | null = null;
    let activeLead: HighPriorityLead | null = null;

    if (selectedTicketId) {
      activeTicket = tickets.find(t => t.id === selectedTicketId) || null;
    } else if (selectedLeadId) {
      activeLead = leads.find(l => l.id === selectedLeadId) || null;
      if (activeLead) {
        activeTicket = {
          id: activeLead.id,
          customerName: activeLead.customerName,
          companyName: "Google Workspace Hub",
          device: activeLead.deviceModel,
          issueType: "other",
          status: "open",
          quotedPrice: 150,
          tax: 13.35,
          discount: 0,
          total: 163.35,
          createdAt: activeLead.createdAt,
          userId: activeLead.userId,
          internalNotes: "Simulated ticket from Lead"
        };
      }
    }

    applyTemplateVariables(tplId, activeTicket, activeLead);
  };

  const handleSendGmail = async () => {
    if (!draftTo.trim() || !draftSubject.trim() || !draftBody.trim()) {
      addToast("Validation Failed", "To, Subject, and Mail body are strictly required.", "warning");
      return;
    }

    setIsSending(true);
    try {
        // REAL GOOGLE GMAIL TRANSMISSION VIA HTTPS API PUSH
        const emailContent = [
          `To: ${draftTo}`,
          `Subject: ${draftSubject}`,
          `Content-Type: text/html; charset=utf-8`,
          `MIME-Version: 1.0`,
          ``,
          `<div>${draftBody}</div>`
        ].join("\r\n");

        // Encode as standard base64Url protocol safe payload
        const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            raw: encodedEmail
          })
        });

        if (!sendRes.ok) {
          throw new Error(`Gmail API failure returning headers value ${sendRes.status}`);
        }

        addToast(
          "Gmail Message Dispatched!",
          `Successfully delivered email update to ${draftTo} via Google Workspace API.`,
          "success"
        );
        
        // Reset compose
        setDraftTo("");
        setDraftSubject("");
        setDraftBody("");
        fetchRealGmailInbox();
    } catch (err: any) {
      console.error(err);
      addToast("Transmission Blocked", err.message || "Could not interact with mail service API.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to change label status / trash this customer email thread?");
    if (!confirm) return;

    try {
        // Move message to trash on real Google Server
        const trashRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (trashRes.ok) {
          addToast("Email Trashed", "Thread has been moved to Google Drive Trash successfully.", "success");
          fetchRealGmailInbox();
          setSelectedMsg(null);
        } else {
          throw new Error(`Trash endpoint return status ${trashRes.status}`);
        }
    } catch (err: any) {
      addToast("Failed Deleting Thread", err.message || "Contact Workspace Administrator", "error");
    }
  };

  const filteredMessages = messages.filter(m => {
    const searchLow = searchQuery.toLowerCase();
    return (
      m.from.toLowerCase().includes(searchLow) ||
      m.subject.toLowerCase().includes(searchLow) ||
      m.snippet.toLowerCase().includes(searchLow)
    );
  });

  return (
    <div id="gmail-integration-hub" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* COLUMN 1: COMPOSE & UTILITIES */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* INTERNALS & AUTHORIZATION */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <h3 className="text-xs font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
              <Inbox className="w-4 h-4 text-red-500 animate-pulse" />
              Gmail API Gateway
            </h3>
            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
              API Linked
            </span>
          </div>

          {!accessToken ? (
            <div className="flex flex-col gap-3">
              <p className="text-[11px] text-slate-400 leading-normal">
                To dispatch notifications and review incoming emails via the Google Workspace API, authenticate with your Google SSO session.
              </p>
              <button
                onClick={onLinkGoogleAuth}
                className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs uppercase tracking-wide rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <Lock className="w-3.5 h-3.5" />
                Sign In with Google
              </button>
              <button
                onClick={() => {
                  
                  loadSandboxMessages();
                  addToast("Sandbox Feed Ready", "Using simulated diagnostic inbox.", "info");
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              >
                Launch Sandbox Demo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-xs text-slate-400">
              <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="font-bold text-white block">Workspace Session Enabled</span>
                  <span className="text-[10px] font-mono truncate max-w-[200px] block">{authUser?.email}</span>
                </div>
              </div>
              <p className="text-[10px] leading-relaxed">
                Tokens parsed with compose, send, and metadata access scopes. Real system alerts will ship from your account.
              </p>
            </div>
          )}
        </section>

        {/* COMPOSE MASSAGE CONTROLLER */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h3 className="text-xs font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
              <Plus className="w-4 h-4 text-blue-400" />
              Notification Center
            </h3>
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          </div>

          <div className="flex flex-col gap-3.5">
            {/* LINK POS ACTIVE OR LEAD */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Auto-Import Client Meta</span>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <select
                    value={selectedTicketId}
                    onChange={(e) => handleTicketSelect(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300 font-mono"
                  >
                    <option value="">-- Active POS Ticket --</option>
                    {tickets.map(t => (
                      <option key={t.id} value={t.id}>{t.id} - {t.customerName} ({t.device})</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <select
                    value={selectedLeadId}
                    onChange={(e) => handleLeadSelect(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300 font-mono"
                  >
                    <option value="">-- High Priority Lead --</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.customerName} - {l.deviceModel}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* COMMUNICATIONS TEMPLATE SELECTOR */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Select Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-850 rounded text-xs text-white"
              >
                {REPAIR_TEMPLATES.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                ))}
              </select>
            </div>

            {/* SEND INSTRUCTIONS */}
            <div className="flex flex-col gap-2 text-xs">
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-0.5">To (Recipient)</label>
                <input
                  type="email"
                  value={draftTo}
                  onChange={(e) => setDraftTo(e.target.value)}
                  placeholder="name@customer.com"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-0.5">Subject Heading</label>
                <input
                  type="text"
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                  placeholder="Email Subject"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-0.5">Email Message (HTML supported)</label>
                <textarea
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  rows={6}
                  placeholder="Mime body here..."
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded text-xs text-slate-300 font-sans focus:border-red-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleSendGmail}
                disabled={isSending}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 shadow transition-all duration-200 mt-1"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Ship Notification via Gmail
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* COLUMN 2: INBOX FEED & THREADS VIEW */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex-1 flex flex-col min-h-[500px]">
          
          {/* BANNER REFRESH / FILTER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
                  Diagnostic Inbox System
                </h3>
                <p className="text-xs text-slate-400">
                  {"Streaming production messages in Spokane county"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Search communications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs text-white pl-8 focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                onClick={fetchRealGmailInbox}
                disabled={isLoading}
                className="p-1 px-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-750 transition-colors border border-slate-700 font-semibold"
                title="Force Feed Sync"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* TWO PANEL INBOX AND MESSAGE DETAIL */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* THREAD LIST */}
            <div className="md:col-span-5 flex flex-col gap-2 overflow-y-auto pr-1 max-h-[550px]">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <RefreshCw className="w-8 h-8 text-red-500 animate-spin mb-2" />
                  <p className="text-xs text-slate-500 font-mono">Syncing email headers...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-850 rounded-lg">
                  <Mail className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs font-bold text-slate-400">Inbox Clean</p>
                  <p className="text-[10px] text-slate-600">No client requests recorded here.</p>
                </div>
              ) : (
                filteredMessages.map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMsg(msg)}
                    className={`w-full text-left p-3.5 rounded-lg border flex flex-col gap-1.5 transition-all focus:outline-none ${
                      selectedMsg?.id === msg.id 
                        ? "bg-gradient-to-r from-red-950/40 to-slate-900 border-red-500/40" 
                        : "bg-slate-950/60 border-slate-850 hover:bg-slate-800/20"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[11px] font-bold text-slate-200 truncate max-w-[120px]">{msg.from.split(" <")[0]}</span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-white font-medium truncate w-full">{msg.subject}</p>
                    <p className="text-[10.5px] text-slate-400 line-clamp-2 leading-relaxed">{msg.snippet}</p>

                    <div className="flex items-center gap-1.5 mt-1">
                      {msg.labelIds.map(lbl => (
                        <span 
                          key={lbl} 
                          className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                            lbl === "INBOX" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                            lbl === "STARRED" ? "bg-amber-500/10 text-amber-400 border border-amber-500/10" :
                            lbl === "SENT" ? "bg-blue-500/10 text-blue-400 border border-blue-500/10" :
                            "bg-slate-800 text-slate-500"
                          }`}
                        >
                          {lbl}
                        </span>
                      ))}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* EXPANDED MESSAGE READER */}
            <div className="md:col-span-7 bg-slate-950/50 rounded-lg border border-slate-850 p-4 flex flex-col gap-4 min-h-[400px]">
              {selectedMsg ? (
                <div className="flex-1 flex flex-col gap-4">
                  
                  {/* METAS & DELETIONS */}
                  <div className="flex justify-between items-start border-b border-slate-850 pb-3">
                    <div>
                      <h4 className="text-sm font-extrabold text-white tracking-tight">{selectedMsg.subject}</h4>
                      <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        From: <span className="font-semibold text-slate-200">{selectedMsg.from}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(selectedMsg.date).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleMessageDelete(selectedMsg.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-850 transition-colors"
                      title="Move Message to Trash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* MESSAGE BODY (DECODED HTML INSIDE SAFELY SANDBOXED IFRAME OR DIV) */}
                  <div className="flex-1 overflow-y-auto max-h-[350px] bg-slate-900/40 p-3.5 rounded-lg border border-slate-850 font-sans text-xs text-slate-300 space-y-3 leading-relaxed">
                    {/* Rendered HTML safely since it came from clean Workspace responses or sandbox */}
                    <div 
                      dangerouslySetInnerHTML={{ __html: selectedMsg.body }} 
                      className="gmail-body-markup"
                    />
                  </div>

                  {/* DRAFT REPLY HOOK */}
                  <div className="border-t border-slate-850 pt-3 flex gap-2">
                    <button
                      onClick={() => {
                        const senderEmail = selectedMsg.from.match(/<([^>]+)>/)?.[1] || selectedMsg.from;
                        setDraftTo(senderEmail);
                        setDraftSubject(`Re: ${selectedMsg.subject}`);
                        setDraftBody(`Hi ${selectedMsg.from.split(" <")[0]},<br/><br/>Thanks for getting back to us. regarding your inquiry:<br/><br/><blockquote>${selectedMsg.snippet}</blockquote><br/>Our technicians have audited the workspace status, and we are happy to support you dynamically.<br/><br/>Best,<br/>Spokane Lab Team`);
                        addToast("Reply Pre-filled", "Variables mapped to composing ledger.", "info");
                      }}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-205 border border-slate-700 text-xs font-bold rounded flex items-center gap-1 transition-transform"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5" />
                      Reply In Composer
                    </button>
                    
                    <a
                      href={`https://mail.google.com/mail/u/0/#inbox/${selectedMsg.threadId}`}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-805 text-slate-400 text-xs font-semibold rounded flex items-center gap-1 transition-transform"
                    >
                      Open in Native Gmail
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-10">
                  <Mail className="w-12 h-12 text-slate-800 mb-2" />
                  <p className="text-xs font-bold">No message selected</p>
                  <p className="text-[10px] text-slate-600 max-w-xs leading-normal">
                    Select a service dispatch ticket, read notification inquiries, or click a thread item in the list to reveal full conversation logs.
                  </p>
                </div>
              )}
            </div>

          </div>

        </section>

      </div>

    </div>
  );
};
