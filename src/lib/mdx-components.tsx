import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import type { ImgHTMLAttributes } from "react";

import { ContentImage } from "@/components/mdx/content-image";
import { WalletStub as WalletStubClient } from "@/components/WalletStub";

function MarkdownImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { title, ...rest } = props;
  return <ContentImage caption={title ?? undefined} {...rest} />;
}

function WalletStub() {
  return <WalletStubClient />;
}

export const mdxComponents: MDXRemoteProps["components"] = {
  img: MarkdownImage,
  ContentImage,
  WalletStub,
};

export type MdxComponentMap = typeof mdxComponents;
