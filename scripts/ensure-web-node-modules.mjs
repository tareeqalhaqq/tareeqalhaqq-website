import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const workspaceDir = path.join(repoRoot, "apps", "web");
const workspaceNodeModules = path.join(workspaceDir, "node_modules");
const rootNodeModules = path.join(repoRoot, "node_modules");

const packagesToLink = ["@swc/helpers", "scheduler"];

if (!fs.existsSync(workspaceDir)) {
  process.exit(0);
}

fs.mkdirSync(workspaceNodeModules, { recursive: true });

for (const pkgName of packagesToLink) {
  const source = path.join(rootNodeModules, ...pkgName.split("/"));
  const target = path.join(workspaceNodeModules, ...pkgName.split("/"));

  if (!fs.existsSync(source)) {
    continue;
  }

  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.symlinkSync(source, target, "junction");
}

// Handle styled-jsx which is required by Next.js
// Check root node_modules first, then fall back to next/node_modules
const styledJsxName = "styled-jsx";
const styledJsxTarget = path.join(workspaceNodeModules, styledJsxName);
let styledJsxSource = path.join(rootNodeModules, styledJsxName);

if (!fs.existsSync(styledJsxSource)) {
  // Fall back to next/node_modules if not in root
  const nextNodeModules = path.join(workspaceNodeModules, "next", "node_modules");
  styledJsxSource = path.join(nextNodeModules, styledJsxName);
}

if (fs.existsSync(styledJsxSource)) {
  fs.rmSync(styledJsxTarget, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(styledJsxTarget), { recursive: true });
  fs.symlinkSync(styledJsxSource, styledJsxTarget, "junction");
}
