interface MediaAssetCardProps {
  path: string;
  label: string;
  bytes: string;
}

function getAssetIcon(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("logo") || lower.includes("mark")) return "fa-hexagon";
  if (lower.includes("headshot") || lower.includes("photo")) return "fa-image";
  if (lower.includes("pdf")) return "fa-file-pdf";
  return "fa-file-arrow-down";
}

function getAssetType(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("logo")) return "Logo";
  if (lower.includes("headshot")) return "Photo";
  if (lower.includes("pdf")) return "Document";
  if (lower.includes("svg")) return "Vector";
  if (lower.includes("png") || lower.includes("jpg")) return "Image";
  return "File";
}

export default function MediaAssetCard({ path, label, bytes }: MediaAssetCardProps) {
  const icon = getAssetIcon(label);
  const type = getAssetType(label);

  return (
    <a href={path} download className="media-asset-card">
      <div className="media-asset-card__icon-wrapper">
        <i className={`fa-solid ${icon} media-asset-card__icon`} aria-hidden="true"></i>
      </div>
      <div className="media-asset-card__content">
        <h3 className="media-asset-card__label">{label}</h3>
        <div className="media-asset-card__meta">
          <span className="media-asset-card__type">{type}</span>
          {bytes && (
            <>
              <span className="media-asset-card__separator">•</span>
              <span className="media-asset-card__size">{bytes}</span>
            </>
          )}
        </div>
      </div>
      <div className="media-asset-card__download">
        <i className="fa-solid fa-arrow-down" aria-hidden="true"></i>
      </div>
    </a>
  );
}
