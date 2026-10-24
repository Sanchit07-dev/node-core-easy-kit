/**
 * node-core-easy-kit
 *
 * Beginner-friendly utilities demonstrating Node.js core modules.
 * Built with 100% built-in Node.js modules and zero external runtime dependencies.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";

/**
 * Reads a UTF-8 encoded text file asynchronously.
 *
 * Demonstrates: `node:fs/promises` (`readFile`)
 *
 * @param {string} filePath - Path to the file to read (relative or absolute).
 * @returns {Promise<string>} The UTF-8 text content of the file.
 * @throws {TypeError} If filePath is not a non-empty string.
 * @throws {Error} If the file does not exist (with code 'ENOENT') or cannot be read.
 *
 * @example
 * import { readText } from "node-core-easy-kit";
 * const content = await readText("./notes.txt");
 * console.log(content);
 */
export async function readText(filePath) {
  if (typeof filePath !== "string" || filePath.trim() === "") {
    throw new TypeError("filePath must be a non-empty string");
  }

  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      const resolved = path.resolve(filePath);
      const notFoundError = new Error(`File not found: "${resolved}"`);
      notFoundError.code = "ENOENT";
      notFoundError.originalError = error;
      throw notFoundError;
    }
    throw error;
  }
}

/**
 * Writes text content to a file, automatically creating parent directories if they don't exist.
 *
 * Demonstrates: `node:fs/promises` (`writeFile`, `mkdir`) and `node:path` (`resolve`, `dirname`).
 *
 * @param {string} filePath - Target file path (relative or absolute).
 * @param {string} content - Text content to write into the file.
 * @returns {Promise<string>} The resolved absolute path of the written file.
 * @throws {TypeError} If filePath is not a non-empty string or content is not a string.
 *
 * @example
 * import { writeText } from "node-core-easy-kit";
 * await writeText("output/subfolder/hello.txt", "Hello world!");
 */
export async function writeText(filePath, content) {
  if (typeof filePath !== "string" || filePath.trim() === "") {
    throw new TypeError("filePath must be a non-empty string");
  }
  if (typeof content !== "string") {
    throw new TypeError("content must be a string");
  }

  const absolutePath = path.resolve(filePath);
  const parentDirectory = path.dirname(absolutePath);

  // Creates parent directories recursively if they don't exist yet
  await mkdir(parentDirectory, { recursive: true });
  await writeFile(absolutePath, content, "utf8");

  return absolutePath;
}

/**
 * Resolves a sequence of path segments into an absolute path using platform-specific separators.
 *
 * Demonstrates: `node:path` (`resolve`).
 *
 * @param {...string} parts - One or more path segments.
 * @returns {string} The resolved absolute path.
 * @throws {TypeError} If no segments are provided or any segment is not a string.
 *
 * @example
 * import { resolvePath } from "node-core-easy-kit";
 * const fullPath = resolvePath("project", "data", "file.json");
 */
export function resolvePath(...parts) {
  if (parts.length === 0) {
    throw new TypeError("resolvePath requires at least one path segment");
  }

  for (let i = 0; i < parts.length; i++) {
    if (typeof parts[i] !== "string" || parts[i].trim() === "") {
      throw new TypeError(`Path segment at index ${i} must be a non-empty string`);
    }
  }

  return path.resolve(...parts);
}

/**
 * Returns safe environment and platform details about the current Node.js runtime.
 * Never exposes sensitive environment variables (`process.env`) or secrets.
 *
 * Demonstrates: `node:process` (`version`, `platform`, `arch`, `cwd()`).
 *
 * @returns {{
 *   nodeVersion: string,
 *   platform: string,
 *   architecture: string,
 *   workingDirectory: string
 * }} Safe runtime environment information.
 *
 * @example
 * import { getRuntimeInfo } from "node-core-easy-kit";
 * const info = getRuntimeInfo();
 * console.log(`Running on Node ${info.nodeVersion} on ${info.platform}`);
 */
export function getRuntimeInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    workingDirectory: process.cwd()
  };
}

/**
 * Pauses asynchronous execution for the specified number of milliseconds.
 *
 * Demonstrates: `node:timers/promises` (`setTimeout`).
 *
 * @param {number} milliseconds - Duration to pause in milliseconds (must be non-negative).
 * @returns {Promise<void>} Resolves when the duration has elapsed.
 * @throws {TypeError} If milliseconds is not a number.
 * @throws {RangeError} If milliseconds is negative, NaN, or non-finite.
 *
 * @example
 * import { delay } from "node-core-easy-kit";
 * console.log("Starting...");
 * await delay(1000); // Wait 1 second
 * console.log("Done!");
 */
export async function delay(milliseconds) {
  if (typeof milliseconds !== "number" || Number.isNaN(milliseconds)) {
    throw new TypeError("milliseconds must be a number");
  }
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new RangeError("milliseconds must be a non-negative finite number");
  }

  await sleep(milliseconds);
}
