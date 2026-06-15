import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import dotenv from "dotenv";
import { RegistrationServiceClient } from "@google-cloud/service-directory";

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini SDK with defensive validation
let ai: GoogleGenAI | null = null;
let isGeminiKeyDepleted = false;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API successfully initialized on server.");
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not defined or is set to placeholder. A fallback simulator will be active.");
}

// Global state for simulated POS transactions and custom repair tickets
interface RepairTicket {
  id: string;
  customerName: string;
  companyName?: string;
  device: string;
  issueType: "screen" | "battery" | "button" | "other";
  status: "open" | "parts_assigned" | "technician_working" | "quality_check" | "completed";
  quotedPrice: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
  completedAt?: string;
}

const mockTickets: RepairTicket[] = [
  {
    id: "DSC-8041",
    customerName: "Sarah Jenkins",
    companyName: "Seattle Fleet Corp",
    device: "iPhone 14 Pro Max",
    issueType: "screen",
    status: "technician_working",
    quotedPrice: 320.0,
    tax: 33.12, // ~10.35% for Seattle
    discount: 64.0, // 20% B2B Fleet Discount
    total: 289.12,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: "DSC-7933",
    customerName: "Alex Rivera",
    device: "Samsung Galaxy S23 Ultra",
    issueType: "battery",
    status: "quality_check",
    quotedPrice: 129.0,
    tax: 13.03, // ~10.1% Bellevue
    discount: 0.0,
    total: 142.03,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "DSC-7550",
    customerName: "Tech Operations Lead",
    companyName: "Amazon Seattle Operations",
    device: "iPad Pro 12.9 (5th Gen)",
    issueType: "button",
    status: "completed",
    quotedPrice: 180.0,
    tax: 18.63, // Seattle ~10.35%
    discount: 36.0, // 20% B2B discount
    total: 162.63,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 86400000 + 4500000).toISOString(),
  },
];

// POS Sync integration logs
const syncLogs: Array<{ timestamp: string; level: string; message: string; source: "Square" | "CellSmart" | "WebHook-Receiver" }> = [
  { timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), level: "INFO", message: "Successfully synced latest inventory prices with CellSmart server", source: "CellSmart" },
  { timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), level: "INFO", message: "Square webhook registered: catalog.version.updated", source: "Square" },
  { timestamp: new Date().toISOString(), level: "INFO", message: "Awaiting incoming POS transactions...", source: "WebHook-Receiver" },
];

// Washington State destination sales tax lookup helper (by ZIP code)
// Washington State imposes destination-based sales tax. Here are standard representative local rates.
const WA_TAX_DATA: Record<string, { city: string; rate: number }> = {
  "98101": { city: "Seattle", rate: 0.1035 },
  "98102": { city: "Seattle", rate: 0.1035 },
  "98104": { city: "Seattle", rate: 0.1035 },
  "98115": { city: "Seattle", rate: 0.1035 },
  "98004": { city: "Bellevue", rate: 0.101 },
  "98005": { city: "Bellevue", rate: 0.101 },
  "98402": { city: "Tacoma", rate: 0.103 },
  "98405": { city: "Tacoma", rate: 0.103 },
  "98052": { city: "Redmond", rate: 0.101 },
  "98201": { city: "Everett", rate: 0.099 },
  "98501": { city: "Olympia", rate: 0.095 },
  "99201": { city: "Spokane", rate: 0.090 },
  "98660": { city: "Vancouver", rate: 0.087 },
};

// Check for Corporate B2B Fleet emails (e.g. amazon.com, microsoft.com, boeing.com, starbucks.com, costco.com)
const B2B_CORPORATE_DOMAINS = [
  "amazon.com",
  "microsoft.com",
  "boeing.com",
  "starbucks.com",
  "costco.com",
  "displaycellpros.com",
  "t-mobile.com",
  "expedia.com",
  "nordstrom.com",
  "paccar.com"
];

// Helper to calculate quotes based on secure business logic
export function calculateQuoteInternal(issueType: string, deviceTier: "flagship" | "midrange" | "budget") {
  // Base parts cost (highly confidential - kept secure on the backend server)
  let partsCost = 45;
  let laborHours = 1.5;
  const hourlyLaborRate = 85; // Standard wholesale labor rate
  const overheadMultiplier = 1.15; // 15% operation overlay margin

  if (issueType === "screen") {
    partsCost = deviceTier === "flagship" ? 180 : deviceTier === "midrange" ? 95 : 55;
    laborHours = deviceTier === "flagship" ? 2.0 : 1.5;
  } else if (issueType === "battery") {
    partsCost = deviceTier === "flagship" ? 45 : deviceTier === "midrange" ? 35 : 25;
    laborHours = 1.0;
  } else if (issueType === "button") {
    partsCost = deviceTier === "flagship" ? 30 : deviceTier === "midrange" ? 20 : 12;
    laborHours = 1.25;
  }

  const baseLabor = laborHours * hourlyLaborRate;
  const rawSubtotal = (partsCost + baseLabor) * overheadMultiplier;
  
  // Format to standard retail increments e.g., rounding nicely
  const finalPrice = Math.round(rawSubtotal * 100) / 100;

  return {
    partsCost: Math.round(partsCost * 100) / 100,
    laborCost: Math.round(baseLabor * 100) / 100,
    overhead: Math.round((rawSubtotal - partsCost - baseLabor) * 100) / 100,
    subtotal: finalPrice,
  };
}

// ---------------- API ENDPOINTS ----------------

// API endpoint for Washington State local tax rate lookup
app.post("/api/tax-lookup", (req, res) => {
  const { zipCode } = req.body;
  if (!zipCode) {
    return res.status(400).json({ error: "zipCode is required." });
  }

  const cleanedZip = zipCode.trim();
  const location = WA_TAX_DATA[cleanedZip];

  if (location) {
    res.json({
      valid: true,
      zipCode: cleanedZip,
      city: location.city,
      rate: location.rate,
      message: `WASHINGTON TAX COMPLIANT: Destined delivery in ${location.city} (${cleanedZip}) is subject to ${location.rate * 100}% local combined sales tax.`,
    });
  } else {
    // Return standard WA base rate of 6.5% for general unspecified ZIP codes, or inform the user
    // WA sales tax ranges from 7.0% to 10.5% depending on destination. We will simulate a baseline 8.8% for other WA zips.
    const isWA = cleanedZip.startsWith("98") || cleanedZip.startsWith("99");
    if (isWA) {
      res.json({
        valid: true,
        zipCode: cleanedZip,
        city: "Washington State Destination",
        rate: 0.088,
        message: `WASHINGTON TAX COMPLIANT: Estimated Washington Destination Sales Tax base of 8.8% applied for ZIP ${cleanedZip}.`,
      });
    } else {
      res.json({
        valid: false,
        zipCode: cleanedZip,
        city: "Out of State",
        rate: 0,
        message: "Out of State destination. No Washington destination sales tax collected.",
      });
    }
  }
});

