import type { JSX as ReactJSX } from "react";

declare global {
  namespace JSX {
    export type Element = ReactJSX.Element;
    export type ElementClass = ReactJSX.ElementClass;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface IntrinsicElements extends ReactJSX.IntrinsicElements {}
  }
}

export {};
