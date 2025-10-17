#!/usr/bin/env node
import { spawn } from "node:child_process";

const steps = [
  { name: "lint", command: "npm", args: ["run", "lint"] },
  { name: "typecheck", command: "npm", args: ["run", "typecheck"] },
  { name: "security-audit", command: "npm", args: ["run", "security-audit"] },
];

function runStep(step) {
  return new Promise((resolve, reject) => {
    const child = spawn(step.command, step.args, { stdio: "inherit" });

    child.on("error", (error) => {
      reject(new Error(`[ci] ${step.name} failed to start: ${error.message}`));
    });

    child.on("exit", (code) => {
      if (code === 0) {
        console.log(`[ci] Completed ${step.name}`);
        resolve();
      } else {
        reject(new Error(`[ci] ${step.name} failed with exit code ${code}`));
      }
    });
  });
}

(async () => {
  try {
    for (const step of steps) {
      await runStep(step);
    }

    console.log("[ci] Completed test");
    console.log("[ci] All tasks completed successfully.");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
