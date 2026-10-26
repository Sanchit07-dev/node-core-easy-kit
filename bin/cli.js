#!/usr/bin/env node

/**
 * node-core-easy-kit CLI
 *
 * A lightweight command-line interface demonstrating the core utilities.
 */

import process from "node:process";
import { getRuntimeInfo, getSystemInfo, delay, resolvePath, hashText } from "../src/index.js";

const args = process.argv.slice(2);
const command = args[0];

const HELP_TEXT = `
node-core-easy-kit (CLI)

Usage:
  node-core-easy-kit <command> [options]

Commands:
  info                 Show Node.js runtime information (Node version, OS, arch, cwd)
  sysinfo              Show system and hardware information (CPUs, RAM, uptime)
  hash <text> [alg]    Compute cryptographic hash (default algorithm: sha256)
  delay <ms>           Pause execution for <ms> milliseconds
  resolve <...paths>   Resolve path segments into an absolute path
  --help, -h           Show this help message
  --version, -v        Show package version

Examples:
  node-core-easy-kit info
  node-core-easy-kit sysinfo
  node-core-easy-kit hash "hello world"
  node-core-easy-kit hash "hello world" md5
  node-core-easy-kit delay 1000
  node-core-easy-kit resolve src index.js
`;

async function main() {
  if (!command || command === "--help" || command === "-h" || command === "help") {
    console.log(HELP_TEXT.trim());
    return;
  }

  if (command === "--version" || command === "-v") {
    console.log("1.0.1");
    return;
  }

  if (command === "info") {
    const info = getRuntimeInfo();
    console.log("Node.js Runtime Environment:");
    console.log(`  • Node Version:     ${info.nodeVersion}`);
    console.log(`  • OS Platform:      ${info.platform}`);
    console.log(`  • Architecture:     ${info.architecture}`);
    console.log(`  • Working Dir:      ${info.workingDirectory}`);
    return;
  }

  if (command === "sysinfo") {
    const sys = getSystemInfo();
    console.log("System Information:");
    console.log(`  • Platform:         ${sys.platform} (${sys.type})`);
    console.log(`  • Architecture:     ${sys.architecture}`);
    console.log(`  • CPU Cores:        ${sys.cpuCount}`);
    console.log(`  • Total Memory:     ${(sys.totalMemoryBytes / (1024 ** 3)).toFixed(2)} GB`);
    console.log(`  • Free Memory:      ${(sys.freeMemoryBytes / (1024 ** 3)).toFixed(2)} GB`);
    console.log(`  • Uptime:           ${sys.uptimeSeconds}s`);
    return;
  }

  if (command === "hash") {
    const text = args[1];
    const alg = args[2] || "sha256";
    if (typeof text !== "string") {
      console.error("Error: Please provide a text string to hash.");
      process.exitCode = 1;
      return;
    }
    try {
      console.log(hashText(text, alg));
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "delay") {
    const ms = Number(args[1]);
    if (!Number.isFinite(ms) || ms < 0) {
      console.error("Error: Please provide a valid non-negative number of milliseconds.");
      process.exitCode = 1;
      return;
    }
    console.log(`Waiting for ${ms}ms...`);
    await delay(ms);
    console.log("Done!");
    return;
  }

  if (command === "resolve") {
    const parts = args.slice(1);
    if (parts.length === 0) {
      console.error("Error: Please provide at least one path segment.");
      process.exitCode = 1;
      return;
    }
    try {
      console.log(resolvePath(...parts));
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
    return;
  }

  console.error(`Unknown command: "${command}"\nRun "node-core-easy-kit --help" for available commands.`);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exitCode = 1;
});
