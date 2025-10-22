import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";

import Callout from "./Callout";
import styles from "./mdx.module.scss";

type HeadingProps = ComponentProps<"h2"> & { children: ReactNode };

type AnchorProps = ComponentProps<"a">;

type BlockquoteProps = ComponentProps<"blockquote">;

type PreProps = ComponentProps<"pre">;

type CodeProps = ComponentProps<"code">;

function H2({ children, className, ...rest }: HeadingProps) {
  return (
    <h2 {...rest} className={clsx(styles.heading2, className)}>
      {children}
    </h2>
  );
}

function H3({ children, className, ...rest }: HeadingProps) {
  return (
    <h3 {...rest} className={clsx(styles.heading3, className)}>
      {children}
    </h3>
  );
}

function Anchor({ href = "", children, className, ...rest }: AnchorProps) {
  const mergedClassName = clsx(styles.link, className);

  if (href.startsWith("/")) {
    return (
      <Link className={mergedClassName} href={href} {...rest}>
        {children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a className={mergedClassName} href={href} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <a
      className={mergedClassName}
      href={href}
      {...rest}
      target="_blank"
      rel="noreferrer noopener"
    >
      {children}
    </a>
  );
}

function Blockquote({ children, className, ...rest }: BlockquoteProps) {
  return (
    <blockquote {...rest} className={clsx(styles.blockquote, className)}>
      {children}
    </blockquote>
  );
}

function Pre({ children, className, ...rest }: PreProps) {
  return (
    <pre {...rest} className={clsx(styles.pre, className)}>
      {children}
    </pre>
  );
}

function Code({ children, className, ...rest }: CodeProps) {
  return (
    <code {...rest} className={clsx(styles.code, className)}>
      {children}
    </code>
  );
}

export const MDXComponents = {
  h2: H2,
  h3: H3,
  a: Anchor,
  blockquote: Blockquote,
  pre: Pre,
  code: Code,
  Callout,
};

export type MDXComponentMap = typeof MDXComponents;
