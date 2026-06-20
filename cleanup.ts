import fs from 'fs';

function removeRegex(filePath: string, replaceFn: (content: string) => string) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    content = replaceFn(content);
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

// 1. GoogleWorkspaceHubView
removeRegex('src/components/GoogleWorkspaceHubView.tsx', c => {
  c = c.replace(/const loadSandboxData[\s\S]*?(?=const syncPosToSheets)/, '');
  return c;
});

// 2. FormsIntegrationView
removeRegex('src/components/FormsIntegrationView.tsx', c => {
  // Replace references
  c = c.replace(/const\s+\[isSandboxMode,\s*setIsSandboxMode\]\s*=\s*useState[^;]+;/g, 'const isSandboxMode = false;');
  c = c.replace(/setIsSandboxMode\(false\);/g, '');
  c = c.replace(/setIsSandboxMode\(true\);/g, '');
  c = c.replace(/setFormId\("sandbox-intake-form"\);/g, '');
  c = c.replace(/setFormId\("sandbox-intake"\);/g, '');
  return c;
});

// 3. App.tsx - stripping out mock "sandbox-tech-101" things.
removeRegex('src/App.tsx', c => {
  c = c.replace(/if\s*\(uid === "sandbox-tech-101"\)\s*\{[\s\S]*?return;\s*\}/g, '');
  c = c.replace(/if\s*\(authUser\?\.uid && authUser\.uid !== "sandbox-tech-101"\)\s*\{/g, 'if (authUser?.uid) {');
  c = c.replace(/if\s*\(authUser\?\.uid && authUser\.uid !== "sandbox-tech-101" && !ticketId.startsWith\("DCP-SIM"\)\)\s*\{/g, 'if (authUser?.uid) {');
  c = c.replace(/if\s*\(authUser && authUser\.uid !== "sandbox-tech-101"\)\s*\{/g, 'if (authUser) {');
  
  c = c.replace(/authUser\?\.uid \|\| "sandbox-tech-101"/g, 'authUser?.uid || "unauthenticated"');
  
  // Remove "Sandbox Environment Active" block? We did it earlier but let's sweep local storage things.
  c = c.replace(/const existing = localStorage\.getItem\("dcp_sandbox_tickets"\);[\s\S]*?setFirestoreTickets\(list\);/g, '');
  c = c.replace(/localStorage\.setItem\("dcp_sandbox_[^"]+",[^)]+\);/g, '');
  
  return c;
});

