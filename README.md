# node-core-easy-kit 🚀

A beginner-friendly, zero-dependency Node.js toolkit demonstrating **Node.js core modules**:
- `node:fs/promises` (modern asynchronous file operations)
- `node:path` (cross-platform path resolution)
- `node:process` (runtime environment inspection without leaking secrets)
- `node:timers/promises` (promise-based async delays)

Whether you are building your first npm package or learning Node.js fundamentals, this library provides a clean, predictable, and fully-tested reference implementation.

---

## 📦 Features

- **Zero Runtime Dependencies**: Uses 100% native Node.js standard library modules.
- **Modern ES Modules (`import`/`export`)**: Ready for modern JavaScript applications.
- **Safe Path & Directory Handling**: `writeText()` automatically creates missing parent directories before writing.
- **Secure Runtime Inspection**: Inspects Node.js version, platform, arch, and working directory without exposing environment secrets.
- **Predictable Error Handling**: Meaningful errors and input validation for missing files, invalid arguments, and negative durations.
- **Built-in CLI**: Includes a lightweight command-line tool for quick terminal inspections.
- **Fully Tested**: 100% test coverage using Node.js's built-in native test runner (`node:test`).

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
  resolvePath,
  getRuntimeInfo,
  delay
} from "node-core-easy-kit";

// 1. Resolve a file path safely
const filePath = resolvePath("my-folder", "notes.txt");

// 2. Write text (automatically creates "my-folder" if it doesn't exist)
await writeText(filePath, "Learning Node.js core modules!");

// 3. Read it back
const content = await readText(filePath);
console.log("File content:", content);

// 4. Inspect runtime details (without leaking credentials)
console.log("Runtime info:", getRuntimeInfo());

// 5. Asynchronously wait 500 milliseconds
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

```javascript
import { readText } from "node-core-easy-kit";

try {
  const content = await readText("./data/config.json");
  console.log(content);
} catch (error) {
  if (error.code === "ENOENT") {
    console.error("The requested file was not found.");
  }
}
```

---

### 2. `writeText(filePath, content)`
Writes a string to a file. If any parent directories in the path do not exist, they are created automatically. If the file already exists, it is overwritten.

- **Demonstrates:** `node:fs/promises` (`writeFile`, `mkdir`) and `node:path` (`resolve`, `dirname`)
- **Parameters:**
  - `filePath` (`string`): Target file path.
  - `content` (`string`): The text content to write.
- **Returns:** `Promise<string>` — The resolved absolute path of the written file.
- **Throws:**
  - `TypeError`: If `filePath` is not a non-empty string or `content` is not a string.

```javascript
import { writeText } from "node-core-easy-kit";

// Creates 'reports/2026/january/' folders automatically
const savedPath = await writeText("reports/2026/january/summary.txt", "All systems operational.");
console.log("Saved at:", savedPath);
```

---

### 3. `resolvePath(...parts)`
Combines multiple path segments into an absolute, normalized path matching your operating system's separator (`/` on macOS/Linux, `\` on Windows).

- **Demonstrates:** `node:path` (`resolve`)
- **Parameters:**
  - `...parts` (`string[]`): One or more path segment strings.
- **Returns:** `string` — The absolute path.
- **Throws:**
  - `TypeError`: If no segments are provided or any segment is not a non-empty string.

```javascript
import { resolvePath } from "node-core-easy-kit";

const target = resolvePath("uploads", "images", "avatar.png");
console.log(target);
// On macOS: /Users/username/project/uploads/images/avatar.png
// On Windows: C:\Users\username\project\uploads\images\avatar.png
```

---

### 4. `getRuntimeInfo()`
Retrieves essential, safe details about the current operating environment. **Crucially, it never exposes `process.env` or sensitive variables.**

- **Demonstrates:** `node:process` (`version`, `platform`, `arch`, `cwd()`)
- **Returns:** `Object`:
  - `nodeVersion` (`string`): Current Node.js version (e.g., `"v20.10.0"`).
  - `platform` (`string`): OS platform (e.g., `"darwin"`, `"win32"`, `"linux"`).
  - `architecture` (`string`): CPU architecture (e.g., `"x64"`, `"arm64"`).
  - `workingDirectory` (`string`): Current working directory path.

```javascript
import { getRuntimeInfo } from "node-core-easy-kit";

const info = getRuntimeInfo();
console.log(`Running on Node ${info.nodeVersion} on ${info.platform} (${info.architecture})`);
```

---

### 5. `delay(milliseconds)`
Pauses execution asynchronously for the specified number of milliseconds using modern Promise-based timers.

- **Demonstrates:** `node:timers/promises` (`setTimeout`)
- **Parameters:**
  - `milliseconds` (`number`): Non-negative number of milliseconds to pause.
- **Returns:** `Promise<void>` — Resolves when the time has passed.
- **Throws:**
  - `TypeError`: If `milliseconds` is not a number or is `NaN`.
  - `RangeError`: If `milliseconds` is negative or non-finite.

```javascript
import { delay } from "node-core-easy-kit";

console.log("Starting countdown...");
await delay(1000);
console.log("1 second passed!");
```

---

## 💻 Command Line Interface (CLI)

The package includes an optional command-line interface for terminal usage.

### Running via npx:
```bash
# Print runtime information
npx node-core-easy-kit info

# Pause execution in terminal for 2 seconds
npx node-core-easy-kit delay 2000

# Resolve path segments
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

All file tests run inside safe, temporary directories (`node:os.tmpdir()`) and clean up automatically.

---

## 🚀 How to Publish to npm

Follow these steps to publish this package or your own customized copy:

### 1. Verify the Package Name Availability
Check if your desired package name is already taken:
```bash
npm view node-core-easy-kit
```
- If it returns **`404 Not Found`**, the name is available!
- If the name is already taken, either choose a new name or publish under your npm username scope:
  ```json
  "name": "@yourusername/node-core-easy-kit"
  ```

### 2. Prepare an npm Account
If you don't have an npm account:
1. Sign up at [npmjs.com](https://www.npmjs.com/).
2. Verify your email address (required for publishing).
3. Enable Two-Factor Authentication (2FA) for security.

### 3. Log In to npm via Terminal
```bash
npm login
```
Follow the web authentication prompt to log in securely.

### 4. Run Pre-flight Checks
Make sure tests pass and verify exactly which files will be published:
```bash
# 1. Run all tests
npm test

# 2. Inspect packaged contents (dry-run)
npm pack --dry-run
```
Notice that only `src/`, `bin/`, `README.md`, and `LICENSE` are included.

### 5. Publish to npm
- For standard unscoped packages:
  ```bash
  npm publish
  ```
- For scoped packages (`@yourusername/package`):
  ```bash
  npm publish --access public
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
