#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../../..");
const artifactRoot = path.join(repoRoot, ".artifacts", "verification");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let index = 0; index < rest.length; index += 1) {
    const key = rest[index];
    if (!key.startsWith("--") || index + 1 >= rest.length) fail(`Invalid argument: ${key}`);
    options[key.slice(2)] = rest[index + 1];
    index += 1;
  }
  return { command, options };
}

function requireRun(options) {
  const runId = options.run;
  if (!runId || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(runId)) {
    fail("Pass --run with letters, numbers, dots, underscores, or hyphens.");
  }
  return runId;
}

function pathsFor(runId) {
  const runDir = path.join(artifactRoot, runId);
  return { runDir, receiptPath: path.join(runDir, "receipt.json") };
}

function readReceipt(runId) {
  const { receiptPath } = pathsFor(runId);
  if (!existsSync(receiptPath)) fail(`No receipt for run ${runId}. Launch it first.`);
  return JSON.parse(readFileSync(receiptPath, "utf8"));
}

function processExists(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function portIsFree(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") resolve(false);
      else reject(error);
    });
    server.listen({ host: "127.0.0.1", port }, () => server.close(() => resolve(true)));
  });
}

async function fetchText(url, timeoutMs = 5000) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  return { response, text: await response.text() };
}

async function waitForSite(origin, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const { response, text } = await fetchText(origin);
      if (response.ok && text.includes("Taylor McNeil") && text.includes("docs-as-portfolio")) return;
      lastError = new Error(`Unexpected response ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw lastError ?? new Error("Timed out waiting for site");
}

function gitHead() {
  return spawnSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).stdout.trim();
}

function listenerForPort(port) {
  const pidResult = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-Fp"], { encoding: "utf8" });
  const pid = Number(pidResult.stdout.match(/^p(\d+)$/m)?.[1]);
  if (!Number.isInteger(pid)) return null;
  const cwdResult = spawnSync("lsof", ["-a", "-p", String(pid), "-d", "cwd", "-Fn"], { encoding: "utf8" });
  const cwd = cwdResult.stdout.match(/^n(.+)$/m)?.[1];
  return cwd ? { pid, cwd } : null;
}

async function attach(options) {
  const runId = requireRun(options);
  const port = Number(options.port);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) fail("Pass --port between 1024 and 65535.");
  const { runDir, receiptPath } = pathsFor(runId);
  if (existsSync(receiptPath)) fail(`Run ${runId} already has a receipt. Choose another ID.`);
  const listener = listenerForPort(port);
  if (!listener) fail(`No listener found on port ${port}.`);
  if (path.resolve(listener.cwd) !== repoRoot) fail(`Port ${port} belongs to another checkout: ${listener.cwd}`);

  const origin = `http://localhost:${port}`;
  await waitForSite(origin, 10000);
  mkdirSync(runDir, { recursive: true });
  const receipt = {
    runId,
    pid: listener.pid,
    port,
    origin,
    repoRoot,
    serverCwd: listener.cwd,
    borrowed: true,
    gitHead: gitHead(),
    startedAt: new Date().toISOString(),
  };
  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(JSON.stringify(receipt, null, 2));
}

async function launch(options) {
  const runId = requireRun(options);
  const port = Number(options.port);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) fail("Pass --port between 1024 and 65535.");
  const { runDir, receiptPath } = pathsFor(runId);
  if (existsSync(receiptPath)) fail(`Run ${runId} already has a receipt. Clean it up or choose another ID.`);
  if (!(await portIsFree(port))) fail(`Port ${port} is already in use; refusing to borrow it.`);

  mkdirSync(runDir, { recursive: true });
  const logPath = path.join(runDir, "server.log");
  const logFd = openSync(logPath, "a");
  const child = spawn("npm", ["run", "dev", "--", "--port", String(port)], {
    cwd: repoRoot,
    detached: true,
    stdio: ["ignore", logFd, logFd],
  });
  closeSync(logFd);

  const receipt = {
    runId,
    pid: child.pid,
    port,
    origin: `http://localhost:${port}`,
    repoRoot,
    serverCwd: repoRoot,
    borrowed: false,
    gitHead: gitHead(),
    startedAt: new Date().toISOString(),
    logPath,
  };
  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

  try {
    await waitForSite(receipt.origin);
  } catch (error) {
    try { process.kill(-receipt.pid, "SIGTERM"); } catch {}
    fail(`Launch failed: ${error.message}. See ${logPath}`);
  }
  console.log(JSON.stringify(receipt, null, 2));
}