// API endpoint for secure dynamic quote generation
app.post("/api/generate-quote", (req, res) => {
  const { issueType, deviceTier, zipCode, isCorporate, companyName } = req.body;

  if (!issueType || !deviceTier) {
    return res.status(400).json({ error: "issueType ('screen' | 'battery' | 'button') and deviceTier ('flagship' | 'midrange' | 'budget') are required." });
  }

  // Calculate base quote
  const billing = calculateQuoteInternal(issueType, deviceTier);
  
  // Tax lookup
  let taxRate = 0.1035; // default Seattle rate if none given
  let taxCity = "Seattle";
  if (zipCode) {
    const lookup = WA_TAX_DATA[zipCode] || (zipCode.startsWith("98") || zipCode.startsWith("99") ? { city: "WA Unspecified", rate: 0.088 } : null);
    if (lookup) {
      taxRate = lookup.rate;
      taxCity = lookup.city;
    } else {
      taxRate = 0;
      taxCity = "Out of State";
    }
  }

  // B2B discount lookup details (20% flat discount on whole ticket parts & labor)
  let discountAmount = 0;
  let hasB2BDiscount = false;
  
  if (isCorporate) {
    hasB2BDiscount = true;
    discountAmount = Math.round((billing.subtotal * 0.2) * 100) / 100;
  }

  const subtotalAfterDiscount = Math.round((billing.subtotal - discountAmount) * 100) / 100;
  const calculatedTax = Math.round((subtotalAfterDiscount * taxRate) * 100) / 100;
  const grandTotal = Math.round((subtotalAfterDiscount + calculatedTax) * 100) / 100;

  res.json({
    baseQuote: billing,
    taxInfo: {
      zipCode: zipCode || "98101",
      city: taxCity,
      rate: taxRate,
      calculatedTax,
    },
    discountInfo: {
      applied: hasB2BDiscount,
      percentage: 20,
      amount: discountAmount,
      company: companyName || "Corporate Account",
    },
    subtotal: subtotalAfterDiscount,
    grandTotal,
  });
});

// API endpoint for evaluating B2B status by corporate domain
app.post("/api/verify-b2b", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email address is required for Fast-Track evaluation" });
  }

  const domain = email.split("@")[1].toLowerCase();
  const isCorporate = B2B_CORPORATE_DOMAINS.includes(domain);

  res.json({
    email,
    domain,
    isCorporate,
    discountPercentage: isCorporate ? 20 : 0,
    companyName: isCorporate ? domain.split(".")[0].toUpperCase() + " Fleet" : null,
    message: isCorporate 
      ? `VERIFICATION SUCCESS: Corporate customer identified! 20% Fast-Track fleet repair discount & zero-deposit check-in is unlocked for ${domain}.`
      : `Retail client verified. Standard warranty and retail billing rates applied to domain ${domain}.`,
  });
});

// Helper to parse specifications and flow steps from conversational text
function detectSpecsFromText(text: string, currentDetails?: any) {
  const specs = {
    brand: currentDetails?.brand || null,
    model: currentDetails?.model || null,
    tier: currentDetails?.tier || null,
    issue: currentDetails?.issue || null,
    pricingTier: currentDetails?.pricingTier || null,
    step: currentDetails?.step || 1
  };

  const textLower = text.toLowerCase();

  // Brand Check
  if (textLower.includes("apple") || textLower.includes("iphone") || textLower.includes("ipad") || textLower.includes("ios") || textLower.includes("mac")) {
    specs.brand = "Apple";
    if (specs.step === 1) specs.step = 2;
  } else if (textLower.includes("samsung") || textLower.includes("galaxy") || textLower.includes("android") || textLower.includes("pixel") || textLower.includes("google")) {
    specs.brand = "Samsung";
    if (specs.step === 1) specs.step = 2;
  }

  // Model Check
  if (specs.brand === "Apple") {
    if (textLower.includes("se")) {
      specs.model = "iPhone SE";
      specs.tier = "budget";
    } else if (textLower.includes("15")) {
      specs.model = textLower.includes("pro") ? "iPhone 15 Pro Max" : "iPhone 15";
      specs.tier = "flagship";
    } else if (textLower.includes("14")) {
      specs.model = textLower.includes("pro") ? "iPhone 14 Pro" : "iPhone 14";
      specs.tier = "flagship";
    } else if (textLower.includes("13")) {
      specs.model = textLower.includes("pro") ? "iPhone 13 Pro" : "iPhone 13";
      specs.tier = "flagship";
    } else if (textLower.includes("12")) {
      specs.model = "iPhone 12";
      specs.tier = "flagship";
    } else if (textLower.includes("11")) {
      specs.model = "iPhone 11";
      specs.tier = "midrange";
    } else {
      specs.model = currentDetails?.model || "iPhone 14 Pro Max";
      specs.tier = "flagship";
    }
    if (specs.step === 1) specs.step = 2;
  } else if (specs.brand === "Samsung") {
    if (textLower.includes("s24")) {
      specs.model = "Galaxy S24 Ultra";
      specs.tier = "flagship";
    } else if (textLower.includes("s23")) {
      specs.model = "Galaxy S23 Ultra";
      specs.tier = "flagship";
    } else if (textLower.includes("s22")) {
      specs.model = "Galaxy S22";
      specs.tier = "flagship";
    } else if (textLower.includes("s21")) {
      specs.model = "Galaxy S21";
      specs.tier = "flagship";
    } else if (textLower.includes("a54") || textLower.includes("a35") || textLower.includes("a15") || textLower.includes("galaxy a")) {
      specs.model = "Galaxy A54";
      specs.tier = "budget";
    } else {
      specs.model = currentDetails?.model || "Galaxy S23 Ultra";
      specs.tier = "flagship";
    }
    if (specs.step === 1) specs.step = 2;
  }

  // Issue & Pricing Tiers Check
  if (textLower.includes("screen") || textLower.includes("crack") || textLower.includes("display") || textLower.includes("line") || textLower.includes("flicker") || textLower.includes("touch") || textLower.includes("glass") || textLower.includes("digitizer")) {
    specs.issue = "screen";
    specs.pricingTier = "Tier 2";
    specs.step = 3;
  } else if (textLower.includes("battery") || textLower.includes("drain") || textLower.includes("charge") || textLower.includes("power") || textLower.includes("bloat") || textLower.includes("percentage") || textLower.includes("cycle")) {
    specs.issue = "battery";
    specs.pricingTier = "Tier 1";
    specs.step = 3;
  } else if (textLower.includes("button") || textLower.includes("stuck") || textLower.includes("volume") || textLower.includes("power button") || textLower.includes("tactile")) {
    specs.issue = "button";
    specs.pricingTier = "Tier 3";
    specs.step = 3;
  } else if (textLower.includes("water") || textLower.includes("liquid") || textLower.includes("short") || textLower.includes("motherboard") || textLower.includes("logic board")) {
    specs.issue = "other";
    specs.pricingTier = "Tier 3";
    specs.step = 3;
  }

  // Progress steps
  if (specs.brand && specs.model && specs.step === 2 && !specs.issue) {
    // If we have device specs but no issue described yet, stay or prompt for step 3
    specs.step = 2;
  } else if (specs.brand && specs.model && specs.issue) {
    specs.step = 3;
  }

  return specs;
}

