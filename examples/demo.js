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
  resolvePath,
  getRuntimeInfo,
  delay
} from "node-core-easy-kit";

async function runDemo() {
  console.log("=========================================");
  console.log("   Node Core Easy Kit - Live Demo        ");
  console.log("=========================================\n");

  // 1. Process Module: Inspect safe runtime information
  console.log("[1] Node.js Runtime Information:");
  const info = getRuntimeInfo();
  console.log(`    Node Version:     ${info.nodeVersion}`);
  console.log(`    Operating System: ${info.platform}`);
  console.log(`    Architecture:     ${info.architecture}`);
  console.log(`    Current Working Dir: ${info.workingDirectory}\n`);

  // 2. Path Module: Safely resolve paths across Windows, macOS, and Linux
  console.log("[2] Path Resolution:");
  const samplePath = resolvePath("demo-output", "tutorial", "welcome.txt");
  console.log(`    Resolved target path: ${samplePath}\n`);

  // 3. File System Module: Write file with automatic directory creation
  console.log("[3] Writing Text File:");
  const greeting = "Hello from Node.js! This file was created with node-core-easy-kit.";
  await writeText(samplePath, greeting);
  console.log(`    ✓ Successfully created parent folders and wrote file!\n`);

  // 4. File System Module: Read text file
  console.log("[4] Reading Text File:");
  const content = await readText(samplePath);
  console.log(`    File content:\n    "${content}"\n`);

  // 5. Timers Module: Asynchronous delay using promises
  console.log("[5] Asynchronous Delay:");
  console.log("    Waiting for 500ms using native Promise timers...");
  await delay(500);
  console.log("    ✓ Resumed after 500ms!\n");

  // 6. Error Handling Demonstration: Safe handling of missing files
  console.log("[6] Error Handling Demo (Missing File):");
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
