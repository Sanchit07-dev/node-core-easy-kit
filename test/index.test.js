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