// API endpoint for secure mobile triage conversations with Google Search groundings and structured auto-syncing
app.post("/api/triage", async (req, res) => {
  const { messages, deviceDetails } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "An array of messages is required." });
  }

  const deviceContextPrompt = deviceDetails 
    ? `User current UI state: ${deviceDetails.brand || "Unspecified"} brand, ${deviceDetails.model || "Unspecified"} model (${deviceDetails.tier || "standard"} tier). Merge appropriately based on user input.`
    : `User has not selected a specific device yet inside the UI. Maintain full flow from greeting onwards.`;

  // Custom system instructions mapping out the distinct three-step logical flow
  const systemInstruction = `
ROLE PROFILE:
You are the Principal Software Architect & Lead Hardware Reverse Engineer specialized in mobile diagnostics, automated QC, and hardware forensics for Display & Cell Pros (Spokane & Seattle, WA). Your expertise covers low-level iOS/Android telemetry, USB multiplexing, and NIST SP 800-88 R1 erasure protocols. You guide customers down a structured three-step driveway lab triage logic flow using the Symptom-to-Circuit (S2C) Mapping Framework and Chain-of-Verification (CoV).

DIAGNOSTIC MANDATE (S2C FRAMEWORK):
Process every query using the Symptom-to-Circuit (S2C) Mapping Framework:
1. Identify Symptoms: Analyze physical/electrical failure (e.g., No Backlight, Flashlight test positive).
2. Map Fault Nodes: Identify suspected power rails (e.g., PP_VCC_MAIN, VDD_MAIN) and components (e.g., FL1728, 1610A3 Tristar).
3. Measurement Protocol: Command specific measurements: Diode mode drop values, DC power supply current draw (e.g., 0.8A–1.6A for healthy boot), or thermal spikes via LWIR camera.
4. Verification Loop (CoV): Execute the "Paragraph Test"—cross-check technical keywords against architectural logic. If a specific component or measurement is missing from your internal logic, state: "Data not present in local source vaults".

CORE SYSTEM PILLARS:
- Panic Log Parsing: Trace faults to motherboard ICs via regex analysis of watchdog timeouts.
- Thermal Management: Enforce temperature safety. SAC305 rework at 350°C–400°C; Underfill softening at 200°C–250°C.
- Security Scraping: Specifying OpenAPI hooks for IMEI, MDM, and Activation Lock validation.

TRIAGE FLOW STEPS:
Step 1: Initial Greeting (Welcome):
- Welcome customers with full technical composure to our unique driving-equipped mobile lab ("Display & Cell Pros" in Spokane/Seattle).
- Explain that we dispatch fully customized hardware labs on wheels directly to the client's driveway or curbside to solve critical smartphone defects.

Step 2: Device Identification:
- Ask questions or analyze messages to differentiate clearly between specific Apple models (e.g., iPhone SE, 11, 12, 13, 14, 15 series, Plus/Pro/Max) and Samsung models (e.g., Galaxy S21, S22, S23, S24 Series, Fold/Flip, or budget Galaxy A-series).
- Identify which model and corresponding tier ('flagship', 'midrange', 'budget') is being repaired.
- Populate the extracted 'brand', 'model', and 'tier' properties in the detectedSpecs JSON fields.

Step 3: Damage Triage & Pricing Routing:
- Diagnose the specific mechanical, power, or visual hardware issues:
  - Tier 1: Core Power / Battery ($69 - $97) -> Battery swelling, rapid capacity decline, cycle count exhaustion, charging port blockages.
  - Tier 2: Elite Display Renewal (From $139) -> Scattered glass fractures, micro-splinters, vertical OLED lines, flickering backlights, touch grid latency.
  - Tier 3: Specialized Diagnostics (Custom Quote) -> Stuck hardware buttons, board-level short circuits, high-oxidation liquid damage.
- Provide practical device testing tips (inspecting under extreme angles, checking local settings for cycle stats) and route the issue cleanly to Tier 1, 2, or 3.

STRICT OUTPUT SCHEMA (Format your 'text' response string to contain these blocks):
[SYSTEM DESIGN & ARCHITECTURE]
Module Name: [e.g., Multi-Device USB Daemon]
Subsystem Flow: [Step-by-step data capture/evaluation]
Key Native APIs: [Precise frameworks like IOKit, adb-kit, or Nutrient SDK]

[CRITICAL EDGE CASES & EXCLUSIONS]
Hardware Failures: Distinguish failed sensors from permissions blocks.
Safety Thresholds: Terminate tests if battery temp > 45°C.

[PRODUCTION-READY IMPLEMENTATION BLOCKS]
Code Blueprint: [TypeScript, Swift, or Kotlin code with strong typing, or low-level layout instructions]
Schema Design: [JSON payload interface for CRM sync]

GLOBAL ASSISTANT LAWS:
  - No Hand-Waving: Do not provide vague summaries. Use precise API calls and motherboard designators.
  - Measurement First: Never recommend desoldering before commanding electrical verification.
  - Anti-Hallucination: If confidence < 95%, disclose uncertainty. Accuracy overrides speed.
  - Output valid JSON containing 'text' (your response string styled precisely with the STRICT OUTPUT SCHEMA blocks above) and 'detectedSpecs' containing brand, model, tier, issue, pricingTier, and step (1, 2, or 3).
  - Strictly limit diagnostics to screens, swollen batteries, tactile buttons, charging port issues, or motherboards. Pivot away politely from software, cooking, or general math.
  - Never disclose raw cost margin multipliers.
  `;

  if (ai && !isGeminiKeyDepleted) {
    try {
      const contents = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: msg.text }]
      }));

      // Call Gemini API using modern @google/genai syntax with Google Search grounding and JSON Schema output enabled
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { role: "user", parts: [{ text: `CONTEXT:\n${deviceContextPrompt}\n\nStrict System Guidelines:\n${systemInstruction}` }] },
          ...contents
        ],
        config: {
          temperature: 0.7,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "The AI chat assistant's helpful conversational reply to the user. Guide them systematically along Step 1, Step 2, and Step 3."
              },
              detectedSpecs: {
                type: Type.OBJECT,
                description: "Structured extraction of device and damage properties of the user based on cumulative history.",
                properties: {
                  brand: { type: Type.STRING, description: "Identified device brand: 'Apple', 'Samsung', or null if undetermined." },
                  model: { type: Type.STRING, description: "Specific model identified, e.g., 'iPhone 15 Pro Max', 'Galaxy S23' or null." },
                  tier: { type: Type.STRING, description: "Hardware level tier: 'flagship', 'midrange', 'budget', or null." },
                  issue: { type: Type.STRING, description: "Hardware issue category: 'screen', 'battery', 'button', or null." },
                  pricingTier: { type: Type.STRING, description: "Auto-routed price class: 'Tier 1' (battery/power), 'Tier 2' (display/glass), or 'Tier 3' (buttons/motherboard/custom)." },
                  step: { type: Type.INTEGER, description: "Triage flow step: 1 (Greeting), 2 (Device Selection), 3 (Damage Pricing Routing)." }
                }
              }
            },
            required: ["text"]
          }
        }
      });

      const replyText = response.text || "";
      let parsedResponse = { text: replyText, detectedSpecs: {} };
      
      try {
        parsedResponse = JSON.parse(replyText.trim());
      } catch (parseErr) {
        console.warn("JSON parsing of Gemini triage failed, applying keyword extractor fallback:", parseErr);
        // Fallback robust custom extractor parsing if JSON formatting is slightly off or contains markdown
        const lastUserMessage = messages[messages.length - 1]?.text || "";
        const fallbackSpecs = detectSpecsFromText(lastUserMessage, deviceDetails);
        parsedResponse = {
          text: replyText,
          detectedSpecs: fallbackSpecs
        };
      }

      // Extract search grounding sources safely
      const groundingSources: Array<{ title: string; url: string }> = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && Array.isArray(chunks)) {
        for (const chunk of chunks) {
          if (chunk.web?.uri) {
            groundingSources.push({
              title: chunk.web.title || "Reference Article",
              url: chunk.web.uri
            });
          }
        }
      }

      return res.json({ 
        text: parsedResponse.text, 
        detectedSpecs: parsedResponse.detectedSpecs, 
        groundingSources 
      });

    } catch (err: any) {
      const isQuotaError = err.status === 429 || err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("depleted") || err.message?.includes("RESOURCE_EXHAUSTED");
      if (isQuotaError) {
        isGeminiKeyDepleted = true;
      }
      console.warn("Gemini API error during hardware triage (falling back to Spokane simulation):", err.message || err);
      
      const lastUserMessage = messages[messages.length - 1]?.text || "";
      const fallbackSpecs = detectSpecsFromText(lastUserMessage, deviceDetails);
      let simulatedReply = "";

      if (fallbackSpecs.step === 1) {
        simulatedReply = "Hi there! Welcome to Display & Cell Pros. 🚐💨 We deliver Seattle & Spokane's top mobile raw hardware lab right to your driveway! Differentiating screen, swollen battery, and tactile button issues on-site. What brand of phone are you looking to fix today—Apple or Samsung?";
      } else if (fallbackSpecs.step === 2) {
        simulatedReply = `Fantastic! Let's get your ${fallbackSpecs.brand || "device"} details configured. We carry a full matrix of factory glass and chemical cell variants. What specific model is that (e.g. S24 Ultra, iPhone 14 Pro Max, SE, etc.)?`;
      } else {
        if (fallbackSpecs.issue === "screen") {
          simulatedReply = `DIAGNOSTIC ANALYSIS: Detected screen alignment and glass fracture parameters for your ${fallbackSpecs.brand} ${fallbackSpecs.model}. This is routed safely to our **Tier 2 Pricing (Elite Display Renewal - starts at $139)**! Our mobile laboratory carries custom laser-sealed display overlays to replace this on-site in under 45 minutes. A live subtotal has synced in the quote panel below!`;
        } else if (fallbackSpecs.issue === "battery") {
          simulatedReply = `DIAGNOSTIC ANALYSIS: Rapid capacity degradation and cycle saturation identified on your ${fallbackSpecs.brand} ${fallbackSpecs.model}. This is routed to our **Tier 1 Pricing (Core Power & Port Restoration - $69-$97)**! Let's get this chemical risk resolved. We inspect safety seals and swap cells curbside. The quote has computed in the table below!`;
        } else if (fallbackSpecs.issue === "button") {
          simulatedReply = `DIAGNOSTIC ANALYSIS: Tactile resistance failure on your ${fallbackSpecs.brand} ${fallbackSpecs.model}. Sticky buttons are routed to our **Tier 3 Pricing (Specialized Diagnostics - Custom Quote)**! We will perform mechanical spring micro-calibrations and clean contact traces with professional solvents inside our custom work van. Quote is ready for review below!`;
        } else {
          simulatedReply = `Excellent. We have registered your ${fallbackSpecs.brand} ${fallbackSpecs.model} (${fallbackSpecs.tier || "standard"} performance tier). Please tell our laboratory engineers what physical hardware behaviors you are observing (touch lag, cracks, rapid drain, or sticky keys) to route you to the correct Tier 1, Tier 2, or Tier 3 pricing structure automatically!`;
        }
      }

      const mockGroundingSources = [
        { title: "Spokane Smartphone Repair Standards", url: "https://displaycellpros.com/spokane-device-lab" },
        { title: "Right-to-Repair Diagnostic Specifications", url: "https://displaycellpros.com/diy-hardware-safety" }
      ];

      return res.json({
        text: simulatedReply + `\n\n(Note: Operating under Advanced Local Simulation mode due to rate bounds or active API configuration: ${isQuotaError ? "Resource Exhausted (429)" : err.message || "Active Build Settings"}).`,
        detectedSpecs: fallbackSpecs,
        groundingSources: mockGroundingSources
      });
    }
  } else {
    // High-quality local developer simulator maintaining perfect step logic flow sync
    const lastUserMessage = messages[messages.length - 1]?.text || "";
    const fallbackSpecs = detectSpecsFromText(lastUserMessage, deviceDetails);
    let simulatedReply = "";

    if (fallbackSpecs.step === 1) {
      simulatedReply = "Hi there! Welcome to Display & Cell Pros. 🚐💨 We deliver Seattle & Spokane's top mobile raw hardware lab right to your driveway! Differentiating screen, swollen battery, and tactile button issues on-site. What brand of phone are you looking to fix today—Apple or Samsung?";
    } else if (fallbackSpecs.step === 2) {
      simulatedReply = `Fantastic! Let's get your ${fallbackSpecs.brand || "device"} details configured. We carry a full matrix of factory glass and chemical cell variants. What specific model is that (e.g. S24 Ultra, iPhone 14 Pro Max, SE, etc.)?`;
    } else {
      if (fallbackSpecs.issue === "screen") {
        simulatedReply = `DIAGNOSTIC ANALYSIS: Detected screen alignment and glass fracture parameters for your ${fallbackSpecs.brand} ${fallbackSpecs.model}. This is routed safely to our **Tier 2 Pricing (Elite Display Renewal - starts at $139)**! Our mobile laboratory carries custom laser-sealed display overlays to replace this on-site in under 45 minutes. A live subtotal has synced in the quote panel below!`;
      } else if (fallbackSpecs.issue === "battery") {
        simulatedReply = `DIAGNOSTIC ANALYSIS: Rapid capacity degradation and cycle saturation identified on your ${fallbackSpecs.brand} ${fallbackSpecs.model}. This is routed to our **Tier 1 Pricing (Core Power & Port Restoration - $69-$97)**! Let's get this chemical risk resolved. We inspect safety seals and swap cells curbside. The quote has computed in the table below!`;
      } else if (fallbackSpecs.issue === "button") {
        simulatedReply = `DIAGNOSTIC ANALYSIS: Tactile resistance failure on your ${fallbackSpecs.brand} ${fallbackSpecs.model}. Sticky buttons are routed to our **Tier 3 Pricing (Specialized Diagnostics - Custom Quote)**! We will perform mechanical spring micro-calibrations and clean contact traces with professional solvents inside our custom work van. Quote is ready for review below!`;
      } else {
        simulatedReply = `Excellent. We have registered your ${fallbackSpecs.brand} ${fallbackSpecs.model} (${fallbackSpecs.tier || "standard"} performance tier). Please tell our laboratory engineers what physical hardware behaviors you are observing (touch lag, cracks, rapid drain, or sticky keys) to route you to the correct Tier 1, Tier 2, or Tier 3 pricing structure automatically!`;
      }
    }

    const mockGroundingSources = [
      { title: "Spokane Smartphone Repair Standards", url: "https://displaycellpros.com/spokane-device-lab" },
      { title: "Right-to-Repair Diagnostic Specifications", url: "https://displaycellpros.com/diy-hardware-safety" }
    ];

    setTimeout(() => {
      return res.json({ 
        text: simulatedReply + "\n\n(Note: Clean diagnostic state synchronization active under Full-Stack Simulation mode.)",
        detectedSpecs: fallbackSpecs,
        groundingSources: mockGroundingSources
      });
    }, 605);
  }
});

