import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  PlusCircle, 
  RefreshCw, 
  ExternalLink, 
  FileText, 
  Check, 
  Clock, 
  User, 
  Phone, 
  Smartphone, 
  AlertTriangle, 
  Link as LinkIcon, 
  Trash2,
  Database,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  Lock
} from "lucide-react";
import { RepairTicket, HighPriorityLead } from "../types";

interface FormsIntegrationViewProps {
  accessToken: string | null;
  authUser: any;
  onLinkGoogleAuth: () => void;
  addToast: (title: string, message: string, type: "success" | "error" | "info" | "warning", duration?: number) => void;
  onAddNewTicket: (ticket: Omit<RepairTicket, "id" | "createdAt" | "userId">) => Promise<any>;
  onAddNewLead: (lead: { customerName: string; phone: string; deviceModel: string }) => Promise<any>;
}

interface FormItem {
  itemId: string;
  title: string;
  questionItem?: {
    question: {
      questionId: string;
      required?: boolean;
      textQuestion?: {
        paragraph?: boolean;
      };
    };
  };
}

interface GoogleFormDetails {
  formId: string;
  info: {
    title: string;
    description?: string;
    documentTitle?: string;
  };
  responderUri: string;
  items?: FormItem[];
}

interface FormResponse {
  responseId: string;
  createTime: string;
  lastSubmittedTime?: string;
  answers: {
    [questionId: string]: {
      questionId: string;
      textAnswers: {
        answers: { value: string }[];
      };
    };
  };
}

