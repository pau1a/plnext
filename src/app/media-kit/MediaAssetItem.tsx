interface MediaAssetItemProps {
  path: string;
  label: string;
  bytes: string;
}

export default function MediaAssetItem({ path, label, bytes }: MediaAssetItemProps) {
  return (
    <li className="media-asset-item">
      <a href={path} download className="media-asset-item__link">
        {label}
      </a>
      <span className="media-asset-item__size">{bytes}</span>
    </li>
  );
}