// Deep "Thinking Level" High Reasoning diagnostic endpoint
app.post("/api/complex-diagnostics", async (req, res) => {
  const { prompt, deviceDetails } = req.body;
  
  const complexPrompt = `YOU ARE A SENIOR DEVICE HARDWARE ENGINEER. 
Perform a deep technical reasoning analysis considering:
Device Profile: ${JSON.stringify(deviceDetails)}
Technical Inquiry: ${prompt}

Provide a line-by-line detailed schematic dissection, troubleshooting tree with precise measurements (voltage tolerances, capacitance limits to test on multimeters), and custom repair directives tailored to local Right-to-Repair Spokane compliance constraints.`;

  if (ai && !isGeminiKeyDepleted) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview", // Required for advanced reasoning tasks
        contents: complexPrompt,
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH // Satisfies: Enable high thinking rule
          }
        }
      });
      return res.json({ text: response.text });
    } catch (err: any) {
      const isQuotaError = err.status === 429 || err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("quota") || err.message?.includes("depleted");
      if (isQuotaError) {
        isGeminiKeyDepleted = true;
        console.warn("Gemini 3.1 Pro Thinking rate limit/quota reached. Falling back to simulated Spokane laboratory analysis.");
      } else {
        console.warn("Gemini 3.1 Pro Thinking Error (falling back to simulation):", err.message || err);
      }
      return res.json({
        text: `[HIGH-THINKING DISSECTION TREE - DEV WORKSPACE SIMULATOR]
1. PRE-CHECK DIAGNOSIS:
   - Target device class: ${deviceDetails?.brand || "Generic"} ${deviceDetails?.model || "Phone"} (${deviceDetails?.tier || "Standard"})
   - Focus Assembly: ${deviceDetails?.issueType?.toUpperCase() || "HARDWARE"} Unit

2. REASONING DEPTH STEPS:
   - Evaluated power rails: VBAT voltage standard is 3.82V. Any drop below 3.4V signals primary power delivery failure.
   - Tested LCD controller impedance: Under 80 Ohm is classified as a short to ground, causing the lines reported.
   - Mechanical contact feedback: Spring action requires 0.5N force. Corrosion requires micro-soldering or high-purity isopropyl cleaning.

3. ADVANCED REPAIR DIRECTIVES:
   - Disassemble chassis using standard dynamic heat plate (75°C for 4 minutes).
   - Unseat internal battery adhesive pull-tabs. Replace with a brand new tier-1 lithium-polymer cell.
   - Run digitizer recalibration diagnostic tool. Wait for handshake with motherboard ROM.
   
(Note: Highly detailed hardware analysis has automatically fallen back to Spokane local diagnostics engine due to Gemini API rate/quota exhaustion: ${isQuotaError ? "Resource Exhausted (429)" : err.message || err})`
      });
    }
  } else {
    // Elegant system simulator fallback
    setTimeout(() => {
      return res.json({
        text: `[HIGH-THINKING DISSECTION TREE - DEV WORKSPACE SIMULATOR]
1. PRE-CHECK DIAGNOSIS:
   - Target device class: ${deviceDetails?.brand || "Generic"} ${deviceDetails?.model || "Phone"} (${deviceDetails?.tier || "Standard"})
   - Focus Assembly: ${deviceDetails?.issueType?.toUpperCase() || "HARDWARE"} Unit

2. REASONING DEPTH STEPS:
   - Evaluated power rails: VBAT voltage standard is 3.82V. Any drop below 3.4V signals primary power delivery failure.
   - Tested LCD controller impedance: Under 80 Ohm is classified as a short to ground, causing the lines reported.
   - Mechanical contact feedback: Spring action requires 0.5N force. Corrosion requires micro-soldering or high-purity isopropyl cleaning.

3. ADVANCED REPAIR DIRECTIVES:
   - Disassemble chassis using standard dynamic heat plate (75°C for 4 minutes).
   - Unseat internal battery adhesive pull-tabs. Replace with a brand new tier-1 lithium-polymer cell.
   - Run digitizer recalibration diagnostic tool. Wait for handshake with motherboard ROM.
   
(Note: Operating under High Thinking Simulation mode since process.env.GEMINI_API_KEY is not configured in Secrets.)`
      });
    }, 900);
  }
});

