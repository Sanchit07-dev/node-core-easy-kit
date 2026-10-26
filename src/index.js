/**
 * node-core-easy-kit
 *
 * Beginner-friendly utilities demonstrating Node.js core modules.
 * Built with 100% built-in Node.js modules and zero external runtime dependencies.
 */

import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import crypto from "node:crypto";
import os from "node:os";
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
 * Reads and parses a JSON file asynchronously.
 *
 * Demonstrates: `node:fs/promises` (`readFile`) and native JSON parsing.
 *
 * @param {string} filePath - Path to the JSON file to read.
 * @returns {Promise<any>} The parsed JSON data.
 * @throws {TypeError} If filePath is not a non-empty string.
 * @throws {Error} If the file does not exist (ENOENT) or contains invalid JSON.
 *
 * @example
 * import { readJson } from "node-core-easy-kit";
 * const config = await readJson("./package.json");
 * console.log(config.name);
 */
export async function readJson(filePath) {
  if (typeof filePath !== "string" || filePath.trim() === "") {
    throw new TypeError("filePath must be a non-empty string");
  }

  const content = await readText(filePath);
  try {
    return JSON.parse(content);
  } catch (error) {
    const resolved = path.resolve(filePath);
    const parseError = new SyntaxError(`Failed to parse JSON from "${resolved}": ${error.message}`);
    parseError.code = "ERR_JSON_PARSE";
    parseError.originalError = error;
    throw parseError;
  }
}

/**
 * Serializes data to JSON and writes it to a file with automatic directory creation.
 *
 * Demonstrates: `node:fs/promises` (`writeFile`, `mkdir`) and formatted JSON serialization.
 *
 * @param {string} filePath - Target file path.
 * @param {any} data - Data to serialize and write.
 * @param {{ spaces?: number | string }} [options={ spaces: 2 }] - Serialization options.
 * @returns {Promise<string>} The resolved absolute path of the written file.
 * @throws {TypeError} If filePath is not a non-empty string or options are invalid.
 *
 * @example
 * import { writeJson } from "node-core-easy-kit";
 * await writeJson("output/settings.json", { theme: "dark", autoSave: true });
 */
export async function writeJson(filePath, data, options = {}) {
  if (typeof filePath !== "string" || filePath.trim() === "") {
    throw new TypeError("filePath must be a non-empty string");
  }
  if (options !== null && typeof options !== "object") {
    throw new TypeError("options must be an object if provided");
  }

  const spaces = options?.spaces !== undefined ? options.spaces : 2;
  if (typeof spaces !== "number" && typeof spaces !== "string" && spaces !== null) {
    throw new TypeError("options.spaces must be a number, string, or null");
  }

  let jsonString;
  try {
    jsonString = JSON.stringify(data, null, spaces);
  } catch (error) {
    throw new TypeError(`Failed to serialize data to JSON: ${error.message}`);
  }

  if (jsonString === undefined) {
    throw new TypeError("Cannot serialize undefined value to JSON");
  }

  const content = jsonString + "\n";
  return await writeText(filePath, content);
}

/**
 * Checks whether a file or directory exists asynchronously.
 *
 * Demonstrates: `node:fs/promises` (`stat`).
 *
 * @param {string} filePath - Path to check.
 * @returns {Promise<boolean>} True if the file or directory exists, false otherwise.
 * @throws {TypeError} If filePath is not a non-empty string.
 *
 * @example
 * import { fileExists } from "node-core-easy-kit";
 * if (await fileExists("./config.json")) {
 *   console.log("Config exists!");
 * }
 */
export async function fileExists(filePath) {
  if (typeof filePath !== "string" || filePath.trim() === "") {
    throw new TypeError("filePath must be a non-empty string");
  }

  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

/**
 * Retrieves file or directory metadata statistics.
 *
 * Demonstrates: `node:fs/promises` (`stat`).
 *
 * @param {string} filePath - Path to the file or directory.
 * @returns {Promise<{
 *   path: string,
 *   size: number,
 *   isFile: boolean,
 *   isDirectory: boolean,
 *   createdAt: Date,
 *   modifiedAt: Date
 * }>} File metadata object.
 * @throws {TypeError} If filePath is not a non-empty string.
 * @throws {Error} If the file or directory does not exist (code 'ENOENT').
 *
 * @example
 * import { getFileStats } from "node-core-easy-kit";
 * const stats = await getFileStats("./package.json");
 * console.log(`Size: ${stats.size} bytes, Modified: ${stats.modifiedAt}`);
 */
export async function getFileStats(filePath) {
  if (typeof filePath !== "string" || filePath.trim() === "") {
    throw new TypeError("filePath must be a non-empty string");
  }

  const absolutePath = path.resolve(filePath);
  try {
    const fileStat = await stat(filePath);
    return {
      path: absolutePath,
      size: fileStat.size,
      isFile: fileStat.isFile(),
      isDirectory: fileStat.isDirectory(),
      createdAt: fileStat.birthtime,
      modifiedAt: fileStat.mtime
    };
  } catch (error) {
    if (error && error.code === "ENOENT") {
      const notFoundError = new Error(`File or directory not found: "${absolutePath}"`);
      notFoundError.code = "ENOENT";
      notFoundError.originalError = error;
      throw notFoundError;
    }
    throw error;
  }
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
 * Retrieves safe system and hardware information.
 *
 * Demonstrates: `node:os` (`platform`, `type`, `arch`, `cpus`, `totalmem`, `freemem`, `uptime`, `homedir`).
 *
 * @returns {{
 *   platform: string,
 *   type: string,
 *   architecture: string,
 *   cpuCount: number,
 *   totalMemoryBytes: number,
 *   freeMemoryBytes: number,
 *   uptimeSeconds: number,
 *   homeDirectory: string
 * }} Safe system environment details.
 *
 * @example
 * import { getSystemInfo } from "node-core-easy-kit";
 * const sys = getSystemInfo();
 * console.log(`CPUs: ${sys.cpuCount}, Total RAM: ${sys.totalMemoryBytes}`);
 */
export function getSystemInfo() {
  return {
    platform: os.platform(),
    type: os.type(),
    architecture: os.arch(),
    cpuCount: os.cpus().length,
    totalMemoryBytes: os.totalmem(),
    freeMemoryBytes: os.freemem(),
    uptimeSeconds: Math.floor(os.uptime()),
    homeDirectory: os.homedir()
  };
}

/**
 * Computes a cryptographic hash digest of a text string.
 *
 * Demonstrates: `node:crypto` (`createHash`).
 *
 * @param {string} text - The input string to hash.
 * @param {string} [algorithm="sha256"] - Hash algorithm (e.g. 'sha256', 'md5', 'sha512').
 * @returns {string} Hexadecimal hash digest.
 * @throws {TypeError} If text is not a string or algorithm is not a non-empty string.
 * @throws {Error} If the specified algorithm is not supported.
 *
 * @example
 * import { hashText } from "node-core-easy-kit";
 * const hash = hashText("Hello World");
 * console.log(`SHA-256: ${hash}`);
 */
export function hashText(text, algorithm = "sha256") {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }
  if (typeof algorithm !== "string" || algorithm.trim() === "") {
    throw new TypeError("algorithm must be a non-empty string");
  }

  try {
    return crypto.createHash(algorithm).update(text, "utf8").digest("hex");
  } catch (error) {
    const invalidAlgError = new Error(`Unsupported hash algorithm "${algorithm}": ${error.message}`);
    invalidAlgError.code = "ERR_CRYPTO_INVALID_ALGORITHM";
    invalidAlgError.originalError = error;
    throw invalidAlgError;
  }
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
