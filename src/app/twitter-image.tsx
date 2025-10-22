import { ImageResponse } from "next/og";

import { createSocialImage, size } from "./opengraph-image";

export const contentType = "image/png";
export const runtime = "edge";

export default function TwitterImage() {
  return new ImageResponse(createSocialImage(), {
    ...size,
  });
}
