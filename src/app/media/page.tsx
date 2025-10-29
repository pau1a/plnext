import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import MediaBioCard from "./MediaBioCard";
import MediaAssetCard from "./MediaAssetCard";
import { getMediaBios, getMediaAssets, formatBytes } from "@/lib/media";

export const metadata = {
  title: "Media",
  description: "Press bios, headshots, and logos for publication.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/media" },
};

export default async function MediaPage() {
  const bios = await getMediaBios();
  const assets = await getMediaAssets();

  // Group assets by type
  const headshots = assets.filter(a => a.label.toLowerCase().includes('headshot'));
  const logos = assets.filter(a => a.label.toLowerCase().includes('logo'));
  const bioAssets = assets.filter(a => a.label.toLowerCase().includes('bio'));

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <MotionFade>
        <div className="u-stack u-gap-3xl">
          <header className="u-stack u-gap-sm u-text-center">
            <h1 className="u-heading-lg u-font-semibold">Media Kit</h1>
            <p className="u-text-muted u-text-lg u-max-w-prose u-mx-auto">
              Press bios, headshots, and logos for publication.
            </p>
          </header>

          <section className="u-stack u-gap-xl">
            <div className="u-stack u-gap-md">
              <h2 className="u-heading-md u-font-semibold">Biography</h2>
              <p className="u-text-muted u-text-sm">
                Click any bio to copy to clipboard
              </p>
            </div>

            <div className="media-bio-grid">
              <MediaBioCard
                title="One-liner"
                content={bios.oneLiner}
                icon="fa-comment-dots"
              />
              <MediaBioCard
                title="Short"
                content={bios.short}
                icon="fa-align-left"
              />
              <MediaBioCard
                title="Long"
                content={bios.long}
                icon="fa-align-justify"
              />
            </div>
          </section>

          <section className="u-stack u-gap-xl">
            <div className="u-stack u-gap-md">
              <h2 className="u-heading-md u-font-semibold">Downloads</h2>
              <p className="u-text-muted u-text-sm">
                High-resolution assets for press and media use
              </p>
            </div>

            <div className="u-stack u-gap-lg">
              {/* Headshots row */}
              {headshots.length > 0 && (
                <div className="media-asset-row">
                  {headshots.map((asset) => (
                    <MediaAssetCard
                      key={asset.path}
                      path={asset.path}
                      label={asset.label}
                      bytes={formatBytes(asset.bytes)}
                    />
                  ))}
                </div>
              )}

              {/* Logos row */}
              {logos.length > 0 && (
                <div className="media-asset-row">
                  {logos.map((asset) => (
                    <MediaAssetCard
                      key={asset.path}
                      path={asset.path}
                      label={asset.label}
                      bytes={formatBytes(asset.bytes)}
                    />
                  ))}
                </div>
              )}

              {/* Bio assets row */}
              {bioAssets.length > 0 && (
                <div className="media-asset-row">
                  {bioAssets.map((asset) => (
                    <MediaAssetCard
                      key={asset.path}
                      path={asset.path}
                      label={asset.label}
                      bytes={formatBytes(asset.bytes)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </MotionFade>
    </PageShell>
  );
}
