import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const workspaceDir = path.join(repoRoot, "apps/web");
const workspaceNodeModules = path.join(workspaceDir, "node_modules");
const rootNodeModules = path.join(repoRoot, "node_modules");

const packagesToLink = ["@swc/helpers", "scheduler"];

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
