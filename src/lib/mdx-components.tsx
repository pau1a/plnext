import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import type { ImgHTMLAttributes } from "react";

import { ContentImage } from "@/components/mdx/content-image";

function MarkdownImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { title, ...rest } = props;
  return <ContentImage caption={title ?? undefined} {...rest} />;
}

export const mdxComponents: MDXRemoteProps["components"] = {
  img: MarkdownImage,
  ContentImage,
};

export type MdxComponentMap = typeof mdxComponents;
