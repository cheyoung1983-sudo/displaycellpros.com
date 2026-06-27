# Refreshing Antigravity Firebase Skills

Follow these steps if you encounter outdated Firebase commands or issues with
Agent Skills in Antigravity.

### 1. Update Firebase Agent Skills

1. **Uninstall Old Skills**:
   ```bash
   npx skills remove firebase/agent-skills --agent antigravity
   ```
1. **Reinstall Latest Skills**:
   ```bash
   npx skills add firebase/agent-skills --agent antigravity --skill "*"
   ```
1. **Verify**: Run `npx skills list --agent antigravity` to confirm the latest
   `firebase-basics` is active.

### 2. Update Firebase MCP Server

Antigravity uses the Firebase CLI's built-in MCP server. Updating the CLI
automatically updates the MCP server.

1. **Force Update via npx**: Ensure your `mcp_config.json` uses the `@latest`
   tag:
   ```json
   {
     "firebase": {
       "command": "npx",
       "args": ["-y", "firebase-tools@latest", "mcp"]
     }
   }
   ```
1. **Manual Update**: Alternatively, update the global CLI:
   ```bash
   npm install -g firebase-tools@latest
   ```

### 3. Restart and Synchronize

1. **Restart Antigravity**: A full restart is required to reload the MCP server
   definition.
1. **Re-sync Project**: In your next prompt, run
   `npx -y firebase-tools@latest use` to re-establish project context.
