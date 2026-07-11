/**
 * loadBrowserModule — evaluate a browser-targeted js/*.js file (which assigns to
 * window.*) inside a sandboxed Node context and return the chosen global.
 *
 * The client modules in this project are not ES modules; they declare a top-level
 * `const X = {...}` and finish with `window.X = X`. To unit-test their PURE methods
 * (money/aging math, CSV-injection defang, URL scheme guard) without a browser, we
 * run the file in a fresh `vm` context that provides minimal `window`/`document`/
 * `console` stubs, then read back the global the file exported.
 *
 * IMPORTANT: this only loads the file's top-level code. The methods under test must
 * not touch the DOM at module-evaluation time — they don't; DOM access happens only
 * inside methods we call deliberately (e.g. render()), which these tests avoid.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..", "..");

export function loadBrowserModule(relativePath, globalName) {
  const abs = resolve(PROJECT_ROOT, relativePath);
  const code = readFileSync(abs, "utf-8");

  // Minimal stubs. Methods we test never invoke these; they exist so that the
  // file's top-level `window.X = X` assignment (and any benign top-level refs)
  // do not throw during evaluation.
  const noop = () => {};
  const documentStub = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
      style: {},
      setAttribute: noop,
      appendChild: noop,
      addEventListener: noop,
      classList: { add: noop, remove: noop },
    }),
    addEventListener: noop,
    body: { style: {}, dataset: {}, appendChild: noop, removeChild: noop },
  };

  const windowStub = {};
  const sandbox = {
    window: windowStub,
    document: documentStub,
    console: { log: noop, warn: noop, error: noop },
    navigator: { userAgent: "node-test" },
    location: { href: "", search: "" },
    URL, // real WHATWG URL for the directory scheme-guard test
    URLSearchParams,
    showToast: noop,
    setTimeout,
    clearTimeout,
  };
  // Let the module see `window` both as a global and as a property of itself.
  windowStub.window = windowStub;

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: abs });

  const exported = windowStub[globalName];
  if (!exported) {
    throw new Error(
      `loadBrowserModule: ${relativePath} did not assign window.${globalName}`,
    );
  }
  return exported;
}

export function readSource(relativePath) {
  return readFileSync(resolve(PROJECT_ROOT, relativePath), "utf-8");
}

export { PROJECT_ROOT };