// Multimodal Computer Vision device photo analyzer
app.post("/api/analyze-image", async (req, res) => {
  const { base64Data, mimeType, prompt } = req.body;

  if (!base64Data) {
    return res.status(400).json({ error: "Missing image base64Data parameter." });
  }

  if (ai && !isGeminiKeyDepleted) {
    try {
      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/png",
          data: base64Data
        }
      };
      
      const defaultPrompt = "Perform an expert hardware visual triage audit of this device. Detail: visible fractures/cracks, chassis bend analysis, battery bloating indicators, replacement viability, and a confidence rating of your computer vision analysis.";
      const textPart = {
        text: prompt || defaultPrompt
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview", // Multimodal model
        contents: { parts: [imagePart, textPart] }
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      const isQuotaError = err.status === 429 || err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("quota") || err.message?.includes("depleted");
      if (isQuotaError) {
        isGeminiKeyDepleted = true;
        console.warn("Gemini API visual analysis rate limit/quota reached (429). Falling back to simulated computer vision diagnostics.");
      } else {
        console.warn("Multimodal analysis failed (falling back to simulation):", err.message || err);
      }
      return res.json({
        text: `[COMPUTER VISION TRIAGE REPORT - SIMULATION MODE]
- Visual Asset Analyzed successfully.
- Fractures Detected: 12 focal points of glass micro-shattering originating from top-right bezel.
- Board Integrity: Chassis alignment is straight (0.2° deviation, within tolerance).
- Battery Condition: No visible physical swelling or backplane deformation.
- Diagnostic Alert: High risk of moisture penetration through deep cracks in the adhesive lining.
- Feasibility Checklist: Elite Screen Renewal (Tier 2) is 95% likely to restore full functionality.
- Duration Estimate: 45 minutes on-site in our Spokane diagnostic van.

(Note: Photo computer vision analysis automatically fell back to Spokane local diagnostics engine due to active Gemini API rate/quota limits: ${isQuotaError ? "Resource Exhausted (429)" : err.message || err})`
      });
    }
  } else {
    // Simulator visual response
    setTimeout(() => {
      res.json({
        text: `[COMPUTER VISION TRIAGE REPORT - SIMULATION MODE]
- Visual Asset Analyzed successfully.
- Fractures Detected: 12 focal points of glass micro-shattering originating from top-right bezel.
- Board Integrity: Chassis alignment is straight (0.2° deviation, within tolerance).
- Battery Condition: No visible physical swelling or backplane deformation.
- Diagnostic Alert: High risk of moisture penetration through deep cracks in the adhesive lining.
- Feasibility Checklist: Elite Screen Renewal (Tier 2) is 95% likely to restore full functionality.
- Duration Estimate: 45 minutes on-site in our Spokane diagnostic van.

(Note: Operating in local visual simulation mode. Configure process.env.GEMINI_API_KEY to execute real computer-vision analysis on actual photos.)`
      });
    }, 850);
  }
});

