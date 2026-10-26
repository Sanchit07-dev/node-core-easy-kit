/**
 * examples/demo.js
 *
 * A complete, hands-on demonstration of `node-core-easy-kit`.
 *
 * Run this example directly using:
 *   node examples/demo.js
 * or:
 *   npm run demo
 */

import {
  readText,
  writeText,
  readJson,
  writeJson,
  fileExists,
  getFileStats,
  listFiles,
  resolvePath,
  getRuntimeInfo,
  getSystemInfo,
  hashText,
  delay
} from "node-core-easy-kit";

async function runDemo() {
  console.log("=========================================");
  console.log("   Node Core Easy Kit - Live Demo        ");
  console.log("=========================================\n");

  // 1. Process Module: Inspect safe runtime information
  console.log("[1] Node.js Runtime Information (node:process):");
  const info = getRuntimeInfo();
  console.log(`    Node Version:        ${info.nodeVersion}`);
  console.log(`    Operating System:    ${info.platform}`);
  console.log(`    Architecture:        ${info.architecture}`);
  console.log(`    Current Working Dir: ${info.workingDirectory}\n`);

  // 2. OS Module: Hardware and host details
  console.log("[2] System & Hardware Details (node:os):");
  const sys = getSystemInfo();
  console.log(`    CPU Cores:           ${sys.cpuCount}`);
  console.log(`    Total Memory:        ${(sys.totalMemoryBytes / (1024 ** 3)).toFixed(2)} GB`);
  console.log(`    Free Memory:         ${(sys.freeMemoryBytes / (1024 ** 3)).toFixed(2)} GB`);
  console.log(`    Uptime:              ${sys.uptimeSeconds} seconds\n`);

  // 3. Path Module: Safely resolve cross-platform paths
  console.log("[3] Path Resolution (node:path):");
  const samplePath = resolvePath("demo-output", "tutorial", "welcome.txt");
  const jsonPath = resolvePath("demo-output", "data", "package-sample.json");
  console.log(`    Resolved text path:  ${samplePath}`);
  console.log(`    Resolved json path:  ${jsonPath}\n`);

  // 4. File System: Write & Read Text
  console.log("[4] Writing & Reading Text (node:fs/promises):");
  const greeting = "Hello from Node.js! This file was created with node-core-easy-kit.";
  await writeText(samplePath, greeting);
  const content = await readText(samplePath);
  console.log(`    ✓ Wrote and read back: "${content}"\n`);

  // 5. File System: Write & Read JSON
  console.log("[5] Writing & Reading JSON (node:fs/promises):");
  const sampleData = {
    kit: "node-core-easy-kit",
    version: "1.0.1",
    modules: ["fs", "path", "process", "timers", "os", "crypto"]
  };
  await writeJson(jsonPath, sampleData, { spaces: 2 });
  const readData = await readJson(jsonPath);
  console.log(`    ✓ Parsed JSON kit name: "${readData.kit}" (${readData.modules.length} modules)\n`);

  // 6. File System: Existence & File Statistics
  console.log("[6] File Inspection (fileExists & getFileStats):");
  const exists = await fileExists(jsonPath);
  const stats = await getFileStats(jsonPath);
  console.log(`    ✓ File exists:        ${exists}`);
  console.log(`    ✓ Size in bytes:      ${stats.size}`);
  console.log(`    ✓ Is standard file:   ${stats.isFile}\n`);

  // 7. File System: Directory Listing
  console.log("[7] Directory Listing (listFiles):");
  const demoFiles = await listFiles("demo-output", { recursive: true });
  console.log(`    ✓ Found files in demo-output:`, demoFiles, "\n");

  // 8. Crypto Module: Hashing text
  console.log("[8] Cryptographic Hashing (node:crypto):");
  const sha256 = hashText("Hello World", "sha256");
  const md5 = hashText("Hello World", "md5");
  console.log(`    ✓ SHA-256: ${sha256}`);
  console.log(`    ✓ MD5:     ${md5}\n`);

  // 9. Timers Module: Asynchronous delay
  console.log("[9] Asynchronous Delay (node:timers/promises):");
  console.log("    Waiting for 300ms using native Promise timers...");
  await delay(300);
  console.log("    ✓ Resumed after 300ms!\n");

  // 10. Error Handling Demonstration: Safe handling of missing files
  console.log("[10] Error Handling Demo (Missing File):");
  try {
    await readText("non-existent-file.txt");
  } catch (error) {
    console.log(`    ✓ Caught expected error gracefully: [${error.code}] ${error.message}\n`);
  }

  console.log("=========================================");
  console.log("   Demo completed successfully! 🎉      ");
  console.log("=========================================");
}

runDemo().catch((err) => {
  console.error("Demo failed with unexpected error:", err);
});
