// Local dev-server launcher for preview. Sets the env vars the Replit-style
// vite configs require (PORT, BASE_PATH) plus an optional VITE_LOCAL_DEMO role,
// then spawns the target app's local vite. Usage:
//   node dev-preview.mjs <absoluteAppDir> <port> [demoRole]
import { spawn } from "node:child_process";
import path from "node:path";

const [appDir, port, demoRole] = process.argv.slice(2);
if (!appDir || !port) {
  console.error("usage: node dev-preview.mjs <appDir> <port> [demoRole]");
  process.exit(1);
}

const env = {
  ...process.env,
  PORT: String(port),
  BASE_PATH: "/",
  NODE_ENV: "development",
};
if (demoRole) env.VITE_LOCAL_DEMO = demoRole;

// Resolve vite's JS entry so we can run it with node directly — avoids
// shell quoting issues on paths that contain spaces.
const viteEntry = path.join(appDir, "node_modules", "vite", "bin", "vite.js");

const child = spawn(process.execPath, [viteEntry, "--config", "vite.config.ts", "--host", "127.0.0.1"], {
  cwd: appDir,
  env,
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 0));