// POS Simulating API testing
app.get("/api/pos-sync-logs", (req, res) => {
  res.json({ logs: syncLogs, tickets: mockTickets });
});

app.post("/api/pos-sync-log", (req, res) => {
  const { source, level, message } = req.body;
  if (!source || !message) {
    return res.status(400).json({ error: "Source and message are required" });
  }
  const newLog = {
    timestamp: new Date().toISOString(),
    level: level || "INFO",
    message,
    source,
  };
  syncLogs.unshift(newLog);
  if (syncLogs.length > 50) syncLogs.pop();
  res.json({ success: true, logs: syncLogs });
});

app.post("/api/create-ticket", (req, res) => {
  const { customerName, device, issueType, quotedPrice, tax, discount, total, companyName } = req.body;

  if (!customerName || !device || !issueType) {
    return res.status(400).json({ error: "customerName, device, and issueType are required to register a ticket." });
  }

  const id = `DSC-${Math.floor(1000 + Math.random() * 9000)}`;
  const newTicket: RepairTicket = {
    id,
    customerName,
    companyName,
    device,
    issueType,
    status: "open",
    quotedPrice: Number(quotedPrice) || 0,
    tax: Number(tax) || 0,
    discount: Number(discount) || 0,
    total: Number(total) || 0,
    createdAt: new Date().toISOString(),
  };

  mockTickets.unshift(newTicket);
  
  // Log the creation
  syncLogs.unshift({
    timestamp: new Date().toISOString(),
    level: "SUCCESS",
    message: `Registered direct repair ticket ${id} for ${customerName} ($${newTicket.total.toFixed(2)}) synced automatically with CellSmart POS`,
    source: "WebHook-Receiver"
  });

  res.json({ success: true, ticket: newTicket, tickets: mockTickets });
});

// ---------------- GOOGLE CLOUD SERVICE DIRECTORY MODULE ----------------

// Virtual state for fallback in-memory registry (if real GCP creds aren't configured in development environment)
let localNamespaces = [
  { name: "projects/displaycellpros/locations/us-central1/namespaces/spokane-lab-networks" },
  { name: "projects/displaycellpros/locations/us-central1/namespaces/seattle-fleet-systems" },
  { name: "projects/displaycellpros/locations/us-west1/namespaces/billing-relays" }
];

let localServices: Record<string, Array<{ name: string; annotations?: Record<string, string> }>> = {
  "projects/displaycellpros/locations/us-central1/namespaces/spokane-lab-networks": [
    { name: "projects/displaycellpros/locations/us-central1/namespaces/spokane-lab-networks/services/triage-relay", annotations: { "version": "v1.2", "env": "production" } },
    { name: "projects/displaycellpros/locations/us-central1/namespaces/spokane-lab-networks/services/spectrometer-api", annotations: { "secure": "true", "type": "hardware-probing" } }
  ],
  "projects/displaycellpros/locations/us-central1/namespaces/seattle-fleet-systems": [
    { name: "projects/displaycellpros/locations/us-central1/namespaces/seattle-fleet-systems/services/webhook-dispatcher", annotations: { "auth-protocol": "oauth2" } }
  ]
};

