# node-core-easy-kit 🚀

A beginner-friendly, zero-dependency Node.js toolkit demonstrating **Node.js core modules**:
- `node:fs/promises` (modern asynchronous file & directory operations)
- `node:path` (cross-platform path resolution)
- `node:process` (runtime environment inspection without leaking secrets)
- `node:timers/promises` (promise-based async delays)
- `node:os` (system hardware, memory, and OS inspection)
- `node:crypto` (cryptographic hashing without third-party libraries)

Whether you are building your first npm package or learning Node.js fundamentals, this library provides a clean, predictable, and fully-tested reference implementation.

---

## 📦 Features

- **Zero Runtime Dependencies**: Uses 100% native Node.js standard library modules.
- **Modern ES Modules (`import`/`export`)**: Ready for modern JavaScript applications.
- **Safe Path & Directory Handling**: `writeText()` and `writeJson()` automatically create missing parent directories before writing.
- **JSON Utilities**: Convenient, safe reading and formatted writing of JSON files with syntax error handling.
- **File & Directory Inspection**: Easily test file existence, retrieve statistics (`stat`), and list directory contents with optional recursive traversal.
- **System & Hardware Inspection**: Inspects safe CPU, RAM, OS, and platform metrics without exposing environment secrets.
- **Zero-Dependency Hashing**: Generate SHA-256 or MD5 hashes out of the box with `node:crypto`.
- **Built-in CLI**: Includes a lightweight command-line tool for terminal inspections and hashing.
- **Fully Tested**: 100% test coverage using Node.js's built-in native test runner (`node:test`).
- **Continuous Integration**: Automated GitHub Actions CI workflow testing on Node 18, 20, and 22 across Linux, macOS, and Windows.

---

## 📋 Requirements

- **Node.js 18.0.0 or higher**
- No external libraries or compilers required.

---

## 📥 Installation

```bash
npm install node-core-easy-kit
```

---

## ⚡ Quick Start

```javascript
import {
  writeText,
  readText,
  writeJson,
  readJson,
  fileExists,
  getFileStats,
  listFiles,
  resolvePath,
  getRuntimeInfo,
  getSystemInfo,
  hashText,
  delay
} from "node-core-easy-kit";

// 1. Resolve a file path safely
const filePath = resolvePath("my-folder", "config.json");

// 2. Write formatted JSON (automatically creates "my-folder" if needed)
await writeJson(filePath, { theme: "dark", autoSave: true });

// 3. Check existence and read it back
if (await fileExists(filePath)) {
  const data = await readJson(filePath);
  console.log("Config loaded:", data);
}

// 4. Compute a cryptographic hash
console.log("SHA-256:", hashText("secret-token"));

// 5. Inspect system details (without leaking credentials)
console.log("System info:", getSystemInfo());

// 6. Asynchronously wait 500 milliseconds
console.log("Waiting...");
await delay(500);
console.log("Resumed!");
```

---

## 📖 API Reference

### 1. `readText(filePath)`
Reads a UTF-8 encoded text file asynchronously.

- **Demonstrates:** `node:fs/promises` (`readFile`)
- **Parameters:**
  - `filePath` (`string`): The relative or absolute path to the file.
- **Returns:** `Promise<string>` — The UTF-8 text contents of the file.
- **Throws:**
  - `TypeError`: If `filePath` is not a non-empty string.
  - `Error` with `.code = "ENOENT"`: If the target file does not exist.

---

### 2. `writeText(filePath, content)`
Writes a string to a file. Automatically creates any missing parent directories.

- **Demonstrates:** `node:fs/promises` (`writeFile`, `mkdir`) and `node:path` (`resolve`, `dirname`)
- **Parameters:**
  - `filePath` (`string`): Target file path.
  - `content` (`string`): The text content to write.
- **Returns:** `Promise<string>` — The resolved absolute path of the written file.
- **Throws:**
  - `TypeError`: If `filePath` is not a non-empty string or `content` is not a string.

---

### 3. `readJson(filePath)`
Reads and parses a JSON file asynchronously with informative error wrapping.

- **Demonstrates:** `node:fs/promises` (`readFile`) and native JSON parsing.
- **Parameters:**
  - `filePath` (`string`): Path to the JSON file.
- **Returns:** `Promise<any>` — Parsed JavaScript value or object.
- **Throws:**
  - `TypeError`: If `filePath` is not a non-empty string.
  - `SyntaxError` with `.code = "ERR_JSON_PARSE"`: If file contains invalid JSON.
  - `Error` with `.code = "ENOENT"`: If file does not exist.

---

### 4. `writeJson(filePath, data, options?)`
Serializes data to formatted JSON and writes to a file, creating parent directories automatically.

- **Demonstrates:** `node:fs/promises` (`writeFile`, `mkdir`) and `JSON.stringify`.
- **Parameters:**
  - `filePath` (`string`): Target file path.
  - `data` (`any`): Data to serialize.
  - `options` (`object`, optional):
    - `spaces` (`number | string`): Indentation spaces (default: `2`).