async function doctor(options, { quiet = false } = {}) {
  const runId = requireRun(options);
  const receipt = readReceipt(runId);
  if (receipt.repoRoot !== repoRoot) fail(`Receipt points at another checkout: ${receipt.repoRoot}`);
  if (!processExists(receipt.pid)) fail(`Recorded process ${receipt.pid} is not running.`);
  const borrowedListener = receipt.borrowed ? listenerForPort(receipt.port) : null;

  const home = await fetchText(receipt.origin);
  const quickstart = await fetchText(`${receipt.origin}/quickstart`);
  const checks = {
    process: true,
    checkout: receipt.repoRoot === repoRoot,
    listener: !receipt.borrowed || (
      borrowedListener?.pid === receipt.pid && path.resolve(borrowedListener.cwd) === repoRoot
    ),
    home: home.response.ok && home.text.includes("Taylor McNeil") && home.text.includes("docs-as-portfolio"),
    quickstart: quickstart.response.ok && quickstart.text.includes("Quickstart"),
  };
  if (!Object.values(checks).every(Boolean)) fail(`Doctor failed: ${JSON.stringify(checks)}`);
  const result = { runId, origin: receipt.origin, pid: receipt.pid, borrowed: receipt.borrowed, gitHead: receipt.gitHead, checks };
  if (!quiet) console.log(JSON.stringify(result, null, 2));
  return receipt;
}

async function smoke(options) {
  const runId = requireRun(options);
  const receipt = await doctor(options, { quiet: true });
  const { runDir } = pathsFor(runId);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const page = await context.newPage();
  const summary = { runId, origin: receipt.origin, actions: [] };

  try {
    await page.goto(receipt.origin, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Introduction" }).waitFor();
    await page.screenshot({ path: path.join(runDir, "01-home.png"), fullPage: true });

    await page.locator('a[href="/quickstart"]').first().click();
    await page.getByRole("heading", { name: "Quickstart" }).waitFor();
    summary.actions.push({ action: "click /quickstart", result: page.url() });
    await page.screenshot({ path: path.join(runDir, "02-quickstart.png"), fullPage: true });

    const themeButton = page.getByTitle("Toggle theme").filter({ visible: true });
    const beforeTheme = await page.locator("html").getAttribute("class");
    await themeButton.click();
    await page.waitForFunction((before) => document.documentElement.className !== before, beforeTheme);
    const afterTheme = await page.locator("html").getAttribute("class");
    summary.actions.push({ action: "toggle theme", before: beforeTheme, result: afterTheme });
    await page.screenshot({ path: path.join(runDir, "03-theme-toggled.png"), fullPage: true });

    await page.locator('a[href="/aampersand"]').first().click();
    await page.getByRole("heading", { name: "aampersand", exact: true }).waitFor();
    await page.getByRole("link", { name: /What if Icarus Had Sunscreen/ }).click();
    await page.waitForURL("**/aampersand/a-sirens-song");
    await page.getByRole("heading", { level: 1, name: "A Siren's Song", exact: true }).waitFor();
    summary.actions.push({ action: "open first aampersand devlog", result: page.url() });
    await page.screenshot({ path: path.join(runDir, "04-devlog.png"), fullPage: true });

    writeFileSync(path.join(runDir, "smoke-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await context.tracing.stop({ path: path.join(runDir, "smoke-trace.zip") });
    await browser.close();
  }
}

async function cleanup(options) {
  const runId = requireRun(options);
  const receipt = readReceipt(runId);
  if (receipt.repoRoot !== repoRoot) fail(`Refusing to clean a receipt from another checkout: ${receipt.repoRoot}`);

  if (!receipt.borrowed && processExists(receipt.pid)) {
    try { process.kill(-receipt.pid, "SIGTERM"); } catch (error) { fail(`Could not stop process group ${receipt.pid}: ${error.message}`); }
    const deadline = Date.now() + 10000;
    while (processExists(receipt.pid) && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    if (processExists(receipt.pid)) fail(`Process ${receipt.pid} did not stop after SIGTERM.`);
  }
  const { runDir } = pathsFor(runId);
  const result = {
    runId,
    borrowed: receipt.borrowed,
    stoppedPid: receipt.borrowed ? null : receipt.pid,
    preservedPid: receipt.borrowed ? receipt.pid : null,
    evidence: runDir,
    evidencePreserved: existsSync(runDir),
  };
  writeFileSync(path.join(runDir, "cleanup.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
}

const { command, options } = parseArgs(process.argv.slice(2));
if (command === "attach") await attach(options);
else if (command === "launch") await launch(options);
else if (command === "doctor") await doctor(options);
else if (command === "smoke") await smoke(options);
else if (command === "cleanup") await cleanup(options);
else fail("Usage: verify-site.mjs <attach|launch|doctor|smoke|cleanup> --run <id> [--port <port>]");