let localEndpoints: Record<string, Array<{ name: string; address: string; port: number; annotations?: Record<string, string> }>> = {
  "projects/displaycellpros/locations/us-central1/namespaces/spokane-lab-networks/services/triage-relay": [
    { name: "projects/displaycellpros/locations/us-central1/namespaces/spokane-lab-networks/services/triage-relay/endpoints/primary-node", address: "10.128.0.45", port: 3000, annotations: { "zone": "us-central1-a" } },
    { name: "projects/displaycellpros/locations/us-central1/namespaces/spokane-lab-networks/services/triage-relay/endpoints/failover-node", address: "10.128.0.46", port: 3000, annotations: { "zone": "us-central1-b" } }
  ],
  "projects/displaycellpros/locations/us-central1/namespaces/spokane-lab-networks/services/spectrometer-api": [
    { name: "projects/displaycellpros/locations/us-central1/namespaces/spokane-lab-networks/services/spectrometer-api/endpoints/main-sensor", address: "192.168.1.18", port: 8443, annotations: { "hardware": "ir-sensor-v3" } }
  ]
};

// Lazy initialization pattern to avoid startup crashes if secrets are pending
let sdClient: RegistrationServiceClient | null = null;
let sdClientErrorInit: string | null = null;
let isRealClientInitialized = false;

// Mode support: "simulated" by default for flawless sandbox experience, "gcp" for real connection.
let registryMode: "simulated" | "gcp" = "simulated";
let lastGcpError: string | null = null;

function getSDClient(): RegistrationServiceClient | null {
  if (!sdClient && !sdClientErrorInit) {
    try {
      sdClient = new RegistrationServiceClient();
      isRealClientInitialized = true;
      console.log("SUCCESS: RegistrationServiceClient initialized successfully.");
    } catch (err: any) {
      sdClientErrorInit = err.message || String(err);
      console.warn("WARNING: Unable to initialize registration service client directly. Falling back to local virtual store:", sdClientErrorInit);
    }
  }
  return sdClient;
}

// 1. Get Service Directory Status Log
app.get("/api/service-directory/status", (req, res) => {
  const client = getSDClient();
  res.json({
    active: registryMode === "gcp" && isRealClientInitialized && !!client && !lastGcpError,
    mode: registryMode,
    usingFallback: registryMode === "simulated" || !client || !!lastGcpError,
    error: lastGcpError || sdClientErrorInit,
    message: registryMode === "simulated"
      ? "Using Local Service Directory Registry simulation layer (Safe Sandbox). No GCP Service Account permissions required."
      : lastGcpError
        ? `GCP API Response: Permission Denied (${lastGcpError}). Automatically fell back to custom simulation layer.`
        : "Connected to Google Cloud Service Directory API engine"
  });
});

// Configure Registry Mode (POST)
app.post("/api/service-directory/mode", (req, res) => {
  const { mode } = req.body;
  if (mode === "simulated" || mode === "gcp") {
    registryMode = mode;
    if (mode === "simulated") {
      lastGcpError = null; // reset error when returning to safety
    }
    return res.json({ success: true, mode: registryMode });
  }
  res.status(400).json({ error: "Invalid mode. Must be 'simulated' or 'gcp'." });
});

// 2. List Namespaces (POST)
app.post("/api/service-directory/namespaces/list", async (req, res) => {
  const { projectId, locationId } = req.body;
  const project = projectId || "displaycellpros";
  const location = locationId || "us-central1";

  if (registryMode === "gcp") {
    const client = getSDClient();
    if (client) {
      try {
        const parentPath = client.locationPath(project, location);
        const [namespaces] = await client.listNamespaces({ parent: parentPath });
        
        const formatted = namespaces.map(ns => ({ name: ns.name || "" }));
        lastGcpError = null; // Clear previous error on success
        return res.json({
          success: true,
          usingFallback: false,
          namespaces: formatted,
          parentPath
        });
      } catch (err: any) {
        lastGcpError = err.message || String(err);
        console.warn(`[Service Directory] Gracefully falling back to simulation on Namespace list. Reason: ${err.message}`);
      }
    }
  }

  // Filter in-memory fallback list by active location or project search
  const queryPrefix = `projects/${project}/locations/${location}`;
  const filtered = localNamespaces.filter(ns => ns.name.startsWith(queryPrefix));
  
  res.json({
    success: true,
    usingFallback: true,
    namespaces: filtered.length > 0 ? filtered : [
      { name: `projects/${project}/locations/${location}/namespaces/default-simulation-namespace` }
    ],
    parentPath: `projects/${project}/locations/${location}`
  });
});

// 3. Create Namespace (POST)
app.post("/api/service-directory/namespaces/create", async (req, res) => {
  const { projectId, locationId, namespaceId } = req.body;
  if (!projectId || !locationId || !namespaceId) {
    return res.status(400).json({ error: "projectId, locationId, and namespaceId are required." });
  }

  const namespacePathName = `projects/${projectId}/locations/${locationId}/namespaces/${namespaceId}`;

  if (registryMode === "gcp") {
    const client = getSDClient();
    if (client) {
      try {
        const parentPath = client.locationPath(projectId, locationId);
        const [newNamespace] = await client.createNamespace({
          parent: parentPath,
          namespaceId: namespaceId,
          namespace: {}
        });
        lastGcpError = null;
        return res.json({
          success: true,
          usingFallback: false,
          namespace: { name: newNamespace.name }
        });
      } catch (err: any) {
        lastGcpError = err.message || String(err);
        console.warn(`[Service Directory] Gracefully falling back to simulation on Namespace create. Reason: ${err.message}`);
      }
    }
  }

  // Virtual layer create
  const exists = localNamespaces.some(ns => ns.name === namespacePathName);
  if (!exists) {
    localNamespaces.push({ name: namespacePathName });
  }

  res.json({
    success: true,
    usingFallback: true,
    namespace: { name: namespacePathName }
  });
});

// 4. Delete Namespace (POST)
app.post("/api/service-directory/namespaces/delete", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Namespace full path 'name' is required." });
  }

  if (registryMode === "gcp") {
    const client = getSDClient();
    if (client) {
      try {
        await client.deleteNamespace({ name });
        lastGcpError = null;
        return res.json({ success: true, usingFallback: false });
      } catch (err: any) {
        lastGcpError = err.message || String(err);
        console.warn(`[Service Directory] Gracefully falling back to simulation on Namespace delete. Reason: ${err.message}`);
      }
    }
  }

  // Virtual layer delete
  localNamespaces = localNamespaces.filter(ns => ns.name !== name);
  delete localServices[name];
  
  res.json({ success: true, usingFallback: true });
});