- **Returns:** `Promise<string>` — Resolved absolute path of the written file.

---

### 5. `fileExists(filePath)`
Checks whether a file or directory exists asynchronously without masking permission errors.

- **Demonstrates:** `node:fs/promises` (`stat`).
- **Parameters:**
  - `filePath` (`string`): Target path to check.
- **Returns:** `Promise<boolean>` — `true` if exists, `false` if not found.

---

### 6. `getFileStats(filePath)`
Retrieves metadata statistics for a file or directory.

- **Demonstrates:** `node:fs/promises` (`stat`).
- **Parameters:**
  - `filePath` (`string`): Target path.
- **Returns:** `Promise<{ path, size, isFile, isDirectory, createdAt, modifiedAt }>`

---

### 7. `listFiles(dirPath, options?)`
Lists all files in a directory, with optional recursive traversal into subdirectories.

- **Demonstrates:** `node:fs/promises` (`readdir`).
- **Parameters:**
  - `dirPath` (`string`): Directory to scan.
  - `options` (`object`, optional):
    - `recursive` (`boolean`): Whether to scan subdirectories (default: `false`).
- **Returns:** `Promise<string[]>` — Sorted array of relative file paths.

---

### 8. `resolvePath(...parts)`
Combines path segments into a normalized absolute path matching the host operating system's separator.

- **Demonstrates:** `node:path` (`resolve`).
- **Parameters:**
  - `...parts` (`string[]`): One or more path segment strings.
- **Returns:** `string` — Normalized absolute path.

---

### 9. `getRuntimeInfo()`
Retrieves safe details about the Node.js runtime process without leaking `process.env`.

- **Demonstrates:** `node:process` (`version`, `platform`, `arch`, `cwd()`).
- **Returns:** `Object` (`nodeVersion`, `platform`, `architecture`, `workingDirectory`).

---

### 10. `getSystemInfo()`
Retrieves safe system and hardware information.

- **Demonstrates:** `node:os` (`platform`, `type`, `arch`, `cpus`, `totalmem`, `freemem`, `uptime`, `homedir`).
- **Returns:** `Object` (`platform`, `type`, `architecture`, `cpuCount`, `totalMemoryBytes`, `freeMemoryBytes`, `uptimeSeconds`, `homeDirectory`).

---

### 11. `hashText(text, algorithm?)`
Computes a cryptographic hash digest of a text string using native Node.js crypto.

- **Demonstrates:** `node:crypto` (`createHash`).
- **Parameters:**
  - `text` (`string`): The text to hash.
  - `algorithm` (`string`, optional): Algorithm name (default: `"sha256"`, supports `"md5"`, `"sha512"`, etc.).
- **Returns:** `string` — Hexadecimal hash digest.

---

### 12. `delay(milliseconds)`
Pauses asynchronous execution for the specified duration using Promise-based timers.

- **Demonstrates:** `node:timers/promises` (`setTimeout`).
- **Parameters:**
  - `milliseconds` (`number`): Non-negative number of milliseconds to pause.
- **Returns:** `Promise<void>`

---

## 💻 Command Line Interface (CLI)

The package includes an interactive command-line interface for terminal usage.

### Running via npx:
```bash
# Print Node.js runtime information
npx node-core-easy-kit info

# Print OS & hardware details (CPUs, RAM, uptime)
npx node-core-easy-kit sysinfo

# Compute cryptographic hashes
npx node-core-easy-kit hash "hello world"
npx node-core-easy-kit hash "hello world" md5

# Pause execution in terminal for 2 seconds
npx node-core-easy-kit delay 2000

# Resolve path segments into absolute path
npx node-core-easy-kit resolve src index.js

# Display CLI help
npx node-core-easy-kit --help
```

---

## 🧪 Testing

This project uses Node.js's built-in native test runner (`node:test`) and strict assertion module (`node:assert/strict`).

Run the test suite with:

```bash
npm test
```

Run the hands-on demonstration script with:

```bash
npm run demo
```

All file tests run inside safe, temporary directories (`node:os.tmpdir()`) and clean up automatically.

---

## 🚀 How to Publish to npm

Follow these steps to publish this package:

```bash
# 1. Run all tests
npm test

# 2. Inspect packaged contents (dry-run)
npm pack --dry-run

# 3. Publish to npm
npm publish
```

---

## 🤝 Contributing

1. Fork this repository.
2. Create a new branch: `git checkout -b feature/my-improvement`.
3. Ensure all tests pass: `npm test`.
4. Submit a pull request explaining your changes.

---

## 📄 License

MIT License. See [LICENSE](file:///Users/sanchitbaviskar07@gmail.com%20/Downloads/node-core-easy-kit/LICENSE) for details.
