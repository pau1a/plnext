import PageShell from "@/components/layout/PageShell";
import { getMediaBios, getMediaAssets, formatBytes } from "@/lib/media";

import MediaClientPage from "./MediaClientPage";
import styles from "./media-kit.module.scss";

export const metadata = {
  title: "Media Kit | Paula Livingstone",
  description: "Press bios, headshots, and logos for publication.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/media-kit" },
};

export default async function MediaKitPage() {
  const bios = await getMediaBios();
  const rawAssets = await getMediaAssets();

  const assets = rawAssets.map((asset) => {
    const label = asset.label.toLowerCase();

    const type = label.includes("headshot")
      ? "headshot"
      : label.includes("logo")
      ? "logo"
      : "bio";

    return {
      path: asset.path,
      label: asset.label,
      bytes: formatBytes(asset.bytes),
      type,
    };
  });

  const headshots = assets.filter((asset) => asset.type === "headshot");
  const logos = assets.filter((asset) => asset.type === "logo");
  const bioAssets = assets.filter((asset) => asset.type === "bio");

  return (
    <PageShell as="main" outerClassName={styles.pageShell} className={styles.layout}>
      <MediaClientPage
        bios={bios}
        headshots={headshots}
        logos={logos}
        bioAssets={bioAssets}
      />
    </PageShell>
  );
}
