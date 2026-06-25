import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const getAiClient = (req: express.Request) => {
    return new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
          'Referer': 'https://displaycellpros.com/'
        }
      }
    });
  };

  let gatewaySettings = {
    enforceGateway: true,
    rateLimitLimit: 100,
    activeKeys: [{ status: "ACTIVE", key: "mock-key", name: "System Default", creationDate: new Date().toISOString() }],
    adminEmail: "cheyoung1983@gmail.com",
    rotationFrequencyHours: 72,
    nextRotationTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    rotationLogs: []
  };

  app.get("/api/gateway/settings", (req, res) => {
    res.json(gatewaySettings);
  });

  app.post("/api/gateway/settings", (req, res) => {
    const data = req.body;
    
    if (data.action === "create-key") {
      gatewaySettings.activeKeys.push({
        status: "ACTIVE",
        key: data.key,
        name: data.name,
        creationDate: new Date().toISOString()
      });
    } else if (data.action === "update-key-status") {
      const keyObj = gatewaySettings.activeKeys.find(k => k.key === data.key);
      if (keyObj) keyObj.status = data.nextStatus;
    } else if (data.action === "delete-key") {
      gatewaySettings.activeKeys = gatewaySettings.activeKeys.filter(k => k.key !== data.key);
    } else {
      if (data.enforce !== undefined) gatewaySettings.enforceGateway = data.enforce;
      if (data.newLimit !== undefined) gatewaySettings.rateLimitLimit = data.newLimit;
    }
    
    res.json(gatewaySettings);
  });

  app.post("/api/triage", async (req, res) => {
    try {
      const { messages, deviceDetails } = req.body;
      
      const systemInstruction = `You are the Principal Software Architect & Lead Hardware Reverse Engineer for the Triage-AI platform.
Your expertise covers low-level iOS/Android telemetry (IOKit/BatteryManager), USB multiplexing, motherboard circuit forensics, and NIST SP 800-88 R1 data sanitization standards.
Always follow the S2C (Symptom-to-Circuit) Mapping Framework.
Do not recommend thermal rework before commanding electrical verification.
Perform a Chain-of-Verification (CoV).
Maintain an Obsidian Canvas (Dark Mode Default) tone and Corporate Palette terminology where applicable.
Use tools like googleMaps when applicable to help users find local resources, e.g., components suppliers or our Spokane/Seattle labs.
When helping users, you must format your responses elegantly. Do not ask for the API key.
Currently assisting a customer with device: ${deviceDetails?.brand} ${deviceDetails?.model} (Tier: ${deviceDetails?.tier}).`;

      // Filter and format history correctly
      let historyText = "";
      if (messages && Array.isArray(messages)) {
        historyText = messages.map((m: any) => `${m.role === 'user' ? 'Customer' : 'Triage-AI'}: ${m.text}`).join('\n\n');
      }

      const ai = getAiClient(req);
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: historyText || "Hello",
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          tools: [{ googleMaps: {} }],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Triage Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/generate-quote", async (req, res) => {
    try {
      const { issueType, deviceTier, zipCode, isCorporate } = req.body;
      
      const prompt = `Generate a repair quote estimation in JSON format for the following details:
Issue: ${issueType}
Tier: ${deviceTier}
Location ZIP: ${zipCode}
Corporate/B2B: ${isCorporate ? 'Yes' : 'No'}

Return JSON matching this schema exactly:
{
  "quoteRef": "string",
  "baseRate": number,
  "tax": number,
  "total": number,
  "notes": "string",
  "localFacilities": "string"
}`;

      const ai = getAiClient(req);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleMaps: {} }],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });
      
      const responseText = response.text || "{}";
      const quoteData = JSON.parse(responseText);
      res.json(quoteData);
    } catch (error: any) {
      console.error("Quote Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Catch-all for unimplemented API routes to prevent JSON parsing errors on frontend
  app.all("/api/*", (req, res) => {
    res.json({ message: "Mock endpoint", status: "OK", data: [] });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
