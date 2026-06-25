import { startServer } from "./server";

// Start the local development or production server
startServer().catch(err => {
  console.error("Failed to start local server:", err);
  process.exit(1);
});
