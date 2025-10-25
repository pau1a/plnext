import clsx from "clsx";
import Image from "next/image";
import type { ImgHTMLAttributes } from "react";

import styles from "./content-image.module.scss";

type ContentImageAlignment = "default" | "left" | "right" | "wide";

interface ContentImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "width" | "height" | "loading" | "decoding"> {
  caption?: string;
  align?: ContentImageAlignment;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
}
export function ContentImage({
  align = "default",
  caption,
  className,
  width,
  height,
  priority,
  ...imgProps
}: ContentImageProps) {
  const { src, alt = "", title, ...restImageProps } = imgProps;

  if (!src) {
    return null;
  }

  const figureClass = clsx(styles.figure, className, {
    [styles.figureAlignLeft]: align === "left",
    [styles.figureAlignRight]: align === "right",
    [styles.figureAlignWide]: align === "wide",
  });

  const widthValue = typeof width === "string" ? Number.parseInt(width, 10) : width;
  const heightValue = typeof height === "string" ? Number.parseInt(height, 10) : height;

  const resolvedWidth = Number.isFinite(widthValue) ? widthValue : 1600;
  const resolvedHeight = Number.isFinite(heightValue) ? heightValue : Math.round((resolvedWidth / 16) * 9);

  return (
    <figure className={figureClass}>
      <Image
        className={styles.image}
        src={src}
        alt={alt}
        width={resolvedWidth}
        height={resolvedHeight}
        priority={priority}
        sizes={align === "wide" ? "(min-width: 768px) 960px, 100vw" : "(min-width: 768px) 420px, 100vw"}
        {...restImageProps}
      />
      {caption || title ? <figcaption className={styles.caption}>{caption ?? title}</figcaption> : null}
    </figure>
  );
}
