"use client";

import { useEffect } from "react";

type Props = {
  imgSrc: string;
  targetSelector: string;
  sampleHeightPct?: number;
};

function srgbToLinear(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

function linearToSrgb(value: number) {
  const scaled =
    value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(scaled * 255)));
}

export default function ContactColorCalibrator({
  imgSrc,
  targetSelector,
  sampleHeightPct = 12,
}: Props) {
  useEffect(() => {
    let cancelled = false;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.src = imgSrc;

    image.onload = () => {
      if (cancelled) {
        return;
      }

      const width = 128;
      const height = Math.max(8, Math.round((image.height / image.width) * width));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        return;
      }

      context.drawImage(image, 0, 0, width, height);

      const sampleHeight = Math.max(1, Math.round((sampleHeightPct / 100) * height));
      const startY = height - sampleHeight;
      const { data } = context.getImageData(0, startY, width, sampleHeight);

      let rLinear = 0;
      let gLinear = 0;
      let bLinear = 0;
      let count = 0;

      for (let index = 0; index < data.length; index += 4) {
        rLinear += srgbToLinear(data[index]);
        gLinear += srgbToLinear(data[index + 1]);
        bLinear += srgbToLinear(data[index + 2]);
        count += 1;
      }

      if (count === 0) {
        return;
      }

      rLinear /= count;
      gLinear /= count;
      bLinear /= count;

      const red = linearToSrgb(rLinear);
      const green = linearToSrgb(gLinear);
      const blue = linearToSrgb(bLinear);

      const color = `rgb(${red} ${green} ${blue})`;

      const element = document.querySelector<HTMLElement>(targetSelector);
      if (element) {
        element.style.setProperty("--moor-fade-color", color);
      }
    };

    return () => {
      cancelled = true;
    };
  }, [imgSrc, targetSelector, sampleHeightPct]);

  return null;
}
