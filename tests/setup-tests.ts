import "@testing-library/jest-dom/vitest";
import { webcrypto } from "node:crypto";

// Provide a Crypto implementation for jsdom tests.
if (typeof globalThis.crypto === "undefined") {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
  });
}