export const FormsIntegrationView: React.FC<FormsIntegrationViewProps> = ({
  accessToken,
  authUser,
  onLinkGoogleAuth,
  addToast,
  onAddNewTicket,
  onAddNewLead,
}) => {
  // Config & State
  const [formId, setFormId] = useState<string>(() => {
    return localStorage.getItem("dcp_google_form_id") || "";
  });
  const [customTitle, setCustomTitle] = useState("Display & Cell Pros - Digital Repair Intake");
  const [customDesc, setCustomDesc] = useState("Fast-track your repair. Complete this check-in form to authorize our Spokane diagnostic team.");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formDetails, setFormDetails] = useState<GoogleFormDetails | null>(null);
  const [submissions, setSubmissions] = useState<FormResponse[]>([]);
  

  // Read saved state on mount or mode switch
  useEffect(() => {
  }, [accessToken]);

  // Read saved form details on mount or mode switch
  useEffect(() => {
    if (formId) {
      localStorage.setItem("dcp_google_form_id", formId);
      if (accessToken) {
        fetchRealFormDetailsAndResponses();
      }
    } else {
      setFormDetails(null);
      setSubmissions([]);
    }
  }, [formId, accessToken]);

  const generateMockFormDetails = () => {
    const mockDetails: GoogleFormDetails = {
      formId: formId || "mock-form-spokane-101",
      info: {
        title: "Display & Cell Pros - Active Intake Form (Sandbox)",
        description: "Standard repair questionnaire used by cellular fleets.",
        documentTitle: "Active Intake Form (Sandbox)"
      },
      responderUri: "https://docs.google.com/forms/d/e/1FAIpQLScesandboxmode-spokane-wash-99/viewform",
      items: [
        { itemId: "q_name", title: "Customer Full Name", questionItem: { question: { questionId: "q_name", required: true } } },
        { itemId: "q_phone", title: "Contact Phone Number", questionItem: { question: { questionId: "q_phone", required: true } } },
        { itemId: "q_device", title: "Device Brand & Model", questionItem: { question: { questionId: "q_device", required: true } } },
        { itemId: "q_issue", title: "Explain what is broken", questionItem: { question: { questionId: "q_issue", textQuestion: { paragraph: true } } } },
        { itemId: "q_price", title: "Pre-Auth Limit ($)", questionItem: { question: { questionId: "q_price" } } }
      ]
    };
    setFormDetails(mockDetails);

    // Generate some mock submissions representing repairs in Spokane
    const mockResponses: FormResponse[] = [
      {
        responseId: "resp-001",
        createTime: new Date(Date.now() - 45 * 60000).toISOString(),
        answers: {
          "q_name": { questionId: "q_name", textAnswers: { answers: [{ value: "Jessica Miller" }] } },
          "q_phone": { questionId: "q_phone", textAnswers: { answers: [{ value: "509-338-1294" }] } },
          "q_device": { questionId: "q_device", textAnswers: { answers: [{ value: "iPhone 15 Pro Max (Titanium Blue)" }] } },
          "q_issue": { questionId: "q_issue", textAnswers: { answers: [{ value: "Cracked outer screen glass after drop in Riverfront Park. Digitizer functions fine." }] } },
          "q_price": { questionId: "q_price", textAnswers: { answers: [{ value: "150" }] } }
        }
      },
      {
        responseId: "resp-002",
        createTime: new Date(Date.now() - 3 * 3600000).toISOString(),
        answers: {
          "q_name": { questionId: "q_name", textAnswers: { answers: [{ value: "David Vance" }] } },
          "q_phone": { questionId: "q_phone", textAnswers: { answers: [{ value: "509-445-9201" }] } },
          "q_device": { questionId: "q_device", textAnswers: { answers: [{ value: "Samsung Galaxy S24 Ultra" }] } },
          "q_issue": { questionId: "q_issue", textAnswers: { answers: [{ value: "Water spill. Motherboard won't boot, green lines on screen when plugged into USB-C." }] } },
          "q_price": { questionId: "q_price", textAnswers: { answers: [{ value: "400" }] } }
        }
      },
      {
        responseId: "resp-003",
        createTime: new Date(Date.now() - 22 * 3605000).toISOString(),
        answers: {
          "q_name": { questionId: "q_name", textAnswers: { answers: [{ value: "Sarah Lindqvist" }] } },
          "q_phone": { questionId: "q_phone", textAnswers: { answers: [{ value: "509-881-2300" }] } },
          "q_device": { questionId: "q_device", textAnswers: { answers: [{ value: "iPad Air 5th Gen M1" }] } },
          "q_issue": { questionId: "q_issue", textAnswers: { answers: [{ value: "Charging port pins are burned out. Intermittent power delivery." }] } },
          "q_price": { questionId: "q_price", textAnswers: { answers: [{ value: "200" }] } }
        }
      }
    ];
    setSubmissions(mockResponses);
  };

  const fetchRealFormDetailsAndResponses = async () => {
    if (!accessToken || !formId) return;
    setIsLoading(true);
    try {
      // 1. Fetch form metadata
      const formUrl = `https://forms.googleapis.com/v1/forms/${formId}`;
      const metadataRes = await fetch(formUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!metadataRes.ok) {
        throw new Error(`Failed to load Google Form details (${metadataRes.status}). Ensure the Form ID is correct and you own it.`);
      }

      const mData = await metadataRes.json() as GoogleFormDetails;
      setFormDetails(mData);

      // 2. Fetch responses
      const responsesUrl = `https://forms.googleapis.com/v1/forms/${formId}/responses`;
      const responsesRes = await fetch(responsesUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (responsesRes.ok) {
        const rData = await responsesRes.json();
        setSubmissions(rData.responses || []);
        addToast(
          "Synced with Google Forms",
          `Fetched form structural metadata and ${rData.responses?.length || 0} active responses.`,
          "success",
          3000
        );
      } else {
        setSubmissions([]);
        console.warn("Could not retrieve responses list (No responses exist yet or permission boundary):", responsesRes.status);
      }
    } catch (err: any) {
      console.error("fetchRealFormDetailsAndResponses error:", err);
      addToast("Forms Connection Failure", err.message || "Could not retrieve document from Google Drive.", "error");
      setFormDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewForm = async () => {
    

    if (!accessToken) {
      addToast("Auth Token Expired", "Please link your Google session to provision forms.", "warning");
      return;
    }

    setIsCreating(true);
    try {
      // Step A: Create Form Container
      const createRes = await fetch("https://forms.googleapis.com/v1/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          info: {
            title: customTitle,
            description: customDesc
          }
        })
      });

      if (!createRes.ok) throw new Error(`Init create failed: ${createRes.status}`);
      const formObj = await createRes.json() as GoogleFormDetails;
      const createdId = formObj.formId;

      // Step B: BatchUpdate to inject our standardized cellular diagnostic questions
      const batchUpdateUrl = `https://forms.googleapis.com/v1/forms/${createdId}:batchUpdate`;
      const batchBody = {
        requests: [
          {
            createItem: {
              item: {
                title: "Customer Full Name",
                description: "Primary spelling for warranty registration.",
                questionItem: {
                  question: {
                    required: true,
                    textQuestion: { paragraph: false }
                  }
                }
              },
              location: { index: 0 }
            }
          },
          {
            createItem: {
              item: {
                title: "Contact Phone Number",
                description: "Spokane cellular fleet operations notify you here.",
                questionItem: {
                  question: {
                    required: true,
                    textQuestion: { paragraph: false }
                  }
                }
              },
              location: { index: 1 }
            }
          },
          {
            createItem: {
              item: {
                title: "Device Brand & Model",
                description: "e.g., iPhone 15 Pro, Samsung Galaxy S23, Pixel 8",
                questionItem: {
                  question: {
                    required: true,
                    textQuestion: { paragraph: false }
                  }
                }
              },
              location: { index: 2 }
            }
          },
          {
            createItem: {
              item: {
                title: "Explain What is Broken",
                description: "e.g., green screen lines, digitizer dead, ammeter power limits.",
                questionItem: {
                  question: {
                    required: true,
                    textQuestion: { paragraph: true }
                  }
                }
              },
              location: { index: 3 }
            }
          },
          {
            createItem: {
              item: {
                title: "Estimated Target Value / Repair Authorization Limit ($)",
                description: "Maximum budget limit for motherboard diagnostics.",
                questionItem: {
                  question: {
                    required: false,
                    textQuestion: { paragraph: false }
                  }
                }
              },
              location: { index: 4 }
            }
          }
        ]
      };

      const updateRes = await fetch(batchUpdateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(batchBody)
      });

      if (!updateRes.ok) throw new Error(`Inject questions failed: ${updateRes.status}`);

      setFormId(createdId);
      addToast(
        "Google Form Deployed!",
        "Successfully provisioned the Google Form and compiled questions on your Google Workspace Drive. Sharing Link is active.",
        "success"
      );
    } catch (error: any) {
      console.error("Form creation error:", error);
      addToast("Failed Deploying Form", error.message || "An error occurred with your Workspace permission boundaries.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  // Maps values dynamically looking at questions
  const extractResponseField = (response: FormResponse, needleTerm: string): string => {
    if (!formDetails || !formDetails.items) return "Unspecified";
    
    // Find item matching the text
    const targetItem = formDetails.items.find(item => 
      item.title.toLowerCase().includes(needleTerm.toLowerCase())
    );

    if (!targetItem) {
      // Fallback: try positional guess
      if (needleTerm === "name") return getAnswerByIndex(response, 0);
      if (needleTerm === "phone") return getAnswerByIndex(response, 1);
      if (needleTerm === "device") return getAnswerByIndex(response, 2);
      if (needleTerm === "issue") return getAnswerByIndex(response, 3);
      if (needleTerm === "price") return getAnswerByIndex(response, 4);
      return "Unknown";
    }

    const questionId = targetItem.questionItem?.question?.questionId || targetItem.itemId;
    const ans = response.answers[questionId];
    if (ans && ans.textAnswers && ans.textAnswers.answers && ans.textAnswers.answers[0]) {
      return ans.textAnswers.answers[0].value;
    }
    return "";
  };

  const getAnswerByIndex = (resp: FormResponse, index: number): string => {
    const keys = Object.keys(resp.answers);
    const targetKey = keys[index];
    if (!targetKey) return "";
    const ans = resp.answers[targetKey];
    if (ans?.textAnswers?.answers?.[0]) {
      return ans.textAnswers.answers[0].value;
    }
    return "";
  };

  const handleImportAsLead = async (resp: FormResponse) => {
    const name = extractResponseField(resp, "name") || "Google Customer";
    const phone = extractResponseField(resp, "phone") || "509-300-0000";
    const device = extractResponseField(resp, "device") || "Unknown Smartphone";
    const issue = extractResponseField(resp, "issue") || "Intake Checklist needed";

    const confirmed = window.confirm(`Import response from "${name}" as a High Priority Lead in Spokane repairs? This executes updates across persistent storage.`);
    if (!confirmed) return;

    try {
      await onAddNewLead({
        customerName: name,
        phone,
        deviceModel: `${device} (${issue.substring(0, 30)}...)`
      });
      addToast(
        "Lead Imported",
        `Created high-priority lead for ${name} based on Google form submission.`,
        "success"
      );
    } catch (err: any) {
      addToast("Import Error", err.message || "Could not write to lead registry", "error");
    }
  };

  const handleImportAsTicket = async (resp: FormResponse) => {
    const name = extractResponseField(resp, "name") || "Google Customer";
    const phone = extractResponseField(resp, "phone") || "509-300-0000";
    const device = extractResponseField(resp, "device") || "Unknown Smartphone";
    const issue = extractResponseField(resp, "issue") || "General maintenance";
    const preAuthStr = extractResponseField(resp, "price") || "200";
    const preAuthVal = parseFloat(preAuthStr.replace(/[^0-9.]/g, "")) || 180;

    const confirmed = window.confirm(`Generate active Repair Ticket in POS ledger for "${name}" with pre-authorized limit of $${preAuthVal}?`);
    if (!confirmed) return;

    try {
      await onAddNewTicket({
        customerName: name,
        companyName: "Google Forms Intake",
        device: device,
        issueType: issue.toLowerCase().includes("screen") ? "screen" : 
                   issue.toLowerCase().includes("battery") ? "battery" : "other",
        status: "open",
        quotedPrice: preAuthVal,
        tax: Number((preAuthVal * 0.089).toFixed(2)),
        discount: 0,
        total: Number((preAuthVal * 1.089).toFixed(2)),
        internalNotes: `Originally submitted in Google Forms. Issue summary:\n${issue}\nCustomer Phone: ${phone}`
      });
      addToast(
        "Active Ticket Compiled",
        `Created repair record for ${name} ($${preAuthVal.toFixed(2)} quota). Assigned to immediate Spokane technician dispatch.`,
        "success"
      );
    } catch (err: any) {
      addToast("Import Error", err.message || "Could not compile repair ticket", "error");
    }
  };

  const clearFormReference = () => {
    const confirmed = window.confirm("Are you sure you want to decouple this Google Form from the technician workspace? This will clear locally cached metadata.");
    if (confirmed) {
      setFormId("");
      setFormDetails(null);
      setSubmissions([]);
      localStorage.removeItem("dcp_google_form_id");
      addToast("Connection Decoupled", "Form reference has been cleared safely.", "info");
    }
  };

  return (
    <div id="forms-integration-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: CONTROL & PROVISIONING */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* CONNECTION CARD */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-wide uppercase">
              <Database className="w-4 h-4 text-blue-400 animate-pulse" />
              Auth Status
            </h3>
            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-extrabold">
              Production Live
            </span>
          </div>

          {!accessToken ? (
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-xs leading-relaxed text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  No Workspace Session
                </div>
                Connect your Spokane Google corporate account to programmatically create and monitor intake forms.
              </div>

              <button
                onClick={onLinkGoogleAuth}
                className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow transition-all duration-200 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Sign In with Google
              </button>
              
              <button
                onClick={() => {
                  
                  
                  addToast("Sandbox Initiated", "Switched to local simulation sandbox. No Google SSO required.", "info");
                }}
                className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold tracking-wide border border-slate-700 transition-colors"
              >
                Launch Sandbox Demo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-white uppercase tracking-tight">Access Link Validated</p>
                  <p className="text-slate-400 text-[11px] mt-0.5 font-mono truncate max-w-[200px]">{authUser?.email}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Google Forms scopes loaded successfully. Token active in-memory.
              </div>
            </div>
          )}
        </section>

        {/* CREATOR PANEL */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
              <PlusCircle className="w-4 h-4 text-blue-400" />
              Form Provisioner
            </h3>
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Form Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Form Header"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Introduction</label>
              <textarea
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                rows={3}
                placeholder="Description of the intake"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded text-xs text-white resize-none"
              />
            </div>

            <button
              onClick={handleCreateNewForm}
              disabled={isCreating}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Deploying on Drive...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Deploy New Google Form
                </>
              )}
            </button>
          </div>
        </section>

        {/* HOOK TO MANUAL FORM ID */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-3">
          <label className="text-xs font-extrabold text-white uppercase tracking-wider block">Connect Existing Form ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formId}
              onChange={(e) => setFormId(e.target.value)}
              placeholder="Enter Google Form ID"
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
            />
            {formId && (
              <button
                onClick={clearFormReference}
                className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 hover:text-red-400 border border-slate-700 rounded text-slate-400 text-xs transition-all"
                title="Decouple"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            To extract responses, paste the ID from your form's URL (located between `/forms/d/` and `/edit`).
          </p>
        </section>

      </div>

      {/* RIGHT COLUMN: SUBMISSIONS LIST */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* MAIN VIEWER HEADER */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex-1 flex flex-col min-h-[500px]">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
                  {formDetails ? formDetails.info.title : "Google Form Submissions Panel"}
                </h3>
                <p className="text-xs text-slate-400">
                  {formDetails ? `${submissions.length} Active Responses in register` : "Connect an Intake check-in sheet to pull device data."}
                </p>
              </div>
            </div>

            {formId && (
              <div className="flex items-center gap-2">
                {formDetails?.responderUri && (
                  <a
                    href={formDetails.responderUri}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded border border-slate-700 text-xs font-semibold transition-transform"
                  >
                    View Form
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                
                <button
                  onClick={fetchRealFormDetailsAndResponses}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-normal bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200 rounded text-xs font-semibold transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* INTERNAL CONTENT LOADING STATE */}
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <p className="text-xs text-slate-400 font-mono">Querying Workspace Sheets & Drive metadata...</p>
            </div>
          ) : !formId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-slate-800 rounded-lg text-center bg-slate-950/20">
              <FileSpreadsheet className="w-12 h-12 text-slate-700 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">No Form Connected</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 leading-normal">
                Initialize a custom intake form or connect an existing form by ID to stream customer repair listings directly.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    
                    
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all uppercase tracking-wide cursor-pointer"
                >
                  Try Sandbox Demo
                </button>
                <button
                  onClick={handleCreateNewForm}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all uppercase tracking-wide flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Create One Now
                </button>
              </div>
            </div>
          ) : submissions.length === 0 ? (
            <div id="no-submissions-slate" className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Clock className="w-12 h-12 text-slate-700 mb-2" />
              <h4 className="text-sm font-bold text-slate-300">Awaiting Submissions</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No submissions compiled on this spreadsheet. Send the link to the client to trigger real-time listings.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
              {submissions.map((response) => {
                const customerName = extractResponseField(response, "name");
                const phone = extractResponseField(response, "phone");
                const deviceModel = extractResponseField(response, "device");
                const issueExplain = extractResponseField(response, "issue");
                const targetBudget = extractResponseField(response, "price");

                return (
                  <div 
                    key={response.responseId}
                    className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl relative hover:border-blue-500/30 transition-all flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                          {customerName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white tracking-wide">{customerName}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {new Date(response.createTime).toLocaleString("en-US", {
                              hour: "numeric", minute: "2-digit", month: "short", day: "numeric"
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleImportAsLead(response)}
                          className="px-2.5 py-1 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase tracking-wide rounded transition-transform"
                        >
                          Import as Lead
                        </button>
                        <button
                          onClick={() => handleImportAsTicket(response)}
                          className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wide rounded transition-all shadow-md"
                        >
                          Create Repair Ticket
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="flex gap-2.5 text-slate-300">
                        <Phone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Contact</span>
                          <span className="font-semibold">{phone || "No phone listed"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2.5 text-slate-300">
                        <Smartphone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Device Specs</span>
                          <span className="font-semibold text-blue-400">{deviceModel || "Unknown hardware"}</span>
                        </div>
                      </div>

                      {targetBudget && (
                        <div className="flex gap-2.5 text-indigo-300">
                          <Check className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Auth Budget</span>
                            <span className="font-bold text-emerald-400">${targetBudget}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-slate-950 rounded-lg text-[11px] leading-relaxed text-slate-400 border border-slate-900 font-serif">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1 font-sans">Issue Breakdown:</span>
                      {issueExplain || "No detailed hardware breakdown annotated."}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </section>

      </div>
    </div>
  );
};
