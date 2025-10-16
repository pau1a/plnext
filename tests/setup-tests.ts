import "@testing-library/jest-dom/vitest";

// Provide a Crypto implementation for jsdom tests.
if (typeof globalThis.crypto === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { webcrypto } = require("node:crypto");
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
  });
}
