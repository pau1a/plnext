import type { JSX as ReactJSX } from "react";

declare global {
  namespace JSX {
    export type Element = ReactJSX.Element;
    export type ElementClass = ReactJSX.ElementClass;
    export type IntrinsicElements = ReactJSX.IntrinsicElements;
  }
}

export {};
