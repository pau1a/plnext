import MediaClientPage from "./MediaClientPage";
import { getMediaBios, getMediaAssets, formatBytes } from "@/lib/media";

export const metadata = {
  title: "Media Kit | Paula Livingstone",
  description: "Press bios, headshots, and logos for publication.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/media" },
};

export default async function MediaPage() {
  const bios = await getMediaBios();
  const rawAssets = await getMediaAssets();

  const assets = rawAssets.map((asset) => ({
    path: asset.path,
    label: asset.label,
    bytes: formatBytes(asset.bytes),
    type: asset.label.toLowerCase().includes('headshot') ? 'headshot'
      : asset.label.toLowerCase().includes('logo') ? 'logo'
      : 'bio'
  }));

  const headshots = assets.filter(a => a.type === 'headshot');
  const logos = assets.filter(a => a.type === 'logo');
  const bioAssets = assets.filter(a => a.type === 'bio');

  return (
    <MediaClientPage
      bios={bios}
      headshots={headshots}
      logos={logos}
      bioAssets={bioAssets}
    />
  );
}
