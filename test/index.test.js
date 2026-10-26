import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  readText,
  writeText,
  readJson,
  writeJson,
  fileExists,
  getFileStats,
  resolvePath,
  getRuntimeInfo,
  delay
} from "../src/index.js";

const execFileAsync = promisify(execFile);

test("FileSystem: writeText and readText round-trip successfully", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "easykit-test-"));
  const testFile = path.join(tempDir, "sample.txt");

  try {
    const writtenPath = await writeText(testFile, "Hello Node.js!");
    assert.equal(writtenPath, path.resolve(testFile));

    const content = await readText(testFile);
    assert.equal(content, "Hello Node.js!");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("FileSystem: writeText automatically creates deeply nested directories", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "easykit-test-"));
  const deepFile = path.join(tempDir, "nested", "level2", "level3", "deep.txt");

  try {
    await writeText(deepFile, "Deep content");
    const content = await readText(deepFile);
    assert.equal(content, "Deep content");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("FileSystem: readText fails clearly when file does not exist", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "easykit-test-"));
  const nonexistent = path.join(tempDir, "does-not-exist.txt");

  try {
    await assert.rejects(
      async () => {
        await readText(nonexistent);
      },
      (err) => {
        assert.equal(err.code, "ENOENT");
        assert.match(err.message, /File not found/);
        return true;
      }
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("FileSystem: invalid inputs throw TypeError", async () => {
  // readText invalid inputs
  await assert.rejects(async () => readText(""), TypeError);
  await assert.rejects(async () => readText("   "), TypeError);
  await assert.rejects(async () => readText(null), TypeError);
  await assert.rejects(async () => readText(123), TypeError);

  // writeText invalid inputs
  await assert.rejects(async () => writeText("", "content"), TypeError);
  await assert.rejects(async () => writeText("file.txt", null), TypeError);
  await assert.rejects(async () => writeText("file.txt", 12345), TypeError);
  await assert.rejects(async () => writeText(null, "content"), TypeError);
});

test("FileSystem: writeJson and readJson round-trip objects and arrays", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "easykit-test-"));
  const jsonFile = path.join(tempDir, "data", "config.json");

  try {
    const payload = {
      name: "node-core-easy-kit",
      version: "1.0.1",
      features: ["zero-dep", "promises", "modern"],
      meta: { active: true, count: 42 }
    };

    const writtenPath = await writeJson(jsonFile, payload);
    assert.equal(writtenPath, path.resolve(jsonFile));

    const parsed = await readJson(jsonFile);
    assert.deepEqual(parsed, payload);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("FileSystem: writeJson respects custom spaces formatting", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "easykit-test-"));
  const jsonFile = path.join(tempDir, "compact.json");

  try {
    await writeJson(jsonFile, { a: 1 }, { spaces: 0 });
    const content = await readText(jsonFile);
    assert.equal(content, '{"a":1}\n');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("FileSystem: readJson throws clear SyntaxError on malformed JSON", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "easykit-test-"));
  const invalidJsonFile = path.join(tempDir, "invalid.json");

  try {
    await writeText(invalidJsonFile, "{ invalid_json: ");
    await assert.rejects(
      async () => readJson(invalidJsonFile),
      (err) => {
        assert.equal(err instanceof SyntaxError, true);
        assert.equal(err.code, "ERR_JSON_PARSE");
        assert.match(err.message, /Failed to parse JSON/);
        return true;
      }
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("FileSystem: readJson and writeJson validate inputs", async () => {
  // readJson validation
  await assert.rejects(async () => readJson(""), TypeError);
  await assert.rejects(async () => readJson("   "), TypeError);
  await assert.rejects(async () => readJson(null), TypeError);

  // writeJson validation
  await assert.rejects(async () => writeJson("", { ok: true }), TypeError);
  await assert.rejects(async () => writeJson("valid.json", { ok: true }, "invalid-options"), TypeError);
  await assert.rejects(async () => writeJson("valid.json", { ok: true }, { spaces: false }), TypeError);
  await assert.rejects(async () => writeJson("valid.json", undefined), TypeError);
});

test("FileSystem: fileExists returns true for existing paths and false for nonexistent paths", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "easykit-test-"));
  const sampleFile = path.join(tempDir, "exists.txt");

  try {
    assert.equal(await fileExists(tempDir), true); // directory check
    assert.equal(await fileExists(sampleFile), false); // file not yet created

    await writeText(sampleFile, "present");
    assert.equal(await fileExists(sampleFile), true); // file now exists
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("FileSystem: fileExists validates input parameter", async () => {
  await assert.rejects(async () => fileExists(""), TypeError);
  await assert.rejects(async () => fileExists("   "), TypeError);
  await assert.rejects(async () => fileExists(null), TypeError);
  await assert.rejects(async () => fileExists(12345), TypeError);
});

test("FileSystem: getFileStats returns accurate metadata for files and directories", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "easykit-test-"));
  const sampleFile = path.join(tempDir, "stat-sample.txt");
  const testPayload = "Hello Node Stats!";

  try {
    await writeText(sampleFile, testPayload);

    // Test file statistics
    const fileStats = await getFileStats(sampleFile);
    assert.equal(fileStats.path, path.resolve(sampleFile));
    assert.equal(fileStats.isFile, true);
    assert.equal(fileStats.isDirectory, false);
    assert.equal(fileStats.size, Buffer.byteLength(testPayload));
    assert.equal(fileStats.createdAt instanceof Date, true);
    assert.equal(fileStats.modifiedAt instanceof Date, true);

    // Test directory statistics
    const dirStats = await getFileStats(tempDir);
    assert.equal(dirStats.path, path.resolve(tempDir));
    assert.equal(dirStats.isFile, false);
    assert.equal(dirStats.isDirectory, true);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("FileSystem: getFileStats throws ENOENT on nonexistent file and validates input", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "easykit-test-"));
  const nonExistent = path.join(tempDir, "ghost.txt");

  try {
    await assert.rejects(
      async () => getFileStats(nonExistent),
      (err) => {
        assert.equal(err.code, "ENOENT");
        assert.match(err.message, /File or directory not found/);
        return true;
      }
    );

    await assert.rejects(async () => getFileStats(""), TypeError);
    await assert.rejects(async () => getFileStats("   "), TypeError);
    await assert.rejects(async () => getFileStats(null), TypeError);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("Path: resolvePath resolves segments into an absolute path", () => {
  const resolved = resolvePath("folder", "subfolder", "file.txt");
  assert.equal(path.isAbsolute(resolved), true);
  assert.equal(resolved.endsWith(path.join("folder", "subfolder", "file.txt")), true);
});

test("Path: resolvePath validates input segments", () => {
  assert.throws(() => resolvePath(), TypeError);
  assert.throws(() => resolvePath(""), TypeError);
  assert.throws(() => resolvePath("valid", ""), TypeError);
  assert.throws(() => resolvePath("valid", null), TypeError);
  assert.throws(() => resolvePath(123), TypeError);
});

test("Process: getRuntimeInfo returns correct runtime details without leaking secrets", () => {
  const info = getRuntimeInfo();

  assert.equal(typeof info.nodeVersion, "string");
  assert.equal(info.nodeVersion.startsWith("v"), true);

  assert.equal(typeof info.platform, "string");
  assert.equal(info.platform, process.platform);

  assert.equal(typeof info.architecture, "string");
  assert.equal(info.architecture, process.arch);

  assert.equal(typeof info.workingDirectory, "string");
  assert.equal(info.workingDirectory, process.cwd());

  // Ensure process.env or sensitive secrets are NEVER exposed
  assert.equal("env" in info, false);
  assert.equal("PATH" in info, false);
  assert.equal("USER" in info, false);
  assert.equal("HOME" in info, false);
  assert.equal(Object.keys(info).length, 4);
});

test("Timers: delay resolves after waiting", async () => {
  const start = Date.now();
  await assert.doesNotReject(delay(20));
  const elapsed = Date.now() - start;
  assert.equal(elapsed >= 15, true);
});

test("Timers: delay rejects invalid durations", async () => {
  // Negative numbers throw RangeError
  await assert.rejects(async () => delay(-1), RangeError);
  await assert.rejects(async () => delay(-500), RangeError);
  await assert.rejects(async () => delay(Infinity), RangeError);

  // Non-numbers or NaN throw TypeError
  await assert.rejects(async () => delay(NaN), TypeError);
  await assert.rejects(async () => delay("50"), TypeError);
  await assert.rejects(async () => delay(null), TypeError);
  await assert.rejects(async () => delay(undefined), TypeError);
});

test("CLI: demonstrates commands when executed with node", async () => {
  const cliPath = path.resolve("bin", "cli.js");

  // Test --help
  const { stdout: helpOut } = await execFileAsync(process.execPath, [cliPath, "--help"]);
  assert.match(helpOut, /node-core-easy-kit \(CLI\)/);

  // Test info
  const { stdout: infoOut } = await execFileAsync(process.execPath, [cliPath, "info"]);
  assert.match(infoOut, /Node\.js Runtime Environment:/);
  assert.match(infoOut, /Node Version:/);
});
