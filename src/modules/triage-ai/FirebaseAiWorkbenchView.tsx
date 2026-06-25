import React, { useState } from "react";
import { 
  Brain,
  Cpu,
  Sparkles,
  Play,
  Terminal,
  RefreshCw,
  HelpCircle,
  FileCode,
  CheckCircle,
  AlertCircle,
  Code,
  Info,
  Search,
  MessageSquare,
  Network
} from "lucide-react";
import { app } from "../../lib/firebase";

// Custom type definitions for Firebase AI Logic web SDK
interface FunctionCallPayload {
  name: string;
  args: {
    location?: {
      city: string;
      state: string;
    };
    date: string;
  };
}

export const FirebaseAiWorkbenchView: React.FC<{
  addToast: (title: string, message: string, type: "success" | "error" | "info" | "warning") => void;
}> = ({ addToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<"tutorial" | "playground" | "function_calling">("tutorial");
  const [isLiveSDK, setIsLiveSDK] = useState<boolean>(false);
  
  // Playground states
  const [playgroundPrompt, setPlaygroundPrompt] = useState<string>("Write a story about a magic backpack.");
  const [playgroundResponse, setPlaygroundResponse] = useState<string>("");
  const [isPlaygroundLoading, setIsPlaygroundLoading] = useState<boolean>(false);
  const [playgroundLogs, setPlaygroundLogs] = useState<string[]>([]);

  // Function Calling states
  const [fcUserPrompt, setFcUserPrompt] = useState<string>("What was the weather in Boston on October 17, 2024?");
  const [fcLogs, setFcLogs] = useState<{ step: number; title: string; desc: string; type: "sent" | "received" | "internal" | "success" }[]>([]);
  const [fcResponseText, setFcResponseText] = useState<string>("");
  const [fcStatus, setFcStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [isFcLoading, setIsFcLoading] = useState<boolean>(false);

  // Decoupled mock weather DB for sandbox demo
  const mockWeatherDb: { [key: string]: { temp: number; prec: string; clouds: string } } = {
    "boston-2024-10-17": { temp: 38, prec: "56%", clouds: "partlyCloudy" },
    "spokane-2024-10-17": { temp: 42, prec: "10%", clouds: "clear" },
    "seattle-2024-10-17": { temp: 50, prec: "95%", clouds: "cloudy" }
  };

  // Log append helper
  const addPlaygroundLog = (msg: string) => {
    setPlaygroundLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Primary runner using Firebase AI Logic SDK block of code
  const runLiveBackpackScenario = async () => {
    setIsPlaygroundLoading(true);
    setPlaygroundResponse("");
    setPlaygroundLogs([]);
    addPlaygroundLog("Initializing Firebase App Core...");

    try {
      // Dynamic import to prevent bundler failures if packages have local version overrides
      addPlaygroundLog("Importing standard 'firebase/ai' runtime symbols...");
      const { getAI, getGenerativeModel, GoogleAIBackend } = await import("firebase/ai");
      
      addPlaygroundLog("Binding AI backend options utilizing GoogleAIBackend...");
      const ai = getAI(app, { backend: new GoogleAIBackend() });

      addPlaygroundLog("Acquiring GenerativeModel 'gemini-3.5-flash' instance...");
      const model = getGenerativeModel(ai, { model: "gemini-3.5-flash" });

      addPlaygroundLog(`Transmitting prompt payload: "${playgroundPrompt}"`);
      const result = await model.generateContent(playgroundPrompt);

      addPlaygroundLog("Candidate response generated successfully! Unwrapping payload...");
      const text = result.response.text();
      setPlaygroundResponse(text);
      addToast("AI Logic Execution Complete", "The GoogleAIBackend successfully generated content.", "success");
    } catch (err: any) {
      console.error(err);
      addPlaygroundLog(`[ERROR] AI logic failed: ${err.message || err}`);
      
      // Fallback visualization with detailed logs
      addPlaygroundLog("Executing Sandbox simulation fallback...");
      await new Promise(res => setTimeout(res, 1200));
      
      const mockResultText = `Once upon a time in Spokane, a young technician named Leo discovered an old canvas backpack under a pile of broken logic boards. Whenever he placed a shattered cell phone screen inside the bag and zipped it shut, a soft golden warmth pulsed from the zippers. When he opened it seconds later, the glass was perfectly fused and the ammeter trace showed pristine 1.2A voltage draw. The magic backpack was not just a container; it was an offline-first logic rejuvenator.`;
      
      setPlaygroundResponse(mockResultText);
      addPlaygroundLog(`[SIMULATION RESPONSE] (Generated on-the-fly due to Sandbox Offline environment key constraints).`);
      addToast("Demo Flow Generated", "Visual flow simulated correctly in sandboxed environment.", "info");
    } finally {
      setIsPlaygroundLoading(false);
    }
  };

  // Interactive full step-by-step function calling loop
  const executeFunctionCallingLoop = async () => {
    setIsFcLoading(true);
    setFcStatus("running");
    setFcLogs([]);
    setFcResponseText("");

    const addFcLog = (title: string, desc: string, type: "sent" | "received" | "internal" | "success") => {
      setFcLogs(prev => [...prev, { step: prev.length + 1, title, desc, type }]);
    };

    addFcLog("App Init Hooks", "Constructing schema payload. Declaring tool: 'fetchWeather' to Gemini model context.", "internal");
    await new Promise(r => setTimeout(r, 600));

    // Show Schema definition
    const schemaSnippet = `{
  name: "fetchWeather",
  description: "Get the weather conditions for a specific city on a specific date",
  parameters: {
    location: { type: "object", properties: { city: "string", state: "string" } },
    date: "string"
  }
}`;
    addFcLog("Tool Declaration Config", `Declaring tool signature with Schema configuration:\n${schemaSnippet}`, "internal");
    await new Promise(r => setTimeout(r, 800));

    addFcLog("User Query Sent", `Connecting chat session. Client sends: "${fcUserPrompt}"`, "sent");
    await new Promise(r => setTimeout(r, 900));

    try {
      if (isLiveSDK) {
        // Attempt live SDK call
        const { getAI, getGenerativeModel, GoogleAIBackend } = await import("firebase/ai");
        const ai = getAI(app, { backend: new GoogleAIBackend() });
        
        // Define function schema declaration format
        const fetchWeatherTool = {
          functionDeclarations: [
            {
              name: "fetchWeather",
              description: "Get the weather conditions for a specific city on a specific date",
              parameters: {
                type: "object",
                properties: {
                  location: {
                    type: "object",
                    properties: {
                      city: { type: "string", description: "The city of the location." },
                      state: { type: "string", description: "The US state of the location." }
                    },
                    required: ["city", "state"]
                  },
                  date: { type: "string", description: "Date in YYYY-MM-DD format." }
                },
                required: ["location", "date"]
              }
            }
          ]
        };

        const model = getGenerativeModel(ai, { 
          model: "gemini-3.5-flash",
          tools: fetchWeatherTool as any
        });

        const chat = model.startChat();
        const result = await chat.sendMessage(fcUserPrompt);
        const functionCalls = result.response.functionCalls() as any[];

        if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0];
          addFcLog("Model Decided Function Call", `Gemini returned FunctionCall request. Method: "${call.name}" with arguments: ${JSON.stringify(call.args)}`, "received");
          await new Promise(r => setTimeout(r, 800));

          // Simulate actual execution of fetchWeather
          const args = call.args as any;
          const cityNormalized = (args.location?.city || "boston").toLowerCase().trim();
          const lookupKey = `${cityNormalized}-${args.date || "2024-10-17"}`;
          const localResult = mockWeatherDb[lookupKey] || { temp: 39, prec: "40%", clouds: "partlyCloudy" };

          addFcLog("Local Function Executed", `Calling fetchWeather API. Result retrieved: ${JSON.stringify(localResult)}`, "internal");
          await new Promise(r => setTimeout(r, 800));

          // Feed response back to chat model
          addFcLog("Sending Output To Model", "Passing the function output back to model stack...", "sent");
          const finalResult = await chat.sendMessage([
            {
              functionResponse: {
                name: call.name,
                response: localResult,
              },
            },
          ]);

          const finalResponseText = finalResult.response.text();
          setFcResponseText(finalResponseText);
          addFcLog("Final Text Received", "Gemini successfully structured the natural-language report.", "success");
          setFcStatus("done");
        } else {
          // No function call matches
          const text = result.response.text();
          setFcResponseText(text);
          addFcLog("Direct Response Produced", "Model processed query directly without needing tool usage.", "success");
          setFcStatus("done");
        }

      } else {
        // Precise simulated execution exhibiting step-by-step function calling loop
        // Parse prompt if we can guess the city
        let targetCity = "Boston";
        let targetState = "Massachusetts";
        let targetDate = "2024-10-17";

        if (fcUserPrompt.toLowerCase().includes("spokane")) {
          targetCity = "Spokane";
          targetState = "Washington";
        } else if (fcUserPrompt.toLowerCase().includes("seattle")) {
          targetCity = "Seattle";
          targetState = "Washington";
        }

        addFcLog(
          "Model Response Parsing",
          `Gemini detected tool match. Generated structured call schema:\n{\n  "functionName": "fetchWeather",\n  "location": { "city": "${targetCity}", "state": "${targetState}" },\n  "date": "${targetDate}"\n}`,
          "received"
        );
        await new Promise(r => setTimeout(r, 1000));

        // Invoke function
        addFcLog(
          "Executing local fetchWeather()",
          `Technician workbench called fetchWeather with args:\nlocation: { city: "${targetCity}", state: "${targetState}" }, date: "${targetDate}"`,
          "internal"
        );
        await new Promise(r => setTimeout(r, 900));

        const citySlug = targetCity.toLowerCase();
        const info = mockWeatherDb[`${citySlug}-${targetDate}`] || { temp: 38, prec: "50%", clouds: "partlyCloudy" };

        addFcLog(
          "API Response Received",
          `fetchWeather yielded:\n{\n  "temperature": ${info.temp},\n  "chancePrecipitation": "${info.prec}",\n  "cloudConditions": "${info.clouds}"\n}`,
          "internal"
        );
        await new Promise(r => setTimeout(r, 1000));

        addFcLog(
          "Feed Response back to Model",
          "Transmitting structured data packet within chat.sendMessage([ { functionResponse: ... } ]) state machine.",
          "sent"
        );
        await new Promise(r => setTimeout(r, 1200));

        const formattedClouds = info.clouds === "partlyCloudy" ? "partly cloudy skies" : info.clouds;
        const finalSimulatedAns = `On ${targetDate} in ${targetCity}, ${targetState}, the Spokane diagnostic hub log notes it was ${info.temp} degrees Fahrenheit with ${formattedClouds} and a ${info.prec} chance of precipitation. Perfect thermal metrics for mobile screen calibrations!`;

        setFcResponseText(finalSimulatedAns);
        addFcLog("Final Evaluation Complete", "Gemini compiled the trace weather logs seamlessly into friendly guidance.", "success");
        setFcStatus("done");
      }
    } catch (err: any) {
      console.error(err);
      addFcLog("API Failure", `SDK Error detected: ${err.message || err}. Falling back to visual simulation...`, "internal");
      await new Promise(r => setTimeout(r, 1000));
      setFcResponseText(`On October 17, 2024, in Boston, it was 38 degrees Fahrenheit with partly cloudy skies and 56% chance of precipitation.`);
      setFcStatus("done");
    } finally {
      setIsFcLoading(false);
    }
  };

  return (
    <div id="firebase-ai-workbench" className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              Firebase AI Logic Workbench
              <span className="bg-purple-950 text-purple-300 border border-purple-850 px-2 py-0.5 rounded text-[9px] uppercase font-bold">Preview SDK</span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive test console for Firebase Web AI SDK (`firebase/ai`), model instantiation, and parallel function calling.
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800">
          <button
            onClick={() => setActiveSubTab("tutorial")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === "tutorial" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            SDK Tutorial
          </button>
          <button
            onClick={() => setActiveSubTab("playground")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === "playground" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Live Playground
          </button>
          <button
            onClick={() => setActiveSubTab("function_calling")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === "function_calling" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Function Calling
          </button>
        </div>
      </div>

      {/* CORE VIEWPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SUBTAB 1: SDK TUTORIAL GUIDE */}
        {activeSubTab === "tutorial" && (
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-805 pb-3">
                <FileCode className="w-5 h-5 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">How Firebase AI Logic Works Client-Side</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The new Firebase AI Web SDK facilitates direct client-side integration with high-performance Gemini models using secure serverless endpoints or Google AI developer keys. By coupling your authorized <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-purple-300 text-[11px]">firebaseApp</code> session, the SDK acts as an intermediary, abstracting complex endpoint wiring so you can focus purely on intelligent user experiences.
              </p>

              {/* THREE COLUMN PILLARS */}
              <div id="tutorial-steps" className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-850 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center font-bold text-xs font-mono">1</span>
                    <span className="text-xs font-bold text-slate-200">Initialize AI Service</span>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800 overflow-x-auto whitespace-pre">
{`import { getAI } from "firebase/ai";

// Link to Firebase core app
const ai = getAI(firebaseApp, {
  backend: new GoogleAIBackend()
});`}
                  </pre>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-850 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center font-bold text-xs font-mono">2</span>
                    <span className="text-xs font-bold text-slate-200">Bind Model Target</span>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800 overflow-x-auto whitespace-pre">
{`import { getGenerativeModel } from "firebase/ai";

const model = getGenerativeModel(ai, {
  model: "gemini-3.5-flash"
});`}
                  </pre>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-850 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center font-bold text-xs font-mono">3</span>
                    <span className="text-xs font-bold text-slate-200">Generate Content</span>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800 overflow-x-auto whitespace-pre">
{`const prompt = "Write a story...";
const result = await model.generateContent(prompt);

const responseText = result.response.text();`}
                  </pre>
                </div>
              </div>

              {/* FUNCTION CALLING ACCORDION PREVIEW */}
              <div className="bg-slate-950 border border-slate-850 rounded-lg p-5 mt-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Prerequisites & Best Practices</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                  <li>Ensure the SDK dependencies are matched in <code className="bg-slate-900 p-0.5 rounded font-mono text-[10.5px]">package.json</code> via <code className="bg-slate-900 p-0.5 rounded font-mono text-[10.5px]">firebase: ^10.14.0</code> or higher.</li>
                  <li>In case Google AI developer API rules are blocked client-side by security context, configure the backend service using cloud-hosted Vertex API proxies.</li>
                  <li>Initialize the Gemini client dynamically inside components or buttons to avoid locking startup boot cycles when developers are calibrating.</li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveSubTab("playground")}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs uppercase font-extrabold tracking-widest rounded-lg flex items-center gap-2 transition-transform"
                >
                  Proceed to Live Sandbox Playground
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: INTEGRATIVE PLAYGROUND */}
        {activeSubTab === "playground" && (
          <>
            {/* COLUMN Left: Variables Input */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
                    Playground Parameters
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Live SDK</span>
                    <input
                      type="checkbox"
                      checked={isLiveSDK}
                      onChange={(e) => setIsLiveSDK(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-0 w-3 h-3"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Target Generative Model</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-xs text-slate-300 font-mono focus:border-purple-500 focus:outline-none"
                      disabled
                    >
                      <option>gemini-3.5-flash (Standard Developer API)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Prompt Input Configuration</label>
                    <textarea
                      value={playgroundPrompt}
                      onChange={(e) => setPlaygroundPrompt(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-xs text-white leading-relaxed focus:border-purple-500 focus:outline-none font-sans"
                      placeholder="Write a prompt..."
                    />
                  </div>

                  <button
                    onClick={runLiveBackpackScenario}
                    disabled={isPlaygroundLoading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    {isPlaygroundLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Generating Content...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Generate with Firebase AI
                      </>
                    )}
                  </button>
                </div>
              </section>

              {/* CONSOLE LOGGER */}
              <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex-1 flex flex-col min-h-[220px]">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    SDK Console Output
                  </h3>
                  <button
                    onClick={() => setPlaygroundLogs([])}
                    className="text-[9px] font-mono text-slate-500 hover:text-white uppercase"
                  >
                    Clear Logs
                  </button>
                </div>

                <div className="flex-1 bg-slate-950 rounded-lg p-3.5 border border-slate-850 font-mono text-[10.5px] text-zinc-400 space-y-1.5 overflow-y-auto max-h-[200px]">
                  {playgroundLogs.length === 0 ? (
                    <span className="text-slate-600 block italic">Console idle. Click generate to inspect console tracing logs.</span>
                  ) : (
                    playgroundLogs.map((log, i) => (
                      <div 
                        key={i} 
                        className={`truncate leading-snug ${
                          log.includes("[ERROR]") ? "text-red-400 font-bold" :
                          log.includes("[SIMULATION") ? "text-amber-400 font-semibold" : 
                          "text-zinc-400"
                        }`}
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* COLUMN Right: Display Result */}
            <div className="lg:col-span-7">
              <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg h-full flex flex-col min-h-[450px]">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3 mb-4">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
                    Formatted Inference Response
                  </h3>
                </div>

                <div className="flex-1 bg-slate-950/60 rounded-lg p-5 border border-slate-855 overflow-y-auto text-xs text-slate-300 leading-relaxed font-sans space-y-4">
                  {isPlaygroundLoading ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                      <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mb-3" />
                      <p className="text-xs text-slate-500 font-mono">Executing query matching stack...</p>
                    </div>
                  ) : playgroundResponse ? (
                    <p className="whitespace-pre-line leading-relaxed">{playgroundResponse}</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center text-slate-600">
                      <Brain className="w-12 h-12 text-slate-800 mb-2" />
                      <p className="text-xs font-bold text-slate-500">Playground Empty</p>
                      <p className="text-[10px] text-slate-600 max-w-xs">Type a prompt and let the Firebase AI SDK invoke standard Gemini output generation.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}

        {/* SUBTAB 3: INTERACTIVE FUNCTION CALLING DEMO */}
        {activeSubTab === "function_calling" && (
          <div className="lg:col-span-12 space-y-6">
            
            {/* INPUT PANEL AND PARALLEL TRACING LOGS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Command Entry */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <h3 className="text-xs font-extrabold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
                      Function Declaration Setup
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Use Real SDK</span>
                      <input
                        type="checkbox"
                        checked={isLiveSDK}
                        onChange={(e) => setIsLiveSDK(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-0 w-3 h-3"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    This step-by-step console implements <strong>Step 1 to Step 5</strong> of the weather function calling scenario from the Firebase guide.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Pre-configured Tools</label>
                      <div className="bg-slate-950 p-3 rounded border border-slate-850 font-mono text-[10.5px] text-purple-400 leading-relaxed block overflow-x-auto">
                        <span className="text-zinc-400 font-bold block">Function schema:</span>
                        fetchWeather(location: &#123; city, state &#125;, date: string)
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Interactive User Prompt</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={fcUserPrompt}
                          onChange={(e) => setFcUserPrompt(e.target.value)}
                          placeholder="What was the weather in Boston on October 17, 2024?"
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-1.5 self-end">
                          <button
                            onClick={() => setFcUserPrompt("What was the weather in Boston on October 17, 2024?")}
                            className="text-[9px] font-mono bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded px-2 py-0.5 text-zinc-400"
                          >
                            Boston Log
                          </button>
                          <button
                            onClick={() => setFcUserPrompt("Get weather logs for Spokane on October 17, 2024")}
                            className="text-[9px] font-mono bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded px-2 py-0.5 text-zinc-400"
                          >
                            Spokane Log
                          </button>
                          <button
                            onClick={() => setFcUserPrompt("Identify weather conditions in Seattle on October 17, 2024")}
                            className="text-[9px] font-mono bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded px-2 py-0.5 text-zinc-400"
                          >
                            Seattle Log
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={executeFunctionCallingLoop}
                      disabled={isFcLoading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all shadow shadow-blue-900 cursor-pointer"
                    >
                      {isFcLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Running Loop...
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          Execute Multi-Turn Loop
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Process Visualizer */}
              <div className="md:col-span-7 flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-4">
                      <h3 className="text-xs font-extrabold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
                        <Network className="w-4 h-4 text-purple-400" />
                        Relational Flow Tracing
                      </h3>
                      {fcStatus !== "idle" && (
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                          fcStatus === "running" ? "bg-blue-900/30 text-blue-400" :
                          fcStatus === "done" ? "bg-emerald-900/30 text-emerald-400" :
                          "bg-zinc-800 text-zinc-500"
                        }`}>
                          {fcStatus}
                        </span>
                      )}
                    </div>

                    {/* STEPS LIST */}
                    <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                      {fcLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-600 border border-dashed border-slate-850 rounded-lg">
                          <HelpCircle className="w-10 h-10 text-slate-800 mb-2" />
                          <p className="text-xs font-bold text-slate-500">Pipeline Unloaded</p>
                          <p className="text-[10px] text-slate-600 max-w-xs leading-normal">
                            Click 'Execute Multi-Turn Loop' to trace arguments passing back-and-forth dynamically.
                          </p>
                        </div>
                      ) : (
                        fcLogs.map((log) => (
                          <div 
                            key={log.step} 
                            className={`p-3 rounded-lg border text-xs leading-relaxed space-y-1 ${
                              log.type === "sent" ? "bg-blue-950/20 border-blue-900/40 text-blue-200" :
                              log.type === "received" ? "bg-purple-950/20 border-purple-900/40 text-purple-200" :
                              log.type === "success" ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300" :
                              "bg-slate-950/60 border-slate-850 text-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold font-mono uppercase tracking-wider text-[10px] opacity-90 flex items-center gap-1.5">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                                  log.type === "sent" ? "bg-blue-900 text-white" :
                                  log.type === "received" ? "bg-purple-900 text-white" :
                                  log.type === "success" ? "bg-emerald-900 text-white" :
                                  "bg-slate-800 text-zinc-400"
                                }`}>
                                  {log.step}
                                </span>
                                {log.title}
                              </span>
                            </div>
                            <pre className="text-[10.5px] font-mono text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-850/40 overflow-x-auto whitespace-pre-wrap leading-normal">
                              {log.desc}
                            </pre>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* FINAL ACCORDION ANSWER RENDER */}
                  {fcResponseText && (
                    <div className="mt-4 bg-emerald-950/15 border border-emerald-850 rounded-lg p-4 animate-in slide-in-from-bottom duration-300">
                      <div className="flex items-center gap-2 text-emerald-400 mb-1">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Completed Output</span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {fcResponseText}
                      </p>
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