// 5. List Services (POST)
app.post("/api/service-directory/services/list", async (req, res) => {
  const { namespaceName } = req.body;
  if (!namespaceName) {
    return res.status(400).json({ error: "namespaceName is required." });
  }

  if (registryMode === "gcp") {
    const client = getSDClient();
    if (client) {
      try {
        const [services] = await client.listServices({ parent: namespaceName });
        const formatted = services.map(srv => ({
          name: srv.name || "",
          annotations: srv.annotations as Record<string, string> || {}
        }));
        lastGcpError = null;
        return res.json({
          success: true,
          usingFallback: false,
          services: formatted
        });
      } catch (err: any) {
        lastGcpError = err.message || String(err);
        console.warn(`[Service Directory] Gracefully falling back to simulation on Service list. Reason: ${err.message}`);
      }
    }
  }

  // Virtual layer list
  const services = localServices[namespaceName] || [];
  res.json({
    success: true,
    usingFallback: true,
    services
  });
});

// 6. Create Service (POST)
app.post("/api/service-directory/services/create", async (req, res) => {
  const { namespaceName, serviceId, annotations } = req.body;
  if (!namespaceName || !serviceId) {
    return res.status(400).json({ error: "namespaceName and serviceId are required." });
  }

  const servicePathName = `${namespaceName}/services/${serviceId}`;

  if (registryMode === "gcp") {
    const client = getSDClient();
    if (client) {
      try {
        const [newService] = await client.createService({
          parent: namespaceName,
          serviceId: serviceId,
          service: { annotations: annotations || {} }
        });
        lastGcpError = null;
        return res.json({
          success: true,
          usingFallback: false,
          service: {
            name: newService.name,
            annotations: newService.annotations || {}
          }
        });
      } catch (err: any) {
        lastGcpError = err.message || String(err);
        console.warn(`[Service Directory] Gracefully falling back to simulation on Service create. Reason: ${err.message}`);
      }
    }
  }

  // Virtual layer create
  if (!localServices[namespaceName]) {
    localServices[namespaceName] = [];
  }
  
  const exists = localServices[namespaceName].some(srv => srv.name === servicePathName);
  if (!exists) {
    localServices[namespaceName].push({
      name: servicePathName,
      annotations: annotations || {}
    });
  }

  res.json({
    success: true,
    usingFallback: true,
    service: {
      name: servicePathName,
      annotations: annotations || {}
    }
  });
});

// 7. Delete Service (POST)
app.post("/api/service-directory/services/delete", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Service full path 'name' is required." });
  }

  if (registryMode === "gcp") {
    const client = getSDClient();
    if (client) {
      try {
        await client.deleteService({ name });
        lastGcpError = null;
        return res.json({ success: true, usingFallback: false });
      } catch (err: any) {
        lastGcpError = err.message || String(err);
        console.warn(`[Service Directory] Gracefully falling back to simulation on Service delete. Reason: ${err.message}`);
      }
    }
  }

  // Virtual layer delete
  for (const ns in localServices) {
    localServices[ns] = localServices[ns].filter(srv => srv.name !== name);
  }
  delete localEndpoints[name];

  res.json({ success: true, usingFallback: true });
});

// 8. List Endpoints (POST)
app.post("/api/service-directory/endpoints/list", async (req, res) => {
  const { serviceName } = req.body;
  if (!serviceName) {
    return res.status(400).json({ error: "serviceName is required." });
  }

  if (registryMode === "gcp") {
    const client = getSDClient();
    if (client) {
      try {
        const [endpoints] = await client.listEndpoints({ parent: serviceName });
        const formatted = endpoints.map(ep => ({
          name: ep.name || "",
          address: ep.address || "",
          port: ep.port || 0,
          annotations: ep.annotations as Record<string, string> || {}
        }));
        lastGcpError = null;
        return res.json({
          success: true,
          usingFallback: false,
          endpoints: formatted
        });
      } catch (err: any) {
        lastGcpError = err.message || String(err);
        console.warn(`[Service Directory] Gracefully falling back to simulation on Endpoint list. Reason: ${err.message}`);
      }
    }
  }

  // Virtual layer list
  const endpoints = localEndpoints[serviceName] || [];
  res.json({
    success: true,
    usingFallback: true,
    endpoints
  });
});

// 9. Create Endpoint (POST)
app.post("/api/service-directory/endpoints/create", async (req, res) => {
  const { serviceName, endpointId, address, port, annotations } = req.body;
  if (!serviceName || !endpointId || !address || !port) {
    return res.status(400).json({ error: "serviceName, endpointId, address, and port are required." });
  }

  const endpointPathName = `${serviceName}/endpoints/${endpointId}`;

  if (registryMode === "gcp") {
    const client = getSDClient();
    if (client) {
      try {
        const [newEp] = await client.createEndpoint({
          parent: serviceName,
          endpointId: endpointId,
          endpoint: {
            address: address,
            port: Number(port),
            annotations: annotations || {}
          }
        });
        lastGcpError = null;
        return res.json({
          success: true,
          usingFallback: false,
          endpoint: {
            name: newEp.name,
            address: newEp.address,
            port: newEp.port,
            annotations: newEp.annotations || {}
          }
        });
      } catch (err: any) {
        lastGcpError = err.message || String(err);
        console.warn(`[Service Directory] Gracefully falling back to simulation on Endpoint create. Reason: ${err.message}`);
      }
    }
  }

  // Virtual layer create
  if (!localEndpoints[serviceName]) {
    localEndpoints[serviceName] = [];
  }
  
  const exists = localEndpoints[serviceName].some(ep => ep.name === endpointPathName);
  if (!exists) {
    localEndpoints[serviceName].push({
      name: endpointPathName,
      address,
      port: Number(port),
      annotations: annotations || {}
    });
  }

  res.json({
    success: true,
    usingFallback: true,
    endpoint: {
      name: endpointPathName,
      address,
      port: Number(port),
      annotations: annotations || {}
    }
  });
});

// 10. Delete Endpoint (POST)
app.post("/api/service-directory/endpoints/delete", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Endpoint full path 'name' is required." });
  }

  if (registryMode === "gcp") {
    const client = getSDClient();
    if (client) {
      try {
        await client.deleteEndpoint({ name });
        lastGcpError = null;
        return res.json({ success: true, usingFallback: false });
      } catch (err: any) {
        lastGcpError = err.message || String(err);
        console.warn(`[Service Directory] Gracefully falling back to simulation on Endpoint delete. Reason: ${err.message}`);
      }
    }
  }

  // Virtual layer delete
  for (const srv in localEndpoints) {
    localEndpoints[srv] = localEndpoints[srv].filter(ep => ep.name !== name);
  }

  res.json({ success: true, usingFallback: true });
});

// ---------------- VITE MIDDLEWARE CONFIG ----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with HMR...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
