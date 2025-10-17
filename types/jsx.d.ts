import type { JSX as ReactJSX } from "react";

declare global {
  namespace JSX {
    interface Element extends ReactJSX.Element {}
    interface ElementClass extends ReactJSX.ElementClass {}
    interface IntrinsicElements extends ReactJSX.IntrinsicElements {}
  }
}

export {};
